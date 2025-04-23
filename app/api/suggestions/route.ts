import { NextRequest } from "next/server";
import MODEL from "@/constants/models";

// This API endpoint generates sermon-related suggestions using the AI model
export async function GET(req: NextRequest) {
  try {
    // Query parameters (optional)
    const url = new URL(req.url);
    const context = url.searchParams.get('context') || ''; // Optional context to guide suggestions
    const count = parseInt(url.searchParams.get('count') || '7'); // Number of suggestions to generate
    
    // Create a random seed to ensure different results each time
    const nonce = Math.floor(Math.random() * 1000000).toString();
    const timestamp = new Date().toISOString();
    
    // Define a system prompt for generating sermon suggestions with explicit formatting instructions
    const systemPrompt = `
You are a helpful assistant for pastors and religious leaders.
Generate ${count} concise, practical sermon suggestions.
Each suggestion should be a brief prompt or question that a pastor might ask when preparing a sermon.
Make the suggestions diverse in topics, covering different theological themes, Bible passages, and sermon preparation needs.
Keep each suggestion under 85 characters, phrased as a question or request.

IMPORTANT: Respond ONLY with a JSON object like: {"suggestions": ["suggestion1", "suggestion2", ...]}
Do not include any explanation or text outside the JSON object.
Current timestamp: ${timestamp}
Random seed: ${nonce}
${context ? `Consider this context when generating suggestions: ${context}` : ''}
`;

    console.log("Making API call to GROQ with prompt:", systemPrompt.substring(0, 200) + "...");

    // Create messages array for the API call  
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Please generate sermon suggestions for me." }
    ];

    // Call GROQ API for completion
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY || ''}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL.CURRENT,
        messages: messages,
        temperature: 0.8, // Increase temperature for more variety
        response_format: { type: "json_object" }, // Request JSON response
        max_tokens: 600 // Limit token usage
      })
    });

    // Log API status
    console.log(`GROQ API response status: ${groqRes.status} ${groqRes.statusText}`);
    
    const data = await groqRes.json();
    
    // Debug: Log the raw response content
    console.log("AI raw response:", data.choices?.[0]?.message?.content);
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error("Invalid GROQ API response:", data);
      throw new Error("Invalid response from AI service");
    }

    // Parse the JSON response from the LLM
    try {
      // The AI should return a JSON object with a "suggestions" array
      const parsedContent = JSON.parse(data.choices[0].message.content);
      console.log("Parsed content:", parsedContent);
      
      // Extract suggestions array with improved handling
      let suggestions = [];
      
      // Check if it's an object with a suggestions array
      if (parsedContent && typeof parsedContent === 'object') {
        if (Array.isArray(parsedContent.suggestions)) {
          suggestions = parsedContent.suggestions;
        } 
        // If it's just an array at the top level
        else if (Array.isArray(parsedContent)) {
          suggestions = parsedContent;
        }
        // If suggestions aren't in the expected format but we have other keys
        else {
          // Try to extract any array values
          const possibleArrays = Object.values(parsedContent).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            suggestions = possibleArrays[0];
          }
        }
      }
      
      // Log what we found
      if (suggestions.length > 0) {
        console.log(`Successfully extracted ${suggestions.length} suggestions`);
      } else {
        console.warn("No suggestions found in the parsed content");
      }
      
      // Return formatted response
      return Response.json({ suggestions });
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, "Raw content:", data.choices[0].message.content);
      // Fallback suggestions in case parsing fails
      return Response.json({ 
        suggestions: [
          "Help me craft a sermon on forgiveness",
          "Suggest Bible passages about hope",
          "How can I explain salvation to my congregation?",
          "Create an outline for a sermon on prayer"
        ]
      });
    }
  } catch (err) {
    console.error("Error generating suggestions:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}