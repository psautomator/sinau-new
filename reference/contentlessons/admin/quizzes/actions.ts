'use server';

import { revalidatePath } from 'next/cache';
import { QuizImportSchema, type QuizImportData } from '@/lib/data';
import { bulkUpsertQuizzes, toggleQuizPublishInDb } from '@/lib/dal';

interface BulkImportResult {
    success: boolean;
    message: string;
    createdCount?: number;
    updatedCount?: number;
    error?: string;
}

export async function bulkImportQuizzesAction(jsonString: string): Promise<BulkImportResult> {
    let data: QuizImportData;
    try {
        const jsonData = JSON.parse(jsonString);
        const validationResult = QuizImportSchema.safeParse(jsonData);
        
        if (!validationResult.success) {
            console.error("Zod validation error:", validationResult.error.flatten());
            return {
                success: false,
                message: "JSON validation failed. Please check the format.",
                error: JSON.stringify(validationResult.error.flatten()),
            };
        }
        data = validationResult.data;
    } catch (e) {
        return { success: false, message: "Invalid JSON string. Please check for syntax errors." };
    }

    if (data.length === 0) {
        return { success: false, message: "No quizzes found in the provided JSON." };
    }

    try {
        const { createdCount, updatedCount } = await bulkUpsertQuizzes(data);
        
        revalidatePath('/admin/quizzes');

        return {
            success: true,
            message: `Import successful! ${createdCount} quizzes created, ${updatedCount} quizzes updated.`,
            createdCount,
            updatedCount,
        };
    } catch (error) {
        console.error("Bulk import failed:", error);
        return { success: false, message: "An error occurred during the database import." };
    }
}

export async function toggleQuizPublishAction(id: string, isPublished: boolean) {
    try {
        await toggleQuizPublishInDb(id, isPublished);
        revalidatePath('/admin/quizzes');
        return { success: true, message: `Quiz status updated.` };
    } catch (error) {
        return { success: false, error: "Database error." };
    }
}
