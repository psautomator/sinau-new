"use client";

import { Trash2, Plus, Info, AudioWaveform as Audio, Image as ImageIcon, ArrowLeftRight, ListOrdered } from "lucide-react";
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
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Question Prompt</label>
                    <textarea
                        value={question.questionText}
                        onChange={(e) => onChange({ questionText: e.target.value })}
                        placeholder="e.g. Hoe zeg je 'Hallo'?"
                        className="w-full px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    />
                </div>

                {/* Multiple Choice & Audio Choice & Story MCQ & Multi-Select */}
                {(question.questionType === "MULTIPLE_CHOICE" ||
                    question.questionType === "AUDIO_CHOICE" ||
                    question.questionType === "AUDIO_STORY_MCQ" ||
                    question.questionType === "MULTI_SELECT_AUDIO_WORDS") && (
                        <div className="space-y-4">
                            {(question.questionType === "AUDIO_CHOICE" || question.questionType === "AUDIO_STORY_MCQ") && (
                                <div className="flex flex-col gap-2 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                                        <Audio className="w-3 h-3" />
                                        Audio Prompt URL
                                    </label>
                                    <input
                                        value={question.options.audioPromptUrl || ""}
                                        onChange={(e) => onChange({ options: { ...question.options, audioPromptUrl: e.target.value } })}
                                        placeholder="/audio/uploads/word.mp3"
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                                    />
                                </div>
                            )}

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Answer Choices</label>
                                    <button type="button" onClick={handleAddChoice} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-all">+ Add Option</button>
                                </div>

                                {question.options.choices?.map((choice: any, idx: number) => (
                                    <div key={idx} className="flex flex-col gap-2 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={choice.isCorrect}
                                                onChange={(e) => handleChoiceChange(idx, { isCorrect: e.target.checked })}
                                                className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 transition-all"
                                            />
                                            <input
                                                value={choice.text}
                                                onChange={(e) => handleChoiceChange(idx, { text: e.target.value })}
                                                placeholder={`Option ${idx + 1}`}
                                                className={`flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${choice.isCorrect ? 'border-emerald-500/50 ring-2 ring-emerald-500/10' : ''}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveChoice(idx)}
                                                className="p-2 text-slate-300 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="pl-8">
                                            <input
                                                value={choice.wordId || ""}
                                                onChange={(e) => handleChoiceChange(idx, { wordId: e.target.value })}
                                                placeholder="Link to word ID (optional)"
                                                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-lg text-[9px] font-mono opacity-60 focus:opacity-100 transition-all"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                {/* Fill In The Blank */}
                {question.questionType === "FILL_IN_THE_BLANK" && (
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Acceptable Answers (Comma separated)</label>
                        <input
                            value={question.options.fillInAnswers?.join(", ") || ""}
                            onChange={(e) => handleFIBChange(e.target.value.split(",").map(s => s.trim()))}
                            placeholder="Antwoord 1, Antwoord 2"
                            className="w-full px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        />
                        <p className="text-[9px] text-slate-400 italic font-medium px-2">Multiple comma-separated values allow for alternative correct spellings.</p>
                    </div>
                )}

                {/* Match Pairs */}
                {question.questionType === "MATCH_PAIRS" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Match Pairs</label>
                            <button type="button" onClick={handleAddMatchPair} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700">+ Add Pair</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <span className="text-[9px] font-bold uppercase text-slate-400 px-2">Left Side</span>
                                {question.options.matchItemsLeft?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <input
                                            value={item.value}
                                            onChange={(e) => handleMatchItemChange('left', idx, e.target.value)}
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                                            placeholder={`Item ${idx + 1}`}
                                        />
                                        <button type="button" onClick={() => handleRemoveMatchPair(idx)} className="text-slate-300 hover:text-red-500 transition-all"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2">
                                <span className="text-[9px] font-bold uppercase text-slate-400 px-2">Right Side</span>
                                {question.options.matchItemsRight?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <input
                                            value={item.value}
                                            onChange={(e) => handleMatchItemChange('right', idx, e.target.value)}
                                            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
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
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sentence Parts (Correct Order)</label>
                            <button type="button" onClick={handleAddReorderPart} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700">+ Add Part</button>
                        </div>
                        <div className="space-y-2">
                            {question.options.sentencePartsToReorder?.map((part: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-black">{idx + 1}</div>
                                    <input
                                        value={part.value}
                                        onChange={(e) => handleReorderPartChange(idx, e.target.value)}
                                        className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl text-sm font-bold"
                                        placeholder="Fragment..."
                                    />
                                    <button type="button" onClick={() => handleRemoveReorderPart(idx)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                        <p className="text-[9px] text-slate-400 italic font-medium px-2">Fill the parts in the CORRECT order. They will be shuffled for the user.</p>
                    </div>
                )}

                {/* Media Prompts Editor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-100/50 dark:bg-slate-900/30 p-4 rounded-[1.5rem] border border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><Audio className="w-3 h-3" /> Audio URL</label>
                        <input
                            value={question.options.audioPromptUrl || ""}
                            onChange={(e) => onChange({ options: { ...question.options, audioPromptUrl: e.target.value } })}
                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-mono"
                            placeholder="/audio/..."
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Image URL</label>
                        <input
                            value={question.options.imagePromptUrl || ""}
                            onChange={(e) => onChange({ options: { ...question.options, imagePromptUrl: e.target.value } })}
                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-mono"
                            placeholder="/images/..."
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Info className="w-3 h-3" />
                        Explanation / Feedback
                    </label>
                    <textarea
                        value={question.explanation}
                        onChange={(e) => onChange({ explanation: e.target.value })}
                        placeholder="Why is this the correct answer?"
                        className="w-full px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-medium text-xs min-h-[80px] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    />
                </div>
            </div>
        </div>
    );
}
