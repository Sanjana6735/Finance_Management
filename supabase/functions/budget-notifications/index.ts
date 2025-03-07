
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
    
    // Parse request body
    const body = await req.json();
    const { budget_id, user_id, category, percentage_used, email } = body;
    
    console.log("Received budget notification request:", body);
    
    if (!budget_id || !user_id || !category) {
      throw new Error('Missing required parameters');
    }
    
    // Use provided email or fetch user's email if not provided
    let userEmail = email;
    
    if (!userEmail) {
      console.log("Email not provided, fetching from auth.users");
      // Try to get user's email from auth.users using admin functions
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(user_id);
      
      if (authError || !authUser?.user?.email) {
        throw new Error(`Unable to find user email: ${authError?.message || 'User not found'}`);
      }
      
      userEmail = authUser.user.email;
    }
    
    console.log(`User email for notifications: ${userEmail}`);
    
    // Get budget details
    const { data: budgetData, error: budgetError } = await supabase
      .from('budgets')
      .select('*')
      .eq('id', budget_id)
      .single();
    
    if (budgetError || !budgetData) {
      throw new Error(`Error fetching budget: ${budgetError?.message || 'Budget not found'}`);
    }
    
    // Check if we've already sent an alert for this budget at this threshold
    const thresholdRounded = Math.floor(percentage_used / 10) * 10;
    const { data: existingAlerts, error: alertsError } = await supabase
      .from('budget_alert_logs')
      .select('*')
      .eq('budget_id', budget_id)
      .eq('percentage_used', thresholdRounded)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (alertsError) {
      console.error('Error checking existing alerts:', alertsError);
    }
    
    // Only send a new alert if we haven't sent one for this threshold in the last 24 hours
    const shouldSendAlert = 
      !existingAlerts?.length || 
      (new Date().getTime() - new Date(existingAlerts[0].created_at).getTime() > 24 * 60 * 60 * 1000);
    
    if (shouldSendAlert) {
      console.log(`Sending budget alert for ${category} at ${percentage_used.toFixed(0)}% to ${userEmail}`);
      
      try {
        // Call the send-budget-alert function
        const response = await fetch(`${supabaseUrl}/functions/v1/send-budget-alert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({
            user_id,
            email: userEmail,
            category,
            percentage_used,
            spent: budgetData.spent,
            total: budgetData.total,
            currency: 'INR'
          })
        });
        
        let result;
        if (response.ok) {
          result = await response.json();
          console.log("Budget alert email sent:", result);
        } else {
          const errorText = await response.text();
          console.error(`Failed to send budget alert: ${errorText}`);
          throw new Error(`Failed to send budget alert: ${errorText}`);
        }
        
        // Log the alert in the database
        const { error: logError } = await supabase
          .from('budget_alert_logs')
          .insert({
            user_id,
            budget_id,
            category,
            percentage_used: thresholdRounded,
            email_sent_to: userEmail
          });
        
        if (logError) {
          console.error('Error logging budget alert:', logError);
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            message: `Budget alert sent to ${userEmail}`,
            details: result
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      } catch (error) {
        console.error("Error in send-budget-alert:", error);
        throw error;
      }
    } else {
      console.log(`Skipping alert for ${category} - already sent recently`);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Alert skipped - already sent recently',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error(`Error in budget-notifications function: ${error.message}`);
    
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
