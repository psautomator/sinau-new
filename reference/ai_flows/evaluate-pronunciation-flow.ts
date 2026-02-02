
'use server';

/**
 * @fileOverview An AI flow for evaluating a user's pronunciation.
 * 
 * - evaluatePronunciation - A function that handles the pronunciation evaluation.
 * - EvaluatePronunciationInput - The input type for the evaluation function.
 * - EvaluatePronunciationOutput - The return type for the evaluation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const EvaluatePronunciationInputSchema = z.object({
  referenceText: z.string().describe('The correct text the user is supposed to say.'),
  audioDataUri: z.string().describe("A recording of the user's pronunciation, as a data URI that must include a MIME type and use Base64 encoding."),
});
export type EvaluatePronunciationInput = z.infer<typeof EvaluatePronunciationInputSchema>;

const EvaluatePronunciationOutputSchema = z.object({
  score: z.number().min(0).max(100).describe('A score from 0 to 100 representing the pronunciation accuracy.'),
  feedback: z.string().describe("Concise, actionable feedback in Dutch for the user to improve their pronunciation."),
});
export type EvaluatePronunciationOutput = z.infer<typeof EvaluatePronunciationOutputSchema>;

const pronunciationPrompt = ai.definePrompt({
    name: "pronunciationCoachPrompt",
    input: { schema: EvaluatePronunciationInputSchema },
    output: { schema: EvaluatePronunciationOutputSchema },
    prompt: `You are an expert Javanese language pronunciation coach. Your task is to evaluate a user's pronunciation of a given text. The user is a Dutch speaker.

    Provide a score from 0 to 100, where 100 is a perfect native-like pronunciation.
    Also, provide concise, actionable feedback in Dutch to help the user improve. Focus on specific sounds they got wrong. If the pronunciation is very good, compliment them.
    
    Reference Text: {{{referenceText}}}
    User's Audio Recording: {{media url=audioDataUri}}`,
});

const evaluatePronunciationFlow = ai.defineFlow(
    {
        name: "evaluatePronunciationFlow",
        inputSchema: EvaluatePronunciationInputSchema,
        outputSchema: EvaluatePronunciationOutputSchema,
    },
    async (input) => {
        const { output } = await pronunciationPrompt(input);
        if (!output) {
            throw new Error("AI evaluation failed to return a valid output.");
        }
        return output;
    }
);

// This is the only function exported from this file for use in Server Actions.
export async function evaluatePronunciation(input: EvaluatePronunciationInput): Promise<EvaluatePronunciationOutput> {
    return await evaluatePronunciationFlow(input);
}
