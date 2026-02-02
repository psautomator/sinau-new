export default function LessonHeader({ progress = 0 }: { progress?: number }) {
    return (
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 px-4 md:px-8 py-4 shadow-sm">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-8">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Les Voortgang</span>
                        <span className="text-[10px] font-bold text-primary">{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary relative transition-all duration-700 ease-out"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-pulse"></div>
                        </div>
                    </div>
                </div>
                <div className="hidden sm:block">
                    <button className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-95">
                        Doorgaan <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
