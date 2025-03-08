
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: "signup" | "reset";
  email: string;
  redirect_url?: string;
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

    const { type, email, redirect_url }: EmailRequest = await req.json();

    if (!type || !email) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          received: { type, email },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    let result;

    if (type === "signup") {
      // Create user and automatically confirm them
      const { data: userData, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: "TempPassword123!",
        email_confirm: true,
      });

      if (createError) throw createError;
      
      result = userData;
      
      // Send welcome email
      const welcomeHTML = `
        <html>
          <body>
            <h1>Welcome to Finance Dashboard!</h1>
            <p>Hello,</p>
            <p>Your account has been created and confirmed. You can now log in.</p>
            <p>If you need to reset your password, please use the "Forgot Password" option on the login screen.</p>
            <p>Thank you for joining us,<br>Finance Dashboard Team</p>
          </body>
        </html>
      `;
      
      // Send welcome email via our email function
      await fetch(
        `${supabaseUrl}/functions/v1/send-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            to: email,
            subject: "Welcome to Finance Dashboard",
            html: welcomeHTML,
            user_id: userData.user.id,
            email_type: "welcome"
          }),
        }
      );
    } else if (type === "reset") {
      // Send password reset email
      const { data, error } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          redirectTo: redirect_url || "https://finance-dashboard.com/reset-password",
        },
      });

      if (error) throw error;
      
      result = data;
      
      // Also send via SendGrid for reliability
      const resetURL = data.properties.action_link;
      const resetHTML = `
        <html>
          <body>
            <h1>Reset Your Password</h1>
            <p>Hello,</p>
            <p>You requested to reset your password for your Finance Dashboard account.</p>
            <p>Please click the link below to reset your password:</p>
            <p><a href="${resetURL}">Reset Password</a></p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>Thank you,<br>Finance Dashboard Team</p>
          </body>
        </html>
      `;
      
      // Get user id for the email
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers({
        filters: {
          email: email
        }
      });
      
      if (userError) throw userError;
      
      const userId = userData.users.length > 0 ? userData.users[0].id : "system";
      
      // Send reset email via our email function
      await fetch(
        `${supabaseUrl}/functions/v1/send-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            to: email,
            subject: "Reset Your Finance Dashboard Password",
            html: resetHTML,
            user_id: userId,
            email_type: "password_reset"
          }),
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: `${type === "signup" ? "Signup" : "Password reset"} email sent successfully`,
        sentTo: email,
        result,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error(`Error sending ${req.type} email:`, error);
    
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
