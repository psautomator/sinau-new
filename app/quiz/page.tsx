import { getQuizzes } from "@/dal/quizzes";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { prisma } from "@/dal";
import { MOCK_USER_ID } from "@/lib/mock-auth";

export default async function QuizIndexPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const { page } = await searchParams;
    const currentPage = parseInt(page || "1", 10);
    const ITEMS_PER_PAGE = 12;

    const { quizzes } = await getQuizzes({ published: true, take: 500 }); // Fetch all for manual dedupe + sort

    // Get user progress to see which modules are started
    const userProgress = await prisma.userProgress.findMany({
        where: { userId: MOCK_USER_ID },
        include: {
            lesson: {
                select: { moduleId: true }
            }
        }
    });

    const startedModuleIds = new Set(userProgress.map(p => p.lesson.moduleId));

    // 1. Deduplicate: Remove quizzes without lessonId if a quiz with the same title and a lessonId exists
    const deduplicatedQuizzes = quizzes.filter(quiz => {
        if (!quiz.lessonId) {
            const hasBetterVersion = quizzes.some(q => q.lessonId && q.title === quiz.title);
            if (hasBetterVersion) return false;
        }
        return true;
    });

    // 2. Sort quizzes by module order and then lesson order
    const sortedQuizzes = [...deduplicatedQuizzes].sort((a, b) => {
        // Quizzes with modules first, then General ones
        const moduleOrderA = a.lesson?.module?.order ?? 999;
        const moduleOrderB = b.lesson?.module?.order ?? 999;

        if (moduleOrderA !== moduleOrderB) return moduleOrderA - moduleOrderB;

        // Same module (or both General), sort by lesson order
        const lessonOrderA = a.lesson?.order ?? 0;
        const lessonOrderB = b.lesson?.order ?? 0;
        if (lessonOrderA !== lessonOrderB) return lessonOrderA - lessonOrderB;

        // Final tie-breaker: title
        return a.title.localeCompare(b.title);
    });

    // 3. Paginate
    const totalItems = sortedQuizzes.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const paginatedQuizzes = sortedQuizzes.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <>
            <Sidebar />

            <main className="flex-1 overflow-y-auto h-full p-4 md:p-8 bg-background-light dark:bg-background-dark relative">
                <div className="max-w-[1100px] mx-auto space-y-12 py-8">
                    {/* Hero Section */}
                    <div className="relative rounded-[2.5rem] bg-primary p-12 overflow-hidden shadow-2xl shadow-primary/20 group">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)] pointer-events-none" />
                        <div className="absolute -right-16 -bottom-16 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                            <span className="material-symbols-outlined text-[300px] text-white">quiz</span>
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
                            <div className="size-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-8 shadow-inner">
                                <span className="material-symbols-outlined text-5xl">auto_awesome</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Klaar voor een Uitdaging?</h1>
                            <p className="text-white/80 text-lg font-medium mb-10 leading-relaxed">
                                Test je kennis met een willekeurige mix van vragen uit alle modules die je al hebt gestart. De perfecte manier om alles scherp te houden!
                            </p>
                            <Link
                                href="/quiz/random"
                                className="inline-flex items-center justify-center px-12 h-16 rounded-[2rem] bg-white text-primary font-black text-lg shadow-xl shadow-black/10 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
                            >
                                Start Willekeurige Mix
                                <span className="material-symbols-outlined ml-3">play_arrow</span>
                            </Link>
                        </div>
                    </div>

                    {/* Quizzes List */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-4">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">analytics</span>
                                Beschikbare Quizzes
                            </h2>
                            <span className="text-sm font-bold text-slate-400 bg-white dark:bg-slate-900 px-4 py-1.5 rounded-full shadow-sm border border-slate-100 dark:border-gray-800">
                                {totalItems} Quizzes gevonden
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedQuizzes.map((quiz) => {
                                const isLocked = !startedModuleIds.has(quiz.lesson?.moduleId);
                                const CardContent = (
                                    <div className={`h-full bg-white dark:bg-surface-dark border border-slate-200/60 dark:border-gray-800/60 rounded-[2rem] p-6 shadow-sm flex flex-col relative transition-all duration-300 ${isLocked ? 'opacity-70 grayscale' : 'hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1'}`}>
                                        <div className="flex items-start justify-between mb-6">
                                            <div className={`size-14 rounded-2xl flex items-center justify-center transition-colors duration-500 ${isLocked ? 'bg-slate-100 text-slate-400' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'}`}>
                                                <span className="material-symbols-outlined text-3xl">{isLocked ? 'lock' : 'assignment'}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isLocked ? 'text-slate-400' : 'text-slate-400 group-hover:text-primary'}`}>
                                                    {quiz.lesson?.module?.title || "Algemeen"}
                                                </span>
                                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md mt-1 ${isLocked ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'}`}>
                                                    {quiz._count.questions} Vragen
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <h3 className={`text-lg font-black leading-tight mb-2 transition-colors ${isLocked ? 'text-slate-500' : 'text-slate-900 dark:text-white group-hover:text-primary'}`}>
                                                {quiz.title}
                                            </h3>
                                            <p className={`text-sm line-clamp-2 leading-relaxed ${isLocked ? 'text-slate-400 italic' : 'text-slate-500'}`}>
                                                {isLocked ? "Start de module om deze quiz vrij te spelen." : (quiz.lesson?.title || quiz.description)}
                                            </p>
                                        </div>

                                        <div className="mt-8 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-400">{isLocked ? "LOCKED" : "START QUIZ"}</span>
                                            <div className={`size-10 rounded-full flex items-center justify-center transition-all shadow-inner ${isLocked ? 'bg-slate-50 text-slate-300' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-primary group-hover:text-white'}`}>
                                                <span className="material-symbols-outlined text-xl">{isLocked ? 'lock' : 'arrow_right_alt'}</span>
                                            </div>
                                        </div>
                                    </div>
                                );

                                if (isLocked) {
                                    return <div key={quiz.id} className="group cursor-not-allowed">{CardContent}</div>;
                                }

                                return (
                                    <Link key={quiz.id} href={`/quiz/${quiz.id}`} className="group">
                                        {CardContent}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Pagination UI */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-12 pb-8">
                                <Link
                                    href={`/quiz?page=${Math.max(1, currentPage - 1)}`}
                                    className={`size-12 rounded-2xl flex items-center justify-center border transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed border-slate-200' : 'border-slate-200 bg-white hover:border-primary hover:text-primary'}`}
                                >
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </Link>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <Link
                                        key={p}
                                        href={`/quiz?page=${p}`}
                                        className={`size-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all border ${currentPage === p
                                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                            : 'bg-white border-slate-200 text-slate-500 hover:border-primary hover:text-primary'
                                            }`}
                                    >
                                        {p}
                                    </Link>
                                ))}

                                <Link
                                    href={`/quiz?page=${Math.min(totalPages, currentPage + 1)}`}
                                    className={`size-12 rounded-2xl flex items-center justify-center border transition-all ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed border-slate-200' : 'border-slate-200 bg-white hover:border-primary hover:text-primary'}`}
                                >
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
