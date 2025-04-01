
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReceiptData {
  text: string;
  imageBase64?: string;
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
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("Missing OpenAI API key");
    }

    // Get the receipt text from the request
    const { text, imageBase64 }: ReceiptData = await req.json();
    
    if (!text && !imageBase64) {
      return new Response(
        JSON.stringify({ error: "Either text or image must be provided" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    let apiPayload;
    
    if (imageBase64) {
      // Process image with GPT-4 Vision model
      apiPayload = {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert receipt analyzer. Extract the following information from the receipt image: store name, date, total amount, and items purchased with their individual prices. Format the response as a JSON object with these fields."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this receipt image and extract the details in JSON format with fields: storeName, date, totalAmount, items (array of {name, price})"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ],
          },
        ],
        response_format: { type: "json_object" },
      };
    } else {
      // Process text with GPT model
      apiPayload = {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert receipt analyzer. Extract the following information from the receipt text: store name, date, total amount, and items purchased with their individual prices. Format the response as a JSON object with these fields."
          },
          {
            role: "user",
            content: `Extract the details from this receipt text in JSON format with fields: storeName, date, totalAmount, items (array of {name, price}):\n\n${text}`
          },
        ],
        response_format: { type: "json_object" },
      };
    }

    console.log("Sending request to OpenAI");
    
    // Call OpenAI API to analyze the receipt
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify(apiPayload),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.status} ${errorText}`);
    }

    const openaiData = await openaiResponse.json();
    console.log("OpenAI response received");

    try {
      // Parse the response from OpenAI, which should be JSON
      const extractedData = JSON.parse(openaiData.choices[0].message.content);
      
      // Log the extracted data and return it
      console.log("Extracted data:", extractedData);
      
      return new Response(
        JSON.stringify({
          success: true,
          data: extractedData,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      
      // If parsing fails, return the raw content from OpenAI
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to parse receipt data",
          rawResponse: openaiData.choices[0].message.content
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("Error in receipt-scanner function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || String(error),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
