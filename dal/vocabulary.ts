import { prisma } from "./index";

// Using any for Formality due to prisma client generation issues
type Formality = any;

/**
 * Fetches vocabulary items with filtering and pagination.
 */
export async function getVocabulary(params: {
    search?: string;
    category?: string;
    formality?: Formality;
    audioUrl?: string;
    audioStatus?: 'all' | 'hasAudio' | 'noAudio';
    skip?: number;
    take?: number;
} = {}) {
    const { search, category, formality, audioStatus, skip, take } = params;

    const where: any = {};
    if (search) {
        where.OR = [
            { word: { contains: search, mode: "insensitive" } },
            { translation: { contains: search, mode: "insensitive" } },
        ];
    }
    if (category) where.category = category;
    if (formality) where.formality = formality;

    if (audioStatus === 'hasAudio') {
        // Must have a value that is not null and not empty string
        where.AND = [
            { audioUrl: { not: null } },
            { audioUrl: { not: "" } }
        ];
    } else if (audioStatus === 'noAudio') {
        // Either null or empty string
        where.OR = [
            ...(where.OR || []),
            { audioUrl: null },
            { audioUrl: "" }
        ];
    }

    const [vocabulary, total] = await Promise.all([
        prisma.vocabulary.findMany({
            where,
            orderBy: { word: "asc" },
            skip,
            take,
        }),
        prisma.vocabulary.count({ where }),
    ]);

    // Check if audio files actually exist in public directory
    const fs = await import("fs");
    const path = await import("path");
    const vocabularyWithStatus = vocabulary.map((v: any) => {
        let audioFileExists = false;
        if (v.audioUrl && (v.audioUrl.startsWith('/') || v.audioUrl.startsWith('uploads/'))) {
            const relativePath = v.audioUrl.startsWith('/') ? v.audioUrl.substring(1) : v.audioUrl;
            const fullPath = path.join(process.cwd(), "public", relativePath);
            audioFileExists = fs.existsSync(fullPath);
        }
        return {
            ...v,
            audioFileExists,
        };
    });

    return { vocabulary: vocabularyWithStatus, total };
}

/**
 * Fetches all vocabulary items for selection.
 */
export async function getAllVocabularySimple() {
    return await prisma.vocabulary.findMany({
        orderBy: { word: "asc" },
        select: {
            id: true,
            word: true,
            translation: true,
        },
    });
}

/**
 * Fetches vocabulary by formality level.
 */
export async function getVocabularyByFormality(formality: Formality) {
    return await prisma.vocabulary.findMany({
        where: { formality },
        orderBy: { word: "asc" },
    });
}

/**
 * Admin: Adds a new word to the dictionary.
 */
export async function createVocabulary(data: {
    word: string;
    translation: string;
    phonetic?: string;
    aiHint?: string;
    exampleJavanese?: string;
    exampleDutch?: string;
    notes?: string;
    tags?: string[];
    formality: Formality;
    context?: string;
    category?: string;
    audioUrl?: string;
    moduleId?: string;
}) {
    return await prisma.vocabulary.create({
        data,
    });
}

/**
 * Admin: Updates an existing word.
 */
export async function updateVocabulary(id: string, data: Partial<{
    word: string;
    translation: string;
    phonetic: string;
    aiHint: string;
    exampleJavanese: string;
    exampleDutch: string;
    notes: string;
    tags: string[];
    formality: Formality;
    context: string;
    category: string;
    audioUrl: string;
    moduleId: string;
}>) {
    return await prisma.vocabulary.update({
        where: { id },
        data,
    });
}

/**
 * Admin: Deletes a word.
 */
export async function deleteVocabulary(id: string) {
    return await prisma.vocabulary.delete({
        where: { id },
    });
}

/**
 * Fetch words by IDs (for Lesson Flashcards)
 */
export async function getWordsByIds(ids: string[]) {
    return await prisma.vocabulary.findMany({
        where: { id: { in: ids } },
    });
}
/**
 * Fetch flashcards for a specific lesson based on its JSON content.
 */
export async function getFlashcardsByLesson(lessonId: string) {
    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        select: { content: true }
    });

    if (!lesson || !lesson.content) return [];

    const content = lesson.content as any;
    const flashcardSections = (content.sections || []).filter((s: any) => s.type === "FLASHCARD_SET");

    const allWordIds = flashcardSections.flatMap((s: any) => s.wordIds || s.content?.wordIds || []);

    if (allWordIds.length === 0) return [];

    return await prisma.vocabulary.findMany({
        where: { id: { in: allWordIds } }
    });
}
/**
 * Admin: Bulk matches vocabulary words with audio files in public/audio/uploads.
 */
export async function bulkMatchAudioFiles() {
    const fs = await import("fs");
    const path = await import("path");

    const uploadsDir = path.join(process.cwd(), "public", "audio", "uploads");
    if (!fs.existsSync(uploadsDir)) return { success: false, error: "Uploads directory not found" };

    const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith(".mp3"));

    const sanitize = (str: string) => {
        return str
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // remove diacritics
            .replace(/[-\s]+/g, "_")         // replace hyphens and spaces with underscores
            .replace(/[^\w]/g, "")           // remove any other special characters
            .replace(/^_+|_+$/g, "");        // trim underscores from edges
    };

    const fileMap = new Map();
    files.forEach(f => {
        const nameWithoutExt = f.replace(".mp3", "");
        // We also sanitize the filename just in case it has weird characters
        fileMap.set(sanitize(nameWithoutExt), `/audio/uploads/${f}`);
    });

    const vocabulary = await prisma.vocabulary.findMany();
    let matches = 0;

    // Use transaction for better performance if many updates
    const updates = [];

    for (const vocab of vocabulary) {
        const sanitizedWord = sanitize(vocab.word);
        if (fileMap.has(sanitizedWord)) {
            // Only update if it's different to save DB ops
            const newUrl = fileMap.get(sanitizedWord);
            if (vocab.audioUrl !== newUrl) {
                updates.push(
                    prisma.vocabulary.update({
                        where: { id: vocab.id },
                        data: { audioUrl: newUrl }
                    })
                );
                matches++;
            }
        }
    }

    if (updates.length > 0) {
        await prisma.$transaction(updates);
    }

    return { success: true, matches, totalFiles: files.length, totalVocab: vocabulary.length };
}

/**
 * Admin: Bulk upserts vocabulary words. Handles legacy field names as well.
 */
export async function bulkUpsertVocabulary(words: any[]) {
    let createdCount = 0;
    let updatedCount = 0;

    for (const wordData of words) {
        // Find by word + translation pair to avoid duplicates
        const primaryWord = wordData.word || wordData.javanese;
        const primaryTranslation = wordData.translation || wordData.dutch;

        if (!primaryWord || !primaryTranslation) continue;

        const existing = await prisma.vocabulary.findFirst({
            where: {
                word: primaryWord,
                translation: primaryTranslation
            }
        });

        const payload = {
            word: primaryWord,
            translation: primaryTranslation,
            phonetic: wordData.phonetic || "",
            aiHint: wordData.aiHint || "",
            exampleJavanese: wordData.exampleJavanese || wordData.exampleSentenceJavanese || "",
            exampleDutch: wordData.exampleDutch || wordData.exampleSentenceDutch || "",
            notes: wordData.notes || "",
            tags: wordData.tags || [],
            formality: (wordData.formality || "NGOKO").toUpperCase(),
            category: wordData.category || "",
            audioUrl: wordData.audioUrl || wordData.audioJavanese || "",
        };

        if (existing) {
            await prisma.vocabulary.update({
                where: { id: existing.id },
                data: (payload as any)
            });
            updatedCount++;
        } else {
            await prisma.vocabulary.create({
                data: (payload as any)
            });
            createdCount++;
        }
    }

    return { createdCount, updatedCount };
}
