"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FlashcardModeSelectorProps {
    onSelectMode: (mode: string, options?: { level?: string; moduleId?: string }) => void;
    levels: string[];
    modules: any[];
}

export default function FlashcardModeSelector({ onSelectMode, levels, modules }: FlashcardModeSelectorProps) {
    const [selectedMode, setSelectedMode] = useState<string | null>(null);
    const [subSelection, setSubSelection] = useState<{ level?: string; moduleId?: string }>({});

    const modes = [
        {
            id: "daily-mix",
            title: "Daily Mix",
            description: "20 random words today. Focus on what you find difficult.",
            icon: "auto_awesome",
            color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
        },
        {
            id: "by-module",
            title: "Focus by Module",
            description: "Concentrate on specific topics. Select modules like 'Greetings' or 'Dining'.",
            icon: "grid_view",
            color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
        },
        {
            id: "by-level",
            title: "Challenge by Level",
            description: "Push your limits by selecting cards from Ngoko, Madya, or Krama levels.",
            icon: "rocket_launch",
            color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
        }
    ];

    const handleModeClick = (modeId: string) => {
        if (modeId === "daily-mix") {
            onSelectMode(modeId);
        } else {
            setSelectedMode(modeId);
        }
    };

    const handleStart = () => {
        if (selectedMode) {
            onSelectMode(selectedMode, subSelection);
        }
    };

    return (
        <div className="w-full space-y-10">
            <header className="flex flex-col gap-2 relative z-10 px-2">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/25">
                        <span className="material-symbols-outlined text-2xl">style</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Study Modes</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight mt-1">
                    Flashcard <span className="text-primary">Selection</span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base">
                    Hoe wil je vandaag gaan leren? Kies een modus om je Javanese woorden te oefenen.
                </p>
            </header>

            <AnimatePresence mode="wait">
                {!selectedMode ? (
                    <motion.div
                        key="modes"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {modes.map((mode, index) => (
                            <motion.button
                                key={mode.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => handleModeClick(mode.id)}
                                className="group relative bg-white dark:bg-surface-dark p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 text-left hover:border-primary transition-all hover:shadow-2xl hover:shadow-primary/5 flex flex-col items-start h-full"
                            >
                                <div className={`w-14 h-14 ${mode.color} rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 shadow-sm`}>
                                    <span className="material-symbols-outlined text-3xl">{mode.icon}</span>
                                </div>

                                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                    {mode.title}
                                </h3>

                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed flex-1">
                                    {mode.description}
                                </p>

                                <div className="flex items-center text-primary font-bold text-xs uppercase tracking-widest mt-auto">
                                    {mode.id === "daily-mix" ? "Sessie Starten" : "Filter Selecteren"}
                                    <span className="material-symbols-outlined ml-2 text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
                                </div>
                            </motion.button>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="selection"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="max-w-xl mx-auto bg-white dark:bg-surface-dark p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-8"
                    >
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSelectedMode(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                            <h3 className="text-2xl font-bold">
                                {selectedMode === "by-level" ? "Kies een Niveau" : "Kies een Module"}
                            </h3>
                        </div>

                        {selectedMode === "by-level" ? (
                            <div className="grid grid-cols-2 gap-4">
                                {levels.map((lvl) => (
                                    <button
                                        key={lvl}
                                        onClick={() => setSubSelection({ level: lvl })}
                                        className={`p-4 rounded-2xl border-2 transition-all font-bold ${subSelection.level === lvl
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
                                            }`}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {modules.map((mod) => (
                                    <button
                                        key={mod.id}
                                        onClick={() => setSubSelection({ moduleId: mod.id })}
                                        className={`w-full p-4 rounded-2xl border-2 transition-all font-bold text-left flex items-center gap-4 ${subSelection.moduleId === mod.id
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
                                            }`}
                                    >
                                        <span className="material-symbols-outlined">{mod.icon || "layers"}</span>
                                        <span className="flex-1 truncate">{mod.title}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={handleStart}
                            disabled={!subSelection.level && !subSelection.moduleId}
                            className="w-full py-5 bg-primary text-black font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-sm disabled:opacity-50 disabled:hover:scale-100"
                        >
                            Sessie Starten
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
