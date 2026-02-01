import Sidebar from "@/components/Sidebar";
import { getLeaderboard } from "@/dal/user";
import { MOCK_USER_ID } from "@/lib/mock-auth";

export default async function LeaderboardPage() {
    const rawLeaderboard = await getLeaderboard(10);

    const leaderboardData = rawLeaderboard.map((entry, index) => {
        const name = entry.user.name || entry.user.email.split('@')[0];
        const league = entry.xp > 2000 ? "Diamond" : entry.xp > 1500 ? "Platinum" : entry.xp > 1000 ? "Gold" : "Silver";

        return {
            rank: index + 1,
            name: name,
            xp: entry.xp,
            avatar: `bg-primary/20 text-primary-dark`,
            trend: "same", // Mock trend
            league: league,
            isCurrentUser: entry.userId === MOCK_USER_ID
        };
    });

    const podium = leaderboardData.slice(0, 3);
    const list = leaderboardData.length > 3 ? leaderboardData.slice(3) : [];

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-text-main-light dark:text-text-main-dark font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 md:px-8 py-4">
                    <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Weekly Leaderboard</h1>
                            <p className="text-sm text-text-secondary-light dark:text-gray-400">Real-time rankings from the community</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/30">
                            <span className="material-symbols-outlined text-[20px]">emoji_events</span>
                            <span className="text-sm font-bold">Community Rankings</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
                    <div className="max-w-2xl mx-auto space-y-8 pb-12">

                        {leaderboardData.length > 0 ? (
                            <>
                                {/* Podium Section */}
                                <div className="flex justify-center items-end gap-4 mb-12">
                                    {/* 2nd Place */}
                                    {podium[1] && (
                                        <div className="flex flex-col items-center">
                                            <div className="w-20 h-20 rounded-full border-4 border-slate-300 dark:border-slate-600 overflow-hidden relative bg-surface-light dark:bg-surface-dark mb-3 shadow-lg">
                                                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-slate-500">
                                                    {podium[1].name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 shadow-sm border-2 border-white dark:border-slate-800">
                                                    2
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-center max-w-[100px] truncate">{podium[1].name}</span>
                                            <span className="text-xs text-primary font-bold">{podium[1].xp.toLocaleString()} XP</span>
                                        </div>
                                    )}

                                    {/* 1st Place */}
                                    {podium[0] && (
                                        <div className="flex flex-col items-center -mt-6 z-10">
                                            <div className="relative">
                                                <span className="material-symbols-outlined text-yellow-400 text-4xl absolute -top-8 left-1/2 -translate-x-1/2 drop-shadow-sm">crown</span>
                                                <div className="w-24 h-24 rounded-full border-4 border-yellow-400 dark:border-yellow-500 overflow-hidden relative bg-surface-light dark:bg-surface-dark mb-3 shadow-xl ring-4 ring-yellow-400/20">
                                                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-yellow-600">
                                                        {podium[0].name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-yellow-400 text-white rounded-full flex items-center justify-center font-bold shadow-sm border-2 border-white dark:border-slate-800">
                                                        1
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-base font-bold text-center max-w-[120px] truncate">{podium[0].name}</span>
                                            <span className="text-sm text-primary font-bold">{podium[0].xp.toLocaleString()} XP</span>
                                        </div>
                                    )}

                                    {/* 3rd Place */}
                                    {podium[2] && (
                                        <div className="flex flex-col items-center">
                                            <div className="w-20 h-20 rounded-full border-4 border-amber-600 dark:border-amber-700 overflow-hidden relative bg-surface-light dark:bg-surface-dark mb-3 shadow-lg">
                                                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-amber-600">
                                                    {podium[2].name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm border-2 border-white dark:border-slate-800">
                                                    3
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-center max-w-[100px] truncate">{podium[2].name}</span>
                                            <span className="text-xs text-primary font-bold">{podium[2].xp.toLocaleString()} XP</span>
                                        </div>
                                    )}
                                </div>

                                {/* List Section */}
                                <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                                    {list.length > 0 ? list.map((user) => (
                                        <div
                                            key={user.rank}
                                            className={`flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${user.isCurrentUser ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                        >
                                            <span className={`w-8 text-center font-bold ${user.rank <= 10 ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>
                                                {user.rank}
                                            </span>

                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold bg-primary/20 text-primary-dark`}>
                                                {user.name.substring(0, 2).toUpperCase()}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold text-slate-900 dark:text-white ${user.isCurrentUser ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                                                        {user.name}
                                                    </span>
                                                    {user.isCurrentUser && (
                                                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold uppercase rounded">You</span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">{user.league} League</span>
                                            </div>

                                            <div className="text-right">
                                                <span className="block font-bold text-primary">{user.xp.toLocaleString()} XP</span>
                                            </div>
                                        </div>
                                    )) : leaderboardData.length <= 3 && (
                                        <p className="p-8 text-center text-sm text-gray-500 italic">No more students in the list.</p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="p-12 text-center flex flex-col items-center gap-4">
                                <div className="size-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300">
                                    <span className="material-symbols-outlined text-4xl">groups</span>
                                </div>
                                <p className="text-gray-500">No students matching the criteria found.</p>
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
}
