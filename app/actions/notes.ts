"use server";

import { prisma } from "@/dal";
import { revalidatePath } from "next/cache";

export async function saveLessonNote(userId: string, lessonId: string, note: string) {
    try {
        await prisma.userLessonNote.upsert({
            where: {
                userId_lessonId: {
                    userId,
                    lessonId
                }
            },
            update: {
                note
            },
            create: {
                userId,
                lessonId,
                note
            }
        });
        revalidatePath(`/lessons`);
        return { success: true };
    } catch (error) {
        console.error("Error saving note:", error);
        return { success: false, error: "Failed to save note" };
    }
}

export async function getLessonNote(userId: string, lessonId: string) {
    const note = await prisma.userLessonNote.findUnique({
        where: {
            userId_lessonId: {
                userId,
                lessonId
            }
        }
    });
    return note?.note || "";
}
