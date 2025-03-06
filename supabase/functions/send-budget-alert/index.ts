
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

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

async function generateEmailContent(data: BudgetAlertRequest): Promise<string> {
  if (!OPENAI_API_KEY) {
    console.log("OpenAI API key not found, using fallback content");
    return generateFallbackContent(data);
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful financial advisor. Create a concise, professional email about a budget alert with useful suggestions. The email should be formatted with HTML tags for proper display.'
          },
          { 
            role: 'user', 
            content: `Generate a budget alert email for a user whose ${data.categoryName} budget is at ${data.percentageUsed.toFixed(1)}% utilization (spent ₹${data.currentAmount.toLocaleString('en-IN')} out of ₹${data.totalBudget.toLocaleString('en-IN')}). Include personalized financial advice and tips for managing this category.`
          }
        ],
        temperature: 0.7,
      }),
    });

    const responseData = await response.json();
    if (responseData.choices && responseData.choices[0] && responseData.choices[0].message) {
      return responseData.choices[0].message.content;
    } else {
      console.error("Unexpected OpenAI response format:", responseData);
      return generateFallbackContent(data);
    }
  } catch (error) {
    console.error("Error generating content with OpenAI:", error);
    return generateFallbackContent(data);
  }
}

function generateFallbackContent(data: BudgetAlertRequest): string {
  const severity = data.percentageUsed >= 90 ? "Critical" : "Warning";
  
  return `
    <h1>${severity} Budget Alert</h1>
    <p>Dear User,</p>
    <p>This is to inform you that your ${data.categoryName} budget is running low.</p>
    <p>You have spent ₹${data.currentAmount.toLocaleString('en-IN')} out of your total budget of ₹${data.totalBudget.toLocaleString('en-IN')}.</p>
    <p>This means you have used ${data.percentageUsed.toFixed(1)}% of your budget.</p>
    
    <h2>Recommendations:</h2>
    <ul>
      <li>Consider reducing non-essential expenses in this category for the rest of the month.</li>
      <li>Review your spending habits and identify areas where you can save.</li>
      <li>Adjust your budget allocation if this category consistently requires more funds.</li>
    </ul>
    
    <p>Login to your dashboard for more detailed insights and personalized recommendations.</p>
    <p>Best regards,<br>Your Financial Dashboard Team</p>
  `;
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

    // Generate email content using AI
    const emailBody = await generateEmailContent({
      userId, 
      userEmail,
      categoryName,
      currentAmount,
      totalBudget,
      percentageUsed
    });

    const emailSubject = `Budget Alert: Your ${categoryName} budget is running low`;
    
    // In a real implementation, you would use an email service like SendGrid, Amazon SES, or Resend
    // For now, we'll log the email content and return a success response
    console.log(`Would send email to ${userEmail} with subject: ${emailSubject}`);
    console.log(`Email body: ${emailBody}`);

    // Log the alert in the database
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
