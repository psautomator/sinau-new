import { prisma } from "./index";

/**
 * Fetches a lesson by its slug.
 */
export async function getLessonBySlug(slug: string) {
    return await prisma.lesson.findUnique({
        where: { slug },
        include: {
            module: {
                select: { id: true, title: true }
            },
            quiz: {
                select: { id: true }
            }
        },
    });
}

/**
 * Tracks lesson completion for a user.
 * This is a foundation for progress tracking.
 */
export async function completeLesson(userId: string, lessonId: string) {
    return await prisma.userProgress.upsert({
        where: {
            userId_lessonId: {
                userId,
                lessonId,
            },
        },
        update: {
            completedAt: new Date(),
        },
        create: {
            userId,
            lessonId,
        },
    });
}

/**
 * Fetches a user's progress for a specific module.
 */
export async function getUserModuleProgress(userId: string, moduleId: string) {
    const module = await prisma.module.findUnique({
        where: { id: moduleId },
        include: {
            lessons: {
                select: { id: true },
            },
        },
    });

    if (!module) return 0;

    const completedCount = await prisma.userProgress.count({
        where: {
            userId,
            lessonId: { in: module.lessons.map((l: { id: string }) => l.id) },
        },
    });

    return module.lessons.length > 0
        ? Math.round((completedCount / module.lessons.length) * 100)
        : 0;
}

/**
 * Fetches lessons for admin panel with search/filter.
 */
export async function getLessons({
    search,
    moduleId,
    level,
    languageStyle,
    skip = 0,
    take = 10,
}: {
    search?: string;
    moduleId?: string;
    level?: string;
    languageStyle?: string;
    skip?: number;
    take?: number;
}) {
    const where: any = {};

    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
        ];
    }

    if (moduleId) {
        where.moduleId = moduleId;
    }

    if (level) {
        where.level = { contains: level, mode: "insensitive" };
    }

    if (languageStyle) {
        where.languageStyle = { contains: languageStyle, mode: "insensitive" };
    }

    const [lessons, total] = await Promise.all([
        prisma.lesson.findMany({
            where,
            include: {
                module: {
                    select: { title: true }
                }
            },
            orderBy: [{ moduleId: "asc" }, { order: "asc" }],
            skip,
            take,
        }),
        prisma.lesson.count({ where }),
    ]);

    return { lessons, total };
}

/**
 * Fetches a single lesson with full relations for editing.
 */
export async function getLessonById(id: string) {
    return await prisma.lesson.findUnique({
        where: { id },
        include: {
            module: true,
            quiz: {
                select: { id: true, title: true }
            }
        }
    });
}

/**
 * Updates a lesson.
 */
export async function updateLesson(id: string, data: any) {
    const updateData: any = {
        title: data.title,
        slug: data.slug,
        description: data.description,
        published: data.published,
        order: data.order,
        moduleId: data.moduleId,
        level: data.level,
        languageStyle: data.languageStyle,
    };

    if (data.content !== undefined) {
        updateData.content = data.content;
    }

    if (data.quizId !== undefined) {
        updateData.quiz = data.quizId ? {
            connect: { id: data.quizId }
        } : {
            disconnect: true
        };
    }

    return await prisma.lesson.update({
        where: { id },
        data: updateData,
    });
}

/**
 * Creates a new lesson.
 */
export async function createLesson(data: any) {
    return await prisma.lesson.create({
        data: {
            title: data.title,
            slug: data.slug,
            description: data.description,
            content: data.content || {},
            published: data.published || false,
            order: data.order || 0,
            moduleId: data.moduleId,
            level: data.level,
            languageStyle: data.languageStyle,
            quiz: data.quizId ? {
                connect: { id: data.quizId }
            } : undefined
        },
    });
}

/**
 * Deletes a lesson.
 */
export async function deleteLesson(id: string) {
    return await prisma.lesson.delete({
        where: { id },
    });
}

/**
 * Fetches all lessons (simple list) for dropdowns.
 */
export async function getAllLessonsSimple() {
    return await prisma.lesson.findMany({
        select: { id: true, title: true },
        orderBy: { order: "asc" },
    });
}

/**
 * Fetches the next lesson in the sequence within the same module.
 */
export async function getNextLesson(moduleId: string, currentOrder: number) {
    return await prisma.lesson.findFirst({
        where: {
            moduleId,
            order: { gt: currentOrder },
        },
        orderBy: { order: "asc" },
        select: { slug: true },
    });
}

/**
 * Admin: Bulk upserts lessons for a specific module.
 */
export async function bulkUpsertLessons(moduleId: string, lessons: any[]) {
    let createdCount = 0;
    let updatedCount = 0;

    for (const lessonData of lessons) {
        // Lessons have a unique slug
        const existing = await prisma.lesson.findUnique({
            where: { slug: lessonData.slug }
        });

        const payload = {
            title: lessonData.title,
            slug: lessonData.slug,
            description: lessonData.description || "",
            // Compatibility for legacy 'sections' naming or new 'content'
            content: lessonData.sections ? { sections: lessonData.sections } : (lessonData.content || {}),
            published: lessonData.published ?? false,
            order: parseInt(lessonData.order?.toString() || "0"),
            moduleId: moduleId,
            level: lessonData.level,
            languageStyle: lessonData.languageStyle,
        };

        if (existing) {
            await prisma.lesson.update({
                where: { id: existing.id },
                data: payload
            });
            updatedCount++;
        } else {
            await prisma.lesson.create({
                data: payload
            });
            createdCount++;
        }
    }

    return { createdCount, updatedCount };
}

/**
 * Fetches the IDs of lessons that a user has completed from a given list.
 */
export async function getUserCompletedLessonIds(userId: string, lessonIds: string[]) {
    const progress = await prisma.userProgress.findMany({
        where: {
            userId,
            lessonId: { in: lessonIds },
        },
        select: {
            lessonId: true,
        },
    });

    return progress.map((p: { lessonId: string }) => p.lessonId);
}

/**
 * Utility to extract level and language style from lesson content and description.
 */
export function extractLessonMetadata(data: { description?: string, content?: any }) {
    const levelPattern = /Niveau[:\s*]+([A-C][1-2](?:\s*\([^)]+\))?)/i;
    const stylePattern = /Taalstijl[:\s*]+([a-z\/\-\s]+)/i;

    let detectedLevel: string | null = null;
    let detectedStyle: string | null = null;

    const extractFromText = (text: string) => {
        const levelMatch = text.match(levelPattern);
        const styleMatch = text.match(stylePattern);
        return {
            level: levelMatch ? levelMatch[1].trim() : null,
            style: styleMatch ? styleMatch[1].trim() : null
        };
    };

    // 1. Search in description
    if (data.description) {
        const descMeta = extractFromText(data.description);
        if (descMeta.level) detectedLevel = descMeta.level;
        if (descMeta.style) detectedStyle = descMeta.style;
    }

    // 2. Search in content (Markdown blocks)
    if (data.content && data.content.sections) {
        for (const section of data.content.sections) {
            if (section.type === 'MARKDOWN' && section.content?.markdownText) {
                const blockMeta = extractFromText(section.content.markdownText);
                if (blockMeta.level && (!detectedLevel || detectedLevel === 'A1')) detectedLevel = blockMeta.level;
                if (blockMeta.style && (!detectedStyle || detectedStyle === 'Ngoko' || detectedStyle === 'Mixed')) detectedStyle = blockMeta.style;
            }
        }
    }

    // Normalization
    if (detectedLevel) {
        if (detectedLevel.includes('A2')) detectedLevel = 'A2';
        else if (detectedLevel.includes('B1')) detectedLevel = 'B1';
        else if (detectedLevel.includes('B2')) detectedLevel = 'B2';
        else if (detectedLevel.includes('C1')) detectedLevel = 'C1';
        else if (detectedLevel.includes('A1')) detectedLevel = 'A1';
    }

    if (detectedStyle) {
        const low = detectedStyle.toLowerCase();
        if (low.includes('krama') && low.includes('ngoko')) detectedStyle = 'Mixed';
        else if (low.includes('krama')) detectedStyle = 'Krama';
        else if (low.includes('ngoko')) detectedStyle = 'Ngoko';
        else detectedStyle = null; // Junk
    }

    return {
        level: detectedLevel,
        languageStyle: detectedStyle
    };
}
