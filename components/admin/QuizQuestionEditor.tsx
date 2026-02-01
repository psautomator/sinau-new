"use client";

import { useState, useEffect } from "react";
import {
    Plus, Trash2, GripVertical, ChevronDown, ChevronUp, HelpCircle,
    AudioWaveform as Audio, Type, ListChecks, ArrowLeftRight,
    ListOrdered, Headphones, Mic, Library, Ear
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import QuestionItemEditor from "./QuestionItemEditor";

import { QuestionType, QuizQuestion } from "@/types/quiz";

interface QuizQuestionEditorProps {
    initialQuestions?: any[];
}

export default function QuizQuestionEditor({ initialQuestions = [] }: QuizQuestionEditorProps) {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);

    useEffect(() => {
        if (initialQuestions && initialQuestions.length > 0) {
            setQuestions(initialQuestions.map((q, idx) => ({
                ...q,
                id: q.id || uuidv4(),
                order: q.order || idx + 1
            })));
        }
    }, [initialQuestions]);

    const addQuestion = (type: QuestionType) => {
        let initialOptions: any = {};

        switch (type) {
            case "MULTIPLE_CHOICE":
            case "AUDIO_CHOICE":
            case "AUDIO_STORY_MCQ":
                initialOptions = { choices: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }] };
                break;
            case "MULTI_SELECT_AUDIO_WORDS":
                initialOptions = { choices: [{ text: "", isCorrect: true }, { text: "", isCorrect: true }] };
                break;
            case "FILL_IN_THE_BLANK":
            case "TYPE_HEARD_AUDIO":
                initialOptions = { fillInAnswers: [""] };
                break;
            case "MATCH_PAIRS":
                initialOptions = {
                    matchItemsLeft: [{ value: "" }, { value: "" }],
                    matchItemsRight: [{ value: "" }, { value: "" }]
                };
                break;
            case "REORDER_SENTENCE":
                initialOptions = { sentencePartsToReorder: [{ value: "" }, { value: "" }, { value: "" }] };
                break;
        }

        const newQuestion: QuizQuestion = {
            id: uuidv4(),
            questionText: "",
            questionType: type,
            explanation: "",
            order: questions.length + 1,
            options: initialOptions
        };
        setQuestions([...questions, newQuestion]);
    };

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id).map((q, idx) => ({ ...q, order: idx + 1 })));
    };

    const updateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
    };

    const moveQuestion = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === questions.length - 1) return;

        const newQuestions = [...questions];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];

        setQuestions(newQuestions.map((q, idx) => ({ ...q, order: idx + 1 })));
    };

    return (
        <div className="space-y-8">
            <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-[2.5rem]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                        <Plus className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Build Your Assessment</h3>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <button type="button" onClick={() => addQuestion("MULTIPLE_CHOICE")} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all group">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all"><ListChecks className="w-5 h-5" /></div>
                        <div className="flex flex-col items-start"><span className="text-[10px] font-black uppercase">MCQ</span><span className="text-[8px] opacity-50 font-bold uppercase tracking-tight">Standard</span></div>
                    </button>

                    <button type="button" onClick={() => addQuestion("FILL_IN_THE_BLANK")} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-emerald-500 hover:shadow-lg transition-all group">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all"><Type className="w-5 h-5" /></div>
                        <div className="flex flex-col items-start"><span className="text-[10px] font-black uppercase">FIB</span><span className="text-[8px] opacity-50 font-bold uppercase tracking-tight">Text Entry</span></div>
                    </button>

                    <button type="button" onClick={() => addQuestion("MATCH_PAIRS")} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-indigo-500 hover:shadow-lg transition-all group">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all"><ArrowLeftRight className="w-5 h-5" /></div>
                        <div className="flex flex-col items-start"><span className="text-[10px] font-black uppercase">Match</span><span className="text-[8px] opacity-50 font-bold uppercase tracking-tight">Pairs</span></div>
                    </button>

                    <button type="button" onClick={() => addQuestion("REORDER_SENTENCE")} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-amber-500 hover:shadow-lg transition-all group">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-all"><ListOrdered className="w-5 h-5" /></div>
                        <div className="flex flex-col items-start"><span className="text-[10px] font-black uppercase">Reorder</span><span className="text-[8px] opacity-50 font-bold uppercase tracking-tight">Sentence</span></div>
                    </button>

                    <button type="button" onClick={() => addQuestion("AUDIO_CHOICE")} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-purple-500 hover:shadow-lg transition-all group">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-all"><Headphones className="w-5 h-5" /></div>
                        <div className="flex flex-col items-start"><span className="text-[10px] font-black uppercase">Audio</span><span className="text-[8px] opacity-50 font-bold uppercase tracking-tight">Listening</span></div>
                    </button>

                    <button type="button" onClick={() => addQuestion("TYPE_HEARD_AUDIO")} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-cyan-500 hover:shadow-lg transition-all group">
                        <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 rounded-xl group-hover:bg-cyan-600 group-hover:text-white transition-all"><Ear className="w-5 h-5" /></div>
                        <div className="flex flex-col items-start"><span className="text-[10px] font-black uppercase">Listen</span><span className="text-[8px] opacity-50 font-bold uppercase tracking-tight">Type Heard</span></div>
                    </button>

                    <button type="button" onClick={() => addQuestion("AUDIO_STORY_MCQ")} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-pink-500 hover:shadow-lg transition-all group">
                        <div className="p-3 bg-pink-50 dark:bg-pink-900/20 text-pink-600 rounded-xl group-hover:bg-pink-600 group-hover:text-white transition-all"><Mic className="w-5 h-5" /></div>
                        <div className="flex flex-col items-start"><span className="text-[10px] font-black uppercase">Story</span><span className="text-[8px] opacity-50 font-bold uppercase tracking-tight">Comprehension</span></div>
                    </button>

                    <button type="button" onClick={() => addQuestion("MULTI_SELECT_AUDIO_WORDS")} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-rose-500 hover:shadow-lg transition-all group">
                        <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-all"><Library className="w-5 h-5" /></div>
                        <div className="flex flex-col items-start"><span className="text-[10px] font-black uppercase">Multi</span><span className="text-[8px] opacity-50 font-bold uppercase tracking-tight">Checkboxes</span></div>
                    </button>
                </div>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {questions.length === 0 ? (
                    <div className="p-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] flex flex-col items-center justify-center gap-4 text-slate-400">
                        <HelpCircle className="w-12 h-12 opacity-20" />
                        <p className="text-sm font-bold uppercase tracking-widest opacity-50">Empty Question Bank</p>
                    </div>
                ) : (
                    questions.map((q, index) => (
                        <div key={q.id} className="group relative bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-[2rem] p-6 transition-all hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 flex flex-col gap-1 items-center">
                                    <button type="button" onClick={() => moveQuestion(index, 'up')} disabled={index === 0} className="p-1 text-slate-300 hover:text-blue-500 disabled:opacity-0 transition-all">
                                        <ChevronUp className="w-4 h-4" />
                                    </button>
                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-black">
                                        {index + 1}
                                    </div>
                                    <button type="button" onClick={() => moveQuestion(index, 'down')} disabled={index === questions.length - 1} className="p-1 text-slate-300 hover:text-blue-500 disabled:opacity-0 transition-all">
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {q.questionType === "MULTIPLE_CHOICE" && <ListChecks className="w-4 h-4 text-blue-500" />}
                                            {q.questionType === "FILL_IN_THE_BLANK" && <Type className="w-4 h-4 text-emerald-500" />}
                                            {q.questionType === "AUDIO_CHOICE" && <Audio className="w-4 h-4 text-purple-500" />}
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{q.questionType.replace(/_/g, " ")}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(q.id)}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <QuestionItemEditor
                                        question={q}
                                        onChange={(updates: Partial<QuizQuestion>) => updateQuestion(q.id, updates)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Hidden Input to sync with form submission */}
            <input type="hidden" name="questions" value={JSON.stringify(questions.map(({ id, ...rest }) => rest))} />
        </div>
    );
}
