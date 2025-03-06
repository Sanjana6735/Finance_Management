
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // This function is meant to be triggered by a cron job
  console.log("Budget notification cron job running");
  
  // Create a Supabase client
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
  
  try {
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
    
    // Process each budget to check if notifications are needed
    for (const budget of budgets) {
      const percentage = (budget.spent / budget.total) * 100;
      
      // Check if budget is at a threshold that requires notification
      if (percentage >= 75) {
        // Get user info
        const { data: user, error: userError } = await supabaseClient
          .auth.admin.getUserById(budget.user_id);
        
        if (userError) {
          console.error(`Error fetching user for budget ${budget.id}:`, userError);
          continue;
        }
        
        if (!user || !user.user || !user.user.email) {
          console.error(`No valid user email found for budget ${budget.id}`);
          continue;
        }

        // Determine notification type based on percentage
        const notificationType = percentage >= 90 ? "critical" : "warning";
        console.log(`Sending ${notificationType} email to ${user.user.email} about ${budget.category} budget at ${percentage.toFixed(0)}%`);
        
        // Create a notification record
        const { data: notification, error: notifError } = await supabaseClient
          .from('notifications')
          .insert({
            user_id: budget.user_id,
            title: `${notificationType === 'critical' ? 'Critical' : 'Warning'}: Budget Alert`,
            message: `Your ${budget.category} budget is at ${percentage.toFixed(0)}% utilization.`,
            read: false
          })
          .select();
          
        if (notifError) {
          console.error(`Error creating notification for budget ${budget.id}:`, notifError);
        } else {
          console.log(`Notification created: ${JSON.stringify(notification)}`);
        }

        // Send email via our send-budget-alert function
        try {
          const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-budget-alert`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
            },
            body: JSON.stringify({
              userId: budget.user_id,
              userEmail: user.user.email,
              categoryName: budget.category,
              currentAmount: budget.spent,
              totalBudget: budget.total,
              percentageUsed: percentage
            })
          });

          const emailResult = await emailResponse.json();
          console.log(`Email sending result: ${JSON.stringify(emailResult)}`);
        } catch (emailError) {
          console.error(`Error sending email for budget ${budget.id}:`, emailError);
        }
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Budget notifications processed" 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in budget-cron function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
