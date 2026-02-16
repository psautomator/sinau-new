interface StatsCardsProps {
    xp?: number;
    level?: string;
    streak?: number;
}

export default function StatsCards({
    xp = 1250,
    level = "Beginner II",
    streak = 5
}: StatsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-500 flex items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full translate-x-1/2 -translate-y-1/2 group-hover:bg-blue-500/10 transition-colors" />
                <div className="size-16 rounded-3xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl">bolt</span>
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">Total XP</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{xp.toLocaleString()}</p>
                </div>
            </div>

            <div className="group bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-500 flex items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full translate-x-1/2 -translate-y-1/2 group-hover:bg-purple-500/10 transition-colors" />
                <div className="size-16 rounded-3xl bg-purple-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl">school</span>
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-1">Rank Status</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{level}</p>
                </div>
            </div>

            <div className="group bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-1 transition-all duration-500 flex items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-full translate-x-1/2 -translate-y-1/2 group-hover:bg-orange-500/10 transition-colors" />
                <div className="size-16 rounded-3xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1">Day Streak</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{streak} Days</p>
                </div>
            </div>
        </div>
    );
}
