import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

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
    // Parse request data
    const alertData = await req.json();
    console.log("Received alert data:", alertData);
    
    const { 
      user_id, 
      email, 
      category, 
      percentage_used, 
      spent, 
      total, 
      currency,
      is_summary,
      budgets
    } = alertData;
    
    if (!email) {
      throw new Error('No email provided for notification');
    }
    
    console.log(`Generating email for ${email} about budget ${is_summary ? 'summary' : category}`);
    
    // Get API keys
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      throw new Error('Missing OpenAI API key in environment');
    }
    
    // Generate email content using OpenAI
    let emailSubject, emailContent;
    
    if (is_summary) {
      // Generate weekly summary email
      const { subject, content } = await generateWeeklySummaryEmail(openaiApiKey, email, budgets, currency);
      emailSubject = subject;
      emailContent = content;
    } else {
      // Generate single budget alert email
      const { subject, content } = await generateBudgetAlertEmail(
        openaiApiKey,
        email,
        category,
        percentage_used,
        spent,
        total,
        currency
      );
      emailSubject = subject;
      emailContent = content;
    }
    
    // For demo purposes, we'll just return the generated email content
    // In production, you would send this email via an email service
    
    console.log(`Email generated successfully for ${email}`);
    console.log("========= EMAIL WOULD BE SENT =========");
    console.log(`To: ${email}`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`Content: ${emailContent}`);
    console.log("======================================");
    
    return new Response(
      JSON.stringify({
        success: true,
        email: {
          to: email,
          subject: emailSubject,
          content: emailContent
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error(`Error in send-budget-alert function: ${error.message}`);
    
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

// Function to generate budget alert email content using OpenAI
async function generateBudgetAlertEmail(apiKey, email, category, percentageUsed, spent, total, currency) {
  try {
    const formattedPercentage = percentageUsed.toFixed(0);
    const formattedSpent = Number(spent).toLocaleString('en-IN');
    const formattedTotal = Number(total).toLocaleString('en-IN');
    
    // Determine alert level
    let alertLevel = "approaching";
    if (percentageUsed >= 100) {
      alertLevel = "exceeded";
    } else if (percentageUsed >= 90) {
      alertLevel = "critical";
    }
    
    const currencySymbol = currency === 'USD' ? '$' : '₹';
    
    // Prepare the prompt for OpenAI
    const prompt = `
      You are a personal finance assistant that helps users manage their budget. 
      Write a concise, helpful email for a user with the following budget alert information:
      
      - Category: ${category}
      - User has ${alertLevel} their budget (${formattedPercentage}% used)
      - Amount spent: ${currencySymbol}${formattedSpent} out of ${currencySymbol}${formattedTotal}
      
      The email should:
      1. Have a brief, attention-grabbing subject line
      2. Be professional but conversational and friendly in tone
      3. Start with a brief summary of the budget situation
      4. Include 2-3 specific, actionable tips to manage spending in this category
      5. End with an encouraging note
      6. Be concise and to the point, around 150-200 words maximum
      
      Format your response as a JSON object with "subject" and "content" keys.
    `;
    
    console.log("Sending prompt to OpenAI:", prompt.substring(0, 100) + "...");
    
    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a personal finance assistant that creates helpful, concise email content."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API Error:", error);
      throw new Error(`OpenAI API error: ${error}`);
    }
    
    const data = await response.json();
    console.log("OpenAI response received");
    
    try {
      // Parse the response from OpenAI
      const content = data.choices[0].message.content;
      console.log("OpenAI content:", content);
      const emailData = JSON.parse(content);
      
      return {
        subject: emailData.subject,
        content: emailData.content
      };
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      
      // Fallback email template
      return {
        subject: `Budget Alert: Your ${category} spending has reached ${formattedPercentage}%`,
        content: `
          <p>Hello,</p>
          
          <p>This is an alert regarding your ${category} budget. You've currently spent ${currencySymbol}${formattedSpent} out of your ${currencySymbol}${formattedTotal} budget (${formattedPercentage}%).</p>
          
          <p>We recommend reviewing your recent expenses in this category and adjusting your spending for the remainder of the month.</p>
          
          <p>Thank you for using our budget management system!</p>
        `
      };
    }
  } catch (error) {
    console.error("Error in generateBudgetAlertEmail:", error);
    throw error;
  }
}

// Function to generate weekly summary email content using OpenAI
async function generateWeeklySummaryEmail(apiKey, email, budgets, currency) {
  const currencySymbol = currency === 'USD' ? '$' : '₹';
  
  // Calculate total spending and budget
  let totalSpent = 0;
  let totalBudget = 0;
  let overspentCategories = [];
  let healthyCategories = [];
  
  budgets.forEach(budget => {
    totalSpent += Number(budget.spent);
    totalBudget += Number(budget.total);
    
    if (budget.percentage >= 90) {
      overspentCategories.push({
        category: budget.category,
        percentage: budget.percentage.toFixed(0),
        spent: Number(budget.spent).toLocaleString('en-IN'),
        total: Number(budget.total).toLocaleString('en-IN')
      });
    } else if (budget.percentage < 75) {
      healthyCategories.push({
        category: budget.category,
        percentage: budget.percentage.toFixed(0),
        spent: Number(budget.spent).toLocaleString('en-IN'),
        total: Number(budget.total).toLocaleString('en-IN')
      });
    }
  });
  
  const totalPercentage = (totalSpent / totalBudget * 100).toFixed(0);
  
  // Prepare the prompt for OpenAI
  const prompt = `
    You are a personal finance assistant that helps users manage their budget. 
    Write a concise, helpful weekly summary email with the following budget information:
    
    - Overall: ${currencySymbol}${totalSpent.toLocaleString('en-IN')} spent out of ${currencySymbol}${totalBudget.toLocaleString('en-IN')} (${totalPercentage}%)
    - Overspent categories: ${JSON.stringify(overspentCategories)}
    - Healthy categories: ${JSON.stringify(healthyCategories)}
    
    The email should:
    1. Have a brief, informative subject line about the weekly budget summary
    2. Be professional but conversational and friendly in tone
    3. Start with an overview of their overall budget status
    4. Highlight areas of concern (overspent categories) if any
    5. Praise good budgeting in healthy categories
    6. Provide 2-3 general tips for the coming week
    7. Be concise and to the point, around 200-250 words maximum
    
    Format your response as a JSON object with "subject" and "content" keys.
  `;
  
  // Call OpenAI API
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a personal finance assistant that creates helpful, concise email content."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }
  
  const data = await response.json();
  
  try {
    // Parse the response from OpenAI
    const content = data.choices[0].message.content;
    const emailData = JSON.parse(content);
    
    return {
      subject: emailData.subject,
      content: emailData.content
    };
  } catch (error) {
    console.error("Error parsing OpenAI response:", error);
    
    // Fallback email template
    return {
      subject: `Your Weekly Budget Summary`,
      content: `
        <p>Hello,</p>
        
        <p>Here's your weekly budget summary:</p>
        
        <p>Overall, you've spent ${currencySymbol}${totalSpent.toLocaleString('en-IN')} out of your ${currencySymbol}${totalBudget.toLocaleString('en-IN')} total budget (${totalPercentage}%).</p>
        
        ${overspentCategories.length > 0 ? `
        <p><strong>Categories to watch:</strong></p>
        <ul>
          ${overspentCategories.map(cat => 
            `<li>${cat.category}: ${cat.percentage}% used (${currencySymbol}${cat.spent} of ${currencySymbol}${cat.total})</li>`
          ).join('')}
        </ul>
        ` : ''}
        
        ${healthyCategories.length > 0 ? `
        <p><strong>Well managed categories:</strong></p>
        <ul>
          ${healthyCategories.map(cat => 
            `<li>${cat.category}: ${cat.percentage}% used (${currencySymbol}${cat.spent} of ${currencySymbol}${cat.total})</li>`
          ).join('')}
        </ul>
        ` : ''}
        
        <p>Thank you for using our budget management system!</p>
      `
    };
  }
}
