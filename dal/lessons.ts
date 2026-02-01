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
    skip = 0,
    take = 10,
}: {
    search?: string;
    moduleId?: string;
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
