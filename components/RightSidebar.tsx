import Link from "next/link";

interface LeaderboardEntry {
    xp: number;
    user: {
        name: string | null;
        email: string;
    };
}

interface WordOfTheDay {
    word: string;
    translation: string;
    formality: string;
    phonetic?: string | null;
    context?: string | null;
}

interface RightSidebarProps {
    wordOfTheDay?: WordOfTheDay | null;
    leaderboard?: LeaderboardEntry[];
}

export default function RightSidebar({
    wordOfTheDay,
    leaderboard = []
}: RightSidebarProps) {
    // Fallback Word of the Day if none provided
    const defaultWord: WordOfTheDay = {
        word: "Mangan",
        translation: "To eat",
        formality: "Ngoko",
        phonetic: "/ma-ŋan/",
        context: "Kowe wis mangan durung?"
    };

    const displayWord = wordOfTheDay || defaultWord;

    return (
        <div className="flex flex-col gap-6">
            {/* Word of the Day Widget - Premium Refined */}
            <div className="group bg-white dark:bg-surface-dark rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 p-8 relative overflow-hidden active:scale-[0.98] transition-all duration-500">
                {/* Background Accents */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 dark:bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/15 transition-colors duration-700"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-batik-pattern opacity-[0.03] dark:opacity-[0.07] pointer-events-none group-hover:opacity-[0.1] transition-opacity duration-1000"></div>

                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary-dark dark:text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/20 backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                        Word of the Day
                    </div>
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-primary hover:bg-primary/10 transition-all duration-300">
                        <span className="material-symbols-outlined text-[22px]">bookmark</span>
                    </button>
                </div>

                <div className="flex flex-col items-center relative z-10">
                    {/* Wayang Illustration - Better Integrated */}
                    <div className="relative mb-8 group-hover:-translate-y-2 transition-transform duration-700">
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-50 opacity-50 group-hover:scale-100 transition-transform duration-1000"></div>
                        <div
                            className="w-36 h-36 bg-contain bg-no-repeat bg-center relative z-10 drop-shadow-2xl brightness-110"
                            style={{
                                backgroundImage:
                                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAjRbIM6AJVYqMVY1t4rwymqiOIS10HDe0OpZkKmGyOpHT2p6YMN5_SL0AY94dYRb6WINWOFbCVt4P-ByAS4UomQFOjWD1pXbMQM3vXMGUub5rbC3E_PsgiJLJ-KunAYkbzaoEiOCISSewAsk1MSobc1ddTE5wpKolsyO7xy4qfDWWtPRHRR1iq1WB86VHtkcA7ytIlMJvrRjf0ixl6MWwmUjQD6D4wD4ALCErGBVFoEGR9scNk4-C2CUR6Zb6NYIWS0ETdJtYAUpk')",
                            }}
                        ></div>
                    </div>

                    <div className="text-center space-y-2 mb-8">
                        <h2 className="text-4xl font-black text-text-main-light dark:text-text-main-dark tracking-tighter leading-none group-hover:text-primary transition-colors duration-500">
                            {displayWord.word}
                        </h2>
                        <div className="flex items-center justify-center gap-2 font-black text-[11px] tracking-widest uppercase text-primary/60 dark:text-primary/40">
                            <span>{displayWord.formality}</span>
                            <span className="w-1 h-1 bg-primary/30 rounded-full"></span>
                            <span className="font-mono">{displayWord.phonetic || "/-/"}</span>
                        </div>
                    </div>

                    <div className="w-full bg-gray-50/50 dark:bg-gray-800/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/50 space-y-3 mb-8 group-hover:border-primary/20 transition-colors duration-500">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5 opacity-50">format_quote</span>
                            <p className="text-sm font-medium leading-relaxed italic text-text-secondary-light dark:text-gray-300">
                                {displayWord.context || "No context provided."}
                            </p>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800/50">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Betekenis</span>
                            <span className="text-sm font-bold text-text-main-light dark:text-white">{displayWord.translation}</span>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full">
                        <button className="flex-[2] h-12 bg-primary hover:bg-primary-dark text-white rounded-xl font-black text-xs tracking-[0.2em] uppercase transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40 flex items-center justify-center gap-2 overflow-hidden relative group/btn">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                            <span className="material-symbols-outlined text-[20px] relative z-10">volume_up</span>
                            <span className="relative z-10">Listen</span>
                        </button>
                        <Link
                            href="/ai-tutor"
                            className="flex-1 h-12 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-primary/10 rounded-xl font-black text-[10px] tracking-[0.1em] uppercase transition-all duration-300 flex items-center justify-center gap-1 border border-transparent hover:border-primary/20"
                        >
                            <span>Oefen</span>
                            <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mini Leaderboard */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-text-main-light dark:text-text-main-dark">
                        Top Students
                    </h3>
                    <a
                        href="/leaderboard"
                        className="text-xs font-bold text-primary-dark dark:text-primary hover:underline"
                    >
                        View All
                    </a>
                </div>
                <div className="flex flex-col gap-4">
                    {leaderboard.length > 0 ? leaderboard.map((entry, index) => (
                        <div key={entry.user.email} className="flex items-center gap-3">
                            <div className={`flex items-center justify-center w-6 font-bold ${index === 0 ? "text-yellow-500" :
                                index === 1 ? "text-gray-400" :
                                    index === 2 ? "text-orange-700" : "text-gray-500"
                                }`}>
                                {index + 1}
                            </div>
                            <div
                                className="size-10 rounded-full bg-gray-200 bg-cover bg-center"
                                style={{
                                    backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(entry.user.name || entry.user.email)}&background=random')`,
                                }}
                            ></div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-text-main-light dark:text-text-main-dark truncate">
                                    {entry.user.name || entry.user.email.split('@')[0]}
                                </p>
                                <p className="text-xs text-gray-400">{entry.xp.toLocaleString()} XP</p>
                            </div>
                            {index === 0 && (
                                <span className="material-symbols-outlined text-yellow-500 text-lg">
                                    emoji_events
                                </span>
                            )}
                        </div>
                    )) : (
                        <p className="text-xs text-gray-500 italic text-center py-4">No data available yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
