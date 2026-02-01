"use server";

import { revalidatePath } from "next/cache";
import { bulkUpsertModules } from "@/dal/modules";
import { bulkUpsertLessons } from "@/dal/lessons";
import { bulkUpsertVocabulary } from "@/dal/vocabulary";
import { bulkUpsertQuizzes } from "@/dal/quizzes";

export async function bulkImportModulesAction(jsonString: string) {
    try {
        const modules = JSON.parse(jsonString);
        if (!Array.isArray(modules)) {
            return { success: false, error: "JSON must be an array of module objects." };
        }

        const { createdCount, updatedCount } = await bulkUpsertModules(modules);

        revalidatePath("/admin");
        return {
            success: true,
            message: `Successfully imported ${createdCount} new modules and updated ${updatedCount} existing ones.`
        };
    } catch (error: any) {
        return { success: false, error: "Invalid JSON or database error: " + error.message };
    }
}

export async function bulkImportLessonsAction(moduleId: string, jsonString: string) {
    try {
        if (!moduleId) {
            return { success: false, error: "Please select a target module." };
        }

        const lessons = JSON.parse(jsonString);
        if (!Array.isArray(lessons)) {
            return { success: false, error: "JSON must be an array of lesson objects." };
        }

        const { createdCount, updatedCount } = await bulkUpsertLessons(moduleId, lessons);

        revalidatePath("/admin");
        return {
            success: true,
            message: `Successfully imported ${createdCount} new lessons and updated ${updatedCount} existing ones.`
        };
    } catch (error: any) {
        return { success: false, error: "Invalid JSON or database error: " + error.message };
    }
}

export async function bulkImportVocabularyAction(jsonString: string) {
    try {
        const words = JSON.parse(jsonString);
        if (!Array.isArray(words)) {
            return { success: false, error: "JSON must be an array of vocabulary objects." };
        }

        const { createdCount, updatedCount } = await bulkUpsertVocabulary(words);

        revalidatePath("/admin");
        return {
            success: true,
            message: `Successfully imported ${createdCount} new words and updated ${updatedCount} existing ones.`
        };
    } catch (error: any) {
        return { success: false, error: "Invalid JSON or database error: " + error.message };
    }
}

export async function bulkImportQuizzesAction(jsonString: string) {
    try {
        const quizzes = JSON.parse(jsonString);
        const dataToImport = Array.isArray(quizzes) ? quizzes : [quizzes];

        const { createdCount, updatedCount } = await bulkUpsertQuizzes(dataToImport);

        revalidatePath("/admin");
        return {
            success: true,
            message: `Successfully imported ${createdCount} new quizzes and updated ${updatedCount} existing ones.`
        };
    } catch (error: any) {
        return { success: false, error: "Invalid JSON or database error: " + error.message };
    }
}
