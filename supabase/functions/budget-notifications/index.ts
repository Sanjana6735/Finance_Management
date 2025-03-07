
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
    const { budget_id, user_id, category, percentage_used } = await req.json();
    
    if (!budget_id || !user_id || !category) {
      throw new Error('Missing required parameters');
    }
    
    // Get user's email
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('email')
      .eq('id', user_id)
      .single();
    
    if (userError || !userData) {
      console.log('Error fetching user data:', userError);
      // Attempt to get user directly from auth.users table
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(user_id);
      
      if (authError || !authUser?.user?.email) {
        throw new Error(`Unable to find user email: ${authError?.message || 'User not found'}`);
      }
      
      userData = { email: authUser.user.email };
    }
    
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
      console.log(`Sending budget alert for ${category} at ${percentage_used.toFixed(0)}% to ${userData.email}`);
      
      // Call the send-budget-alert function
      const response = await fetch(`${supabaseUrl}/functions/v1/send-budget-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({
          user_id,
          email: userData.email,
          category,
          percentage_used,
          spent: budgetData.spent,
          total: budgetData.total,
          currency: 'INR'
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to send budget alert: ${error}`);
      }
      
      // Log the alert in the database
      const { error: logError } = await supabase
        .from('budget_alert_logs')
        .insert({
          user_id,
          budget_id,
          category,
          percentage_used: thresholdRounded,
          email_sent_to: userData.email
        });
      
      if (logError) {
        console.error('Error logging budget alert:', logError);
      }
      
      // Add a notification for the user
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id,
          title: `Budget Alert: ${category}`,
          message: `You've used ${percentage_used.toFixed(0)}% of your ${category} budget.`,
          read: false
        });
      
      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }
      
      const result = await response.json();
      return new Response(
        JSON.stringify({
          success: true,
          message: `Budget alert sent to ${userData.email}`,
          details: result
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
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
