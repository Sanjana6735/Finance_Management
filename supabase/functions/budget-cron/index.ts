import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if this is a weekly summary request
    const { isWeeklySummary } = await req.json();
    
    // If it's a weekly summary, we'll generate summary emails for all users
    if (isWeeklySummary) {
      return await handleWeeklySummary(supabase, supabaseUrl, supabaseServiceKey, corsHeaders);
    }
    
    // Otherwise, check all budgets for alerts
    return await checkAllBudgets(supabase, supabaseUrl, supabaseServiceKey, corsHeaders);
  } catch (error) {
    console.error(`Error in budget-cron function: ${error.message}`);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function checkAllBudgets(supabase, supabaseUrl, supabaseServiceKey, corsHeaders) {
  console.log('Checking all budgets for alerts...');
  
  // Get all budgets with relevant thresholds
  const { data: budgets, error: budgetsError } = await supabase
    .from('budgets')
    .select('*');
  
  if (budgetsError) {
    throw new Error(`Error fetching budgets: ${budgetsError.message}`);
  }
  
  console.log(`Found ${budgets.length} budgets to check`);
  
  // Track alerts sent
  const alertsSent = [];
  const errors = [];
  
  // Check each budget and send alerts if thresholds reached
  for (const budget of budgets) {
    try {
      const percentageUsed = (budget.spent / budget.total) * 100;
      
      // Check if percentage has crossed important thresholds (75%, 90%, 100%)
      if (
        percentageUsed >= 75 && 
        (
          percentageUsed >= (100) || 
          percentageUsed >= (90) || 
          percentageUsed >= (75)
        )
      ) {
        console.log(`Budget for ${budget.category} at ${percentageUsed.toFixed(0)}% - sending alert`);
        
        // Call the budget-notifications function
        const response = await fetch(`${supabaseUrl}/functions/v1/budget-notifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({
            budget_id: budget.id,
            user_id: budget.user_id,
            category: budget.category,
            percentage_used: percentageUsed
          })
        });
        
        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Failed to send budget notification: ${error}`);
        }
        
        alertsSent.push({
          category: budget.category,
          percentage: percentageUsed.toFixed(0),
          user_id: budget.user_id
        });
      }
    } catch (error) {
      console.error(`Error processing budget ${budget.id}:`, error);
      errors.push({
        budget_id: budget.id,
        category: budget.category,
        error: error.message
      });
    }
  }
  
  return new Response(
    JSON.stringify({
      success: true,
      message: `Budget check completed - sent ${alertsSent.length} alerts`,
      alerts_sent: alertsSent,
      errors: errors
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function handleWeeklySummary(supabase, supabaseUrl, supabaseServiceKey, corsHeaders) {
  console.log('Generating weekly budget summaries...');
  
  // Get distinct user IDs with budgets
  const { data: users, error: usersError } = await supabase
    .from('budgets')
    .select('user_id')
    .distinct();
  
  if (usersError) {
    throw new Error(`Error fetching users with budgets: ${usersError.message}`);
  }
  
  console.log(`Found ${users.length} users for weekly summaries`);
  
  const summariesSent = [];
  const errors = [];
  
  // Generate summary for each user
  for (const user of users) {
    try {
      // Get all budgets for this user
      const { data: userBudgets, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.user_id);
      
      if (budgetsError) {
        throw new Error(`Error fetching budgets for user: ${budgetsError.message}`);
      }
      
      // Get user's email
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user.user_id);
      
      if (userError || !userData?.user?.email) {
        throw new Error(`Unable to find user email: ${userError?.message || 'User not found'}`);
      }
      
      const userEmail = userData.user.email;
      
      console.log(`Generating weekly summary for ${userEmail} with ${userBudgets.length} budgets`);
      
      // Call the send-budget-alert function with the summary flag
      const response = await fetch(`${supabaseUrl}/functions/v1/send-budget-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({
          user_id: user.user_id,
          email: userEmail,
          is_summary: true,
          budgets: userBudgets.map(budget => ({
            category: budget.category,
            spent: budget.spent,
            total: budget.total,
            percentage: (budget.spent / budget.total) * 100
          })),
          currency: 'INR'
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to send weekly summary: ${error}`);
      }
      
      // Add a notification for the user
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: user.user_id,
          title: "Weekly Budget Summary",
          message: "Your weekly budget summary is ready. Check your email for details.",
          read: false
        });
      
      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }
      
      summariesSent.push({
        user_id: user.user_id,
        email: userEmail,
        budgets_count: userBudgets.length
      });
    } catch (error) {
      console.error(`Error processing summary for user ${user.user_id}:`, error);
      errors.push({
        user_id: user.user_id,
        error: error.message
      });
    }
  }
  
  return new Response(
    JSON.stringify({
      success: true,
      message: `Weekly summaries completed - sent ${summariesSent.length} summaries`,
      summaries_sent: summariesSent,
      errors: errors
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}
