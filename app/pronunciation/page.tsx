"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

export default function PronunciationPage() {
    const [isRecording, setIsRecording] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const handleRecord = () => {
        setIsRecording(true);
        // Simulate recording delay
        setTimeout(() => {
            setIsRecording(false);
            setShowResults(true);
        }, 2000);
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
                                <span>AI Feedback Enabled</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Interaction Card */}
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 md:p-12 flex flex-col items-center gap-8 relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

                        {/* Target Phrase Section */}
                        <div className="flex flex-col items-center gap-2 w-full text-center">
                            <button className="inline-flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary-dark dark:text-primary mb-2 cursor-pointer hover:bg-primary hover:text-text-main-light transition-all group shadow-sm">
                                <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">volume_up</span>
                            </button>
                            <h2 className="text-text-main-light dark:text-white tracking-tight text-4xl md:text-5xl font-bold leading-tight">Sugeng enjang</h2>
                            <p className="text-gray-400 dark:text-gray-500 text-lg md:text-xl font-normal leading-normal italic font-mono mt-1">/su-geng en-jang/</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg mt-2">Meaning: Good morning</p>
                        </div>

                        {/* Recording Interaction Area */}
                        <div className="flex flex-col items-center justify-center gap-6 w-full py-6">
                            {/* Record Button with Pulse Effect */}
                            <button
                                onClick={handleRecord}
                                disabled={isRecording}
                                className={`group relative flex items-center justify-center size-24 rounded-full bg-primary text-text-main-light shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-105 active:scale-95 z-10 ${isRecording ? 'animate-pulse' : ''}`}
                            >
                                {/* Ripple Animation Ring */}
                                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
                                <span className="material-symbols-outlined text-[40px]">{isRecording ? 'graphic_eq' : 'mic'}</span>
                            </button>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium animate-pulse">
                                {isRecording ? 'Listening...' : 'Tap to record'}
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-2"></div>

                        {/* Results Section (Visible State) */}
                        {showResults && (
                            <div className="flex flex-col md:flex-row w-full gap-8 items-stretch animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {/* Score Gauge */}
                                <div className="flex flex-col items-center justify-center gap-3 md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 pb-6 md:pb-0 md:pr-6">
                                    <div className="relative size-32">
                                        <svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                                            {/* Background Circle */}
                                            <path className="text-gray-100 dark:text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3"></path>
                                            {/* Progress Circle (85%) */}
                                            <path className="text-primary drop-shadow-[0_0_4px_rgba(19,236,200,0.5)]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="85, 100" strokeLinecap="round" strokeWidth="3"></path>
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-text-main-light dark:text-white">
                                            <span className="text-3xl font-bold tracking-tighter">85</span>
                                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Score</span>
                                        </div>
                                    </div>
                                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Excellent</span>
                                </div>
                                {/* Feedback Detail */}
                                <div className="flex flex-col gap-5 flex-1 justify-center">
                                    <div className="space-y-3">
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Syllable Analysis</p>
                                        <div className="flex gap-2 text-2xl md:text-3xl font-medium flex-wrap">
                                            <span className="text-green-600 dark:text-green-400 border-b-2 border-green-500/50 pb-1">Su</span>
                                            <span className="text-green-600 dark:text-green-400 border-b-2 border-green-500/50 pb-1">geng</span>
                                            <span className="text-text-main-light dark:text-white border-b-2 border-transparent pb-1">&nbsp;</span>
                                            <span className="text-green-600 dark:text-green-400 border-b-2 border-green-500/50 pb-1">en</span>
                                            {/* Problematic Syllable */}
                                            <span className="relative group cursor-help text-orange-500 dark:text-orange-400 border-b-2 border-orange-500 pb-1">
                                                jang
                                                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-text-main-light dark:bg-white text-white dark:text-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">Needs work</span>
                                            </span>
                                        </div>
                                    </div>
                                    {/* AI Tip Card */}
                                    <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-500/20 rounded-lg p-4 flex gap-3 items-start">
                                        <span className="material-symbols-outlined text-orange-500 mt-0.5 shrink-0">lightbulb</span>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-text-main-light dark:text-white font-bold text-sm">AI Tip</p>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                                You&apos;re close! Try to soften the <span className="font-bold text-orange-600 dark:text-orange-400">&quot;ng&quot;</span> sound at the end. In Javanese, it&apos;s more nasal and lighter than in English.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Navigation */}
                    <div className="flex justify-between items-center px-4">
                        <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-text-main-light dark:hover:text-white transition-colors font-medium">
                            <span className="material-symbols-outlined text-xl">arrow_back</span>
                            Previous
                        </button>
                        <div className="flex gap-4">
                            <button
                                onClick={() => { setShowResults(false); }}
                                className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-6 py-3 rounded-full font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-xl">replay</span>
                                Retry
                            </button>
                            <button className="bg-text-main-light dark:bg-white text-white dark:text-text-main-light px-6 py-3 rounded-full font-bold hover:bg-primary hover:text-text-main-light dark:hover:bg-primary transition-all shadow-lg shadow-black/5 flex items-center gap-2">
                                Next Lesson
                                <span className="material-symbols-outlined text-xl">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
