"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2, ArrowLeft, Info, Book, BookOpen, Languages, GraduationCap } from "lucide-react";
import {
    bulkImportModulesAction,
    bulkImportLessonsAction,
    bulkImportVocabularyAction,
    bulkImportQuizzesAction
} from "../import-actions";

export default function BulkImportClient({ modules }: { modules: any[] }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"modules" | "lessons" | "vocabulary" | "quizzes">("modules");
    const [jsonInput, setJsonInput] = useState("");
    const [targetModuleId, setTargetModuleId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus(null);

        try {
            let result;
            if (activeTab === "modules") result = await bulkImportModulesAction(jsonInput);
            else if (activeTab === "lessons") result = await bulkImportLessonsAction(targetModuleId, jsonInput);
            else if (activeTab === "vocabulary") result = await bulkImportVocabularyAction(jsonInput);
            else result = await bulkImportQuizzesAction(jsonInput);

            if (result.success) {
                setStatus({ type: "success", message: (result as any).message });
                setJsonInput("");
            } else {
                setStatus({ type: "error", message: (result as any).error || "Unknown error" });
            }
        } catch (err: any) {
            setStatus({ type: "error", message: "Client error: " + err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.push("/admin")}
                        className="p-4 bg-white dark:bg-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm border border-slate-200 dark:border-slate-700"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                            Bulk Importer <span className="text-blue-600">v2.0</span>
                        </h1>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-1">Mass ingestion for curriculum content</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-4 p-2 bg-slate-200/50 dark:bg-slate-800/50 rounded-3xl w-fit mb-8">
                <button
                    onClick={() => { setActiveTab("modules"); setStatus(null); }}
                    className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "modules" ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Book className="w-4 h-4" />
                    Modules
                </button>
                <button
                    onClick={() => { setActiveTab("lessons"); setStatus(null); }}
                    className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "lessons" ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <BookOpen className="w-4 h-4" />
                    Lessons
                </button>
                <button
                    onClick={() => { setActiveTab("vocabulary"); setStatus(null); }}
                    className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "vocabulary" ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Languages className="w-4 h-4" />
                    Vocabulary
                </button>
                <button
                    onClick={() => { setActiveTab("quizzes"); setStatus(null); }}
                    className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "quizzes" ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <GraduationCap className="w-4 h-4" />
                    Quizzes
                </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-[2.5rem] p-8 mb-8 flex gap-6 items-start">
                <div className="bg-blue-600 p-3 rounded-2xl text-white">
                    <Info className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Import Guidelines</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl font-medium">
                        Paste a valid JSON array of {activeTab}. The system will automatically **Update** existing items based on {
                            activeTab === "modules" ? "Title" :
                                activeTab === "lessons" ? "Slug" :
                                    activeTab === "vocabulary" ? "Word + Translation" : "Lesson Matching"
                        } and **Create** new entries if they don't exist.
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
                {activeTab === "lessons" && (
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 shadow-sm border border-slate-200 dark:border-slate-700">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Target Destination Module</label>
                        <select
                            required
                            value={targetModuleId}
                            onChange={(e) => setTargetModuleId(e.target.value)}
                            className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                        >
                            <option value="">Select a Module...</option>
                            {modules.map(m => (
                                <option key={m.id} value={m.id}>{m.title}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 shadow-sm border border-slate-200 dark:border-slate-700">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">RAW JSON Payload</label>
                    <textarea
                        required
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder={activeTab === "modules" ? '[{"title": "Intro", "level": "A1", "order": 1}, ...]' : '[{"title": "Lesson 1", "slug": "lesson-1", "sections": [...]}, ...]'}
                        className="w-full min-h-[400px] px-8 py-8 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-[2rem] font-mono text-xs leading-relaxed outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                </div>

                {status && (
                    <div className={`p-8 rounded-[2rem] border animate-in slide-in-from-bottom-4 duration-300 ${status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                        <p className="text-sm font-black uppercase tracking-widest mb-1">{status.type === 'success' ? 'Ingestion Successful' : 'Ingestion Failed'}</p>
                        <p className="text-sm font-medium">{status.message}</p>
                    </div>
                )}

                <button
                    disabled={isSubmitting || !jsonInput || (activeTab === "lessons" && !targetModuleId)}
                    className="w-full py-8 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-blue-500/30 hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:translate-y-0"
                >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileUp className="w-6 h-6" />}
                    Ignite Import Sequence
                </button>
            </form>
        </div>
    );
}
