import Link from "next/link";

interface Module {
    id: string;
    title: string;
    image?: string | null;
}

interface CourseProgressProps {
    activeModule?: Module | null;
    progress?: number;
    resumeLessonSlug?: string | null;
}

export default function CourseProgress({
    activeModule,
    progress = 0,
    resumeLessonSlug
}: CourseProgressProps) {
    if (!activeModule) {
        return (
            <div className="lg:col-span-2 flex flex-col gap-8">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">auto_stories</span>
                    Continue Learning
                </h3>
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-16 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center gap-6 group hover:border-primary/50 transition-colors">
                    <div className="size-24 rounded-[2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:scale-110 group-hover:text-primary transition-all duration-500">
                        <span className="material-symbols-outlined text-5xl">school</span>
                    </div>
                    <div>
                        <p className="text-xl font-black text-slate-900 dark:text-white">Avontuur Wacht op Je!</p>
                        <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">Geen actieve modules gevonden. Kies een pad om te starten.</p>
                    </div>
                    <Link href="/modules" className="inline-flex items-center justify-center px-10 h-14 rounded-2xl bg-primary text-white font-black hover:bg-primary-dark hover:scale-105 transition-all shadow-lg shadow-primary/25">
                        Pad Kiezen
                        <span className="material-symbols-outlined ml-2">explore</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">auto_stories</span>
                    Activeer Je Brein
                </h3>
                <Link
                    href="/modules"
                    className="text-primary font-black text-xs uppercase tracking-widest hover:underline flex items-center gap-2"
                >
                    Alle Modules
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
            </div>

            {/* Main Lesson Card - High Fidelity */}
            <div className="group bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200/50 dark:border-slate-800/50 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-700">
                <div className="h-56 relative overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-1000"
                        style={{
                            backgroundImage: `url('${activeModule.image || "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop"}')`,
                        }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

                    <div className="absolute top-6 left-6 flex gap-2">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black rounded-lg uppercase tracking-wider border border-white/20">
                            HUIDIG PAD
                        </span>
                    </div>

                    <div className="absolute bottom-6 left-8 right-8 text-white">
                        <h4 className="text-3xl font-black tracking-tighter leading-tight drop-shadow-lg">{activeModule.title}</h4>
                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-sm font-black text-white/90">{progress}%</span>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1 text-center md:text-left">
                            <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                Je bent goed op weg! Ga verder met de volgende les om je doel te bereiken.
                            </p>
                        </div>
                        <div className="flex shrink-0 gap-3 w-full md:w-auto">
                            <Link href={resumeLessonSlug ? `/lessons/${resumeLessonSlug}` : `/lessons/${activeModule.id}`} className="flex-1 md:flex-none inline-flex items-center justify-center px-10 h-14 rounded-2xl bg-primary text-white font-black hover:bg-primary-dark hover:scale-105 transition-all shadow-lg shadow-primary/25 group/btn">
                                <span>{progress > 0 ? 'Hervatten' : 'Starten'}</span>
                                <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">play_arrow</span>
                            </Link>
                            <Link href="/modules" className="flex-1 md:flex-none inline-flex items-center justify-center px-8 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                                Details
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Link href="/pronunciation" className="group bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 flex items-center gap-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                    <div className="size-16 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-all">
                        <span className="material-symbols-outlined text-3xl">record_voice_over</span>
                    </div>
                    <div>
                        <h5 className="font-black text-lg text-slate-900 dark:text-white tracking-tight">Pronunciation</h5>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">Oefen de 'Th' vs 'T' klanken</p>
                    </div>
                </Link>

                <Link href="/quiz" className="group bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 flex items-center gap-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                    <div className="size-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <span className="material-symbols-outlined text-3xl">quiz</span>
                    </div>
                    <div>
                        <h5 className="font-black text-lg text-slate-900 dark:text-white tracking-tight">Quick Quiz</h5>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">Test je woordenschat</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
