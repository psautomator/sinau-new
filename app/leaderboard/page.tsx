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
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <Sidebar />

            <main className="flex-1 overflow-y-auto h-full p-4 md:p-12 relative overflow-x-hidden">
                {/* Deep Batik Decoration Background */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-batik-pattern opacity-[0.03] dark:opacity-[0.07] pointer-events-none rounded-bl-[10rem] mask-image-gradient" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="max-w-[1100px] mx-auto flex flex-col gap-10 relative z-10">
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/25">
                                    <span className="material-symbols-outlined text-2xl">leaderboard</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Community Rankings</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight mt-1">
                                Weekly <span className="text-primary">Leaderboard</span>
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base">
                                Real-time rankings from the community. Let's see who's on top!
                            </p>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {leaderboardData.length > 0 ? (
                            <>
                                {/* Podium Section */}
                                <div className="lg:col-span-12 flex justify-center items-end gap-6 md:gap-12 py-10 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl rounded-[3rem] border border-white/20 dark:border-slate-800/20 shadow-xl overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

                                    {/* 2nd Place */}
                                    {podium[1] && (
                                        <div className="flex flex-col items-center group">
                                            <div className="size-24 md:size-32 rounded-[2.5rem] bg-slate-200 dark:bg-slate-800 p-1 relative shadow-lg transition-transform group-hover:-translate-y-2 duration-500">
                                                <div className="absolute -top-3 -right-3 size-10 bg-slate-400 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg border-4 border-white dark:border-slate-800 z-20">2</div>
                                                <div
                                                    className="w-full h-full rounded-[2.2rem] bg-cover bg-center border-4 border-white dark:border-slate-700"
                                                    style={{ backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(podium[1].name)}&background=random')` }}
                                                />
                                            </div>
                                            <span className="mt-4 text-sm font-black text-slate-900 dark:text-white tracking-tight">{podium[1].name}</span>
                                            <span className="text-xs font-black text-primary uppercase tracking-widest">{podium[1].xp.toLocaleString()} XP</span>
                                        </div>
                                    )}

                                    {/* 1st Place */}
                                    {podium[0] && (
                                        <div className="flex flex-col items-center group -mt-10 md:-mt-16 z-10">
                                            <div className="relative">
                                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce">
                                                    <span className="material-symbols-outlined text-yellow-400 text-5xl drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">crown</span>
                                                </div>
                                                <div className="size-32 md:size-44 rounded-[3rem] bg-yellow-400 p-1.5 relative shadow-2xl transition-transform group-hover:-translate-y-3 duration-500">
                                                    <div className="absolute -top-3 -right-3 size-12 bg-yellow-400 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg border-4 border-white dark:border-slate-800 z-20">1</div>
                                                    <div
                                                        className="w-full h-full rounded-[2.7rem] bg-cover bg-center border-8 border-white dark:border-slate-700"
                                                        style={{ backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(podium[0].name)}&background=random')` }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="mt-4 text-lg font-black text-slate-900 dark:text-white tracking-tighter">{podium[0].name}</span>
                                            <span className="text-sm font-black text-primary uppercase tracking-widest">{podium[0].xp.toLocaleString()} XP</span>
                                        </div>
                                    )}

                                    {/* 3rd Place */}
                                    {podium[2] && (
                                        <div className="flex flex-col items-center group">
                                            <div className="size-24 md:size-32 rounded-[2.5rem] bg-orange-700 dark:bg-orange-900/50 p-1 relative shadow-lg transition-transform group-hover:-translate-y-2 duration-500">
                                                <div className="absolute -top-3 -right-3 size-10 bg-orange-700 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg border-4 border-white dark:border-slate-800 z-20">3</div>
                                                <div
                                                    className="w-full h-full rounded-[2.2rem] bg-cover bg-center border-4 border-white dark:border-slate-700"
                                                    style={{ backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(podium[2].name)}&background=random')` }}
                                                />
                                            </div>
                                            <span className="mt-4 text-sm font-black text-slate-900 dark:text-white tracking-tight">{podium[2].name}</span>
                                            <span className="text-xs font-black text-primary uppercase tracking-widest">{podium[2].xp.toLocaleString()} XP</span>
                                        </div>
                                    )}
                                </div>

                                {/* List Section */}
                                <div className="lg:col-span-12 flex flex-col gap-4">
                                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm overflow-hidden p-4 md:p-8">
                                        <div className="flex flex-col gap-2">
                                            {list.length > 0 ? list.map((user) => (
                                                <div
                                                    key={user.rank}
                                                    className={`group flex items-center gap-4 md:gap-6 p-4 rounded-3xl transition-all duration-300 ${user.isCurrentUser ? 'bg-primary/10 border border-primary/20 shadow-lg shadow-primary/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                                >
                                                    <span className="w-8 text-center text-sm font-black text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">
                                                        {user.rank}
                                                    </span>

                                                    <div
                                                        className="size-12 md:size-14 rounded-2xl bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-sm bg-cover bg-center"
                                                        style={{ backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random')` }}
                                                    />

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-base md:text-lg font-black text-slate-900 dark:text-white truncate tracking-tight">
                                                                {user.name}
                                                            </span>
                                                            {user.isCurrentUser && (
                                                                <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-black uppercase rounded-lg">YOU</span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.league} League</p>
                                                    </div>

                                                    <div className="text-right">
                                                        <span className="block text-base md:text-lg font-black text-primary tracking-tighter">{user.xp.toLocaleString()} <span className="text-[10px] md:text-xs">XP</span></span>
                                                    </div>
                                                </div>
                                            )) : leaderboardData.length <= 3 && (
                                                <p className="py-12 text-center text-sm font-bold text-slate-400 italic">No more legends in this list yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="lg:col-span-12 py-32 text-center flex flex-col items-center gap-6 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                                <div className="size-24 rounded-[2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                                    <span className="material-symbols-outlined text-5xl">groups</span>
                                </div>
                                <div>
                                    <p className="text-xl font-black text-slate-900 dark:text-white">Empty Arena</p>
                                    <p className="text-slate-500 font-bold mt-2">No students have joined this week's battle yet.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
