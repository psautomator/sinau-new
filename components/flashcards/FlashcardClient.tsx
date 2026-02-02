"use client";

// Using any to bypass lint issues with generated Prisma types
interface Vocabulary {
    id: string;
    word: string;
    translation: string;
    phonetic?: string | null;
    audioUrl?: string | null;
    context?: string | null;
    formality: string;
    level?: string | null;
}

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FlashcardClientProps {
    words: any[];
    title?: string;
    onBack?: () => void;
}

export default function FlashcardClient({ words: initialWords, title = "Daily Mix", onBack }: FlashcardClientProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [queue, setQueue] = useState<any[]>([...initialWords]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);
    const [stats, setStats] = useState({ mastered: 0, learning: 0, startTime: Date.now() });
    const [showSummary, setShowSummary] = useState(false);

    // Keyboard shortcuts
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (showSummary) return;

        if (e.code === "Space") {
            e.preventDefault();
            setIsFlipped(prev => !prev);
        } else if (isFlipped) {
            if (e.key === "1") handleRate("again");
            else if (e.key === "2") handleRate("hard");
            else if (e.key === "3") handleRate("good");
            else if (e.key === "4") handleRate("easy");
        }
    }, [isFlipped, showSummary]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    if (initialWords.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-surface-dark rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">style</span>
                <h2 className="text-xl font-bold">Geen woorden gevonden</h2>
                <p className="text-gray-500 mb-6">Er zijn momenteel geen woorden beschikbaar voor deze sessie.</p>
                <button onClick={onBack} className="text-primary font-bold hover:underline">Ga terug</button>
            </div>
        );
    }

    const currentWord = queue[currentIndex];
    const totalToMaster = initialWords.length;
    const progress = (completedCount / totalToMaster) * 100;

    const handleFlip = () => setIsFlipped(!isFlipped);

    const handleRate = (rating: "again" | "hard" | "good" | "easy") => {
        const word = queue[currentIndex];
        let newQueue = [...queue];

        if (rating === "again" || rating === "hard") {
            // Re-insert into queue
            // "Again" -> 3 cards away, "Hard" -> 6 cards away (or end if fewer)
            const gap = rating === "again" ? 2 : 5;
            const insertAt = Math.min(currentIndex + gap + 1, newQueue.length);
            newQueue.splice(insertAt, 0, word);
            setStats(prev => ({ ...prev, learning: prev.learning + 1 }));
            setQueue(newQueue);
        } else {
            // Mastered
            setStats(prev => ({ ...prev, mastered: prev.mastered + 1 }));
            setCompletedCount(prev => prev + 1);
        }

        // Logic to move to next card or show summary
        if (currentIndex < newQueue.length - 1) {
            setIsFlipped(false);
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, 100);
        } else {
            setShowSummary(true);
        }
    };

    const playAudio = (e: React.MouseEvent, url: string) => {
        e.stopPropagation();
        const audio = new Audio(url);
        audio.play().catch(console.error);
    };

    if (showSummary) {
        const timeSpent = Math.floor((Date.now() - stats.startTime) / 1000);
        const minutes = Math.floor(timeSpent / 60);
        const seconds = timeSpent % 60;

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl bg-white dark:bg-surface-dark rounded-[3rem] p-12 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-8"
            >
                <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mx-auto mb-4">
                    <span className="material-symbols-outlined text-4xl">emoji_events</span>
                </div>

                <h2 className="text-3xl font-black text-slate-900 dark:text-white">Sessie Voltooid!</h2>

                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2 font-mono">Gemasterd</p>
                        <p className="text-4xl font-black text-emerald-700 dark:text-emerald-300">{stats.mastered}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 font-mono">Tijd</p>
                        <p className="text-4xl font-black text-slate-700 dark:text-slate-200">{minutes}:{seconds.toString().padStart(2, '0')}</p>
                    </div>
                </div>

                <div className="pt-6 flex flex-col gap-4">
                    <button
                        onClick={() => {
                            setQueue([...initialWords]);
                            setCurrentIndex(0);
                            setCompletedCount(0);
                            setStats({ mastered: 0, learning: 0, startTime: Date.now() });
                            setShowSummary(false);
                        }}
                        className="w-full py-4 bg-primary text-black font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
                    >
                        Opnieuw Proberen
                    </button>
                    <button
                        onClick={onBack}
                        className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all uppercase tracking-widest text-xs"
                    >
                        Terug naar Selectie
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="w-full max-w-[900px] flex flex-col gap-10 items-center">
            {/* Session Sticky-like Header */}
            <div className="w-full bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md rounded-[2rem] p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col gap-5 sticky top-4 z-40 transition-all">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                            {title}
                        </h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Voortgang</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white">
                                {currentIndex + 1} <span className="text-slate-400 text-[10px] font-bold">/ {queue.length}</span>
                            </p>
                        </div>
                        <div className="w-32 sm:w-48 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                                className="h-full bg-primary rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ type: "spring", bounce: 0, duration: 0.6 }}
                            ></motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Flashcard Area */}
            <div className="w-full max-w-2xl flex flex-col gap-10">
                <div
                    className="perspective-1000 w-full h-[450px] relative group cursor-pointer"
                    onClick={handleFlip}
                >
                    <div
                        className={`relative w-full h-full transition-all duration-700 preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}
                    >
                        {/* Front Side */}
                        <div className="absolute inset-0 backface-hidden bg-white dark:bg-surface-dark rounded-[3rem] shadow-2xl border-4 border-white dark:border-slate-800 p-12 flex flex-col items-center justify-center gap-8 batik-pattern overflow-hidden">
                            <div className="absolute top-8 left-1/2 -translate-x-1/2">
                                <span className="px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                                    Javaans • {currentWord.formality}
                                </span>
                            </div>

                            <div className="flex flex-col items-center gap-8 relative z-10 w-full">
                                <h2 className="text-6xl sm:text-7xl font-black text-center tracking-tighter text-slate-900 dark:text-white drop-shadow-sm">
                                    {currentWord.word}
                                </h2>

                                <div className="flex gap-4">
                                    {currentWord.audioUrl && (
                                        <button
                                            className="size-14 rounded-2xl bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all flex items-center justify-center shadow-lg shadow-primary/5 group/audio"
                                            onClick={(e) => playAudio(e, currentWord.audioUrl!)}
                                        >
                                            <span className="material-symbols-outlined text-3xl group-hover/audio:scale-110 transition-transform">
                                                volume_up
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="absolute bottom-10 left-0 w-full flex justify-center items-center gap-2 text-slate-300 dark:text-slate-600 font-bold text-[10px] uppercase tracking-widest animate-pulse">
                                <span className="material-symbols-outlined text-sm">touch_app</span>
                                Klik om om te draaien
                            </div>
                        </div>

                        {/* Back Side */}
                        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-primary rounded-[3rem] shadow-2xl border-4 border-white dark:border-surface-dark flex flex-col p-12 text-white items-center justify-center gap-8 overflow-hidden batik-pattern">
                            <div className="absolute top-8 left-1/2 -translate-x-1/2">
                                <span className="px-4 py-1.5 bg-white/20 text-white border border-white/30 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                                    Vertaling
                                </span>
                            </div>

                            <div className="flex flex-col items-center gap-6 relative z-10 w-full">
                                <h2 className="text-4xl sm:text-5xl font-black text-center tracking-tight leading-tight">
                                    {currentWord.translation}
                                </h2>

                                {currentWord.phonetic && (
                                    <p className="text-white/60 font-mono text-lg italic bg-white/10 px-4 py-1 rounded-lg">
                                        /{currentWord.phonetic}/
                                    </p>
                                )}
                            </div>

                            {currentWord.context && (
                                <div className="bg-white/15 backdrop-blur-sm p-6 rounded-[2rem] border border-white/20 max-w-sm relative z-10">
                                    <div className="flex gap-4 items-start">
                                        <span className="material-symbols-outlined text-white text-xl mt-0.5">info</span>
                                        <p className="text-sm text-white/90 leading-relaxed font-medium">
                                            {currentWord.context}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Interaction Controls */}
                <div className="w-full flex flex-col gap-10">
                    <AnimatePresence mode="wait">
                        {!isFlipped ? (
                            <motion.div
                                key="pre-flip"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex justify-center"
                            >
                                <button
                                    onClick={handleFlip}
                                    className="px-12 py-5 rounded-[2rem] bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black text-sm tracking-[0.2em] uppercase shadow-2xl hover:scale-[1.05] active:scale-[0.95] transition-all"
                                >
                                    Toon Antwoord
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="post-flip"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                            >
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleRate("again"); }}
                                    className="flex flex-col items-center gap-2 p-5 rounded-[2rem] bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all group active:scale-95"
                                >
                                    <span className="text-rose-600 dark:text-rose-400 font-bold text-sm">Opnieuw</span>
                                    <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">1 min</span>
                                    <span className="hidden sm:block text-[8px] font-black text-rose-300 dark:text-rose-600 mt-1">TOETS 1</span>
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); handleRate("hard"); }}
                                    className="flex flex-col items-center gap-2 p-5 rounded-[2rem] bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-200 dark:border-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all active:scale-95"
                                >
                                    <span className="text-orange-600 dark:text-orange-400 font-bold text-sm">Moeilijk</span>
                                    <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">2 dagen</span>
                                    <span className="hidden sm:block text-[8px] font-black text-orange-300 dark:text-orange-600 mt-1">TOETS 2</span>
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); handleRate("good"); }}
                                    className="flex flex-col items-center gap-2 p-5 rounded-[2rem] bg-emerald-50 dark:bg-emerald-950/20 border-4 border-emerald-500/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all scale-105 shadow-xl shadow-emerald-500/10 active:scale-95"
                                >
                                    <span className="text-emerald-600 font-black text-sm">Goed</span>
                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">4 dagen</span>
                                    <span className="hidden sm:block text-[8px] font-black text-emerald-300 dark:text-emerald-700 mt-1">TOETS 3</span>
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); handleRate("easy"); }}
                                    className="flex flex-col items-center gap-2 p-5 rounded-[2rem] bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all active:scale-95"
                                >
                                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">Makkelijk</span>
                                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">1 week</span>
                                    <span className="hidden sm:block text-[8px] font-black text-blue-300 dark:text-blue-600 mt-1">TOETS 4</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Hint for expert users */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-4 px-6 py-3 rounded-full bg-slate-900/90 dark:bg-white/10 backdrop-blur-md text-white border border-white/10 shadow-2xl">
                <div className="flex items-center gap-2">
                    <kbd className="px-2 py-0.5 rounded bg-white/20 text-[10px] font-black">SPATIE</kbd>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Flip</span>
                </div>
                <div className="w-px h-3 bg-white/20"></div>
                <div className="flex items-center gap-2">
                    <kbd className="px-2 py-0.5 rounded bg-white/20 text-[10px] font-black">1 - 4</kbd>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Beoordelen</span>
                </div>
            </div>
        </div>
    );
}
