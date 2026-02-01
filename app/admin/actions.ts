"use server";

import { revalidatePath } from "next/cache";
import { createLesson, updateLesson, deleteLesson } from "@/dal/lessons";
import { createQuiz, updateQuiz, deleteQuiz } from "@/dal/quizzes";
import { deleteUser } from "@/dal/user";

export async function saveLessonAction(formData: FormData) {
    try {
        const id = formData.get("id") as string;
        const title = formData.get("title") as string;
        const slug = formData.get("slug") as string;
        const description = formData.get("description") as string;
        const order = parseInt(formData.get("order") as string || "0");
        const moduleId = formData.get("moduleId") as string;
        const quizId = formData.get("quizId") as string;
        const published = formData.get("published") === "on";
        const level = formData.get("level") as string;
        const languageStyle = formData.get("languageStyle") as string;

        const contentRaw = formData.get("content") as string;
        const content = contentRaw ? JSON.parse(contentRaw) : undefined;

        if (id) {
            await updateLesson(id, { title, slug, description, order, moduleId, content, quizId, published, level, languageStyle });
        } else {
            await createLesson({ title, slug, description, order, moduleId, content: content || {}, quizId, published, level, languageStyle });
        }

        revalidatePath("/admin");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function saveLessonSectionsAction(lessonId: string, sections: any) {
    try {
        await updateLesson(lessonId, { content: { sections } });
        revalidatePath("/admin");
        revalidatePath(`/lessons`); // Might need to revalidate specific slug if cached
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleLessonPublishAction(id: string, published: boolean) {
    try {
        await updateLesson(id, { published });
        revalidatePath("/admin");
        revalidatePath(`/lessons`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteLessonAction(id: string) {
    try {
        await deleteLesson(id);
        revalidatePath("/admin");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function saveQuizAction(formData: FormData) {
    try {
        const id = formData.get("id") as string;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const lessonId = formData.get("lessonId") as string;
        const published = formData.get("published") === "on";
        const questionsStr = formData.get("questions") as string;
        const questions = questionsStr ? JSON.parse(questionsStr) : undefined;

        if (id) {
            await updateQuiz(id, { title, description, lessonId, published, questions });
        } else {
            await createQuiz({ title, description, lessonId, published, questions });
        }

        revalidatePath("/admin");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteQuizAction(id: string) {
    try {
        await deleteQuiz(id);
        revalidatePath("/admin");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteUserAction(id: string) {
    try {
        await deleteUser(id);
        revalidatePath("/admin");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
