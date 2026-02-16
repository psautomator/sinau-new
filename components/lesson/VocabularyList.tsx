import React, { useState } from 'react';
import AudioRecorder from '../shared/AudioRecorder';
import { evaluatePronunciationAction } from '@/ai/actions';
import { updateSrsFromPronunciationAction } from '@/app/actions/srs';

export default function VocabularyList({ words = [], title = "Vocabulary List" }: { words?: any[], title?: string }) {
    const [practicingWord, setPracticingWord] = useState<any | null>(null);
    const [evaluation, setEvaluation] = useState<{ score: number, feedback: string } | null>(null);
    const [isEvaluating, setIsEvaluating] = useState(false);

    // Map formality/category to colors/icons if needed, or use defaults
    const getIcon = (w: any) => "school"; // Default

    const playAudio = (url: string) => {
        const audio = new Audio(url);
        audio.play().catch((err) => console.error("Playback failed:", err));
    };

    const handlePractice = (word: any) => {
        setPracticingWord(word);
        setEvaluation(null);
    };

    const handleRecordingComplete = async (audioDataUri: string) => {
        if (!practicingWord) return;

        setIsEvaluating(true);
        try {
            const result = await evaluatePronunciationAction({
                referenceText: practicingWord.word,
                audioDataUri
            });
            setEvaluation(result);

            // Persist for SRS
            if (practicingWord.id) {
                await updateSrsFromPronunciationAction(practicingWord.id, result.score);
            }
        } catch (error) {
            console.error(error);
            alert("Mislukt om de uitspraak te evalueren. Probeer het opnieuw.");
        } finally {
            setIsEvaluating(false);
        }
    };

    return (
        <section>
            <div className="flex items-center gap-3 mb-5 mt-4">
                <span className="material-symbols-outlined text-primary text-3xl">
                    style
                </span>
                <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">
                    {title}
                </h2>
            </div>
            {words.length === 0 ? (
                <p className="text-gray-500 italic">No vocabulary words for this section.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {words.map((item) => (
                        <div
                            key={item.id}
                            className={`bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all group relative overflow-hidden`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div
                                    className={`size-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400`}
                                >
                                    <span className="material-symbols-outlined">{getIcon(item)}</span>
                                </div>
                                <div className="flex gap-2">
                                    {item.audioUrl && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); playAudio(item.audioUrl); }}
                                            className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                                        >
                                            <span className="material-symbols-outlined text-lg">volume_up</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handlePractice(item)}
                                        className="size-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all"
                                        title="Oefen uitspraak"
                                    >
                                        <span className="material-symbols-outlined text-lg">record_voice_over</span>
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">
                                {item.word}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                {item.translation}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Practice Modal */}
            {practicingWord && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !isEvaluating && setPracticingWord(null)} />
                    <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 overflow-hidden">
                        <div className="absolute top-0 right-0 p-6">
                            <button onClick={() => setPracticingWord(null)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="text-center mb-8">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Uitspraak Oefenen</span>
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white mt-1 tracking-tighter">{practicingWord.word}</h2>
                            <p className="text-slate-500 font-bold">{practicingWord.translation}</p>
                        </div>

                        {!isEvaluating && !evaluation && (
                            <AudioRecorder
                                onRecordingComplete={handleRecordingComplete}
                                onCancel={() => setPracticingWord(null)}
                            />
                        )}

                        {isEvaluating && (
                            <div className="py-12 flex flex-col items-center gap-4">
                                <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <p className="font-bold text-slate-500 animate-pulse">Furnie evalueert je uitspraak...</p>
                            </div>
                        )}

                        {evaluation && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center size-24 rounded-full border-8 border-orange-500/20 mb-4">
                                        <span className="text-3xl font-black text-slate-900 dark:text-white">{evaluation.score}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                        {evaluation.score >= 85 ? 'Geweldig!' : evaluation.score >= 60 ? 'Goed bezig!' : 'Blijf oefenen!'}
                                    </h3>
                                </div>
                                <div className="p-6 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-800/50">
                                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                                        {evaluation.feedback}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setEvaluation(null)}
                                    className="w-full py-4 bg-primary text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all hover:-translate-y-1"
                                >
                                    Opnieuw proberen
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
