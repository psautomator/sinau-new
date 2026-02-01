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
            {/* Word of the Day Widget */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-batik-pattern opacity-10 pointer-events-none"></div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                        Word of the Day
                    </h3>
                    <button className="text-gray-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">bookmark</span>
                    </button>
                </div>
                <div className="flex flex-col items-center text-center gap-4">
                    <div
                        className="w-32 h-32 bg-contain bg-no-repeat bg-center drop-shadow-md"
                        data-alt="Illustration of a Wayang Kulit puppet character"
                        style={{
                            backgroundImage:
                                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAjRbIM6AJVYqMVY1t4rwymqiOIS10HDe0OpZkKmGyOpHT2p6YMN5_SL0AY94dYRb6WINWOFbCVt4P-ByAS4UomQFOjWD1pXbMQM3vXMGUub5rbC3E_PsgiJLJ-KunAYkbzaoEiOCISSewAsk1MSobc1ddTE5wpKolsyO7xy4qfDWWtPRHRR1iq1WB86VHtkcA7ytIlMJvrRjf0ixl6MWwmUjQD6D4wD4ALCErGBVFoEGR9scNk4-C2CUR6Zb6NYIWS0ETdJtYAUpk')",
                        }}
                    ></div>
                    <div>
                        <h2 className="text-3xl font-extrabold text-text-main-light dark:text-text-main-dark">
                            {displayWord.word}
                        </h2>
                        <p className="text-primary-dark dark:text-primary font-medium">
                            ({displayWord.formality})
                        </p>
                    </div>
                    <div className="w-full bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                        <p className="text-sm italic text-gray-600 dark:text-gray-300">
                            "{displayWord.context || "No context provided."}"
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{displayWord.translation}</p>
                    </div>
                    <div className="flex gap-2 w-full">
                        <button className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary-dark dark:text-primary py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                            <span className="material-symbols-outlined text-lg">
                                volume_up
                            </span>
                            Listen
                        </button>
                        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-mono flex items-center text-gray-500">
                            {displayWord.phonetic || "/-/"}
                        </div>
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
