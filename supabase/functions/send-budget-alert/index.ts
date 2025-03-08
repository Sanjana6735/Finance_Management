
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  email: string;
  category: string;
  percentage_used: number;
  user_id: string;
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
    const body: RequestBody = await req.json();
    const { email, category, percentage_used, user_id } = body;

    if (!email || !category || percentage_used === undefined || !user_id) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          received: { email, category, percentage_used, user_id },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log(`Sending budget alert email to ${email} for ${category}`);

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Call the send-email function
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
        message: "Budget alert email sent successfully",
        sentTo: email,
        category: category,
        percentage: percentage_used,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending budget alert email:", error);
    
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
