export default function LessonHero({
    title,
    moduleTitle,
    description,
    level,
    languageStyle
}: {
    title: string;
    moduleTitle: string;
    description?: string;
    level?: string | null;
    languageStyle?: string | null;
}) {
    return (
        <section className="space-y-4 mb-12 animate-fade-in">
            <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.4em]">
                <span className="material-symbols-outlined text-base">bookmark</span>
                {moduleTitle}
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                {title}
            </h1>

            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 pt-2">
                {level && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <span className="material-symbols-outlined text-sm">bar_chart</span>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-1">Level</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{level}</p>
                        </div>
                    </div>
                )}

                {languageStyle && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <span className="material-symbols-outlined text-sm">translate</span>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-1">Taalstijl</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{languageStyle}</p>
                        </div>
                    </div>
                )}
            </div>

            {description && (
                <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed font-medium pt-2">
                    {description}
                </p>
            )}
        </section>
    );
}
