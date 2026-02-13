"use client";

import { useState } from "react";
import FlashcardModeSelector from "./FlashcardModeSelector";
import FlashcardClient from "./FlashcardClient";
import { motion, AnimatePresence } from "framer-motion";

interface FlashcardPageClientProps {
    allVocabulary: any[];
    allModules: any[];
    levels: string[];
    initialWords: any[];
    initialTitle: string;
    backToLessonUrl?: string;
    autoStart?: boolean;
}

export default function FlashcardPageClient({
    allVocabulary,
    allModules,
    levels,
    initialWords,
    initialTitle,
    backToLessonUrl,
    autoStart = false
}: FlashcardPageClientProps) {
    const [view, setView] = useState<"selector" | "session">(autoStart ? "session" : "selector");
    const [sessionWords, setSessionWords] = useState(initialWords);
    const [sessionTitle, setSessionTitle] = useState(initialTitle);

    const shuffleArray = (array: any[]) => {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    };

    const handleSelectMode = (mode: string, options?: { level?: string; moduleId?: string }) => {
        let words = [...allVocabulary];
        let title = "Oefensessie";

        if (mode === "daily-mix") {
            // Seeded shuffle based on date
            const dateStr = new Date().toISOString().split('T')[0];
            const seed = dateStr.split('-').reduce((acc, val) => acc + parseInt(val), 0);

            const seededRandom = (s: number) => {
                const x = Math.sin(s++) * 10000;
                return x - Math.floor(x);
            };

            const seededShuffle = (array: any[], s: number) => {
                const result = [...array];
                for (let i = result.length - 1; i > 0; i--) {
                    const j = Math.floor(seededRandom(s + i) * (i + 1));
                    [result[i], result[j]] = [result[j], result[i]];
                }
                return result;
            };

            words = seededShuffle(allVocabulary, seed).slice(0, 20);
            title = "Dagelijkse Mix";
        } else if (mode === "by-level") {
            if (options?.level) {
                words = allVocabulary.filter(v => v.level === options.level);
                title = `Niveau: ${options.level}`;
            }
            words = shuffleArray(words);
        } else if (mode === "by-module") {
            if (options?.moduleId) {
                words = allVocabulary.filter(v => v.moduleId === options.moduleId);
                const mod = allModules.find(m => m.id === options.moduleId);
                title = mod ? `Module: ${mod.title}` : "Module Focus";
            }
            words = shuffleArray(words);
        }

        if (words.length === 0) {
            alert("Geen woorden gevonden voor deze selectie.");
            return;
        }

        setSessionWords(words);
        setSessionTitle(title);
        setView("session");
    };

    const handleBackToSelector = () => {
        if (backToLessonUrl && autoStart) {
            window.location.href = backToLessonUrl;
        } else {
            setView("selector");
        }
    };

    return (
        <div className="flex flex-col w-full">
            <AnimatePresence mode="wait">
                {view === "selector" ? (
                    <motion.div
                        key="selector"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                        className="w-full"
                    >
                        <FlashcardModeSelector
                            onSelectMode={handleSelectMode}
                            levels={levels}
                            modules={allModules}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="session"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full flex items-center justify-center"
                    >
                        <FlashcardClient
                            words={sessionWords}
                            title={sessionTitle}
                            onBack={handleBackToSelector}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
