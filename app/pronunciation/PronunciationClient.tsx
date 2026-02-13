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
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <Sidebar />

            <main className="flex-1 overflow-y-auto h-full p-4 md:p-12 relative overflow-x-hidden">
                {/* Deep Batik Decoration Background */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-batik-pattern opacity-[0.03] dark:opacity-[0.07] pointer-events-none rounded-bl-[10rem] mask-image-gradient" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="max-w-[1100px] mx-auto flex flex-col gap-8 relative z-10 font-sans">
                    {/* Breadcrumbs & Heading */}
                    <header className="flex flex-col gap-2 relative z-10 px-2">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/25">
                                <span className="material-symbols-outlined text-2xl">record_voice_over</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Speaking Mastery</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight mt-1">
                            Pronunciation <span className="text-primary">Challenge</span>
                        </h2>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mt-2">
                            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base max-w-2xl">
                                Practice your speaking skills with AI-powered feedback. Unlock your true Javanese voice.
                            </p>
                            <div className="flex items-center gap-2 bg-primary/10 dark:bg-primary/5 px-4 py-2 rounded-xl text-primary font-black text-[10px] uppercase tracking-widest border border-primary/20">
                                <span className="material-symbols-outlined text-sm">psychology</span>
                                {vocabulary.length > 0 ? (
                                    <span>Phrase {currentIndex + 1} of {vocabulary.length}</span>
                                ) : (
                                    <span>No phrases available</span>
                                )}
                            </div>
                        </div>
                    </header>

                    {vocabulary.length === 0 ? (
                        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-slate-800 mb-6">search_off</span>
                            <h3 className="text-2xl font-black dark:text-white tracking-tight">Nog geen woorden beschikbaar</h3>
                            <p className="text-slate-500 font-bold mt-2">Start eerst een module om woorden te ontgrendelen.</p>
                            <Link href="/modules" className="inline-block mt-8 bg-primary text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs">
                                Bekijk Modules
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Main Interaction Card - High Fidelity */}
                            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[3rem] shadow-sm border border-slate-200/50 dark:border-slate-800/50 p-10 md:p-16 flex flex-col items-center gap-10 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

                                <div className="flex flex-col items-center gap-4 w-full text-center">
                                    <button className="flex items-center justify-center size-16 rounded-[1.5rem] bg-primary text-white mb-2 cursor-pointer hover:scale-110 active:scale-95 transition-all group shadow-xl shadow-primary/25">
                                        <span className="material-symbols-outlined text-4xl">volume_up</span>
                                    </button>
                                    <h2 className="text-slate-900 dark:text-white tracking-tighter text-5xl md:text-7xl font-black leading-tight">{currentVocab.word}</h2>
                                    <p className="text-primary font-black text-xl md:text-2xl tracking-widest opacity-80 mt-1">
                                        {currentVocab.phonetic || syllables.join('-')}
                                    </p>
                                    <div className="px-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl mt-4 border border-slate-200/50 dark:border-slate-700/50">
                                        <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
                                            Meaning: <span className="text-slate-900 dark:text-white">{currentVocab.translation}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center gap-6 w-full py-6">
                                    {isEvaluating ? (
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="size-24 rounded-[2rem] border-8 border-primary/20 border-t-primary animate-spin"></div>
                                            <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] animate-pulse">Analyzing Voice Patterns...</p>
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
                                            className="group relative flex items-center justify-center size-32 rounded-[2.5rem] bg-primary text-white shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all hover:scale-105 active:scale-95 z-10"
                                        >
                                            <span className="absolute inline-flex h-full w-full rounded-[2.5rem] bg-primary opacity-20 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
                                            <span className="material-symbols-outlined text-[56px]">mic</span>
                                        </button>
                                    ) : null}

                                    {!evaluation && !isEvaluating && !showRecorder && (
                                        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">
                                            Tap to Start Recording
                                        </p>
                                    )}
                                </div>

                                {evaluation && (
                                    <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-4"></div>
                                )}

                                {evaluation && (
                                    <div className="flex flex-col md:flex-row w-full gap-12 items-stretch animate-in fade-in slide-in-from-bottom-8 duration-1000">
                                        <div className="flex flex-col items-center justify-center gap-4 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 pb-10 md:pb-0 md:pr-10">
                                            <div className="relative size-40">
                                                <svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                                                    <circle className="text-slate-100 dark:text-slate-800" cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3"></circle>
                                                    <circle
                                                        className={`transition-all duration-1000 ${evaluation.score >= 80 ? 'text-primary' : evaluation.score >= 60 ? 'text-amber-500' : 'text-rose-500'}`}
                                                        cx="18" cy="18" r="16"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeDasharray={`${evaluation.score}, 100`}
                                                        strokeLinecap="round"
                                                        strokeWidth="3"
                                                    ></circle>
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-900 dark:text-white">
                                                    <span className="text-5xl font-black tracking-tighter leading-none">{evaluation.score}</span>
                                                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-1">Accuracy</span>
                                                </div>
                                            </div>
                                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${evaluation.score >= 80 ? 'bg-emerald-500 text-white' : evaluation.score >= 60 ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'}`}>
                                                {evaluation.score >= 90 ? 'Perfect Syllables' : evaluation.score >= 80 ? 'Excellent' : evaluation.score >= 60 ? 'Goeie Poging' : 'Probeer Opnieuw'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-8 flex-1 justify-center">
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Phonetic Analysis</p>
                                                <div className="flex gap-4 text-3xl md:text-5xl font-black flex-wrap tracking-tighter">
                                                    {syllables.map((s, i) => (
                                                        <span
                                                            key={i}
                                                            className={`relative group border-b-4 pb-2 ${evaluation.score >= 60 ? 'text-emerald-500 border-emerald-500/20' : 'text-rose-500 border-rose-500/20'}`}
                                                        >
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className={`${evaluation.score >= 80 ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-500/20' : 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-500/20'} border-2 rounded-[2rem] p-6 flex gap-4 items-start shadow-sm`}>
                                                <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${evaluation.score >= 80 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'}`}>
                                                    <span className="material-symbols-outlined text-2xl">lightbulb</span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-slate-900 dark:text-white font-black text-sm uppercase tracking-widest">AI Intelligence Feedback</p>
                                                    <p className="text-slate-600 dark:text-slate-300 font-bold text-base leading-relaxed">
                                                        {evaluation.feedback}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center px-4 pb-12">
                                <button
                                    onClick={handlePrev}
                                    disabled={currentIndex === 0}
                                    className="flex items-center gap-3 text-slate-400 font-black uppercase tracking-[0.2em] text-xs hover:text-primary transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
                                >
                                    <span className="material-symbols-outlined text-2xl group-hover:-translate-x-2 transition-transform">arrow_back</span>
                                    Previous
                                </button>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => { setEvaluation(null); setShowRecorder(true); }}
                                        className="h-14 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-300 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 border border-slate-200 dark:border-slate-800 transition-all flex items-center gap-2 shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-xl">replay</span>
                                        Retake
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        disabled={currentIndex === vocabulary.length - 1}
                                        className="h-14 bg-primary text-white px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed group"
                                    >
                                        Next Phrase
                                        <span className="material-symbols-outlined text-xl group-hover:translate-x-2 transition-transform">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
