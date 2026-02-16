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
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <Sidebar />

            <main className="flex-1 overflow-y-auto h-full p-4 md:p-12 relative overflow-x-hidden">
                {/* Deep Batik Decoration Background */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none" />

                <div className="relative max-w-[1100px] mx-auto pb-20">
                    {/* High-Fidelity Header Section */}
                    <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                                <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Oefen Arena</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight mt-1">
                                Test je <span className="text-primary">Kennis</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base max-w-2xl">
                                Daag jezelf uit met onze interactieve quizzes. Elke quiz is ontworpen om je begrip van de Surinaams-Javaanse taal te verdiepen.
                            </p>
                        </div>
                        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-6 py-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-2xl">quiz</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Totaal</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{totalItems} Quizzes</p>
                            </div>
                        </div>
                    </header>

                    {/* Random Mix Hero Section */}
                    <div className="relative mb-16 rounded-[3rem] bg-slate-900 dark:bg-black p-8 md:p-12 overflow-hidden shadow-2xl shadow-slate-900/10 group">
                        <div className="absolute inset-0 opacity-20 batik-pattern opacity-10 pointer-events-none" />
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

                        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                            <div className="flex-1 text-center lg:text-left">
                                <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Klaar voor een Willekeurige Mix?</h2>
                                <p className="text-slate-400 text-lg font-medium mb-8 leading-relaxed max-w-xl">
                                    Test je kennis met een mix van vragen uit al je gestarte modules. De ultieme manier om alles scherp te houden!
                                </p>
                                <Link
                                    href="/quiz/random"
                                    className="inline-flex items-center justify-center px-10 h-16 rounded-[1.5rem] bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all group"
                                >
                                    Start Willekeurige Mix
                                    <span className="material-symbols-outlined ml-3 group-hover:translate-x-1 transition-transform">bolt</span>
                                </Link>
                            </div>
                            <div className="relative size-48 md:size-64 flex-shrink-0">
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-[40px] animate-pulse" />
                                <div className="relative h-full w-full rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center">
                                    <span className="material-symbols-outlined text-8xl md:text-[9rem] text-primary">auto_awesome</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quizzes List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedQuizzes.map((quiz) => {
                            const isLocked = !startedModuleIds.has(quiz.lesson?.moduleId);
                            const CardContent = (
                                <div className={`h-full bg-white dark:bg-slate-900/50 backdrop-blur-sm border-2 transition-all duration-300 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden group ${isLocked ? 'border-transparent opacity-60 grayscale' : 'border-slate-50 dark:border-slate-800 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2'}`}>
                                    {/* Batik Glow Interior */}
                                    {!isLocked && <div className="absolute -right-16 -top-16 size-32 bg-primary/5 rounded-full blur-3xl transition-all group-hover:bg-primary/10 group-hover:scale-150" />}

                                    <div className="flex items-start justify-between mb-8 relative z-10">
                                        <div className={`size-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner ${isLocked ? 'bg-slate-100 text-slate-400' : 'bg-primary/10 text-primary group-hover:scale-110'}`}>
                                            <span className="material-symbols-outlined text-3xl leading-none">{isLocked ? 'lock' : 'assignment'}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${isLocked ? 'text-slate-400' : 'text-primary'}`}>
                                                    {quiz.lesson?.module?.title || "Algemeen"}
                                                </span>
                                            </div>
                                            <span className={`text-[11px] font-bold mt-2 flex items-center gap-1.5 ${isLocked ? 'text-slate-400' : 'text-emerald-500'}`}>
                                                <span className="size-1.5 rounded-full bg-current" />
                                                {quiz._count.questions} Vragen
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1 relative z-10">
                                        <h3 className={`text-xl font-black leading-tight mb-3 tracking-tight ${isLocked ? 'text-slate-500' : 'text-slate-900 dark:text-white group-hover:text-primary transition-colors'}`}>
                                            {quiz.title}
                                        </h3>
                                        <p className={`text-sm leading-relaxed line-clamp-2 ${isLocked ? 'text-slate-400 font-medium italic' : 'text-slate-500 dark:text-slate-400 font-bold'}`}>
                                            {isLocked ? "Start de module om deze quiz vrij te spelen." : (quiz.lesson?.title || quiz.description)}
                                        </p>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between relative z-10">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{isLocked ? "Vergrendeld" : "Basis Quiz"}</span>
                                        <div className={`size-12 rounded-2xl flex items-center justify-center transition-all ${isLocked ? 'bg-slate-50 text-slate-300' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:scale-110 shadow-sm'}`}>
                                            <span className="material-symbols-outlined text-2xl leading-none">{isLocked ? 'lock' : 'arrow_forward'}</span>
                                        </div>
                                    </div>
                                </div>
                            );

                            if (isLocked) {
                                return <div key={quiz.id} className="group cursor-not-allowed">{CardContent}</div>;
                            }

                            return (
                                <Link key={quiz.id} href={`/quiz/${quiz.id}`} className="group outline-none">
                                    {CardContent}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Pagination UI */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 mt-16">
                            <Link
                                href={`/quiz?page=${Math.max(1, currentPage - 1)}`}
                                className={`size-14 rounded-2xl flex items-center justify-center border-2 transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed border-slate-100' : 'border-slate-50 bg-white dark:bg-slate-900 dark:border-slate-800 hover:border-primary hover:text-primary shadow-sm hover:shadow-xl hover:shadow-primary/10'}`}
                            >
                                <span className="material-symbols-outlined text-2xl">chevron_left</span>
                            </Link>

                            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <Link
                                        key={p}
                                        href={`/quiz?page=${p}`}
                                        className={`size-10 rounded-xl flex items-center justify-center font-black text-xs transition-all ${currentPage === p
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110'
                                            : 'text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        {p}
                                    </Link>
                                ))}
                            </div>

                            <Link
                                href={`/quiz?page=${Math.min(totalPages, currentPage + 1)}`}
                                className={`size-14 rounded-2xl flex items-center justify-center border-2 transition-all ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed border-slate-100' : 'border-slate-50 bg-white dark:bg-slate-900 dark:border-slate-800 hover:border-primary hover:text-primary shadow-sm hover:shadow-xl hover:shadow-primary/10'}`}
                            >
                                <span className="material-symbols-outlined text-2xl">chevron_right</span>
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
