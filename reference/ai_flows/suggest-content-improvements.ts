'use server';

/**
 * @fileOverview A content improvement suggestion AI agent.
 *
 * - suggestContentImprovements - A function that suggests improvements to content.
 * - SuggestContentImprovementsInput - The input type for the suggestContentImprovements function.
 * - SuggestContentImprovementsOutput - The return type for the suggestContentImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestContentImprovementsInputSchema = z.object({
  content: z.string().describe('The content to improve.'),
});
export type SuggestContentImprovementsInput = z.infer<typeof SuggestContentImprovementsInputSchema>;

const SuggestContentImprovementsOutputSchema = z.object({
  improvedContent: z.string().describe('The improved content.'),
  suggestions: z.array(z.string()).describe('Specific suggestions for improvement.'),
});
export type SuggestContentImprovementsOutput = z.infer<typeof SuggestContentImprovementsOutputSchema>;

export async function suggestContentImprovements(
  input: SuggestContentImprovementsInput
): Promise<SuggestContentImprovementsOutput> {
  return suggestContentImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestContentImprovementsPrompt',
  input: {schema: SuggestContentImprovementsInputSchema},
  output: {schema: SuggestContentImprovementsOutputSchema},
  prompt: `You are an AI assistant that provides suggestions for improving text content.

  Given the following content, please provide an improved version and a list of specific suggestions for how to make it better.

  Content: {{{content}}}
  `,
});

const suggestContentImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestContentImprovementsFlow',
    inputSchema: SuggestContentImprovementsInputSchema,
    outputSchema: SuggestContentImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
