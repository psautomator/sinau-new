"use server";

export async function addModuleAction(formData: FormData) {
    // In a real app, check permissions here (e.g., isAdmin(session))

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const level = formData.get("level") as string;
    const order = parseInt(formData.get("order") as string || "0");
    const icon = formData.get("icon") as string || "school";
    const imageColor = formData.get("imageColor") as string || "bg-emerald-100";
    const published = formData.get("published") === "true";

    try {
        const { createModule } = await import("@/dal/modules");
        await createModule({
            title,
            description,
            level,
            order,
            icon,
            imageColor,
            published
        });

        const { revalidatePath } = await import("next/cache");
        revalidatePath("/admin");
        revalidatePath("/modules");

        return { success: true };
    } catch (error) {
        console.error("Failed to add module:", error);
        return { success: false, error: "Failed to create module" };
    }
}

export async function updateModuleAction(id: string, formData: FormData) {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const level = formData.get("level") as string;
    const order = parseInt(formData.get("order") as string || "0");
    const icon = formData.get("icon") as string;
    const imageColor = formData.get("imageColor") as string;
    const published = formData.get("published") === "true";

    try {
        const { updateModule } = await import("@/dal/modules");
        await updateModule(id, {
            title,
            description,
            level,
            order,
            icon,
            imageColor,
            published
        });

        const { revalidatePath } = await import("next/cache");
        revalidatePath("/admin");
        revalidatePath("/modules");

        return { success: true };
    } catch (error) {
        console.error("Failed to update module:", error);
        return { success: false, error: "Failed to update module" };
    }
}

export async function deleteModuleAction(id: string) {
    try {
        const { deleteModule } = await import("@/dal/modules");
        await deleteModule(id);

        const { revalidatePath } = await import("next/cache");
        revalidatePath("/admin");
        revalidatePath("/modules");

        return { success: true };
    } catch (error) {
        console.error("Failed to delete module:", error);
        return { success: false, error: "Failed to delete module" };
    }
}

export async function toggleModulePublishAction(id: string, published: boolean) {
    try {
        const { updateModule } = await import("@/dal/modules");
        await updateModule(id, { published });

        const { revalidatePath } = await import("next/cache");
        revalidatePath("/admin");
        revalidatePath("/modules");

        return { success: true };
    } catch (error) {
        console.error("Failed to toggle publish status:", error);
        return { success: false, error: "Failed to update publication status" };
    }
}

export async function deleteVocabularyAction(id: string) {
    try {
        const { deleteVocabulary } = await import("@/dal/vocabulary");
        await deleteVocabulary(id);

        const { revalidatePath } = await import("next/cache");
        revalidatePath("/admin");

        return { success: true };
    } catch (error) {
        console.error("Failed to delete vocabulary:", error);
        return { success: false, error: "Failed to delete vocabulary item" };
    }
}
export async function addVocabularyAction(formData: FormData) {
    const word = formData.get("word") as string;
    const translation = formData.get("translation") as string;
    const phonetic = formData.get("phonetic") as string;
    const aiHint = formData.get("aiHint") as string;
    const exampleJavanese = formData.get("exampleJavanese") as string;
    const exampleDutch = formData.get("exampleDutch") as string;
    const notes = formData.get("notes") as string;
    const tagsString = formData.get("tags") as string;
    const tags = tagsString ? tagsString.split(",").map(t => t.trim()).filter(t => t !== "") : [];
    const formality = formData.get("formality") as any;
    const category = formData.get("category") as string;
    const audioUrl = formData.get("audioUrl") as string;
    const context = formData.get("context") as string;
    const level = formData.get("level") as string;
    const moduleId = (formData.get("moduleId") as string) || undefined;

    try {
        const { createVocabulary } = await import("@/dal/vocabulary");
        await createVocabulary({
            word,
            translation,
            phonetic,
            aiHint,
            exampleJavanese,
            exampleDutch,
            notes,
            tags,
            formality,
            category,
            audioUrl,
            context,
            level,
            moduleId
        });

        const { revalidatePath } = await import("next/cache");
        revalidatePath("/admin");

        return { success: true };
    } catch (error) {
        console.error("Failed to add vocabulary:", error);
        return { success: false, error: "Failed to create vocabulary item" };
    }
}

export async function updateVocabularyAction(id: string, formData: FormData) {
    const word = formData.get("word") as string;
    const translation = formData.get("translation") as string;
    const phonetic = formData.get("phonetic") as string;
    const aiHint = formData.get("aiHint") as string;
    const exampleJavanese = formData.get("exampleJavanese") as string;
    const exampleDutch = formData.get("exampleDutch") as string;
    const notes = formData.get("notes") as string;
    const tagsString = formData.get("tags") as string;
    const tags = tagsString ? tagsString.split(",").map(t => t.trim()).filter(t => t !== "") : [];
    const formality = formData.get("formality") as any;
    const category = formData.get("category") as string;
    const audioUrl = formData.get("audioUrl") as string;
    const context = formData.get("context") as string;
    const level = formData.get("level") as string;
    const moduleId = (formData.get("moduleId") as string) || undefined;

    try {
        const { updateVocabulary } = await import("@/dal/vocabulary");
        await updateVocabulary(id, {
            word,
            translation,
            phonetic,
            aiHint,
            exampleJavanese,
            exampleDutch,
            notes,
            tags,
            formality,
            category,
            audioUrl,
            context,
            level,
            moduleId
        });

        const { revalidatePath } = await import("next/cache");
        revalidatePath("/admin");

        return { success: true };
    } catch (error) {
        console.error("Failed to update vocabulary:", error);
        return { success: false, error: "Failed to update vocabulary item" };
    }
}
export async function bulkMatchAudioAction() {
    try {
        const { bulkMatchAudioFiles } = await import("@/dal/vocabulary");
        const result = await bulkMatchAudioFiles();

        if (result.success) {
            const { revalidatePath } = await import("next/cache");
            revalidatePath("/admin");
            return { success: true, matches: result.matches, totalFiles: result.totalFiles, totalVocab: result.totalVocab };
        } else {
            return { success: false, error: result.error };
        }
    } catch (error) {
        console.error("Failed to bulk match audio:", error);
        return { success: false, error: "An unexpected error occurred during matching" };
    }
}
