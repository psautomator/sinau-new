"use client";

import { useState, useEffect, useMemo } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Wand2, Loader2, Search, X, Check, Save } from "lucide-react";

interface BlockEditorDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (block: any) => void;
    block: any;
    allVocabulary: any[];
    allQuizzes: any[];
}

export default function BlockEditorDialog({
    isOpen,
    onClose,
    onSave,
    block,
    allVocabulary,
    allQuizzes,
}: BlockEditorDialogProps) {
    const [editedBlock, setEditedBlock] = useState<any>(block);
    const [wordSearch, setWordSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

    useEffect(() => {
        if (block) {
            setEditedBlock(JSON.parse(JSON.stringify(block)));
            setActiveTab("edit");
            setWordSearch("");
        }
    }, [block, isOpen]);

    const handleContentChange = (field: string, value: any) => {
        setEditedBlock((prev: any) => ({
            ...prev,
            content: {
                ...prev.content,
                [field]: value,
            },
        }));
    };

    const handleWordToggle = (wordId: string) => {
        const currentIds = editedBlock.content.wordIds || [];
        const newIds = currentIds.includes(wordId)
            ? currentIds.filter((id: string) => id !== wordId)
            : [...currentIds, wordId];
        handleContentChange("wordIds", newIds);
    };

    const filteredVocabulary = useMemo(() => {
        if (!wordSearch) return allVocabulary;
        const query = wordSearch.toLowerCase();
        return allVocabulary.filter(
            (v) =>
                v.word.toLowerCase().includes(query) ||
                v.translation.toLowerCase().includes(query)
        );
    }, [allVocabulary, wordSearch]);

    if (!isOpen || !editedBlock) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            Edit {editedBlock.type.replace("_", " ")} Block
                        </h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Configure section content</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {/* Common Fields for all block types */}
                    <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Section Title (Optional)</label>
                            <input
                                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold outline-none"
                                value={editedBlock.content.title || ""}
                                onChange={(e) => handleContentChange("title", e.target.value)}
                                placeholder="e.g., Introductie / Dialoog"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Section Text / Details (Markdown)</label>
                            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-fit">
                                <button
                                    onClick={() => setActiveTab("edit")}
                                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'edit' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-400'}`}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => setActiveTab("preview")}
                                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'preview' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-400'}`}
                                >
                                    Preview
                                </button>
                            </div>

                            {activeTab === "edit" ? (
                                <textarea
                                    className="w-full min-h-[200px] p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-medium focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm leading-relaxed"
                                    value={editedBlock.content.markdownText || ""}
                                    onChange={(e) => handleContentChange("markdownText", e.target.value)}
                                    placeholder="Add context or notes here using Markdown..."
                                />
                            ) : (
                                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl min-h-[200px] prose dark:prose-invert max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                        {editedBlock.content.markdownText || "*No content to preview*"}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Specialty Fields */}
                    {editedBlock.type === "FLASHCARD_SET" && (
                        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-700/50">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Search Vocabulary</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-medium outline-none"
                                        value={wordSearch}
                                        onChange={(e) => setWordSearch(e.target.value)}
                                        placeholder="Filter by Javanese or Dutch..."
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {filteredVocabulary.map((v) => (
                                    <button
                                        key={v.id}
                                        onClick={() => handleWordToggle(v.id)}
                                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${editedBlock.content.wordIds?.includes(v.id) ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50' : 'bg-white dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                                    >
                                        <div className="text-left">
                                            <p className="text-sm font-black text-slate-900 dark:text-white">{v.word}</p>
                                            <p className="text-xs text-slate-500 font-medium">{v.translation}</p>
                                        </div>
                                        {editedBlock.content.wordIds?.includes(v.id) ? (
                                            <div className="bg-blue-600 text-white rounded-lg p-1">
                                                <Check className="w-3 h-3" />
                                            </div>
                                        ) : (
                                            <div className="w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-700" />
                                        )}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                                {editedBlock.content.wordIds?.length || 0} Words Selected
                            </p>
                        </div>
                    )}

                    {editedBlock.type === "QUIZ_LINK" && (
                        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-700/50">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Quiz</label>
                                <select
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold outline-none"
                                    value={editedBlock.content.quizId || ""}
                                    onChange={(e) => {
                                        const q = allQuizzes.find(item => item.id === e.target.value);
                                        handleContentChange("quizId", e.target.value);
                                        if (q) handleContentChange("title", q.title);
                                    }}
                                >
                                    <option value="">Select a Quiz...</option>
                                    {allQuizzes.map((q) => (
                                        <option key={q.id} value={q.id}>{q.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-700/50 flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all font-mono"
                    >
                        Discard
                    </button>
                    <button
                        onClick={() => onSave(editedBlock)}
                        className="px-12 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3"
                    >
                        <Save className="w-4 h-4" />
                        Apply Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
