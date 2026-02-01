"use client";

import { useState, useRef } from "react";
import { completeLessonAction } from "@/app/actions/progress";
import { motion, AnimatePresence } from "framer-motion";

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

    const handleNext = async () => {
        setIsFlipped(false);
        if (currentIndex < words.length - 1) {
            setCurrentIndex(prev => prev + 1);
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
                        <div className="absolute inset-0 backface-hidden bg-white dark:bg-surface-dark rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center p-8 group hover:shadow-2xl transition-shadow">
                            <span className="material-symbols-outlined text-4xl text-primary mb-6 opacity-80">translate</span>
                            <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4 text-center">
                                {currentCard.word}
                            </h3>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-4">Tap to reveal</p>

                            {/* Decorative bubbles */}
                            <div className="absolute top-6 right-6 w-12 h-12 bg-primary/5 rounded-full blur-xl"></div>
                            <div className="absolute bottom-6 left-6 w-16 h-16 bg-blue-500/5 rounded-full blur-xl"></div>
                        </div>

                        {/* Back (Translation) */}
                        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900 dark:bg-black rounded-3xl shadow-xl border border-slate-700 flex flex-col items-center justify-center p-8 text-white">
                            <h3 className="text-3xl font-bold text-center mb-2">{currentCard.translation}</h3>
                            {currentCard.exampleJavanese && (
                                <p className="mt-4 text-center text-gray-400 italic">"{currentCard.exampleJavanese}"</p>
                            )}

                            {currentCard.audioUrl && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); playAudio(currentCard.audioUrl); }}
                                    className="mt-8 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
                                >
                                    <span className="material-symbols-outlined text-xl">volume_up</span>
                                    <span className="text-sm font-bold">Listen</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Controls */}
            {!isCompleted && (
                <div className="flex items-center justify-between mt-8 px-2">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className={`p-4 rounded-xl flex items-center justify-center transition-all ${currentIndex === 0 ? "opacity-30 cursor-not-allowed text-gray-400" : "bg-white dark:bg-surface-dark shadow-md text-slate-700 hover:-translate-y-1 hover:shadow-lg dark:text-white"}`}
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>

                    <div className="flex gap-2">
                        {words.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-8 bg-primary" : "w-2 bg-gray-200 dark:bg-gray-700"}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        className="p-4 rounded-xl bg-primary text-text-main-light shadow-lg hover:-translate-y-1 hover:shadow-primary/30 transition-all flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined">
                            {currentIndex === words.length - 1 ? "check" : "arrow_forward"}
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
}
