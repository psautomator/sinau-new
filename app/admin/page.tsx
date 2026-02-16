import { getAdminModules, getAllModulesSimple } from "@/dal/modules";
import { getVocabulary, getAllVocabularySimple } from "@/dal/vocabulary";
import { getQuizzes, getAllQuizzesSimple } from "@/dal/quizzes";
import { getLessons, getAllLessonsSimple } from "@/dal/lessons";
import { getUsers } from "@/dal/user";
import { getScenarios } from "../ai-tutor/actions";
import { getFeedbackReports } from "@/dal/feedback";
import { getDashboardStats } from "@/dal/dashboard";
import AdminClient from "./AdminClient";

export default async function AdminPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await searchParams;

    // Basic Pagination
    const page = Number(resolvedParams?.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Filters
    const search = (resolvedParams?.search as string) || undefined;
    const level = (resolvedParams?.level as string) || undefined;
    const category = (resolvedParams?.category as string) || undefined;
    const formality = (resolvedParams?.formality as any) || undefined;
    const audioStatus = (resolvedParams?.audioStatus as any) || undefined;
    const moduleId = (resolvedParams?.moduleId as string) || undefined;
    const lessonLevel = (resolvedParams?.lessonLevel as string) || undefined;
    const lessonStyle = (resolvedParams?.lessonStyle as string) || undefined;
    const quizStatus = (resolvedParams?.quizStatus as "all" | "complete" | "incomplete") || "all";
    const quizModuleId = (resolvedParams?.quizModuleId as string) || undefined;
    const quizPublishedParam = resolvedParams?.quizPublished as string | undefined;
    const quizPublished = quizPublishedParam === "true" ? true : quizPublishedParam === "false" ? false : undefined;
    const quizSortBy = (resolvedParams?.quizSortBy as string) || "createdAt";
    const quizSortOrder = (resolvedParams?.quizSortOrder as "asc" | "desc") || "desc";

    // Fetch Data
    const [
        { modules, total: totalModules },
        { vocabulary, total: totalVocabulary },
        { quizzes, total: totalQuizzes },
        { lessons, total: totalLessons },
        allModules,
        allQuizzes,
        allLessons,
        allVocabulary,
        { users, total: totalUsers },
        scenarios,
        feedbackReports,
        dashboardStats
    ] = await Promise.all([
        getAdminModules({ search, level, skip, take: limit }),
        getVocabulary({ search, category, level, formality, audioStatus, skip, take: limit }),
        getQuizzes({
            search,
            status: quizStatus,
            moduleId: quizModuleId,
            published: quizPublished,
            sortBy: quizSortBy,
            sortOrder: quizSortOrder,
            skip,
            take: limit
        }),
        getLessons({ search, moduleId, level: lessonLevel, languageStyle: lessonStyle, skip, take: limit }),
        getAllModulesSimple(),
        getAllQuizzesSimple(),
        getAllLessonsSimple(),
        getAllVocabularySimple(),
        getUsers({ search, skip, take: limit }),
        getScenarios(),
        getFeedbackReports(),
        getDashboardStats()
    ]);

    // Use dynamic stats instead of calculating from limited paginated data
    const stats: any = { // Cast to any to bypass strict type check for now, matching AdminClient props
        modulesCount: dashboardStats.counts.modules,
        vocabularyCount: dashboardStats.counts.vocabulary,
        lessonsCount: dashboardStats.counts.lessons,
        usersCount: dashboardStats.counts.users,
        scenariosCount: scenarios.length,
        queueCount: dashboardStats.counts.feedback,
        newFeedbackCount: dashboardStats.counts.feedback,
        activeUsers24h: dashboardStats.counts.activeUsers24h,
        recentUsers: dashboardStats.recentUsers,
        recentFeedback: dashboardStats.recentFeedback,
        publicationQueue: dashboardStats.publicationQueue,
        contentHealth: dashboardStats.contentHealth
    };

    return (
        <AdminClient
            initialModules={modules as any}
            initialVocabulary={vocabulary as any}
            initialQuizzes={quizzes as any}
            initialLessons={lessons as any}
            initialStats={stats}
            currentPage={page}
            totalModulesCount={totalModules}
            totalVocabularyCount={totalVocabulary}
            totalQuizzesCount={totalQuizzes}
            totalLessonsCount={totalLessons}
            pageSize={limit}
            allModules={allModules as any}
            allQuizzes={allQuizzes as any}
            allLessons={allLessons as any}
            allVocabulary={allVocabulary as any}
            initialUsers={users as any}
            totalUsersCount={totalUsers}
            initialScenarios={scenarios as any}
            initialFeedback={feedbackReports as any}
        />
    );
}
