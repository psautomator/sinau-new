"use server";

import { revalidatePath } from "next/cache";
import { completeLesson } from "@/dal/lessons";
import { addExperience } from "@/dal/user";
import { MOCK_USER_ID } from "@/lib/mock-auth";

/**
 * Server Action to mark a lesson as completed.
 * It updates the progress in the database and rewards the user with XP.
 */
export async function completeLessonAction(lessonId: string) {
    try {
        // 1. Record lesson completion
        await completeLesson(MOCK_USER_ID, lessonId);

        // 2. Reward XP (e.g., 50 XP per lesson)
        await addExperience(MOCK_USER_ID, 50);

        // 3. Revalidate paths to update UI
        // Fetch lesson to know which module to revalidate
        // We need to import getLessonById or use prisma directly. 
        // Since getLessonById exports partial selection, let's use a lightweight query or import what we have.
        // Importing getLessonById from "@/dal/lessons" is best practice.
        const { getLessonById } = await import("@/dal/lessons");
        const lesson = await getLessonById(lessonId);

        if (lesson) {
            revalidatePath(`/modules/${lesson.moduleId}`);
            revalidatePath(`/lessons/${lesson.slug}`);
        }

        revalidatePath("/");
        revalidatePath("/modules");
        revalidatePath("/leaderboard");

        return { success: true, message: "Lesson completed! +50 XP" };
    } catch (error) {
        console.error("Failed to complete lesson:", error);
        return { success: false, message: "Failed to save progress." };
    }
}
