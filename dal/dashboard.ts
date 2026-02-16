import { prisma } from "./index";

export interface DashboardStats {
    counts: {
        users: number;
        activeUsers24h: number;
        modules: number;
        lessons: number;
        vocabulary: number;
        feedback: number;
    };
    recentUsers: Array<{
        id: string;
        name: string | null;
        email: string;
        createdAt: Date;
        lastActivityAt: Date | null;
        role: string;
    }>;
    recentFeedback: Array<{
        id: string;
        message: string;
        status: string;
        createdAt: Date;
        user: { name: string | null; email: string } | null;
    }>;
    publicationQueue: Array<{
        id: string;
        title: string;
        type: 'Module' | 'Lesson' | 'Quiz';
        createdAt: Date;
    }>;
    contentHealth: {
        emptyModulesCount: number;
        unpublishedModulesCount: number;
        unpublishedLessonsCount: number;
    };
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
        totalUsers,
        activeUsers24h,
        totalModules,
        totalLessons,
        totalVocabulary,
        totalFeedback,
        recentUsers,
        recentFeedback,
        emptyModulesCount,
        unpublishedModulesCount,
        unpublishedLessonsCount,
        draftModules,
        draftLessons,
        draftQuizzes
    ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
            where: {
                OR: [
                    { lastActivityAt: { gte: oneDayAgo } },
                    { updatedAt: { gte: oneDayAgo } }
                ]
            }
        }),
        prisma.module.count(),
        prisma.lesson.count(),
        prisma.vocabulary.count(),
        prisma.feedback.count({ where: { status: "NEW" } }),
        prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                lastActivityAt: true,
                role: true
            }
        }),
        prisma.feedback.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            where: { status: "NEW" },
            include: {
                user: {
                    select: { name: true, email: true }
                }
            }
        }),
        prisma.module.count({
            where: {
                lessons: {
                    none: {}
                }
            }
        }),
        prisma.module.count({ where: { published: false } }),
        prisma.lesson.count({ where: { published: false } }),
        // Publication Queue Items
        prisma.module.findMany({
            where: { published: false },
            take: 3,
            orderBy: { order: 'asc' },
            select: { id: true, title: true }
        }),
        prisma.lesson.findMany({
            where: { published: false },
            take: 3,
            orderBy: { order: 'asc' },
            select: { id: true, title: true, moduleId: true }
        }),
        prisma.quiz.findMany({
            where: { published: false },
            take: 3,
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true }
        })
    ]);

    // Map into a uniform format
    const publicationQueue: any[] = [
        ...draftModules.map(m => ({ id: m.id, title: m.title, type: 'Module', createdAt: new Date() })),
        ...draftLessons.map(l => ({ id: l.id, title: l.title, type: 'Lesson', createdAt: new Date() })),
        ...draftQuizzes.map(q => ({ id: q.id, title: q.title, type: 'Quiz', createdAt: new Date() }))
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);

    return {
        counts: {
            users: totalUsers,
            activeUsers24h,
            modules: totalModules,
            lessons: totalLessons,
            vocabulary: totalVocabulary,
            feedback: totalFeedback
        },
        recentUsers,
        recentFeedback,
        publicationQueue,
        contentHealth: {
            emptyModulesCount,
            unpublishedModulesCount,
            unpublishedLessonsCount
        }
    };
}
