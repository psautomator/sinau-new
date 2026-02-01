import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { getPublishedModules } from "@/dal/modules";
import { getUserModuleProgress } from "@/dal/lessons";
import { MOCK_USER_ID } from "@/lib/mock-auth";

export default async function ModulesPage() {
    const rawModules = await getPublishedModules();

    // Fetch progress for each module
    const modulesWithProgress = await Promise.all(
        rawModules.map(async (m: any) => {
            const progress = await getUserModuleProgress(MOCK_USER_ID, m.id);
            return {
                ...m,
                progress,
                status: progress > 0 ? "In Progress" : "Start"
            };
        })
    );

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-text-main-light dark:text-text-main-dark font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col h-full overflow-y-auto relative scroll-smooth">
                {/* Batik Background Decoration */}
                <div className="absolute inset-x-0 top-0 h-[500px] batik-pattern pointer-events-none z-0 opacity-[0.03] dark:opacity-[0.07] mask-image-gradient"></div>

                <div className="relative z-10 px-4 md:px-10 py-10 md:py-16 max-w-6xl mx-auto w-full">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                        <div className="space-y-4">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary-dark dark:text-primary text-[11px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/20 backdrop-blur-sm">
                                <span className="w-1 h-1 bg-primary rounded-full"></span>
                                Leertraject
                            </span>
                            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
                                Ontdek de <span className="text-primary italic underline decoration-primary/20 underline-offset-8">Modules</span>
                            </h1>
                            <p className="text-lg text-text-secondary-light dark:text-gray-400 max-w-2xl font-medium leading-relaxed">
                                Selecteer een module om je reis in de <span className="text-text-main-light dark:text-white font-bold">Surinaams-Javaanse</span> taal voort te zetten en nieuwe mijlpalen te bereiken.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 self-start md:self-end">
                            <button className="group flex items-center gap-3 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200 px-6 py-3.5 rounded-2xl shadow-sm hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                                <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors duration-300">filter_list</span>
                                <span className="font-black text-xs tracking-widest uppercase">Alle Niveaus</span>
                                <span className="material-symbols-outlined text-gray-300 text-[20px] group-hover:rotate-180 transition-transform duration-500">expand_more</span>
                            </button>
                        </div>
                    </div>

                    {/* Modules Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-20">
                        {modulesWithProgress.map((module) => (
                            <div
                                key={module.id}
                                className="group relative bg-white dark:bg-surface-dark rounded-[2.5rem] p-7 shadow-sm border border-gray-100 dark:border-gray-800/50 hover:shadow-3xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-700 flex flex-col h-full overflow-hidden"
                            >
                                {/* Top Edge Accent - Animated on Group Hover */}
                                <div className="absolute top-0 left-0 w-full h-2 bg-primary/5 overflow-hidden">
                                    <div className="h-full bg-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 ease-[cubic-bezier(0.85,0,0.15,1)]"></div>
                                </div>

                                {/* Background Batik Subtle Glow */}
                                <div className="absolute top-0 right-0 w-40 h-40 batik-pattern opacity-0 group-hover:opacity-10 transition-opacity duration-1000 pointer-events-none"></div>

                                {/* Header Row */}
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className={`w-14 h-14 rounded-2xl ${module.imageColor || "bg-primary/10"} flex items-center justify-center text-primary-dark dark:text-primary ring-4 ring-gray-50/50 dark:ring-white/5 shadow-inner transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3`}>
                                        <span className="material-symbols-outlined text-3xl font-light">{module.icon || "school"}</span>
                                    </div>
                                    <span className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-sm border backdrop-blur-sm ${module.status === 'In Progress'
                                        ? 'bg-blue-50/80 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/40'
                                        : 'bg-emerald-50/80 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900/40'
                                        }`}>
                                        <span className={`w-2 h-2 rounded-full ${module.status === 'In Progress' ? 'bg-blue-600' : 'bg-emerald-600 animate-ping'}`}></span>
                                        {module.status}
                                    </span>
                                </div>

                                {/* Content Body */}
                                <div className="flex-1 relative z-10">
                                    <h3 className="text-2xl font-black mb-3 leading-tight tracking-tight group-hover:text-primary transition-colors duration-500">
                                        {module.title}
                                    </h3>
                                    <p className="text-text-secondary-light dark:text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2 font-medium opacity-70 group-hover:opacity-100 transition-opacity duration-500">
                                        {module.description}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-black tracking-[0.15em] uppercase text-gray-400 dark:text-gray-500 mb-6">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800/50">
                                            <span className="material-symbols-outlined text-[18px] text-primary">signal_cellular_alt</span>
                                            <span>Niveau {module.level}</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800/50">
                                            <span className="material-symbols-outlined text-[18px] text-primary">menu_book</span>
                                            <span>{module._count.lessons} Lessen</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress & Action Area */}
                                <div className="mt-auto space-y-6 pt-6 border-t border-gray-50 dark:border-gray-800/30 relative z-10">
                                    <div className="space-y-2.5">
                                        <div className="flex justify-between items-end px-1">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Jouw Voortgang</span>
                                            <span className="text-xl font-black text-primary tracking-tighter">{module.progress}%</span>
                                        </div>
                                        <div className="h-3 bg-gray-100 dark:bg-gray-800/50 rounded-full overflow-hidden p-0.5 shadow-inner">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary via-emerald-400 to-primary-dark rounded-full transition-all duration-[1.5s] ease-[cubic-bezier(0.34,1.56,0.64,1)] relative shadow-lg"
                                                style={{ width: `${module.progress}%` }}
                                            >
                                                {/* Progress Shine Effect */}
                                                <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <Link
                                        href={module.lessons[0] ? `/lessons/${module.lessons[0].slug}` : "#"}
                                        className="group/btn relative flex items-center justify-center gap-3 w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all duration-500 shadow-2xl shadow-primary/20 hover:shadow-primary/50 active:scale-[0.98] overflow-hidden"
                                    >
                                        <span className="relative z-10 transition-transform duration-500 group-hover/btn:-translate-x-2">
                                            {module.progress > 0 ? "Doorgaan" : "Starten"}
                                        </span>
                                        <span className="material-symbols-outlined text-xl transition-all duration-500 group-hover/btn:translate-x-2 relative z-10">arrow_forward_ios</span>

                                        {/* Button Hover Glow Layer */}
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>

                                        {/* Button Sweep Shine */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                                    </Link>
                                </div>

                                {/* Bottom Decorative Pattern */}
                                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-1000 pointer-events-none"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
