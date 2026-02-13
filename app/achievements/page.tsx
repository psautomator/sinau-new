import Sidebar from "@/components/Sidebar";

export default function AchievementsPage() {
    return (
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <Sidebar />

            <main className="flex-1 overflow-y-auto h-full p-4 md:p-12 relative overflow-x-hidden">
                {/* Deep Batik Decoration Background */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-batik-pattern opacity-[0.03] dark:opacity-[0.07] pointer-events-none rounded-bl-[10rem] mask-image-gradient" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="max-w-[1100px] mx-auto flex flex-col gap-8 relative z-10 font-sans">
                    <header className="flex flex-col gap-2 relative z-10 px-2">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/25">
                                <span className="material-symbols-outlined text-2xl">emoji_events</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Milestones & Badges</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight mt-1">
                            Your <span className="text-primary">Achievements</span>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base max-w-2xl">
                            Track your learning journey, earn badges, and showcase your mastery of the Javanese language to the community.
                        </p>
                    </header>

                    {/* Stats & Progress Section - High Fidelity */}
                    <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col lg:flex-row gap-10 items-center justify-between">
                        <div className="flex gap-10 w-full lg:w-auto">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total XP Gained</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">1,250</span>
                                    <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined text-xl">bolt</span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-px bg-slate-200 dark:bg-slate-800 h-12 self-center"></div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Rank</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">5</span>
                                    <span className="text-sm font-black text-primary uppercase tracking-widest mt-2 px-3 py-1 bg-primary/10 rounded-lg">Sastrawan</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 w-full lg:max-w-md">
                            <div className="flex justify-between items-end px-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tier Progress</span>
                                <span className="text-sm font-black text-primary tracking-tighter">80%</span>
                            </div>
                            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 p-0.5">
                                <div className="h-full bg-primary rounded-xl transition-all duration-1000 shadow-sm" style={{ width: "80%" }}></div>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 px-1">
                                <span>LEVEL 5</span>
                                <span>250 XP TO LEVEL 6</span>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <section className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center py-2">
                        <div className="flex gap-3">
                            {['All', 'Unlocked', 'Locked'].map((filter, i) => (
                                <button key={filter} className={`px-6 h-11 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${i === 0 ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'}`}>
                                    {filter}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span className="material-symbols-outlined text-base">info</span>
                            Tap badge for details
                        </div>
                    </section>

                    {/* Badges Grid - High Fidelity */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12">
                        {/* Earned Badge */}
                        {[
                            { title: "Early Bird", desc: "7-day learning streak", icon: "wb_twilight", date: "Oct 24, 2023" },
                            { title: "Word Smith", desc: "Learned 50 words", icon: "school", date: "Nov 01, 2023" },
                            { title: "Sastrawan", desc: "Reached Level 5", icon: "history_edu", date: "Nov 12, 2023" }
                        ].map((badge) => (
                            <div key={badge.title} className="group bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                                <div className="absolute top-6 right-6">
                                    <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-sm">EARNED</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-6">
                                    <div className="size-24 rounded-[2rem] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-700 border-4 border-white dark:border-slate-800">
                                        <span className="material-symbols-outlined text-5xl text-primary drop-shadow-md">{badge.icon}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{badge.title}</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{badge.desc}</p>
                                    </div>
                                    <div className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                                        {badge.date}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Locked Badge */}
                        <div className="bg-slate-50/50 dark:bg-slate-950/30 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 relative group opacity-60">
                            <div className="absolute top-6 right-6">
                                <span className="material-symbols-outlined text-slate-400">lock</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-6 grayscale">
                                <div className="size-24 rounded-[2rem] bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-5xl text-slate-400">language</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-xl font-black text-slate-400 tracking-tight text-slate-400">Polyglot</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Learn 500 words</p>
                                </div>
                                <div className="w-full space-y-2">
                                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-400 w-1/4"></div>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">125 / 500</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
