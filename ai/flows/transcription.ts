"use server";

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TranscribeAndSegmentAudioInputSchema = z.object({
    audioDataUri: z.string().min(1).describe("The user's recorded audio as a data URI (e.g., data:audio/mpeg;base64,...)."),
    languageCode: z.string().default('jv-ID').describe('The language of the audio (BCP-47 code).'),
});
export type TranscribeAndSegmentAudioInput = z.infer<typeof TranscribeAndSegmentAudioInputSchema>;

const AudioSegmentWithTimestampSchema = z.object({
    text: z.string().describe('The transcribed text of the segment.'),
    startTimeSeconds: z.number().describe('The start time of the segment in seconds from the beginning of the audio.'),
    endTimeSeconds: z.number().describe('The end time of the segment in seconds from the beginning of the audio.'),
});
export type AudioSegmentWithTimestamp = z.infer<typeof AudioSegmentWithTimestampSchema>;

const TranscribeAndSegmentAudioOutputSchema = z.object({
    fullTranscription: z.string().optional().describe('The full transcription of the audio.'),
    segments: z.array(AudioSegmentWithTimestampSchema).optional().describe('An array of transcribed audio segments, each with text, startTimeSeconds, and endTimeSeconds.'),
    error: z.string().optional().describe('Error message if transcription or segmentation failed.'),
});
export type TranscribeAndSegmentAudioOutput = z.infer<typeof TranscribeAndSegmentAudioOutputSchema>;

export const transcribeAndSegmentAudioFlow = ai.defineFlow(
    {
        name: 'transcribeAndSegmentAudioFlow',
        inputSchema: TranscribeAndSegmentAudioInputSchema,
        outputSchema: TranscribeAndSegmentAudioOutputSchema,
    },
    async (input: TranscribeAndSegmentAudioInput): Promise<TranscribeAndSegmentAudioOutput> => {
        const languageName = input.languageCode === 'jv-ID' ? 'Javanese' : (input.languageCode === 'nl-NL' ? 'Dutch' : 'the specified language');

        try {
            const generationResult = await ai.generate({
                prompt: [
                    {
                        text: `
              You are an expert audio transcriber and text segmenter for ${languageName}.
              The provided audio contains spoken ${languageName} words or short phrases.
              Your goal is to segment these into the SMALLEST POSSIBLE MEANINGFUL UNITS, ideally individual words, each with PRECISE start and end timestamps.

              Your tasks are:
              1. Transcribe the ENTIRE audio content accurately.
              2. Segment the full transcription into individual words if possible.
              3. For EACH segment, provide "text", "startTimeSeconds", and "endTimeSeconds".
            `,
                    },
                    {
                        media: {
                            url: input.audioDataUri,
                        },
                    },
                ],
                output: {
                    schema: z.object({
                        fullTranscription: z.string().optional(),
                        segments: z.array(AudioSegmentWithTimestampSchema).optional(),
                    }),
                }
            } as any);

            const aiResponse = generationResult.output as { fullTranscription?: string; segments?: AudioSegmentWithTimestamp[] };

            if (!aiResponse) {
                return { error: 'AI model did not return valid transcription or segments.' };
            }

            return {
                fullTranscription: aiResponse.fullTranscription || "",
                segments: aiResponse.segments || []
            };
        } catch (e: any) {
            console.error(e);
            return { error: e.message };
        }
    }
);
