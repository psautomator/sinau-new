"use client";

import { Trash2, Plus, Info, AudioWaveform as Audio, Image as ImageIcon, ArrowLeftRight, ListOrdered, CheckCircle } from "lucide-react";
import { QuizQuestion } from "@/types/quiz";

interface QuestionItemEditorProps {
    question: QuizQuestion;
    onChange: (updates: Partial<QuizQuestion>) => void;
}

export default function QuestionItemEditor({ question, onChange }: QuestionItemEditorProps) {
    const handleAddChoice = () => {
        const choices = [...(question.options.choices || [])];
        choices.push({ text: "", isCorrect: false });
        onChange({ options: { ...question.options, choices } });
    };

    const handleRemoveChoice = (index: number) => {
        const choices = [...(question.options.choices || [])];
        choices.splice(index, 1);
        onChange({ options: { ...question.options, choices } });
    };

    const handleChoiceChange = (index: number, updates: any) => {
        const choices = [...(question.options.choices || [])];
        choices[index] = { ...choices[index], ...updates };
        onChange({ options: { ...question.options, choices } });
    };

    const handleFIBChange = (answers: string[]) => {
        onChange({ options: { ...question.options, fillInAnswers: answers } });
    };

    const handleAddMatchPair = () => {
        const left = [...(question.options.matchItemsLeft || [])];
        const right = [...(question.options.matchItemsRight || [])];
        left.push({ value: "" });
        right.push({ value: "" });
        onChange({ options: { ...question.options, matchItemsLeft: left, matchItemsRight: right } });
    };

    const handleRemoveMatchPair = (index: number) => {
        const left = [...(question.options.matchItemsLeft || [])];
        const right = [...(question.options.matchItemsRight || [])];
        left.splice(index, 1);
        right.splice(index, 1);
        onChange({ options: { ...question.options, matchItemsLeft: left, matchItemsRight: right } });
    };

    const handleMatchItemChange = (side: 'left' | 'right', index: number, value: string) => {
        const key = side === 'left' ? 'matchItemsLeft' : 'matchItemsRight';
        const items = [...(question.options[key] || [])];
        items[index] = { ...items[index], value };
        onChange({ options: { ...question.options, [key]: items } });
    };

    const handleAddReorderPart = () => {
        const parts = [...(question.options.sentencePartsToReorder || [])];
        parts.push({ value: "" });
        onChange({ options: { ...question.options, sentencePartsToReorder: parts } });
    };

    const handleRemoveReorderPart = (index: number) => {
        const parts = [...(question.options.sentencePartsToReorder || [])];
        parts.splice(index, 1);
        onChange({ options: { ...question.options, sentencePartsToReorder: parts } });
    };

    const handleReorderPartChange = (index: number, value: string) => {
        const parts = [...(question.options.sentencePartsToReorder || [])];
        parts[index] = { ...parts[index], value };
        onChange({ options: { ...question.options, sentencePartsToReorder: parts } });
    };

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 gap-8">
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Question Prompt</label>
                    <textarea
                        value={question.questionText}
                        onChange={(e) => onChange({ questionText: e.target.value })}
                        placeholder="e.g. Hoe zeg je 'Hallo'?"
                        className="w-full px-8 py-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl font-black text-xl tracking-tight focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                        rows={2}
                    />
                </div>

                {/* Multiple Choice & Audio Choice & Story MCQ & Multi-Select */}
                {(question.questionType === "MULTIPLE_CHOICE" ||
                    question.questionType === "AUDIO_CHOICE" ||
                    question.questionType === "AUDIO_STORY_MCQ" ||
                    question.questionType === "MULTI_SELECT_AUDIO_WORDS") && (
                        <div className="space-y-6">
                            {(question.questionType === "AUDIO_CHOICE" || question.questionType === "AUDIO_STORY_MCQ") && (
                                <div className="flex flex-col gap-3 bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-[2rem] border border-blue-100 dark:border-blue-900/20">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                                        <Audio className="w-4 h-4" />
                                        Audio Prompt Source
                                    </label>
                                    <input
                                        value={question.options.audioPromptUrl || ""}
                                        onChange={(e) => onChange({ options: { ...question.options, audioPromptUrl: e.target.value } })}
                                        placeholder="/audio/uploads/word.mp3"
                                        className="w-full px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-mono focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                    />
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Answer Configuration</label>
                                    <button
                                        type="button"
                                        onClick={handleAddChoice}
                                        className="text-[10px] font-black uppercase tracking-[0.1em] text-blue-600 hover:text-blue-700 transition-all flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Add Option
                                    </button>
                                </div>

                                <div className="grid gap-4">
                                    {question.options.choices?.map((choice: any, idx: number) => (
                                        <div key={idx} className={`flex flex-col gap-3 p-5 rounded-[2rem] transition-all border ${choice.isCorrect ? 'bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                                            <div className="flex items-center gap-4">
                                                <div
                                                    onClick={() => handleChoiceChange(idx, { isCorrect: !choice.isCorrect })}
                                                    className={`w-10 h-10 rounded-2xl flex items-center justify-center cursor-pointer transition-all ${choice.isCorrect ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-500/10' : 'bg-slate-100 dark:bg-slate-800 text-slate-300'}`}
                                                >
                                                    {choice.isCorrect ? <CheckCircle className="w-5 h-5" /> : <div className="w-3 h-3 rounded-full border-2 border-slate-300" />}
                                                </div>
                                                <input
                                                    value={choice.text}
                                                    onChange={(e) => handleChoiceChange(idx, { text: e.target.value })}
                                                    placeholder={`Option ${idx + 1}`}
                                                    className="flex-1 bg-transparent border-none p-0 focus:ring-0 text-lg font-bold placeholder:text-slate-300 dark:placeholder:text-slate-700"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveChoice(idx)}
                                                    className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-2xl transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 pl-14">
                                                <Info className="w-3 h-3 text-slate-400" />
                                                <input
                                                    value={choice.wordId || ""}
                                                    onChange={(e) => handleChoiceChange(idx, { wordId: e.target.value })}
                                                    placeholder="Link to word ID (optional)"
                                                    className="flex-1 bg-transparent border-none p-0 focus:ring-0 text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-60 focus:opacity-100 transition-all"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                {/* Fill In The Blank */}
                {question.questionType === "FILL_IN_THE_BLANK" && (
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Acceptable Answers</label>
                        <input
                            value={question.options.fillInAnswers?.join(", ") || ""}
                            onChange={(e) => handleFIBChange(e.target.value.split(",").map(s => s.trim()))}
                            placeholder="Antwoord 1, Antwoord 2"
                            className="w-full px-8 py-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl font-black text-xl tracking-tight focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                        />
                        <p className="text-[10px] text-slate-400 italic font-bold px-4">Tip: Use commas to separate multiple correct spellings or alternative answers.</p>
                    </div>
                )}

                {/* Match Pairs */}
                {question.questionType === "MATCH_PAIRS" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Match Logic</label>
                            <button
                                type="button"
                                onClick={handleAddMatchPair}
                                className="text-[10px] font-black uppercase tracking-[0.1em] text-blue-600 hover:text-blue-700 transition-all flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full"
                            >
                                <Plus className="w-3 h-3" />
                                Add Pair
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 block text-center">Left Side</span>
                                {question.options.matchItemsLeft?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400">{idx + 1}</div>
                                        <input
                                            value={item.value}
                                            onChange={(e) => handleMatchItemChange('left', idx, e.target.value)}
                                            className="flex-1 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                            placeholder={`Item ${idx + 1}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveMatchPair(idx)}
                                            className="p-2 text-slate-300 hover:text-rose-500 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 block text-center">Right Side</span>
                                {question.options.matchItemsRight?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <ArrowLeftRight className="w-4 h-4 text-slate-200 shrink-0" />
                                        <input
                                            value={item.value}
                                            onChange={(e) => handleMatchItemChange('right', idx, e.target.value)}
                                            className="flex-1 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                            placeholder={`Match ${idx + 1}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Reorder Sentence */}
                {question.questionType === "REORDER_SENTENCE" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sentence Fragments</label>
                            <button
                                type="button"
                                onClick={handleAddReorderPart}
                                className="text-[10px] font-black uppercase tracking-[0.1em] text-blue-600 hover:text-blue-700 transition-all flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full"
                            >
                                <Plus className="w-3 h-3" />
                                Add Part
                            </button>
                        </div>
                        <div className="grid gap-3">
                            {question.options.sentencePartsToReorder?.map((part: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-black shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all">{idx + 1}</div>
                                    <input
                                        value={part.value}
                                        onChange={(e) => handleReorderPartChange(idx, e.target.value)}
                                        className="flex-1 bg-transparent border-none p-0 focus:ring-0 text-md font-bold"
                                        placeholder="Fragment..."
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveReorderPart(idx)}
                                        className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-2xl transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-400 italic font-bold px-4">Provide segments in the CORRECT order; they will be randomly shuffled for the student.</p>
                    </div>
                )}

                {/* Media Prompts Editor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 dark:bg-slate-950/30 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Audio className="w-4 h-4 text-purple-500" />
                            Global Audio URL
                        </label>
                        <input
                            value={question.options.audioPromptUrl || ""}
                            onChange={(e) => onChange({ options: { ...question.options, audioPromptUrl: e.target.value } })}
                            className="w-full px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-mono focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                            placeholder="/audio/..."
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-rose-500" />
                            Visual Prompt URL
                        </label>
                        <input
                            value={question.options.imagePromptUrl || ""}
                            onChange={(e) => onChange({ options: { ...question.options, imagePromptUrl: e.target.value } })}
                            className="w-full px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-mono focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                            placeholder="/images/..."
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <Info className="w-4 h-4 text-indigo-500" />
                        Explanation & Feedback
                    </label>
                    <textarea
                        value={question.explanation}
                        onChange={(e) => onChange({ explanation: e.target.value })}
                        placeholder="Why is this the correct answer? This will be shown to students after they answer."
                        className="w-full px-8 py-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl font-medium text-sm min-h-[120px] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                    />
                </div>
            </div>
        </div>
    );
}
