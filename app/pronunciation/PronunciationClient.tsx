"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import AudioRecorder from "@/components/shared/AudioRecorder";
import { evaluatePronunciationAction } from "@/ai/actions";
import { updateSrsFromPronunciationAction } from "@/app/actions/srs";

interface Vocabulary {
    id: string;
    word: string;
    translation: string;
    phonetic?: string | null;
    level?: string | null;
    category?: string | null;
}

interface PronunciationClientProps {
    vocabulary: Vocabulary[];
}

/**
 * Basic Javanese Syllable Splitting Utility
 * Note: This is a heuristic and might not be 100% linguistically accurate,
 * but it's sufficient for UI feedback.
 */
function splitIntoSyllables(word: string): string[] {
    if (!word) return [];

    // Javanese syllable patterns are often CV or CVC.
    // This regex looks for vowel-ending or consonant-ending clusters.
    // It's a simplified version for common Javanese words.
    const syllables = word.match(/[^aeiouéè]*[aeiouéè]+(?:[^aeiouéè](?![aeiouéè]))?/gi);

    return syllables || [word];
}

export default function PronunciationClient({ vocabulary }: PronunciationClientProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [evaluation, setEvaluation] = useState<{ score: number; feedback: string } | null>(null);
    const [showRecorder, setShowRecorder] = useState(false);

    // Provide some defaults if vocab is empty (should not happen normally)
    const currentVocab = vocabulary.length > 0 ? vocabulary[currentIndex] : {
        id: "mock-1",
        word: "Sugeng enjang",
        phonetic: "/su-geng en-jang/",
        translation: "Good morning",
        category: "Greetings"
    };

    const syllables = splitIntoSyllables(currentVocab.word);

    const handleRecordingComplete = async (audioDataUri: string) => {
        setIsEvaluating(true);
        setShowRecorder(false);
        try {
            const result = await evaluatePronunciationAction({
                referenceText: currentVocab.word,
                audioDataUri
            });
            setEvaluation(result);

            // Persist result via SRS
            if (currentVocab?.id) {
                await updateSrsFromPronunciationAction(currentVocab.id, result.score);
            }
        } catch (error) {
            console.error("Evaluation failed:", error);
            alert("Mislukt om de uitspraak te evalueren. Probeer het opnieuw.");
        } finally {
            setIsEvaluating(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < vocabulary.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setEvaluation(null);
            setShowRecorder(false);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setEvaluation(null);
            setShowRecorder(false);
        }
    };

    return (
        <>
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark relative">
                <div className="w-full max-w-[960px] mx-auto px-6 py-8 md:px-10 lg:py-10 flex flex-col gap-8">
                    {/* Breadcrumbs & Heading */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap gap-2 items-center text-sm">
                            <Link href="/" className="text-primary-dark dark:text-primary hover:text-primary transition-colors font-medium">Practice</Link>
                            <span className="text-gray-400 dark:text-gray-600">/</span>
                            <span className="text-text-main-light dark:text-white font-medium">Pronunciation</span>
                        </div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                            <div>
                                <h1 className="text-text-main-light dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">Pronunciation Challenge</h1>
                                <p className="text-text-secondary-light dark:text-gray-400 text-base font-normal mt-2">Practice your speaking skills with AI feedback.</p>
                            </div>
                            <div className="flex items-center gap-2 bg-primary/10 dark:bg-primary/5 px-4 py-2 rounded-full text-primary-dark dark:text-primary font-medium text-sm">
                                <span className="material-symbols-outlined text-lg">psychology</span>
                                {vocabulary.length > 0 ? (
                                    <span>Phrase {currentIndex + 1} of {vocabulary.length}</span>
                                ) : (
                                    <span>No phrases available</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {vocabulary.length === 0 ? (
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-12 text-center border border-dashed border-gray-300 dark:border-gray-700">
                            <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">search_off</span>
                            <h3 className="text-xl font-bold dark:text-white">Nog geen woorden beschikbaar</h3>
                            <p className="text-gray-500 mt-2">Start eerst een module om woorden te ontgrendelen voor uitspraak-oefeningen.</p>
                            <Link href="/modules" className="inline-block mt-6 bg-primary text-black font-bold py-3 px-8 rounded-xl">
                                Bekijk Modules
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Main Interaction Card */}
                            <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 md:p-12 flex flex-col items-center gap-8 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

                                <div className="flex flex-col items-center gap-2 w-full text-center">
                                    <button className="inline-flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary-dark dark:text-primary mb-2 cursor-pointer hover:bg-primary hover:text-text-main-light transition-all group shadow-sm">
                                        <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">volume_up</span>
                                    </button>
                                    <h2 className="text-text-main-light dark:text-white tracking-tight text-4xl md:text-5xl font-bold leading-tight">{currentVocab.word}</h2>
                                    <p className="text-gray-400 dark:text-gray-500 text-lg md:text-xl font-normal leading-normal italic font-mono mt-1">
                                        {currentVocab.phonetic || syllables.join('-')}
                                    </p>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg mt-2">
                                        Meaning: {currentVocab.translation}
                                    </p>
                                </div>

                                <div className="flex flex-col items-center justify-center gap-6 w-full py-6">
                                    {isEvaluating ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="size-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                                            <p className="text-gray-500 font-bold animate-pulse">AI is je uitspraak aan het analyseren...</p>
                                        </div>
                                    ) : showRecorder ? (
                                        <div className="w-full max-w-md">
                                            <AudioRecorder
                                                onRecordingComplete={handleRecordingComplete}
                                                onCancel={() => setShowRecorder(false)}
                                            />
                                        </div>
                                    ) : !evaluation ? (
                                        <button
                                            onClick={() => setShowRecorder(true)}
                                            className="group relative flex items-center justify-center size-24 rounded-full bg-primary text-text-main-light shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-105 active:scale-95 z-10"
                                        >
                                            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
                                            <span className="material-symbols-outlined text-[40px]">mic</span>
                                        </button>
                                    ) : null}

                                    {!evaluation && !isEvaluating && !showRecorder && (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                            Klik op de microfoon om te beginnen
                                        </p>
                                    )}
                                </div>

                                <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-2"></div>

                                {evaluation && (
                                    <div className="flex flex-col md:flex-row w-full gap-8 items-stretch animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <div className="flex flex-col items-center justify-center gap-3 md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 pb-6 md:pb-0 md:pr-6">
                                            <div className="relative size-32">
                                                <svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                                                    <path className="text-gray-100 dark:text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3"></path>
                                                    <path
                                                        className={`transition-all duration-1000 ${evaluation.score >= 80 ? 'text-primary' : evaluation.score >= 60 ? 'text-amber-500' : 'text-rose-500'}`}
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeDasharray={`${evaluation.score}, 100`}
                                                        strokeLinecap="round"
                                                        strokeWidth="3"
                                                    ></path>
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-text-main-light dark:text-white">
                                                    <span className="text-3xl font-bold tracking-tighter">{evaluation.score}</span>
                                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Score</span>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${evaluation.score >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : evaluation.score >= 60 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'}`}>
                                                {evaluation.score >= 90 ? 'Perfect' : evaluation.score >= 80 ? 'Excellent' : evaluation.score >= 60 ? 'Goed' : 'Probeer opnieuw'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-5 flex-1 justify-center">
                                            <div className="space-y-3">
                                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Syllable Analysis</p>
                                                <div className="flex gap-2 text-2xl md:text-3xl font-medium flex-wrap">
                                                    {syllables.map((s, i) => (
                                                        <span
                                                            key={i}
                                                            className={`relative group cursor-help border-b-2 pb-1 ${evaluation.score >= 60 ? 'text-green-600 dark:text-green-400 border-green-500/50' : 'text-rose-600 dark:text-rose-400 border-rose-500/50'}`}
                                                        >
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className={`${evaluation.score >= 80 ? 'bg-primary/5 border-primary/10' : 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-500/20'} border rounded-lg p-4 flex gap-3 items-start`}>
                                                <span className={`material-symbols-outlined mt-0.5 shrink-0 ${evaluation.score >= 80 ? 'text-primary' : 'text-orange-500'}`}>lightbulb</span>
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-text-main-light dark:text-white font-bold text-sm">AI Feedback</p>
                                                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                                        {evaluation.feedback}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center px-4">
                                <button
                                    onClick={handlePrev}
                                    disabled={currentIndex === 0}
                                    className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-text-main-light dark:hover:text-white transition-colors font-medium disabled:opacity-30 disabled:cursor-not-allowed group"
                                >
                                    <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
                                    Previous
                                </button>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => { setEvaluation(null); setShowRecorder(true); }}
                                        className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-6 py-3 rounded-full font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-xl">replay</span>
                                        Opnieuw
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        disabled={currentIndex === vocabulary.length - 1}
                                        className="bg-text-main-light dark:bg-white text-white dark:text-text-main-light px-6 py-3 rounded-full font-bold hover:bg-primary hover:text-text-main-light dark:hover:bg-primary transition-all shadow-lg shadow-black/5 flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed group"
                                    >
                                        Next Word
                                        <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </>
    );
}
