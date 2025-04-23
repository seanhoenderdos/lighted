'use server';

import { hfClient } from '@/ai/ai-instance';  // Ensure we're importing hfClient

export type IdentifyRelevantScripturesInput = {
  sermonContent: string;
};

export type IdentifyRelevantScripturesOutput = {
  relevantScriptures: string[];
};

export async function identifyRelevantScriptures(
  input: IdentifyRelevantScripturesInput
): Promise<IdentifyRelevantScripturesOutput> {
  return identifyRelevantScripturesFlow(input);
}

const identifyRelevantScripturesFlow = async (
  input: IdentifyRelevantScripturesInput
): Promise<IdentifyRelevantScripturesOutput> => {
  const { sermonContent } = input;

  // Construct the prompt for Hugging Face to identify relevant scriptures
  const response = await hfClient.textGeneration({
    model: 'Llama-3', // Replace with your actual model name
    inputs: `Given the following sermon content, identify relevant scripture passages that could be used to support the sermon:\n\n${sermonContent}`,
  });

  // Process the AI response to extract scripture references
  const relevantScriptures: string[] = response.generated_text
    ? response.generated_text.split('\n').map((verse: string) => verse.trim())
    : [];

  return { relevantScriptures };
};
