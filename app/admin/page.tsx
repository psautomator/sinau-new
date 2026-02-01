import { getAdminModules, getAllModulesSimple } from "@/dal/modules";
import { getVocabulary, getAllVocabularySimple } from "@/dal/vocabulary";
import { getQuizzes, getAllQuizzesSimple } from "@/dal/quizzes";
import { getLessons, getAllLessonsSimple } from "@/dal/lessons";
import { getUsers } from "@/dal/user";
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
        { users, total: totalUsers }
    ] = await Promise.all([
        getAdminModules({ search, level, skip, take: limit }),
        getVocabulary({ search, category, formality, audioStatus, skip, take: limit }),
        getQuizzes({ search, skip, take: limit }),
        getLessons({ search, moduleId, skip, take: limit }),
        getAllModulesSimple(),
        getAllQuizzesSimple(),
        getAllLessonsSimple(),
        getAllVocabularySimple(),
        getUsers({ search, skip, take: limit })
    ]);

    const stats = {
        modules: { total: totalModules, active: totalModules },
        vocabulary: { total: totalVocabulary, active: totalVocabulary },
        quizzes: { total: totalQuizzes, active: totalQuizzes },
        lessons: { total: totalLessons, active: totalLessons },
        queue: { total: 0, active: 0 },
        users: { total: totalUsers, active: totalUsers }
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
        />
    );
}
