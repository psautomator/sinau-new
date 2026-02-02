"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface ModuleListProps {
    initialModules: any[];
}

export default function ModuleList({ initialModules }: ModuleListProps) {
    const [filter, setFilter] = useState("All");

    const filteredModules = filter === "All"
        ? initialModules
        : initialModules.filter(m => m.level === filter);

    const levels = ["All", ...Array.from(new Set(initialModules.map(m => m.level)))].sort();

    return (
        <div className="space-y-12">
            {/* Filter UI */}
            <div className="flex justify-center mb-12">
                <div className="bg-white dark:bg-surface-dark border border-gray-200/60 dark:border-gray-800/60 p-1.5 rounded-2xl shadow-sm flex items-center backdrop-blur-md">
                    {levels.map((level) => (
                        <button
                            key={level}
                            onClick={() => setFilter(level)}
                            className={`px-6 py-2 rounded-xl font-bold text-xs transition-all ${filter === level
                                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                                    : "text-gray-500 dark:text-gray-400 hover:text-primary"
                                }`}
                        >
                            {level === "All" ? "Alle Niveaus" : level}
                        </button>
                    ))}
                    <div className="mx-2 w-px h-5 bg-gray-200 dark:bg-gray-800"></div>
                    <button className="p-2 text-gray-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-xl">filter_list</span>
                    </button>
                </div>
            </div>

            {/* Grid UI */}
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
                <AnimatePresence mode="popLayout">
                    {filteredModules.map((module) => (
                        <motion.div
                            key={module.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="group bg-white dark:bg-surface-dark border border-gray-200/60 dark:border-gray-800/60 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 relative flex flex-col hover:-translate-y-1"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-12 h-12 rounded-2xl ${module.imageColor || "bg-primary/10"} flex items-center justify-center text-primary-dark dark:text-primary border border-primary/10 transition-transform duration-300 group-hover:scale-110`}>
                                    <span className="material-symbols-outlined text-2xl">{module.icon || "school"}</span>
                                </div>
                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${module.status === 'In Progress'
                                    ? 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400'
                                    : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400'
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${module.status === 'In Progress' ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                                    {module.status}
                                </span>
                            </div>

                            <div className="mb-6 flex-1">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                    {module.title}
                                </h3>
                                <p className="text-slate-500 dark:text-gray-400 text-[13px] leading-relaxed line-clamp-3 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                                    {module.description}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                                    <span className="material-symbols-outlined text-primary text-base">signal_cellular_alt</span>
                                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tight">Niveau {module.level}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                                    <span className="material-symbols-outlined text-primary text-base">auto_stories</span>
                                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tight">{module._count.lessons} Lessen</span>
                                </div>
                            </div>

                            <div className="mt-auto space-y-3 mb-6">
                                <div className="flex justify-between items-end">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Voortgang</span>
                                    <span className="text-xs font-black text-primary">{module.progress}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${module.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            <Link
                                href={`/modules/${module.id}`}
                                className="w-full bg-primary hover:bg-primary-dark text-white font-black py-3.5 rounded-2xl text-xs tracking-widest uppercase transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group/btn hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {module.progress > 0 ? "Doorgaan" : "Bekijk Lessen"}
                                <span className="material-symbols-outlined text-lg transition-transform group-hover/btn:translate-x-1">chevron_right</span>
                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
