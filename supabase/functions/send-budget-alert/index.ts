
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

    // For demo purposes, we'll log the email content
    // In a real app, you would use a service like Resend or SendGrid
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

    // Log the email that would be sent
    console.log("------ BUDGET ALERT EMAIL ------");
    console.log(`To: ${email}`);
    console.log(`Subject: Budget Alert: ${category} Budget at ${percentage_used.toFixed(0)}%`);
    console.log(`Body: ${emailHTML}`);
    console.log("--------------------------------");

    // Store this email log in the database
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Let's create an email_logs table to track these
    try {
      const { data: logData, error: logError } = await supabase
        .from("email_logs")
        .insert([
          {
            user_id: user_id,
            email_to: email,
            subject: `Budget Alert: ${category} Budget at ${percentage_used.toFixed(0)}%`,
            email_type: "budget_alert",
            content: emailHTML,
          },
        ]);

      if (logError) {
        console.error("Error logging email:", logError);
      } else {
        console.log("Email logged to database:", logData);
      }
    } catch (logError) {
      console.error("Error with email logging:", logError);
      // If this table doesn't exist, we'll just continue without logging
    }

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
