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
    level?: string;
    skip?: number;
    take?: number;
} = {}) {
    const { search, category, formality, audioStatus, level, skip, take } = params;

    const where: any = {};
    if (search) {
        where.OR = [
            { word: { contains: search, mode: "insensitive" } },
            { translation: { contains: search, mode: "insensitive" } },
        ];
    }
    if (category) where.category = category;
    if (formality) where.formality = formality;
    if (level) where.level = level;

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
    level?: string;
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
    level: string;
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
 * Fetch a deterministic "Word of the Day" for a specific user.
 * Changes every 24h and is unique per user ID.
 */
export async function getWordOfTheDay(userId: string) {
    const total = await prisma.vocabulary.count();
    if (total === 0) return null;

    // Create a deterministic hash based on date + userId
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const seedString = `${date}-${userId}`;

    // Simple hash function to generate a number from a string
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
        const char = seedString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    const index = Math.abs(hash) % total;

    return await prisma.vocabulary.findFirst({
        skip: index,
        orderBy: { id: "asc" }
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
            level: wordData.level || "",
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
/**
 * Updates or creates a Spaced Repetition record for a user and word using the SM-2 algorithm.
 * quality: 0-5 (0: again/blackout, 1: incorrect/hard, 2: incorrect/easy, 3: correct/hard, 4: correct/good, 5: correct/easy)
 */
export async function upsertSpacedRepetition(userId: string, wordId: string, quality: number) {
    const existing = await prisma.userWordSpacedRepetition.findUnique({
        where: { userId_wordId: { userId, wordId } }
    });

    let repetitions = existing?.repetitions ?? 0;
    let easinessFactor = existing?.easinessFactor ?? 2.5;
    let interval = existing?.interval ?? 0;

    if (quality >= 3) {
        // Correct response
        if (repetitions === 0) {
            interval = 1;
        } else if (repetitions === 1) {
            interval = 6;
        } else {
            interval = Math.round(interval * easinessFactor);
        }
        repetitions++;
    } else {
        // Incorrect response
        repetitions = 0;
        interval = 1;
    }

    // Update Easiness Factor: EF' = EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02))
    easinessFactor = easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easinessFactor < 1.3) easinessFactor = 1.3;

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    return await prisma.userWordSpacedRepetition.upsert({
        where: { userId_wordId: { userId, wordId } },
        update: {
            repetitions,
            easinessFactor,
            interval,
            nextReviewDate,
            lastReviewedAt: new Date()
        },
        create: {
            userId,
            wordId,
            repetitions,
            easinessFactor,
            interval,
            nextReviewDate,
            lastReviewedAt: new Date()
        }
    });
}

/**
 * Fetches vocabulary for pronunciation practice based on user progress and SRS.
 * Includes:
 * 1. Words due for review (SRS)
 * 2. Recent words from started modules
 * 3. Some random words from the next available module
 */
export async function getPronunciationVocabulary(userId: string) {
    // 1. Get words due for review
    const dueSrs = await prisma.userWordSpacedRepetition.findMany({
        where: {
            userId,
            nextReviewDate: { lte: new Date() }
        },
        select: { wordId: true },
        take: 20
    });

    const dueWordIds = dueSrs.map(s => s.wordId);

    // 2. Get all modules where user has any progress
    const userProgress = await prisma.userProgress.findMany({
        where: { userId },
        include: {
            lesson: {
                select: { moduleId: true }
            }
        }
    });

    const startedModuleIds = Array.from(new Set(userProgress.map(p => p.lesson.moduleId)));

    // 3. Get the next unstarted published module
    const nextModule = await prisma.module.findFirst({
        where: {
            published: true,
            id: { notIn: startedModuleIds }
        },
        orderBy: { order: "asc" },
        select: { id: true }
    });

    const targetModuleIds = [...startedModuleIds];
    if (nextModule) targetModuleIds.push(nextModule.id);

    // 4. Fetch vocabulary from these modules
    const availableVocab = await prisma.vocabulary.findMany({
        where: {
            moduleId: { in: targetModuleIds },
            word: { not: "" },
            translation: { not: "" }
        },
        take: 200 // Get a pool for randomization
    });

    // 5. Mix and prioritize
    // - Always include due SRS words if they belong to these modules (or just always include them)
    const dueVocab = availableVocab.filter(v => dueWordIds.includes(v.id));
    const otherVocab = availableVocab.filter(v => !dueWordIds.includes(v.id));

    // Randomize the "others"
    const shuffledOthers = otherVocab.sort(() => Math.random() - 0.5);

    // Combine: Due words first, then fill up to 50 with shuffled others
    const finalSelection = [...dueVocab, ...shuffledOthers].slice(0, 50);

    // Final shuffle so it's not always SRS at the start
    return finalSelection.sort(() => Math.random() - 0.5);
}
