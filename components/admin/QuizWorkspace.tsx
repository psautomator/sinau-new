"use client";

import { useState, useEffect } from "react";
import {
    Save, X, ChevronRight,
    ListChecks, Type, ArrowLeftRight,
    ListOrdered, Headphones, Ear,
    Mic, Library, Trash2, Plus,
    LayoutDashboard, Settings, Eye,
    Archive, Clock, CheckCircle,
    GripVertical, ChevronUp, ChevronDown
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import QuestionItemEditor from "./QuestionItemEditor";
import { QuestionType, QuizQuestion } from "@/types/quiz";

interface QuizWorkspaceProps {
    quiz: any;
    allLessons: any[];
    onClose: () => void;
    onSave: (formData: FormData) => Promise<void>;
}

export default function QuizWorkspace({ quiz, allLessons, onClose, onSave }: QuizWorkspaceProps) {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
    const [title, setTitle] = useState(quiz?.title || "");
    const [description, setDescription] = useState(quiz?.description || "");
    const [lessonId, setLessonId] = useState(quiz?.lessonId || "");
    const [published, setPublished] = useState(quiz?.published || false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (quiz?.questions) {
            setQuestions(quiz.questions.map((q: any, idx: number) => ({
                ...q,
                id: q.id || uuidv4(),
                order: q.order || idx + 1
            })));
        }
    }, [quiz]);

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
        const newQuestions = [...questions, newQuestion];
        setQuestions(newQuestions);
        setSelectedQuestionIndex(newQuestions.length - 1);
    };

    const removeQuestion = (id: string) => {
        const filtered = questions.filter(q => q.id !== id);
        const reordered = filtered.map((q, idx) => ({ ...q, order: idx + 1 }));
        setQuestions(reordered);
        if (selectedQuestionIndex >= reordered.length) {
            setSelectedQuestionIndex(Math.max(0, reordered.length - 1));
        }
    };

    const updateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("id", quiz?.id || "");
            formData.append("title", title);
            formData.append("description", description);
            formData.append("lessonId", lessonId);
            formData.append("published", String(published));
            formData.append("questions", JSON.stringify(questions.map(({ id, ...rest }) => rest)));

            await onSave(formData);
        } catch (err) {
            console.error(err);
            alert("Failed to save quiz");
        } finally {
            setIsSaving(false);
        }
    };

    const currentQuestion = questions[selectedQuestionIndex];

    return (
        <div className="fixed inset-0 z-[150] bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 animate-in fade-in duration-300">
            {/* Header */}
            <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Advanced Workspace</span>
                        <span className="text-sm font-black tracking-tight">{quiz?.id ? 'Edit Quiz' : 'New Quiz'}: {title || "Untitled Assessment"}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-xs uppercase tracking-[0.1em] rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:scale-95"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Batik Background Pattern (simplified as a CSS background or image) */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none dark:opacity-[0.05] grayscale"
                    style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuCjg0-ssHwsWt3PsTpyDzvmof39k2qkynq1PyYWgARsf67KKd0M7sfDqDLPop7JzD9P5cmRPvdjFnm6Xa6K0yYfi0NchXpefiuNM8vy0nE-vFkUpbC0sDUXtAdcec51c6ny-2FgkLw-hCU53jTYMEVjAy3YEQ3aqoxB5kzLHzpKwYKCa1jzRdCkuO3F7FXNSQCMcopkF6xrXpxsuodePeng7ICpAafJsJN-XyaRWZ8dDEniYYjx9Ueg-yg1jn6orjurd89Hv7UK0eA)', backgroundSize: '400px' }} />

                {/* Left: Question Navigator */}
                <aside className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex flex-col z-10">
                    <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                        <h3 className="font-black text-slate-500 text-[10px] uppercase tracking-[0.2em]">Navigator</h3>
                        <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full">{questions.length} Items</span>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                        {questions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-slate-400 gap-3 opacity-50">
                                <LayoutDashboard className="w-10 h-10" />
                                <p className="text-[10px] font-black uppercase text-center tracking-widest">No Questions Found</p>
                            </div>
                        ) : (
                            questions.map((q, idx) => (
                                <div
                                    key={q.id}
                                    onClick={() => setSelectedQuestionIndex(idx)}
                                    className={`group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${selectedQuestionIndex === idx
                                        ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 shadow-sm'
                                        : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${selectedQuestionIndex === idx ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                        }`}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-bold truncate ${selectedQuestionIndex === idx ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {q.questionText || `Question ${idx + 1}`}
                                        </p>
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                                            {q.questionType.replace(/_/g, " ")}
                                        </p>
                                    </div>
                                    {selectedQuestionIndex === idx && <ChevronRight className="w-4 h-4 text-blue-500" />}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => addQuestion("MULTIPLE_CHOICE")} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-500 text-slate-500 hover:text-blue-600 transition-all flex flex-col items-center gap-1 group">
                                <ListChecks className="w-4 h-4" />
                                <span className="text-[8px] font-black uppercase">Add MCQ</span>
                            </button>
                            <button onClick={() => addQuestion("FILL_IN_THE_BLANK")} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-emerald-500 text-slate-500 hover:text-emerald-600 transition-all flex flex-col items-center gap-1 group">
                                <Type className="w-4 h-4" />
                                <span className="text-[8px] font-black uppercase">Add FIB</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Center: Main Editor Area */}
                <main className="flex-1 flex flex-col overflow-y-auto z-10">
                    <div className="p-8 max-w-4xl mx-auto w-full space-y-8">
                        {currentQuestion ? (
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                                <div className="px-10 py-6 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-[1rem] bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                            {selectedQuestionIndex + 1}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black tracking-tight">Question Item Editor</h2>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type: {currentQuestion.questionType.replace(/_/g, " ")}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => removeQuestion(currentQuestion.id!)}
                                            className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-2xl transition-all"
                                            title="Delete Question"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-10">
                                    <QuestionItemEditor
                                        question={currentQuestion}
                                        onChange={(updates) => updateQuestion(currentQuestion.id!, updates)}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-400 gap-6 grayscale">
                                <div className="w-24 h-24 rounded-[2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                                    <Plus className="w-10 h-10 opacity-20" />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-lg font-black tracking-tight text-slate-300">Ready to expand?</h3>
                                    <p className="text-sm font-bold opacity-50">Select a question or add a new one to start building.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {/* Right: Metadata Sidebar */}
                <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md overflow-y-auto z-10">
                    <div className="p-8 space-y-10">
                        <section>
                            <h3 className="font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-6">Quiz Metadata</h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Quiz Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                        placeholder="e.g. Essential Verbs"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold min-h-[120px] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                        placeholder="Describe the learning goals..."
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="h-px bg-slate-100 dark:bg-slate-800" />

                        <section>
                            <h3 className="font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-6">Configuration</h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Linked Lesson</label>
                                    <select
                                        value={lessonId}
                                        onChange={(e) => setLessonId(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-[10px] font-black uppercase tracking-widest outline-none transition-all"
                                    >
                                        <option value="">Select a lesson</option>
                                        {allLessons.map(l => (
                                            <option key={l.id} value={l.id}>{l.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-[1.5rem] flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Status</p>
                                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Visibility to students</p>
                                    </div>
                                    <div
                                        onClick={() => setPublished(!published)}
                                        className={`w-12 h-6 rounded-full relative transition-all cursor-pointer ${published ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${published ? 'left-7' : 'left-1'}`} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="space-y-3 pt-6">
                            <button className="w-full flex items-center justify-center gap-2 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                <Eye className="w-4 h-4" />
                                <span>Preview Quiz</span>
                            </button>
                            <button className="w-full flex items-center justify-center gap-2 py-4 border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                <Archive className="w-4 h-4" />
                                <span>Archive Quiz</span>
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
