import Sidebar from "@/components/Sidebar";
import { getPublishedModules } from "@/dal/modules";
import { getUserModuleProgress } from "@/dal/lessons";
import { MOCK_USER_ID } from "@/lib/mock-auth";
import ModuleList from "@/components/ModuleList";

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
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <Sidebar />

            <main className="flex-1 overflow-y-auto h-full p-4 md:p-12 relative overflow-x-hidden">
                {/* Deep Batik Decoration Background */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-batik-pattern opacity-[0.03] dark:opacity-[0.07] pointer-events-none rounded-bl-[10rem] mask-image-gradient" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="max-w-[1100px] mx-auto flex flex-col gap-8 relative z-10">
                    <header className="flex flex-col gap-2 relative z-10 px-2">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/25">
                                <span className="material-symbols-outlined text-2xl">menu_book</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Learning Path</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight mt-1">
                            Ontdek de <span className="text-primary">Modules</span>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base max-w-2xl">
                            Selecteer een module om je reis in de Surinaams-Javaanse taal voort te zetten en nieuwe mijlpalen te bereiken.
                        </p>
                    </header>

                    <ModuleList initialModules={modulesWithProgress} />
                </div>
            </main>
        </div>
    );
}
