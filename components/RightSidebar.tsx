"use client";

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
    return (
        <div className="flex flex-col gap-6">
            {/* Word of the Day Widget - Premium Refined */}
            {!wordOfTheDay ? (
                <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800 text-center italic text-gray-400 text-sm">
                    Geen woord van de dag beschikbaar voor vandaag.
                </div>
            ) : (
                <div className="group bg-white dark:bg-surface-dark rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 p-8 relative overflow-hidden active:scale-[0.98] transition-all duration-500">
                    {/* Background Accents */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 dark:bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/15 transition-colors duration-700"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-batik-pattern opacity-[0.03] dark:opacity-[0.07] pointer-events-none group-hover:opacity-[0.1] transition-opacity duration-1000"></div>

                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary-dark dark:text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/20 backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                            Woord van de Dag
                        </div>
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-primary hover:bg-primary/10 transition-all duration-300">
                            <span className="material-symbols-outlined text-[22px]">bookmark</span>
                        </button>
                    </div>

                    <div className="flex flex-col items-center relative z-10">
                        <div className="text-center space-y-2 mb-8">
                            <h2 className="text-4xl font-black text-text-main-light dark:text-text-main-dark tracking-tighter leading-none group-hover:text-primary transition-colors duration-500">
                                {wordOfTheDay.word}
                            </h2>
                            <div className="flex items-center justify-center gap-2 font-black text-[11px] tracking-widest uppercase text-primary/60 dark:text-primary/40">
                                <span>{wordOfTheDay.formality}</span>
                                <span className="w-1 h-1 bg-primary/30 rounded-full"></span>
                                <span className="font-mono">{wordOfTheDay.phonetic || "/-/"}</span>
                            </div>
                        </div>

                        <div className="w-full bg-gray-50/50 dark:bg-gray-800/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/50 space-y-3 mb-8 group-hover:border-primary/20 transition-colors duration-500">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5 opacity-50">format_quote</span>
                                <p className="text-sm font-medium leading-relaxed italic text-text-secondary-light dark:text-gray-300">
                                    {wordOfTheDay.context || "Geen context beschikbaar."}
                                </p>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800/50">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Betekenis</span>
                                <span className="text-sm font-bold text-text-main-light dark:text-white">{wordOfTheDay.translation}</span>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full">
                            <button className="flex-[2] h-12 bg-primary hover:bg-primary-dark text-white rounded-xl font-black text-xs tracking-[0.2em] uppercase transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40 flex items-center justify-center gap-2 overflow-hidden relative group/btn">
                                <span className="material-symbols-outlined text-[20px] relative z-10">volume_up</span>
                                <span className="relative z-10">Luister</span>
                            </button>
                            <Link
                                href="/flashcards"
                                className="flex-1 h-12 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-primary/10 rounded-xl font-black text-[10px] tracking-[0.1em] uppercase transition-all duration-300 flex items-center justify-center gap-1 border border-transparent hover:border-primary/20"
                            >
                                <span>Oefen</span>
                                <span className="material-symbols-outlined text-[16px]">style</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Mini Leaderboard - Premium Style */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200/50 dark:border-slate-800/50 p-8">
                <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">leaderboard</span>
                        </div>
                        <h3 className="font-black text-lg text-slate-900 dark:text-white tracking-tight">
                            Leaderboard
                        </h3>
                    </div>
                    <Link
                        href="/leaderboard"
                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                    >
                        Volledig
                    </Link>
                </div>

                <div className="flex flex-col gap-5">
                    {leaderboard.length > 0 ? leaderboard.map((entry, index) => {
                        const isTopThree = index < 3;
                        const rankColors = [
                            "text-yellow-500 bg-yellow-500/10",
                            "text-slate-400 bg-slate-400/10",
                            "text-orange-700 bg-orange-700/10"
                        ];

                        return (
                            <div key={entry.user.email} className="group flex items-center gap-4 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300">
                                <div className={`flex items-center justify-center size-8 rounded-lg font-black text-xs ${isTopThree ? rankColors[index] : "text-slate-400 bg-slate-100 dark:bg-slate-800"}`}>
                                    {index + 1}
                                </div>
                                <div
                                    className="size-12 rounded-2xl bg-slate-200 bg-cover bg-center border-2 border-white dark:border-slate-800 shadow-sm transition-transform group-hover:scale-105"
                                    style={{
                                        backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(entry.user.name || entry.user.email)}&background=random')`,
                                    }}
                                ></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">
                                        {entry.user.name || entry.user.email.split('@')[0]}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{entry.xp.toLocaleString()} XP</p>
                                </div>
                                {index === 0 && (
                                    <div className="size-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                                        <span className="material-symbols-outlined text-lg">emoji_events</span>
                                    </div>
                                )}
                            </div>
                        );
                    }) : (
                        <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                            <p className="text-xs font-bold text-slate-400 italic">Geen data beschikbaar.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
