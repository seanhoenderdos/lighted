import MODEL from '@/constants/models';
import { InferenceClient } from '@huggingface/inference';
import { fetchWithRetry, getCompatibleModel } from '@/lib/api-helpers';

// Initialize Hugging Face client
const hfClient = new InferenceClient(process.env.HUGGING_FACE_API_KEY);

// GROQ API configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const groqHeaders = {
  'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
  'Content-Type': 'application/json'
};

export { hfClient };

export async function generateSermonFromInput(input: { 
  topic: string; 
  verses: string[]; 
  denomination: string;
  audience?: string;
  sermonLength?: 'short' | 'medium' | 'long';
}): Promise<{ sermonDraft: string }> {
  const { topic, verses, denomination, audience = 'general', sermonLength = 'medium' } = input;
  const versesText = verses.length > 0 ? verses.join(', ') : 'No specific verses provided';

  // Calculate target length based on parameter
  const targetLength = {
    short: 600,
    medium: 1024,
    long: 1800
  }[sermonLength];
  try {
    // Try GROQ first with retry logic
    const groqResponse = await fetchWithRetry(
      GROQ_API_URL,
      {
        method: 'POST',
        headers: groqHeaders,
        body: JSON.stringify({
          model: MODEL.CURRENT,
          messages: [
            {
              role: "system",
              content: `You are a knowledgeable theological assistant helping to create sermons.
              You have expertise in various Christian denominations including ${denomination}.
              Create content appropriate for ${audience} audiences.
              Structure sermons with clear headings using markdown format:
              **Title:**
              **Scripture:**
              **Introduction:**
              **Main Points:**
              **Illustrations:**
              **Application:**
              **Conclusion:**`
            },
            {
              role: "user",
              content: `Please help create a sermon with these details:
              Topic: ${topic}
              Denomination: ${denomination}
              Bible Verses: ${versesText}
              Target Audience: ${audience}
              
              Generate a well-structured sermon that explains the topic, incorporates the Bible verses naturally, and follows the theological perspective of the specified denomination.`
            }
          ],
          temperature: 0.7,
          max_tokens: targetLength,
          top_p: 0.95
        })
      },
      3 // 3 retries
    );

    const groqData = await groqResponse.json();
    return { sermonDraft: groqData.choices[0]?.message?.content || 'No sermon generated' };
  } catch (error) {
    console.error('GROQ API error:', error);
    
    // Fallback to Hugging Face if GROQ fails
    try {      // Use a compatible model instead of Mixtral
      const compatibleModel = getCompatibleModel('text-generation', 'mistralai/Mixtral-8x7B-Instruct-v0.1');
      
      const response = await hfClient.textGeneration({
        model: compatibleModel,
        inputs: `You are a knowledgeable theological assistant. Please help create a sermon with these details:

Topic: ${topic}
Denomination: ${denomination}
Bible Verses: ${versesText}
Target Audience: ${audience}

Structure sermons with clear headings using markdown format:
**Title:**
**Scripture:**
**Introduction:**
**Main Points:**
**Illustrations:**
**Application:**
**Conclusion:**

Generate a well-structured sermon that explains the topic, incorporates the Bible verses naturally, and follows the theological perspective of the specified denomination.`,
        parameters: {
          max_new_tokens: targetLength,
          temperature: 0.7,
          top_p: 0.95,
          repetition_penalty: 1.1,
          do_sample: true
        }
      });

      return { sermonDraft: response.generated_text || 'No sermon generated' };
    } catch (hfError) {
      console.error('Hugging Face API error:', hfError);
      throw new Error('Failed to generate sermon with both GROQ and Hugging Face');
    }
  }
}

/**
 * Generate exegetical analysis of a Bible passage
 */
export async function generateExegesis(passage: string, denomination: string): Promise<{ exegesis: string }> {  try {
    const groqResponse = await fetchWithRetry(
      GROQ_API_URL,
      {
        method: 'POST',
        headers: groqHeaders,
        body: JSON.stringify({
          model: MODEL.CURRENT,
          messages: [
            {
              role: "system",
              content: `You are a biblical scholar providing exegetical analysis of Scripture.
              Consider the ${denomination} tradition in your analysis.
              Structure your analysis with: Historical Context, Word Studies, Literary Context, Theological Significance, and Application.`
            },
            {
              role: "user",
              content: `Provide an exegetical analysis of ${passage}. Include historical context, key word studies (including original languages where relevant), and theological significance.`
            }
          ],
          temperature: 0.3, // Lower temperature for factual content
          max_tokens: 1200,
          top_p: 0.9
        })
      },
      3 // 3 retries
    );

    const groqData = await groqResponse.json();
    return { exegesis: groqData.choices[0]?.message?.content || 'No exegesis generated' };
  } catch (error) {
    console.error('GROQ API error:', error);
    
    // Fallback to Hugging Face
    try {      // Use a compatible model instead of Mixtral
      const compatibleModel = getCompatibleModel('text-generation', 'mistralai/Mixtral-8x7B-Instruct-v0.1');
      
      const response = await hfClient.textGeneration({
        model: compatibleModel,
        inputs: `You are a biblical scholar. Provide an exegetical analysis of ${passage}.
        Consider the ${denomination} tradition in your analysis.
        Include historical context, key word studies (including original languages where relevant), literary context, theological significance, and application.`,
        parameters: {
          max_new_tokens: 1200,
          temperature: 0.3,
          top_p: 0.9,
          repetition_penalty: 1.1,
          do_sample: true
        }
      });

      return { exegesis: response.generated_text || 'No exegesis generated' };
    } catch (hfError) {
      console.error('Hugging Face API error:', hfError);
      throw new Error('Failed to generate exegesis');
    }
  }
}

/**
 * Generate pastoral counseling guidance
 */
export async function generateCounselingGuidance(situation: string, denomination: string): Promise<{ guidance: string }> {  try {
    const groqResponse = await fetchWithRetry(
      GROQ_API_URL,
      {
        method: 'POST',
        headers: groqHeaders,
        body: JSON.stringify({
          model: MODEL.CURRENT,
          messages: [
            {
              role: "system",
              content: `You are a pastoral counseling assistant. Provide biblically-based guidance for pastoral counseling situations.
              Consider ${denomination} perspectives.
              Always include: 1) Key scriptures, 2) Conversation starters, 3) Practical steps, 4) When to refer to professional help`
            },
            {
              role: "user",
              content: `Provide pastoral counseling guidance for this situation: ${situation}`
            }
          ],
          temperature: 0.5,
          max_tokens: 800,
          top_p: 0.9
        })
      },
      3 // 3 retries
    );

    const groqData = await groqResponse.json();
    return { guidance: groqData.choices[0]?.message?.content || 'No guidance generated' };
  } catch (error) {
    console.error('GROQ API error:', error);
    
    // Fallback to Hugging Face
    try {      // Use a compatible model instead of Mixtral
      const compatibleModel = getCompatibleModel('text-generation', 'mistralai/Mixtral-8x7B-Instruct-v0.1');
      
      const response = await hfClient.textGeneration({
        model: compatibleModel,
        inputs: `You are a pastoral counseling assistant. Provide biblically-based guidance for this situation: ${situation}
        Consider ${denomination} perspectives.
        Include: 1) Key scriptures, 2) Conversation starters, 3) Practical steps, 4) When to refer to professional help`,
        parameters: {
          max_new_tokens: 800,
          temperature: 0.5,
          top_p: 0.9,
          repetition_penalty: 1.1,
          do_sample: true
        }
      });

      return { guidance: response.generated_text || 'No guidance generated' };
    } catch (hfError) {
      console.error('Hugging Face API error:', hfError);
      throw new Error('Failed to generate counseling guidance');
    }
  }
}

/**
 * Generate sermon suggestions relevant to pastors' daily activities
 * @returns Array of sermon suggestion strings
 */
export async function generatePastorSuggestions(
  denomination: string = 'non-denominational',
  activeTab: 'sermon' | 'exegesis' | 'counseling' = 'sermon'
): Promise<string[]> {
  try {
    // Generate different suggestions based on activeTab
    let promptContent = '';
    
    if (activeTab === 'sermon') {
      promptContent = `Generate 7 sermon suggestions that are relevant to pastors' daily activities and ministry work, 
      specifically for a ${denomination} pastor.
      These should be phrased as requests a pastor might make, such as "Help me write a sermon about forgiveness from a ${denomination} perspective" 
      or "Create a sermon outline on grace in the ${denomination} tradition".
      Make them diverse, practical, and addressing different aspects of pastoral work like sermon preparation, 
      community outreach, and church leadership.`;
    } else if (activeTab === 'exegesis') {
      promptContent = `Generate 7 Bible exegesis requests that a ${denomination} pastor might need help with.
      These should be phrased as requests, such as "Explain the context and meaning of John 3:16 in the ${denomination} tradition" 
      or "Provide an exegetical analysis of Romans 8:28-39 for a ${denomination} Bible study".
      Include a variety of passages from both Old and New Testament that are important in ${denomination} teaching.`;
    } else if (activeTab === 'counseling') {
      promptContent = `Generate 7 pastoral counseling scenarios that a ${denomination} pastor might need guidance with.
      These should be phrased as requests for help, such as "How can I counsel a couple considering divorce in my ${denomination} congregation?" 
      or "What ${denomination} resources can I offer to someone struggling with grief?".
      Make them diverse, covering different counseling situations including grief, family issues, faith doubts, and life transitions.`;
    }
      // Try GROQ first with retry logic
    const groqResponse = await fetchWithRetry(
      GROQ_API_URL,
      {
        method: 'POST',
        headers: groqHeaders,
        body: JSON.stringify({
          model: MODEL.CURRENT,
          messages: [
            {
              role: "system",
              content: `You are a theological assistant helping ${denomination} pastors with their daily ministry work.`
            },
            {
              role: "user",
              content: `${promptContent}
              Respond with a JSON array of strings only, with no additional text.`
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
          top_p: 0.95
        })
      },
      3 // 3 retries
    );

    const groqData = await groqResponse.json();
    const content = groqData.choices[0]?.message?.content || '[]';
    
    // Parse JSON array from response, with error handling
    try {
      // First try direct parsing
      try {
        // Strip any markdown code block delimiters that might be present
        const cleanContent = content.replace(/```json|```|\n/g, '').trim();
        const suggestions = JSON.parse(cleanContent);
        return Array.isArray(suggestions) ? suggestions.slice(0, 7) : getDefaultSuggestions(denomination, activeTab);
      } catch (directParseError) {
        // If direct parsing fails, try to extract JSON array using regex
        const jsonMatch = content.match(/\[\s*["'].*["']\s*(,\s*["'].*["']\s*)*\]/s);
        if (jsonMatch) {
          try {
            const suggestions = JSON.parse(jsonMatch[0]);
            return Array.isArray(suggestions) ? suggestions.slice(0, 7) : getDefaultSuggestions(denomination, activeTab);
          } catch (matchError) {
            console.error('Failed to parse extracted JSON match:', matchError);
          }
        }
        
        // Try to repair common JSON issues
        const repaired = content
          .replace(/[\r\n\t]/g, ' ')  // Replace line breaks with spaces
          .replace(/'/g, '"')  // Replace single quotes with double quotes
          .replace(/,\s*(\]|\})/g, '$1')  // Remove trailing commas
          .replace(/([a-zA-Z0-9_]+):/g, '"$1":')  // Quote unquoted keys
          .replace(/\"\s+\"/g, '","')  // Fix spaces between array elements
          .replace(/\[\s*,/g, '[')  // Fix leading commas
          .replace(/,\s*,/g, ',');  // Fix consecutive commas
        
        try {
          // Try to find and extract a JSON array from the repaired content
          const arrayMatch = repaired.match(/\[(?:\s*\"[^\"]*\"\s*,?)+\]/);
          if (arrayMatch) {
            const suggestions = JSON.parse(arrayMatch[0]);
            return Array.isArray(suggestions) ? suggestions.slice(0, 7) : getDefaultSuggestions(denomination, activeTab);
          }
        } catch (repairError) {
          console.error('Failed to parse repaired JSON:', repairError);
        }
        
        // Last resort: try to build an array from quoted strings
        try {
          const stringMatches = content.match(/["']([^"']+)["']/g);
          if (stringMatches && stringMatches.length > 0) {
            const suggestions = stringMatches.map((match: string) =>
              match.replace(/^["']|["']$/g, '')
            );
            return suggestions.slice(0, 7);
          }
        } catch (extractError) {
          console.error('Failed to extract strings from content:', extractError);
        }
        
        console.error('Error parsing suggestion response:', directParseError);
        return getDefaultSuggestions(denomination, activeTab);
      }
    } catch (parseError) {
      console.error('Error in JSON parsing wrapper:', parseError);
      return getDefaultSuggestions(denomination, activeTab);
    }  } catch (error) {
    console.error('Error generating suggestions:', error);
    
    // Fallback to Hugging Face if GROQ fails
    try {
      // Create a prompt based on activeTab
      let hfPrompt = '';
      
      if (activeTab === 'sermon') {
        hfPrompt = `Generate 7 sermon suggestions for a ${denomination} pastor.
        These should be phrased as requests a pastor might make, such as "Help me write a sermon about forgiveness" or "Create a sermon outline for a youth service".`;
      } else if (activeTab === 'exegesis') {
        hfPrompt = `Generate 7 Bible exegesis requests for a ${denomination} pastor.
        These should be phrased as requests for help understanding specific Bible passages.`;
      } else if (activeTab === 'counseling') {
        hfPrompt = `Generate 7 pastoral counseling scenarios for a ${denomination} pastor.
        These should be phrased as requests for guidance in counseling situations.`;
      }
      // Use getCompatibleModel to select a model that supports text-generation
      const compatibleModel = getCompatibleModel('text-generation', 'mistralai/Mixtral-8x7B-Instruct-v0.1'); 
      
      const response = await hfClient.textGeneration({
        model: compatibleModel,
        inputs: `${hfPrompt} Respond with a JSON array of strings only.`,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.95,
          do_sample: true
        }
      });
        // Completely rewritten approach to avoid TypeScript errors
      let suggestions: string[] = [];
        try {
        // First, try to extract a JSON array using a regex
        const responseText: string = response.generated_text || '';
        const jsonArrayRegex = /\[[\s\S]*?\]/;
        const matches = responseText.match(jsonArrayRegex);
        
        if (matches && matches.length > 0) {
          const jsonContent: string = matches[0];
          try {
            // Parse the extracted JSON
            const parsedData = JSON.parse(jsonContent);
            
            // Check if it's actually an array
            if (Array.isArray(parsedData)) {
              suggestions = parsedData.slice(0, 7);
            }
          } catch (jsonError) {
            console.error('Failed to parse JSON from response:', jsonError);
          }
        }
        
        // If we couldn't extract valid suggestions, fall back to default
        if (suggestions.length === 0) {
          suggestions = getDefaultSuggestions(denomination, activeTab);
        }
        
        return suggestions;
      } catch (extractError) {
        console.error('Error extracting suggestions from response:', extractError);
        return getDefaultSuggestions(denomination, activeTab);
      }
    } catch (hfError) {
      console.error('Hugging Face API error:', hfError);
      return getDefaultSuggestions(denomination, activeTab);
    }
  }
}

// Default suggestions in case AI generation fails
function getDefaultSuggestions(
  denomination: string = 'non-denominational',
  activeTab: 'sermon' | 'exegesis' | 'counseling' = 'sermon'
): string[] {
  if (activeTab === 'sermon') {
    return [
      `Help me prepare a sermon on healing and reconciliation in the ${denomination} tradition`,
      `Create a sermon outline for a youth service that aligns with ${denomination} teachings`,
      `Draft a sermon about community outreach and social justice from a ${denomination} perspective`,
      `Develop a series on the Beatitudes for a ${denomination} Sunday school class`,
      `Write a meditation for a funeral service incorporating ${denomination} beliefs about afterlife`,
      `Craft a sermon about finding purpose in difficult times that resonates with ${denomination} theology`,
      `Help with a sermon about marriage and family values in the ${denomination} context`
    ];
  } else if (activeTab === 'exegesis') {
    return [
      `Explain the context and meaning of John 3:16 in the ${denomination} tradition`,
      `Provide an exegetical analysis of Romans 8:28-39 for a ${denomination} Bible study`,
      `Help me understand the Beatitudes (Matthew 5:3-12) from a ${denomination} perspective`,
      `Analyze Psalm 23 for a ${denomination} congregation`,
      `What does Genesis 1:26-27 mean in ${denomination} teaching about human nature?`,
      `Explain 1 Corinthians 13 (the love chapter) for a ${denomination} wedding service`,
      `Interpret the prodigal son parable (Luke 15:11-32) according to ${denomination} theology`
    ];
  } else if (activeTab === 'counseling') {
    return [
      `How can I counsel a couple considering divorce in my ${denomination} congregation?`,
      `What ${denomination} resources can I offer to someone struggling with grief?`,
      `How should I approach counseling a teenager questioning their faith in our ${denomination} church?`,
      `What advice can I give to new parents from a ${denomination} perspective?`,
      `How can I counsel someone with anxiety using ${denomination} principles?`,
      `What's the ${denomination} approach to counseling someone struggling with addiction?`,
      `How should I guide a church member facing a serious illness according to ${denomination} teachings?`
    ];
  }
  
  // Fallback generic suggestions
  return [
    `Help me prepare content related to ${denomination} teachings`,
    `Create material for my ${denomination} congregation`,
    `Develop resources that align with ${denomination} theology`,
    `Help me understand how to approach this topic from a ${denomination} perspective`,
    `What does ${denomination} tradition say about this subject?`,
    `How can I incorporate ${denomination} teachings into my ministry?`,
    `Provide guidance on this issue that's consistent with ${denomination} beliefs`
  ];
}

/**
 * Detect Bible references in text
 */
export async function detectBibleReferences(text: string): Promise<Array<{ reference: string; context?: string }>> {
  try {
    // Use a model that supports text generation
    const compatibleModel = getCompatibleModel('text-generation', 'mistralai/Mixtral-8x7B-Instruct-v0.1');
    
    const response = await hfClient.textGeneration({
      model: compatibleModel,
      inputs: `Given the following text, identify all Bible references (e.g., "John 3:16", "Romans 8:28-30", "1 Corinthians 13") that appear in it. For each reference, extract a small amount of surrounding context.
      
      Text: ${text}
      
      Respond with a JSON array of objects, where each object has a "reference" field with the Bible reference and a "context" field with the surrounding text.
      Example:
      [{"reference":"John 3:16","context":"For God so loved the world that he gave..."},{"reference":"Romans 8:28","context":"And we know that in all things God works..."}]
      
      If no Bible references are found, return an empty array: []`,
      parameters: {
        max_new_tokens: 800,
        temperature: 0.1,
        top_p: 0.9,
        do_sample: true
      }
    });
      try {
      // Extract JSON array from response
      const responseText = response.generated_text || '';
      const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0] as string);
      }
      return [];
    } catch (parseError) {
      console.error('Error parsing Bible references response:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error detecting Bible references:', error);
    return [];
  }
}
