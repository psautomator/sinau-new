"use server";

import { upsertSpacedRepetition } from "@/dal/vocabulary";
import { MOCK_USER_ID } from "@/lib/mock-auth";
import { revalidatePath } from "next/cache";

/**
 * Updates SRS state for a word based on a standard rating (0-5).
 */
export async function updateSrsAction(wordId: string, quality: number) {
    try {
        await upsertSpacedRepetition(MOCK_USER_ID, wordId, quality);
        revalidatePath("/flashcards");
        revalidatePath("/pronunciation");
        return { success: true };
    } catch (error) {
        console.error("Failed to update SRS:", error);
        return { success: false, error: "Kon voortgang niet opslaan." };
    }
}

/**
 * Updates SRS state based on a pronunciation score (0-100).
 * Maps:
 * - 90+ -> 5 (Easy)
 * - 75-89 -> 4 (Good)
 * - 60-74 -> 3 (Hard/Correct)
 * - 40-59 -> 2 (Incorrect/Easy)
 * - 20-39 -> 1 (Incorrect/Hard)
 * - <20 -> 0 (Blackout)
 */
export async function updateSrsFromPronunciationAction(wordId: string, score: number) {
    let quality = 0;
    if (score >= 90) quality = 5;
    else if (score >= 75) quality = 4;
    else if (score >= 60) quality = 3;
    else if (score >= 40) quality = 2;
    else if (score >= 20) quality = 1;

    return await updateSrsAction(wordId, quality);
}
