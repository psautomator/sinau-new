"use server";

import { evaluatePronunciationFlow, type EvaluatePronunciationInput, type EvaluatePronunciationOutput } from "./flows/pronunciation";
import { transcribeAndSegmentAudioFlow, type TranscribeAndSegmentAudioInput, type TranscribeAndSegmentAudioOutput } from "./flows/transcription";

/**
 * Server Action to evaluate the user's pronunciation.
 */
export async function evaluatePronunciationAction(input: EvaluatePronunciationInput): Promise<EvaluatePronunciationOutput> {
    try {
        return await evaluatePronunciationFlow(input);
    } catch (error) {
        console.error("Pronunciation Evaluation error:", error);
        throw new Error("Mislukt om uitspraak te evalueren.");
    }
}

/**
 * Server Action to transcribe and segment audio.
 */
export async function transcribeAndSegmentAudioAction(input: TranscribeAndSegmentAudioInput): Promise<TranscribeAndSegmentAudioOutput> {
    try {
        return await transcribeAndSegmentAudioFlow(input);
    } catch (error) {
        console.error("Transcription error:", error);
        throw new Error("Mislukt om audio te transcriberen.");
    }
}
