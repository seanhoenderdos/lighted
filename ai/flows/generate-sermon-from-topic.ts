import { generateSermonFromInput } from '@/ai/ai-instance';  // Correct import
import { z } from 'zod';

// Define the schema for the input and output
export const GenerateSermonInputSchema = z.object({
  topic: z.string(),
  verses: z.array(z.string()),  // Ensure verses is an array
  denomination: z.string(),
});

export const GenerateSermonOutputSchema = z.object({
  sermonDraft: z.string(),
});

// Example of using the generateSermonFromInput function
export async function generateSermon(input: { topic: string; verses: string[]; denomination: string }) {
  const result = await generateSermonFromInput(input);
  return result;
}
