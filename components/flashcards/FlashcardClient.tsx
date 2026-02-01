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

import { useState, useEffect } from "react";

interface FlashcardClientProps {
    words: any[];
    title?: string;
    backToLessonUrl?: string;
}

export default function FlashcardClient({ words, title = "Daily Mix", backToLessonUrl }: FlashcardClientProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Reset flip when word changes
    useEffect(() => {
        setIsFlipped(false);
    }, [currentIndex]);

    if (words.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">style</span>
                <h2 className="text-xl font-bold">No flashcards found</h2>
                <p className="text-gray-500">Add words to this lesson to see them here.</p>
            </div>
        );
    }

    const currentWord = words[currentIndex];
    const isLastCard = currentIndex === words.length - 1;
    const progress = ((currentIndex + 1) / words.length) * 100;

    const handleFlip = () => setIsFlipped(!isFlipped);

    const handleNext = () => {
        if (currentIndex < words.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const playAudio = (e: React.MouseEvent, url: string) => {
        e.stopPropagation();
        const audio = new Audio(url);
        audio.play().catch(console.error);
    };

    return (
        <div className="w-full max-w-[800px] flex flex-col gap-6">
            {/* Progress Section */}
            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-end">
                    <h1 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">
                        {title}
                    </h1>
                    <span className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                        {currentIndex + 1} of {words.length} cards
                    </span>
                </div>
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Flashcard Area */}
            <div className="perspective-1000 w-full mt-4 h-[500px] relative group cursor-pointer" onClick={handleFlip}>
                <div
                    className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? "rotate-y-180" : ""}`}
                >
                    {/* Front Side */}
                    <div className="absolute w-full h-full backface-hidden bg-surface-light dark:bg-surface-dark rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 p-8 sm:p-10 flex flex-col items-center justify-center gap-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-4xl sm:text-5xl font-extrabold text-center tracking-tight text-text-main-light dark:text-text-main-dark">
                                {currentWord.word}
                            </h2>
                            {currentWord.audioUrl && (
                                <button
                                    className="rounded-full size-12 bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-black text-text-main-light dark:text-gray-300 transition-all flex items-center justify-center group/audio shadow-sm"
                                    onClick={(e) => playAudio(e, currentWord.audioUrl!)}
                                >
                                    <span className="material-symbols-outlined text-2xl group-hover/audio:scale-110 transition-transform">
                                        volume_up
                                    </span>
                                </button>
                            )}
                        </div>
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark tracking-wide uppercase">
                            Javanese • {currentWord.formality}
                        </span>
                        <p className="absolute bottom-10 text-sm text-gray-400">Click to flip</p>
                    </div>

                    {/* Back Side */}
                    <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-surface-light dark:bg-surface-dark rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
                        <div className="p-6 sm:p-8 flex flex-col gap-6 h-full items-center justify-center">
                            {/* Text Content */}
                            <div className="flex flex-col gap-4 flex-grow text-center w-full justify-center">
                                <div>
                                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">
                                        Translation
                                    </p>
                                    <p className="text-3xl font-bold text-text-main-light dark:text-text-main-dark">
                                        {currentWord.translation}
                                    </p>
                                </div>

                                {currentWord.context && (
                                    <div className="bg-primary/10 p-4 rounded-xl border-l-4 border-primary text-center">
                                        <div className="flex gap-2 items-start justify-center">
                                            <span className="material-symbols-outlined text-primary-dark dark:text-primary text-sm mt-1">lightbulb</span>
                                            <div className="flex flex-col gap-1">
                                                <p className="text-xs font-bold text-primary-dark dark:text-primary uppercase">Context</p>
                                                <p className="text-sm text-text-main-light dark:text-text-main-dark leading-relaxed">
                                                    {currentWord.context}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentWord.phonetic && (
                                    <p className="text-gray-400 font-mono text-sm italic">/{currentWord.phonetic}/</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Interaction Controls */}
            <div className="flex flex-col items-center gap-6 mt-2">
                <div className="flex justify-center gap-4 w-full">
                    <button
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        disabled={currentIndex === 0}
                        className="flex-1 h-14 rounded-xl border-2 border-gray-100 dark:border-gray-800 hover:border-primary transition-all font-bold disabled:opacity-30 disabled:hover:border-gray-100"
                    >
                        Previous
                    </button>
                    {isLastCard && backToLessonUrl ? (
                        <a
                            href={backToLessonUrl}
                            className="flex-1 h-14 rounded-xl bg-green-600 text-white flex items-center justify-center gap-2 font-bold shadow-md shadow-green-600/20 hover:bg-green-700 transition-all active:scale-95"
                        >
                            <span className="material-symbols-outlined">first_page</span>
                            <span>Back to Lesson</span>
                        </a>
                    ) : (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            disabled={isLastCard}
                            className="flex-1 h-14 rounded-xl bg-primary text-black font-bold shadow-md shadow-primary/20 hover:shadow-lg disabled:opacity-30 transition-all"
                        >
                            Next Card
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
