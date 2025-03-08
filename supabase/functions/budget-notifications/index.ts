
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  budget_id: string;
  user_id: string;
  category: string;
  percentage_used: number;
  email: string;
}

serve(async (req) => {
  // Handle preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: RequestBody = await req.json();
    const { budget_id, user_id, category, percentage_used, email } = body;

    if (!budget_id || !user_id || !category || !email) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          received: { budget_id, user_id, category, email },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log(`Processing budget alert for ${category}, ${percentage_used.toFixed(0)}% used`);

    // Log the alert in the budget_alert_logs table
    const { data: logData, error: logError } = await supabase
      .from("budget_alert_logs")
      .insert([
        {
          user_id: user_id,
          budget_id: budget_id,
          category: category,
          percentage_used: percentage_used,
          email_sent_to: email
        }
      ]);

    if (logError) {
      console.error("Error logging budget alert:", logError);
    } else {
      console.log("Budget alert logged:", logData);
    }

    // Insert notification into the notifications table
    const { data: notificationData, error: notificationError } = await supabase
      .from("notifications")
      .insert([
        {
          user_id: user_id,
          title: "Budget Alert",
          message: `You've used ${percentage_used.toFixed(0)}% of your ${category} budget.`,
          type: "budget",
          read: false
        }
      ]);

    if (notificationError) {
      console.error("Error creating notification:", notificationError);
    } else {
      console.log("Budget notification created:", notificationData);
    }

    // Call the send-budget-alert function to send an email
    const alertResponse = await fetch(
      `${supabaseUrl}/functions/v1/send-budget-alert`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          email: email,
          category: category,
          percentage_used: percentage_used,
          user_id: user_id
        }),
      }
    );
    
    const alertResult = await alertResponse.json();
    console.log("Email sending result:", alertResult);

    return new Response(
      JSON.stringify({
        message: "Budget alert processed successfully",
        notification: notificationData || null,
        email: alertResult,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing budget alert:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || String(error),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
