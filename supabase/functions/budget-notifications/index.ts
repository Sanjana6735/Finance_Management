
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
    const { user } = await req.json();
    
    // Validate that user ID is provided
    if (!user) {
      throw new Error('User ID is required');
    }
    
    // Initialize Supabase client (with user's JWT token from request)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://zycfmehporlshbcpruvr.supabase.co';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user's budget alerts
    const { data: alerts, error: alertsError } = await supabase
      .from('budget_alert_logs')
      .select('*')
      .eq('user_id', user)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (alertsError) {
      throw new Error(`Error fetching budget alerts: ${alertsError.message}`);
    }
    
    // Return user's budget alerts
    return new Response(
      JSON.stringify({
        success: true,
        alerts: alerts || []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
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
