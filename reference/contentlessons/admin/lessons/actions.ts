
'use server';

import { revalidatePath } from 'next/cache';
import { LessonImportSchema, type LessonImportData, ContentBlocksArraySchema, type ContentBlock } from '@/lib/data';
import { bulkUpsertLessons, toggleLessonPublishInDb, updateLessonContentInDb } from '@/lib/dal';

interface BulkImportResult {
    success: boolean;
    message: string;
    createdCount?: number;
    updatedCount?: number;
    error?: string;
}

export async function bulkImportLessonsAction(moduleId: string, jsonString: string): Promise<BulkImportResult> {
    if (!moduleId) {
        return { success: false, message: "Module ID is required. Please select a module." };
    }

    let data: LessonImportData;
    try {
        const jsonData = JSON.parse(jsonString);
        const dataToValidate = Array.isArray(jsonData) ? jsonData : [jsonData];
        const validationResult = LessonImportSchema.safeParse(dataToValidate);
        
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
        return { success: false, message: "No lessons found in the provided JSON." };
    }

    try {
        const { createdCount, updatedCount } = await bulkUpsertLessons(moduleId, data);
        
        revalidatePath('/admin/lessons');
        revalidatePath('/admin/modules'); // Also revalidate modules as lesson counts might change

        return {
            success: true,
            message: `Import successful! ${createdCount} lessons created, ${updatedCount} lessons updated.`,
            createdCount,
            updatedCount,
        };
    } catch (error) {
        console.error("Bulk import failed:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, message: "An error occurred during the database import.", error: errorMessage };
    }
}


export async function toggleLessonPublishAction(id: string, isPublished: boolean) {
    try {
        await toggleLessonPublishInDb(id, isPublished);
        revalidatePath('/admin/lessons');
        return { success: true, message: `Lesson status updated.` };
    } catch (error) {
        return { success: false, error: "Database error." };
    }
}


export async function updateLessonContentAction(lessonId: string, blocks: ContentBlock[]) {
    try {
        const validationResult = ContentBlocksArraySchema.safeParse(blocks);
        if (!validationResult.success) {
            console.error("Zod validation error on updateLessonContentAction:", validationResult.error.flatten());
             return { success: false, error: "Validation failed on the server." };
        }
        await updateLessonContentInDb(lessonId, validationResult.data);
        revalidatePath(`/admin/lessons/${lessonId}/edit-content`);
        revalidatePath(`/modules/.*/lessons/${lessonId}`); // Revalidate public lesson page
        return { success: true };
    } catch (error) {
        console.error("Error updating lesson content:", error);
        return { success: false, error: "Failed to save content to the database." };
    }
}
