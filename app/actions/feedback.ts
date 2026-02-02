"use server";

import { revalidatePath } from "next/cache";
import { createFeedback, updateFeedbackStatus, FeedbackStatus, FeedbackType, FeedbackPriority } from "@/dal/feedback";

export async function submitFeedbackAction(formData: FormData) {
    try {
        const userId = formData.get("userId") as string || undefined;
        const message = formData.get("message") as string;
        const feedbackType = formData.get("feedbackType") as FeedbackType || "OTHER";
        const pageUrl = formData.get("pageUrl") as string || undefined;
        const lessonId = formData.get("lessonId") as string || undefined;
        const vocabId = formData.get("vocabId") as string || undefined;
        const priority = formData.get("priority") as FeedbackPriority || "MEDIUM";

        if (!message || message.length < 3) {
            return { success: false, error: "Message must be at least 3 characters long." };
        }

        await createFeedback({
            userId,
            message,
            feedbackType,
            pageUrl,
            lessonId,
            vocabId,
            priority,
        });

        revalidatePath("/admin");
        return { success: true };
    } catch (error: any) {
        console.error("Feedback submission error:", error);
        return { success: false, error: error.message || "Failed to submit feedback." };
    }
}

export async function updateFeedbackStatusAction(id: string, status: FeedbackStatus) {
    try {
        await updateFeedbackStatus(id, status);
        revalidatePath("/admin");
        return { success: true };
    } catch (error: any) {
        console.error("Feedback status update error:", error);
        return { success: false, error: error.message || "Failed to update feedback status." };
    }
}
