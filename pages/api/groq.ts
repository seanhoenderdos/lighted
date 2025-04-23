// ...for Next.js API route...
import type { NextApiRequest, NextApiResponse } from 'next';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { messages, model } = req.body;
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: model || "llama3-8b-8192",
    });
    res.status(200).json(chatCompletion);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
}
