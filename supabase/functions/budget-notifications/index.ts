
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Create a Supabase client with the auth context of the logged in user
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    }
  )

  try {
    console.log("Starting budget notification check");
    
    // Fetch all budgets
    const { data: budgets, error: budgetsError } = await supabaseClient
      .from('budgets')
      .select('*');
    
    if (budgetsError) throw budgetsError;
    
    if (!budgets || budgets.length === 0) {
      return new Response(
        JSON.stringify({ message: "No budgets found" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Found ${budgets.length} budgets to check`);
    
    // Check which budgets are near or over their limits
    const notificationPromises = budgets.map(async (budget) => {
      const percentage = (budget.spent / budget.total) * 100;
      let notificationType = null;
      
      if (percentage >= 90) {
        notificationType = "critical";
      } else if (percentage >= 75) {
        notificationType = "warning";
      }
      
      if (notificationType) {
        console.log(`Budget ${budget.id} (${budget.category}) at ${percentage.toFixed(0)}% - sending ${notificationType} notification`);
        
        // Get user info to send notification
        const { data: userData, error: userError } = await supabaseClient
          .from('users')
          .select('email')
          .eq('id', budget.user_id)
          .single();
        
        if (userError) {
          console.error(`Error fetching user data for budget ${budget.id}:`, userError);
          return null;
        }
        
        // In a real implementation, you would send an email here
        // For now, we'll just log it
        console.log(`Would send ${notificationType} email to user ${budget.user_id} about ${budget.category} budget`);
        
        // For testing, let's generate AI content
        const message = generateAIMessage(budget.category, percentage, notificationType);
        
        return {
          userId: budget.user_id,
          budgetId: budget.id,
          category: budget.category,
          percentage: percentage,
          notificationType,
          message
        };
      }
      
      return null;
    });
    
    const notifications = (await Promise.all(notificationPromises)).filter(Boolean);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationsSent: notifications.length,
        notifications 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in budget-notifications function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})

// Simulating AI-generated content for budget notifications
function generateAIMessage(category: string, percentage: number, type: string): string {
  const templates = {
    critical: [
      `Your ${category} budget is at ${percentage.toFixed(0)}% utilization. This is a critical alert as you've nearly exhausted your budget. Consider reviewing your spending immediately to avoid going over budget.`,
      `URGENT: You've used ${percentage.toFixed(0)}% of your ${category} budget. To maintain financial health, please take immediate action to reduce spending in this category.`,
    ],
    warning: [
      `Your ${category} budget is now at ${percentage.toFixed(0)}%. You're approaching your limit - this is a good time to review your spending and plan for the rest of the period.`,
      `Heads up! You've used ${percentage.toFixed(0)}% of your ${category} budget. Consider moderating your spending in this category to stay within your financial goals.`,
    ]
  };
  
  const options = templates[type];
  return options[Math.floor(Math.random() * options.length)];
}
