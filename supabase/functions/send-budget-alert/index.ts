
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface BudgetAlertRequest {
  userId: string;
  userEmail: string;
  categoryName: string;
  currentAmount: number;
  totalBudget: number;
  percentageUsed: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const { userId, userEmail, categoryName, currentAmount, totalBudget, percentageUsed }: BudgetAlertRequest = await req.json();

    // Email content - we're simulating email sending here
    const emailSubject = `Budget Alert: Your ${categoryName} budget is running low`;
    
    const emailBody = `
      <h1>Budget Alert</h1>
      <p>Dear User,</p>
      <p>This is to inform you that your ${categoryName} budget is running low.</p>
      <p>You have spent ₹${currentAmount.toLocaleString('en-IN')} out of your total budget of ₹${totalBudget.toLocaleString('en-IN')}.</p>
      <p>This means you have used ${percentageUsed.toFixed(1)}% of your budget.</p>
      
      <h2>Recommendations:</h2>
      <ul>
        <li>Consider reducing non-essential expenses in this category for the rest of the month.</li>
        <li>Review your spending habits and identify areas where you can save.</li>
        <li>Adjust your budget allocation if this category consistently requires more funds.</li>
      </ul>
      
      <p>Login to your dashboard for more detailed insights and personalized recommendations.</p>
      <p>Best regards,<br>Your Financial Dashboard Team</p>
    `;

    // In a real implementation, you would use an email service like SendGrid, Amazon SES, or Resend
    // For now, we'll log the email content and return a success response
    console.log(`Would send email to ${userEmail} with subject: ${emailSubject}`);
    console.log(`Email body: ${emailBody}`);

    // Log the alert in the database (optional but useful for tracking)
    await supabase.from('budget_alerts').insert({
      user_id: userId,
      category: categoryName,
      amount_spent: currentAmount,
      total_budget: totalBudget,
      percentage_used: percentageUsed,
      created_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Budget alert notification sent successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in budget alert function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
