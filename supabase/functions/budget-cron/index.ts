
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request
    const body = await req.json().catch(() => ({}));
    const isSummary = body.isSummary || false;
    
    console.log(`Budget cron job triggered. Summary mode: ${isSummary}`);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://zycfmehporlshbcpruvr.supabase.co';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email:auth.users!id(email), username, currency');
      
    if (usersError) {
      throw new Error(`Error fetching users: ${usersError.message}`);
    }
    
    console.log(`Found ${users.length} users to process`);
    
    // Process each user's budgets
    let totalAlertsSent = 0;
    const processedUsers = [];
    
    for (const user of users) {
      try {
        // Skip users without email
        if (!user.email || !user.email[0]?.email) {
          console.log(`User ${user.id} has no email, skipping`);
          continue;
        }
        
        const userEmail = user.email[0].email;
        
        // Get user's budgets
        const { data: budgets, error: budgetsError } = await supabase
          .from('budgets')
          .select('*')
          .eq('user_id', user.id);
          
        if (budgetsError) {
          console.error(`Error fetching budgets for user ${user.id}: ${budgetsError.message}`);
          continue;
        }
        
        if (!budgets || budgets.length === 0) {
          console.log(`No budgets found for user ${user.id}, skipping`);
          continue;
        }
        
        console.log(`Processing ${budgets.length} budgets for user ${user.id}`);
        
        // If this is a summary request, handle differently
        if (isSummary) {
          await processBudgetSummary(supabase, user, userEmail, budgets);
          processedUsers.push(user.id);
          continue;
        }
        
        // Check each budget
        for (const budget of budgets) {
          const percentageUsed = (budget.spent / budget.total) * 100;
          
          // Check for threshold crossing (75%, 90%, 100%)
          if (percentageUsed >= 75) {
            // Check if we've already sent an alert for this threshold
            const threshold = 
              percentageUsed >= 100 ? 100 : 
              percentageUsed >= 90 ? 90 : 75;
              
            const { data: existingAlerts } = await supabase
              .from('budget_alert_logs')
              .select('*')
              .eq('user_id', user.id)
              .eq('budget_id', budget.id)
              .gte('percentage_used', threshold)
              .order('created_at', { ascending: false })
              .limit(1);
              
            // Skip if we've already sent an alert for this threshold in the last 24 hours
            if (existingAlerts && existingAlerts.length > 0) {
              const lastAlert = new Date(existingAlerts[0].created_at);
              const now = new Date();
              const hoursSinceLastAlert = (now.getTime() - lastAlert.getTime()) / (1000 * 60 * 60);
              
              if (hoursSinceLastAlert < 24) {
                console.log(`Alert for budget ${budget.id} (${budget.category}) already sent in the last 24 hours, skipping`);
                continue;
              }
            }
            
            // Send alert
            console.log(`Sending alert for user ${user.id}, budget ${budget.id} (${budget.category}), percentage: ${percentageUsed.toFixed(2)}%`);
            
            const alertData = {
              user_id: user.id,
              budget_id: budget.id,
              category: budget.category,
              email: userEmail,
              percentage_used: percentageUsed,
              spent: budget.spent,
              total: budget.total,
              currency: user.currency || 'INR'
            };
            
            // Call the send-budget-alert function
            const sendAlertResponse = await fetch(
              `${supabaseUrl}/functions/v1/send-budget-alert`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${supabaseServiceKey}`
                },
                body: JSON.stringify(alertData)
              }
            );
            
            if (sendAlertResponse.ok) {
              // Log the alert in the budget_alert_logs table
              await supabase
                .from('budget_alert_logs')
                .insert({
                  user_id: user.id,
                  email_sent_to: userEmail,
                  budget_id: budget.id,
                  category: budget.category,
                  percentage_used: percentageUsed
                });
                
              totalAlertsSent++;
              console.log(`Alert sent successfully for budget ${budget.id} (${budget.category})`);
            } else {
              const errorText = await sendAlertResponse.text();
              console.error(`Failed to send alert: ${errorText}`);
            }
          }
        }
        
        processedUsers.push(user.id);
      } catch (userError) {
        console.error(`Error processing user ${user.id}: ${userError.message}`);
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Budget check completed. Processed ${processedUsers.length} users, sent ${totalAlertsSent} alerts.`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
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

// Function to process weekly budget summaries
async function processBudgetSummary(supabase, user, userEmail, budgets) {
  console.log(`Processing weekly summary for user ${user.id}`);
  
  try {
    const summaryData = {
      user_id: user.id,
      email: userEmail,
      budgets: budgets.map(budget => ({
        category: budget.category,
        spent: budget.spent,
        total: budget.total,
        percentage: (budget.spent / budget.total) * 100
      })),
      currency: user.currency || 'INR',
      is_summary: true
    };
    
    // Call the send-budget-alert function with summary data
    const response = await fetch(
      `${supabase.supabaseUrl}/functions/v1/send-budget-alert`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify(summaryData)
      }
    );
    
    if (response.ok) {
      console.log(`Weekly summary sent successfully for user ${user.id}`);
    } else {
      const errorText = await response.text();
      console.error(`Failed to send weekly summary: ${errorText}`);
    }
  } catch (error) {
    console.error(`Error sending summary for user ${user.id}: ${error.message}`);
  }
}
