import Groq from 'groq-sdk';

/**
 * Transcribe audio using Groq Whisper
 */
export async function transcribeAudio(audioBuffer: Buffer, filename: string): Promise<string> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  // Create a File object from the buffer (convert to Uint8Array for compatibility)
  const uint8Array = new Uint8Array(audioBuffer);
  const file = new File([uint8Array], filename, { type: 'audio/ogg' });

  const transcription = await groq.audio.transcriptions.create({
    file,
    model: 'whisper-large-v3',
    language: 'en',
  });

  return transcription.text;
}

/**
 * Generate exegesis from transcript using Groq LLM
 */
export async function generateExegesis(transcript: string): Promise<{
  title: string;
  category: 'old-testament' | 'new-testament' | 'topical';
  greekInsights: Array<{ term: string; transliteration: string; meaning: string; usage: string }>;
  historicalContext: string;
  outlinePoints: Array<{ title: string; content: string }>;
}> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const systemPrompt = `You are an expert biblical scholar and exegete. Analyze the following transcript of someone's thoughts about a sermon topic or scripture passage. Generate a structured exegesis brief.

Return a JSON object with this exact structure:
{
  "title": "A concise title for this exegesis brief (3-8 words)",
  "category": "old-testament" | "new-testament" | "topical",
  "greekInsights": [
    {
      "term": "Greek word in Greek characters",
      "transliteration": "English transliteration",
      "meaning": "Definition and theological significance",
      "usage": "How this word is used in the relevant passage"
    }
  ],
  "historicalContext": "2-3 paragraphs about the historical, cultural, and literary context relevant to the topic/passage discussed",
  "outlinePoints": [
    {
      "title": "Main point title",
      "content": "Detailed explanation with supporting scripture references"
    }
  ]
}

Guidelines:
- Include 2-4 Greek insights if discussing New Testament passages, or Hebrew insights for Old Testament
- For topical sermons, focus on key biblical terms related to the theme
- Provide 3-5 outline points that build a coherent argument
- Be scholarly but accessible
- Include scripture references where relevant`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Transcript:\n\n${transcript}` },
    ],
    temperature: 0.7,
    max_tokens: 4096,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from Groq');
  }

  try {
    return JSON.parse(content);
  } catch {
    throw new Error('Failed to parse exegesis response as JSON');
  }
}
