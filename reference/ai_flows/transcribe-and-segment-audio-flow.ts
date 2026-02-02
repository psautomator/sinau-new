
'use server';
/**
 * @fileOverview Genkit flow to transcribe audio and attempt to segment the text with timestamps.
 *
 * - transcribeAndSegmentAudio - Transcribes audio and segments text with timestamps.
 * - TranscribeAndSegmentAudioInput - Input type for the flow.
 * - TranscribeAndSegmentAudioOutput - Output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TranscribeAndSegmentAudioInputSchema = z.object({
  audioDataUri: z.string().min(1).describe("The user's recorded audio as a data URI (e.g., data:audio/mpeg;base64,...)."),
  languageCode: z.string().default('jv-ID').describe('The language of the audio (BCP-47 code).'),
});
export type TranscribeAndSegmentAudioInput = z.infer<typeof TranscribeAndSegmentAudioInputSchema>;

// Schema voor een segment met timestamps, nu met startTimeSeconds en endTimeSeconds als verplicht
const AudioSegmentWithTimestampSchema = z.object({
  text: z.string().describe('The transcribed text of the segment.'),
  startTimeSeconds: z.number().describe('The start time of the segment in seconds from the beginning of the audio.'),
  endTimeSeconds: z.number().describe('The end time of the segment in seconds from the beginning of the audio.'),
}).refine(data => data.endTimeSeconds >= data.startTimeSeconds, {
    message: "endTimeSeconds moet gelijk zijn aan of later dan startTimeSeconds."
});
export type AudioSegmentWithTimestamp = z.infer<typeof AudioSegmentWithTimestampSchema>;

const TranscribeAndSegmentAudioOutputSchema = z.object({
  fullTranscription: z.string().optional().describe('The full transcription of the audio.'),
  segments: z.array(AudioSegmentWithTimestampSchema).optional().describe('An array of transcribed audio segments, each with text, startTimeSeconds, and endTimeSeconds.'),
  error: z.string().optional().describe('Error message if transcription or segmentation failed.'),
});
export type TranscribeAndSegmentAudioOutput = z.infer<typeof TranscribeAndSegmentAudioOutputSchema>;

export async function transcribeAndSegmentAudio(input: TranscribeAndSegmentAudioInput): Promise<TranscribeAndSegmentAudioOutput> {
  // console.log('[transcribeAndSegmentAudio Flow] Received input:', { languageCode: input.languageCode, audioUriLength: input.audioDataUri.length });
  return transcribeAndSegmentAudioFlow(input);
}

const transcribeAndSegmentAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAndSegmentAudioFlow',
    inputSchema: TranscribeAndSegmentAudioInputSchema,
    outputSchema: TranscribeAndSegmentAudioOutputSchema,
  },
  async (input: TranscribeAndSegmentAudioInput): Promise<TranscribeAndSegmentAudioOutput> => {
    const languageName = input.languageCode === 'jv-ID' ? 'Javanese' : (input.languageCode === 'nl-NL' ? 'Dutch' : 'the specified language');

    const promptConfig = {
      prompt: [
        {
          text: `
            You are an expert audio transcriber and text segmenter for ${languageName}.
            The provided audio contains spoken ${languageName} words or short phrases.
            Your goal is to segment these into the SMALLEST POSSIBLE MEANINGFUL UNITS, ideally individual words, each with PRECISE start and end timestamps.
            These segments will be matched against a vocabulary list of individual words.

            Your tasks are:
            1. Transcribe the ENTIRE audio content accurately.
            2. Segment the full transcription into individual words if possible. If a fixed short phrase (e.g., a greeting like "sugeng enjing") is present, it can be a single segment.
               Avoid creating long segments containing multiple distinct words that could be vocabulary items.
            3. For EACH segment, you MUST provide:
               - "text" (string): The transcribed text of the segment.
               - "startTimeSeconds" (number): The ACCURATE start time of the segment in seconds from the beginning of the audio, corresponding to when the first sound of the segment's text begins.
               - "endTimeSeconds" (number): The ACCURATE end time of the segment in seconds from the beginning of the audio, corresponding to when the last sound of the segment's text ends.
               Ensure that "startTimeSeconds" and "endTimeSeconds" are always provided as numbers.
               endTimeSeconds must be greater than or equal to startTimeSeconds. The duration (endTimeSeconds - startTimeSeconds) should tightly match the spoken segment.

            Respond ONLY with a JSON object with two keys:
            - "fullTranscription": A string containing the full transcription of the entire audio.
            - "segments": An array of objects, where each object MUST have "text" (string), "startTimeSeconds" (number), and "endTimeSeconds" (number).

            Example for audio "kowe mangan iwak":
            {
              "fullTranscription": "kowe mangan iwak",
              "segments": [
                { "text": "kowe", "startTimeSeconds": 0.5, "endTimeSeconds": 1.2 },
                { "text": "mangan", "startTimeSeconds": 1.3, "endTimeSeconds": 1.9 },
                { "text": "iwak", "startTimeSeconds": 2.0, "endTimeSeconds": 2.5 }
              ]
            }

            If the audio contains only "sugeng enjing", and it is spoken from 0.2s to 1.5s:
            {
              "fullTranscription": "sugeng enjing",
              "segments": [
                { "text": "sugeng enjing", "startTimeSeconds": 0.2, "endTimeSeconds": 1.5 }
              ]
            }

            CRITICAL: Ensure the timestamps for each segment accurately reflect the spoken duration of THAT SPECIFIC TEXT SEGMENT.
            Do NOT include long pauses or parts of other words within a segment's timestamps.
          `,
        },
        {
          media: {
            url: input.audioDataUri,
          },
        },
      ],
      model: 'googleai/gemini-2.0-flash',
      config: {
        temperature: 0.1, // Lower temperature for more deterministic output
        candidateCount: 1,
      },
      output: {
        schema: z.object({
          fullTranscription: z.string().optional(),
          segments: z.array(AudioSegmentWithTimestampSchema).optional(), 
        }),
      }
    };

    try {
      // console.log(`[transcribeAndSegmentAudioFlow] Sending prompt to AI for audio processing. Language: ${languageName}`);
      const generationResult = await ai.generate(promptConfig as any); 

      const aiResponse = generationResult.output as { fullTranscription?: string; segments?: AudioSegmentWithTimestamp[] };

      if (!aiResponse || (!aiResponse.fullTranscription && (!aiResponse.segments || aiResponse.segments.length === 0))) {
        console.warn('[transcribeAndSegmentAudioFlow] AI returned invalid or empty response. Response object:', JSON.stringify(generationResult));
        return { error: 'AI model did not return valid transcription or segments.' };
      }

      if (aiResponse.segments) {
        for (const seg of aiResponse.segments) {
          if (typeof seg.startTimeSeconds !== 'number' || typeof seg.endTimeSeconds !== 'number') {
            console.warn('[transcribeAndSegmentAudioFlow] AI returned a segment without valid startTimeSeconds or endTimeSeconds:', seg);
            // Optioneel: filter dit segment uit of markeer het als problematisch
          } else if (seg.endTimeSeconds < seg.startTimeSeconds) {
            console.warn(`[transcribeAndSegmentAudioFlow] AI returned a segment with endTime (${seg.endTimeSeconds}) before startTime (${seg.startTimeSeconds}):`, seg);
            // Optioneel: corrigeer of filter
          }
        }
      }

      // console.log(`[transcribeAndSegmentAudioFlow] Processing successful. Full Transcription: "${aiResponse.fullTranscription}", Segments found: ${aiResponse.segments?.length || 0}`);
      // if (aiResponse.segments && aiResponse.segments.length > 0) {
      //   console.log('[transcribeAndSegmentAudioFlow] First segment example:', JSON.stringify(aiResponse.segments[0]));
      // }

      return {
        fullTranscription: aiResponse.fullTranscription || "",
        segments: aiResponse.segments || (aiResponse.fullTranscription ? [{ text: aiResponse.fullTranscription, startTimeSeconds: 0, endTimeSeconds: 0 }] : [])
      };

    } catch (e: unknown) {
      let errorMessage = 'An unexpected error occurred during audio processing.';
      if (e instanceof Error) {
        errorMessage = `Error during audio processing: ${e.message}`;
        if ((e as any).cause) {
          errorMessage += ` Cause: ${String((e as any).cause)}`;
        }
      }
      console.error('[transcribeAndSegmentAudioFlow] Exception:', errorMessage, e);
      return { error: errorMessage };
    }
  }
);
