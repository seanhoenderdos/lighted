import MODEL from '@/constants/models';
import { InferenceClient } from '@huggingface/inference';

// Initialize Hugging Face client
const hfClient = new InferenceClient(process.env.HUGGING_FACE_API_KEY);

// GROQ API configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const groqHeaders = {
  'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
  'Content-Type': 'application/json'
};

export { hfClient };

export async function generateSermonFromInput(input: { topic: string; verses: string[]; denomination: string }): Promise<{ sermonDraft: string }> {
  const { topic, verses, denomination } = input;
  const versesText = verses.length > 0 ? verses.join(', ') : 'No specific verses provided';

  try {
    // Try GROQ first
    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: groqHeaders,
      body: JSON.stringify({
        model: MODEL.CURRENT,
        messages: [
          {
            role: "system",
            content: "You are a knowledgeable theological assistant helping to create sermons."
          },
          {
            role: "user",
            content: `Please help create a sermon with these details:
Topic: ${topic}
Denomination: ${denomination}
Bible Verses: ${versesText}

Generate a well-structured sermon that explains the topic, incorporates the Bible verses naturally, and follows the theological perspective of the specified denomination.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.95
      })
    });

    if (!groqResponse.ok) {
      throw new Error(`GROQ API error: ${groqResponse.statusText}`);
    }

    const groqData = await groqResponse.json();
    return { sermonDraft: groqData.choices[0]?.message?.content || 'No sermon generated' };
  } catch (error) {
    console.error('GROQ API error:', error);
    
    // Fallback to Hugging Face if GROQ fails
    try {
      const response = await hfClient.textGeneration({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        inputs: `<s>[INST] You are a knowledgeable theological assistant. Please help create a sermon with these details:

Topic: ${topic}
Denomination: ${denomination}
Bible Verses: ${versesText}

Generate a well-structured sermon that explains the topic, incorporates the Bible verses naturally, and follows the theological perspective of the specified denomination. [/INST]</s>`,
        parameters: {
          max_new_tokens: 1024,
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
 * Generate sermon suggestions relevant to pastors' daily activities
 * @returns Array of sermon suggestion strings
 */
export async function generatePastorSuggestions(): Promise<string[]> {
  try {
    // Try GROQ first
    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: groqHeaders,
      body: JSON.stringify({
        model: MODEL.CURRENT,
        messages: [
          {
            role: "system",
            content: "You are a theological assistant helping pastors with their daily ministry work."
          },
          {
            role: "user",
            content: `Generate 7 sermon suggestions that are relevant to pastors' daily activities and ministry work. 
            These should be phrased as requests a pastor might make, such as "Help me write a sermon about forgiveness" or "Create a sermon outline for a youth service".
            Make them diverse, practical, and addressing different aspects of pastoral work like sermon preparation, counseling, community outreach, and church leadership.
            Respond with a JSON array of strings only, with no additional text.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.95
      })
    });

    if (!groqResponse.ok) {
      throw new Error(`GROQ API error: ${groqResponse.statusText}`);
    }

    const groqData = await groqResponse.json();
    const content = groqData.choices[0]?.message?.content || '[]';
    
    // Parse JSON array from response, with error handling
    try {
      const suggestions = JSON.parse(content);
      return Array.isArray(suggestions) ? suggestions.slice(0, 7) : getDefaultSuggestions();
    } catch (parseError) {
      console.error('Error parsing suggestion response:', parseError);
      return getDefaultSuggestions();
    }
  } catch (error) {
    console.error('Error generating suggestions:', error);
    
    // Fallback to Hugging Face if GROQ fails
    try {
      const response = await hfClient.textGeneration({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        inputs: `<s>[INST] Generate 7 sermon suggestions that are relevant to pastors' daily activities and ministry work. 
        These should be phrased as requests a pastor might make, such as "Help me write a sermon about forgiveness" or "Create a sermon outline for a youth service".
        Make them diverse, practical, and addressing different aspects of pastoral work.
        Respond with a JSON array of strings only. [/INST]</s>`,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.95,
          do_sample: true
        }
      });
      
      // Extract JSON array from response
      const match = response.generated_text.match(/\[.*\]/s);
      if (match) {
        try {
          const suggestions = JSON.parse(match[0]);
          return Array.isArray(suggestions) ? suggestions.slice(0, 7) : getDefaultSuggestions();
        } catch (parseError) {
          console.error('Error parsing HF suggestion response:', parseError);
          return getDefaultSuggestions();
        }
      }
      
      return getDefaultSuggestions();
    } catch (hfError) {
      console.error('Hugging Face API error:', hfError);
      return getDefaultSuggestions();
    }
  }
}

// Default suggestions in case AI generation fails
function getDefaultSuggestions(): string[] {
  return [
    'Help me prepare a sermon on healing and reconciliation',
    'Create a sermon outline for a youth service',
    'Draft a sermon about community outreach and social justice',
    'Develop a series on the Beatitudes for Sunday school',
    'Write a meditation for a funeral service',
    'Craft a sermon about finding purpose in difficult times',
    'Help with a sermon about marriage and family values'
  ];
}
