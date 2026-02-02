import Link from "next/link";

interface Module {
    id: string;
    title: string;
    image?: string | null;
}

interface CourseProgressProps {
    activeModule?: Module | null;
    progress?: number;
    resumeLessonSlug?: string | null;
}

export default function CourseProgress({
    activeModule,
    progress = 0,
    resumeLessonSlug
}: CourseProgressProps) {
    if (!activeModule) {
        return (
            <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">
                        Continue Learning
                    </h3>
                </div>
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-12 shadow-sm border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-center gap-4">
                    <div className="size-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                        <span className="material-symbols-outlined text-3xl">school</span>
                    </div>
                    <div>
                        <p className="font-bold text-text-main-light dark:text-text-main-dark">No active modules</p>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Start your journey by picking a module!</p>
                    </div>
                    <Link href="/modules" className="bg-primary hover:bg-primary-dark text-text-main-light font-bold py-2 px-6 rounded-xl transition-all">
                        Browse Modules
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">
                    Continue Learning
                </h3>
                <Link
                    href="/modules"
                    className="text-primary-dark dark:text-primary font-semibold text-sm hover:underline"
                >
                    View all
                </Link>
            </div>
            {/* Main Lesson Card */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden group">
                <div className="h-40 bg-gray-100 w-full relative overflow-hidden">
                    {/* Abstract Map/Pattern Background */}
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-105 duration-700"
                        style={{
                            backgroundImage: `url('${activeModule.image || "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop"}')`,
                            opacity: 0.8,
                        }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-4 left-6 text-white">
                        <span className="inline-block px-2 py-1 bg-primary text-black text-[10px] font-black rounded-md mb-2 uppercase tracking-wider">
                            ACTIVE MODULE
                        </span>
                        <h4 className="text-2xl font-bold leading-tight">{activeModule.title}</h4>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-end">
                            <p className="text-gray-600 dark:text-gray-300 text-sm max-w-[70%]">
                                You're doing great! Continue your Javanese journey with the next lesson in this module.
                            </p>
                            <span className="text-xl font-black text-text-main-light dark:text-text-main-dark">
                                {progress}%
                            </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <div className="pt-2 flex gap-3">
                            <Link href={resumeLessonSlug ? `/lessons/${resumeLessonSlug}` : `/lessons/${activeModule.id}`} className="flex-1 bg-primary hover:bg-primary-dark text-text-main-light font-bold py-3 px-6 rounded-xl transition-all shadow-[0_4px_0_0_rgba(16,34,23,0.1)] active:shadow-none active:translate-y-[2px] flex items-center justify-center gap-2">
                                <span>{progress > 0 ? 'Resume' : 'Start'}</span>
                                <span className="material-symbols-outlined text-sm">
                                    play_arrow
                                </span>
                            </Link>
                            <Link href="/modules" className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-text-main-light dark:text-text-main-dark font-semibold py-3 px-6 rounded-xl transition-colors">
                                Details
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            {/* Recommended Next */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/pronunciation" className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center gap-3 hover:shadow-md transition-all cursor-pointer group">
                    <div className="size-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined">record_voice_over</span>
                    </div>
                    <div>
                        <h5 className="font-bold text-text-main-light dark:text-text-main-dark">
                            Pronunciation
                        </h5>
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                            Practice 'Th' vs 'T'
                        </p>
                    </div>
                </Link>
                <Link href="/quiz" className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center gap-3 hover:shadow-md transition-all cursor-pointer group">
                    <div className="size-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined">quiz</span>
                    </div>
                    <div>
                        <h5 className="font-bold text-text-main-light dark:text-text-main-dark">
                            Quick Quiz
                        </h5>
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                            Test your vocabulary
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
