import { notFound } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { getModuleWithLessons } from "@/dal/modules";
import { getUserCompletedLessonIds } from "@/dal/lessons";
import MarkCompleteButton from "@/components/module/MarkCompleteButton";
import { MOCK_USER_ID } from "@/lib/mock-auth";

export default async function ModuleOverviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const module = await getModuleWithLessons(id);

    if (!module) {
        notFound();
    }

    const lessonIds = module.lessons.map((l: any) => l.id);
    const completedLessonIds = await getUserCompletedLessonIds(MOCK_USER_ID, lessonIds);

    const completionPercentage = Math.round((completedLessonIds.length / lessonIds.length) * 100) || 0;

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-text-main-light dark:text-text-main-dark font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col h-full overflow-y-auto relative scroll-smooth">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-[0.02] dark:opacity-[0.05] pointer-events-none"></div>

                <div className="relative z-10 px-4 md:px-10 py-10 md:py-12 max-w-5xl mx-auto w-full">

                    {/* Breadcrumbs / Back */}
                    <Link href="/modules" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary mb-8 transition-colors">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Back to Modules
                    </Link>

                    {/* Module Header */}
                    <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
                        <div className={`w-24 h-24 rounded-3xl ${module.imageColor || "bg-primary/10"} flex items-center justify-center text-primary-dark dark:text-primary shadow-lg ring-4 ring-white dark:ring-white/5`}>
                            <span className="material-symbols-outlined text-5xl">{module.icon || "school"}</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-3 py-1 rounded-full bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    Niveau {module.level}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    {module.lessons.length} Lessen
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-slate-900 dark:text-white leading-tight">
                                {module.title}
                            </h1>
                            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl font-medium leading-relaxed">
                                {module.description}
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-10">
                        <div className="flex justify-between items-end mb-3">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Jouw Voortgang</h3>
                                <p className="text-sm text-gray-400 font-medium">Je hebt {completedLessonIds.length} van de {lessonIds.length} lessen voltooid</p>
                            </div>
                            <span className="text-3xl font-black text-primary">{completionPercentage}%</span>
                        </div>
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-1">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-1000 shadow-sm"
                                style={{ width: `${completionPercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Lessons List */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold px-1 mb-4">Lessen Overzicht</h2>

                        {module.lessons.map((lesson: any, index: number) => {
                            const isCompleted = completedLessonIds.includes(lesson.id);
                            // Logic for locking could go here (e.g., if index > 0 && !prevCompleted)

                            return (
                                <div
                                    key={lesson.id}
                                    className={`group relative flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-2xl border transition-all duration-300 ${isCompleted
                                            ? "bg-emerald-50/30 dark:bg-emerald-900/5 border-emerald-100 dark:border-emerald-900/20"
                                            : "bg-white dark:bg-surface-dark border-gray-100 dark:border-gray-800 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
                                        }`}
                                >
                                    {/* Number / Status Icon */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm transition-colors ${isCompleted
                                                ? "bg-emerald-500 text-white shadow-emerald-200 dark:shadow-none"
                                                : "bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:bg-primary group-hover:text-white"
                                            }`}>
                                            {isCompleted ? (
                                                <span className="material-symbols-outlined">check</span>
                                            ) : (
                                                index + 1
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className={`text-lg font-bold ${isCompleted ? "text-emerald-900 dark:text-emerald-100" : "text-slate-900 dark:text-white"}`}>
                                                {lesson.title}
                                            </h3>
                                            <p className="text-sm text-gray-400 font-medium line-clamp-1">
                                                {lesson.description || `Les ${index + 1} van deze module`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50 dark:border-gray-800 md:pl-4 self-stretch md:self-auto justify-between md:justify-end bg-gray-50/50 md:bg-transparent -mx-5 md:mx-0 px-5 md:px-0 -mb-5 md:mb-0 pb-3 md:pb-0 rounded-b-2xl md:rounded-none">
                                        <MarkCompleteButton
                                            lessonId={lesson.id}
                                            isCompleted={isCompleted}
                                        />

                                        <Link
                                            href={`/lessons/${lesson.slug}`}
                                            className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold text-sm shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all text-center flex items-center gap-2"
                                        >
                                            <span>{isCompleted ? "Review" : "Start"}</span>
                                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}
