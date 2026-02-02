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
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-text-main-light dark:text-text-main-dark font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 overflow-y-auto batik-pattern">
                <div className="max-w-[1400px] mx-auto px-8 py-16">
                    <header className="mb-12 text-center max-w-3xl mx-auto">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-4 border border-primary/20">
                            Leertraject
                        </span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
                            Ontdek de <span className="text-primary italic">Modules</span>
                        </h2>
                        <p className="text-slate-500 dark:text-gray-400 text-lg leading-relaxed">
                            Selecteer een module om je reis in de <span className="text-slate-900 dark:text-white font-semibold">Surinaams-Javaanse</span> taal voort te zetten en nieuwe mijlpalen te bereiken.
                        </p>
                    </header>

                    <ModuleList initialModules={modulesWithProgress} />
                </div>
            </main>
        </div>
    );
}
