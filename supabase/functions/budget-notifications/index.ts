
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

    // Insert notification into the notifications table
    const { data: notificationData, error: notificationError } = await supabase
      .from("notifications")
      .insert([
        {
          user_id: user_id,
          title: "Budget Alert",
          message: `You've used ${percentage_used.toFixed(0)}% of your ${category} budget.`,
          type: "budget",
        },
      ])
      .select();

    if (notificationError) {
      console.error("Error creating notification:", notificationError);
      // Don't fail the whole function if just notification fails
    } else {
      console.log("Budget notification created:", notificationData);
    }

    // Prepare email content
    const emailHTML = `
      <html>
        <body>
          <h1>Budget Alert</h1>
          <p>Hello,</p>
          <p>Your ${category} budget has reached ${percentage_used.toFixed(0)}% of the limit.</p>
          <p>This is a friendly reminder to check your spending.</p>
          <p>View your budget: <a href="https://finance-dashboard.com/budgets">Finance Dashboard</a></p>
          <p>Thank you,<br>Finance Dashboard Team</p>
        </body>
      </html>
    `;

    // Call our new email sending function
    const emailResponse = await fetch(
      `${supabaseUrl}/functions/v1/send-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          to: email,
          subject: `Budget Alert: ${category} Budget at ${percentage_used.toFixed(0)}%`,
          html: emailHTML,
          user_id: user_id,
          email_type: "budget_alert"
        }),
      }
    );
    
    const emailResult = await emailResponse.json();
    console.log("Email sending result:", emailResult);

    return new Response(
      JSON.stringify({
        message: "Budget alert processed successfully",
        notification: notificationData || null,
        email: emailResult,
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
