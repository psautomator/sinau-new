interface DashboardHeaderProps {
    name?: string;
}

export default function DashboardHeader({ name = "Budi" }: DashboardHeaderProps) {
    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    const hours = new Date().getHours();
    let greeting = "Sugeng rawuh"; // Default Javanese welcome
    if (hours < 12) greeting = "Sugeng enjang"; // Good morning
    else if (hours < 16) greeting = "Sugeng siang"; // Good afternoon
    else if (hours < 19) greeting = "Sugeng sonten"; // Good evening
    else greeting = "Sugeng dalu"; // Good night

    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/25">
                        <span className="material-symbols-outlined text-2xl">waving_hand</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Learning Dashboard</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight mt-1">
                    {greeting}, <span className="text-primary">{name}!</span>
                </h2>
                <div className="flex items-center gap-4 mt-1">
                    <p className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2 text-sm md:text-base">
                        Ready to master Javanese today? Let's keep that streak alive.
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-end gap-2">
                <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm hidden md:flex items-center gap-3">
                    <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-sm font-black text-slate-700 dark:text-slate-300 tracking-tight">
                        {today}
                    </p>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    Daily Goal: 50 XP
                </div>
            </div>
        </header>
    );
}
