export default function LessonHeader({ title, moduleTitle, progress = 0 }: { title: string; moduleTitle: string; progress?: number }) {
    return (
        <section className="w-full max-w-4xl mx-auto animate-fade-in-up">
            <div className="flex flex-col gap-2 mb-8">
                <div className="flex gap-6 justify-between items-end">
                    <h1 className="text-text-main-light dark:text-text-main-dark text-3xl md:text-4xl font-black leading-tight tracking-tight">
                        {title}
                    </h1>
                    <div className="text-right hidden sm:block">
                        <p className="text-text-secondary-light dark:text-primary text-sm font-semibold tracking-wide uppercase">
                            Module: {moduleTitle}
                        </p>
                    </div>
                </div>
                {/* Progress Component */}
                <div className="flex flex-col gap-2 mt-4 bg-surface-light dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">timeline</span>
                            Lesson Progress
                        </span>
                        <span className="text-primary-dark dark:text-primary font-bold">{progress}%</span>
                    </div>
                    <div className="h-3 w-full bg-gray-100 dark:bg-[#1f3528] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
