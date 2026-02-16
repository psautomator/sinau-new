"use client";

import { useState, useRef } from "react";
import { completeLessonAction } from "@/app/actions/progress";
import { motion, AnimatePresence } from "framer-motion";
import { updateSrsAction } from "@/app/actions/srs";

interface InteractiveFlashcardsProps {
    words: Array<{
        id: string;
        word: string;
        translation: string;
        audioUrl?: string | null;
        exampleJavanese?: string | null;
    }>;
    lessonId?: string;
    title?: string;
}

export default function InteractiveFlashcards({ words, lessonId, title = "Flashcards" }: InteractiveFlashcardsProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    // Track unique viewed cards to trigger completion only when all read? 
    // Or just when reaching the end. Let's do reaching the end for simplicity + 100% progress.
    const [hasCompletedLesson, setHasCompletedLesson] = useState(false);

    const playAudio = (url: string | null | undefined) => {
        if (!url) return;
        const audio = new Audio(url);
        audio.play().catch(console.error);
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
        if (!isFlipped && words[currentIndex]?.audioUrl) {
            // Optional: play audio on reveal depending on preference, sticking to click for now
        }
    };

    const handleRate = async (rating: "again" | "hard" | "good" | "easy") => {
        const word = words[currentIndex];

        // Persist to DB
        const qualityMap = {
            "again": 0,
            "hard": 2,
            "good": 4,
            "easy": 5
        };
        updateSrsAction(word.id, qualityMap[rating]);

        // Move to next card
        handleNext();
    };

    const handleNext = async () => {
        setIsFlipped(false);
        if (currentIndex < words.length - 1) {
            // Small delay to allow flip animation to finish before changing data
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, 300);
        } else {
            setIsCompleted(true);
            if (lessonId && !hasCompletedLesson) {
                try {
                    await completeLessonAction(lessonId);
                    setHasCompletedLesson(true);
                } catch (err) {
                    console.error("Failed to complete lesson via flashcards", err);
                }
            }
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setIsFlipped(false);
            setCurrentIndex(prev => prev - 1);
            setIsCompleted(false);
        }
    };

    const currentCard = words[currentIndex];

    if (!words || words.length === 0) return null;

    return (
        <div className="w-full max-w-2xl mx-auto py-8">
            <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary text-3xl">style</span>
                <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">{title}</h2>
            </div>

            {isCompleted ? (
                <div className="bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-3xl p-10 text-center shadow-lg relative overflow-hidden">
                    {/* Success Content */}
                    <div className="relative z-10 flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-2">
                            <span className="material-symbols-outlined text-4xl text-emerald-600 dark:text-emerald-400">emoji_events</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">Fantastic!</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-6">
                            You've reviewed all {words.length} words. Keep up the great work!
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setIsCompleted(false); setCurrentIndex(0); }}
                                className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                Restart
                            </button>
                            {/* Optional: Link to quiz or next section */}
                        </div>
                    </div>

                    {/* Decoration */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
                </div>
            ) : (
                <div className="perspective-1000 relative h-[400px]">
                    <div
                        className={`w-full h-full relative preserve-3d transition-transform duration-500 cursor-pointer ${isFlipped ? "rotate-y-180" : ""}`}
                        onClick={handleFlip}
                    >
                        {/* Front (Word) */}
                        <div className="absolute inset-0 backface-hidden bg-white dark:bg-surface-dark rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center p-12 group hover:shadow-2xl transition-all duration-500">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Javaans</span>
                            <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-8 text-center tracking-tight">
                                {currentCard.word}
                            </h3>

                            <div className="w-14 h-14 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                <span className="material-symbols-outlined text-2xl">volume_up</span>
                            </div>

                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-8">Tik om te onthullen</p>

                            {/* Decorative elements */}
                            <div className="absolute top-8 right-8 w-16 h-16 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                        </div>

                        {/* Back (Translation) */}
                        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-primary rounded-[2.5rem] shadow-xl border-4 border-white dark:border-surface-dark flex flex-col items-center justify-center p-12 text-white">
                            <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] mb-6">Nederlands</span>
                            <h3 className="text-3xl md:text-4xl font-black text-center mb-4 tracking-tight">{currentCard.translation}</h3>
                            {currentCard.exampleJavanese && (
                                <p className="mt-4 text-center text-white/80 font-medium italic max-w-xs">"{currentCard.exampleJavanese}"</p>
                            )}

                            {currentCard.audioUrl && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); playAudio(currentCard.audioUrl); }}
                                    className="mt-10 flex items-center gap-3 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-full transition-all backdrop-blur-md font-bold text-sm border border-white/10"
                                >
                                    <span className="material-symbols-outlined text-xl">volume_up</span>
                                    <span>Luister</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Controls */}
            {!isCompleted && (
                <div className="flex flex-col gap-8 mt-8">
                    <AnimatePresence mode="wait">
                        {!isFlipped ? (
                            <motion.div
                                key="pre-flip"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex justify-center"
                            >
                                <button
                                    onClick={handleFlip}
                                    className="px-10 py-4 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black text-sm tracking-widest uppercase shadow-xl hover:-translate-y-1 transition-all"
                                >
                                    Toon Vertaling
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="post-flip"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                            >
                                <button
                                    onClick={() => handleRate("again")}
                                    className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800 hover:bg-rose-100 transition-colors"
                                >
                                    <span className="text-rose-600 font-bold text-xs">Opnieuw</span>
                                    <span className="text-[8px] font-black text-rose-400 uppercase tracking-tighter">1m</span>
                                </button>
                                <button
                                    onClick={() => handleRate("hard")}
                                    className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800 hover:bg-orange-100 transition-colors"
                                >
                                    <span className="text-orange-600 font-bold text-xs">Moeilijk</span>
                                    <span className="text-[8px] font-black text-orange-400 uppercase tracking-tighter">2d</span>
                                </button>
                                <button
                                    onClick={() => handleRate("good")}
                                    className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-500/30 hover:bg-emerald-100 transition-colors lg:scale-110 shadow-lg shadow-emerald-500/10"
                                >
                                    <span className="text-emerald-600 font-bold text-xs">Goed</span>
                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">4d</span>
                                </button>
                                <button
                                    onClick={() => handleRate("easy")}
                                    className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 hover:bg-blue-100 transition-colors"
                                >
                                    <span className="text-blue-600 font-bold text-xs">Makkelijk</span>
                                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-tighter">1w</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between px-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                            className={`p-3 rounded-xl flex items-center justify-center transition-all ${currentIndex === 0 ? "opacity-30 cursor-not-allowed text-gray-400" : "bg-white dark:bg-surface-dark shadow-sm text-slate-700 hover:bg-gray-50 dark:text-white"}`}
                        >
                            <span className="material-symbols-outlined text-xl">arrow_back</span>
                        </button>

                        <div className="flex gap-1.5">
                            {words.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-gray-200 dark:bg-gray-700"}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleNext}
                            className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-primary transition-all flex items-center justify-center"
                            title="Overslaan"
                        >
                            <span className="material-symbols-outlined text-xl">fast_forward</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
