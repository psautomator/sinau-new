"use client";

import { useState, useEffect } from "react";
import {
    Save, X, ChevronRight, FileText, Layers, Puzzle,
    ArrowUp, ArrowDown, Edit, Trash2, Plus,
    LayoutDashboard, Settings, Eye, Archive,
    Clock, CheckCircle, GripVertical, PlayCircle,
    Type, Image as ImageIcon, Video, BookOpen,
    Sparkles, RefreshCw, Layers2
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import BlockEditorDialog from "./BlockEditorDialog";

interface LessonArchitectProps {
    lesson: any;
    allVocabulary: any[];
    allQuizzes: any[];
    allModules: any[];
    onClose: () => void;
    onSave: (formData: FormData) => Promise<void>;
}

export default function LessonArchitect({
    lesson,
    allVocabulary,
    allQuizzes,
    allModules,
    onClose,
    onSave
}: LessonArchitectProps) {
    const [blocks, setBlocks] = useState<any[]>([]);
    const [editingBlock, setEditingBlock] = useState<any | null>(null);
    const [title, setTitle] = useState(lesson?.title || "");
    const [description, setDescription] = useState(lesson?.description || "");
    const [moduleId, setModuleId] = useState(lesson?.moduleId || "");
    const [slug, setSlug] = useState(lesson?.slug || "");
    const [published, setPublished] = useState(lesson?.published || false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (lesson?.content?.sections) {
            setBlocks((lesson.content.sections || []).sort((a: any, b: any) => a.order - b.order));
        }
    }, [lesson]);

    useEffect(() => {
        if (!slug && title && !lesson?.id) {
            setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
        }
    }, [title, slug, lesson]);

    const addBlock = (type: string) => {
        const newOrder = blocks.length > 0 ? Math.max(...blocks.map(b => b.order)) + 1 : 1;
        let newBlock: any = {
            id: uuidv4(),
            type,
            order: newOrder,
            content: { title: type.replace("_", " ") }
        };

        if (type === "MARKDOWN") {
            newBlock.content = { ...newBlock.content, markdownText: "### New Content Section\n\nEnter text here..." };
        } else if (type === "FLASHCARD_SET") {
            newBlock.content = { ...newBlock.content, wordIds: [] };
        } else if (type === "QUIZ_LINK") {
            newBlock.content = { ...newBlock.content, quizId: "" };
        } else if (type === "EMBEDDED_MEDIA") {
            newBlock.content = { ...newBlock.content, mediaUrl: "", mediaType: "YOUTUBE" };
        }

        const newBlocks = [...blocks, newBlock];
        setBlocks(newBlocks);
        setEditingBlock(newBlock);
    };

    const removeBlock = (id: string) => {
        const filtered = blocks.filter(b => b.id !== id);
        const reordered = filtered.map((b, idx) => ({ ...b, order: idx + 1 }));
        setBlocks(reordered);
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === blocks.length - 1) return;

        const newBlocks = [...blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];

        const reordered = newBlocks.map((b, i) => ({ ...b, order: i + 1 }));
        setBlocks(reordered);
    };

    const handleSaveBlock = (updatedBlock: any) => {
        setBlocks(blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b));
        setEditingBlock(null);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("id", lesson?.id || "");
            formData.append("title", title);
            formData.append("slug", slug);
            formData.append("description", description);
            formData.append("moduleId", moduleId);
            formData.append("published", published ? "on" : "off");
            formData.append("content", JSON.stringify({ sections: blocks }));

            await onSave(formData);
        } catch (err) {
            console.error(err);
            alert("Failed to save lesson");
        } finally {
            setIsSaving(false);
        }
    };

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
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Content Architect</span>
                        <span className="text-sm font-black tracking-tight">{lesson?.id ? 'Editing Lesson' : 'New Architecture'}: {title || "Untitled Blueprint"}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black text-xs uppercase tracking-[0.1em] rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 active:scale-95"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        <span>{isSaving ? 'Persisting...' : 'Save Blueprint'}</span>
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Batik Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none dark:opacity-[0.05] grayscale"
                    style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuCjg0-ssHwsWt3PsTpyDzvmof39k2qkynq1PyYWgARsf67KKd0M7sfDqDLPop7JzD9P5cmRPvdjFnm6Xa6K0yYfi0NchXpefiuNM8vy0nE-vFkUpbC0sDUXtAdcec51c6ny-2FgkLw-hCU53jTYMEVjAy3YEQ3aqoxB5kzLHzpKwYKCa1jzRdCkuO3F7FXNSQCMcopkF6xrXpxsuodePeng7ICpAafJsJN-XyaRWZ8dDEniYYjx9Ueg-yg1jn6orjurd89Hv7UK0eA)', backgroundSize: '400px' }} />

                {/* Left: Block Palette */}
                <aside className="w-72 border-r border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex flex-col z-10">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-1">Block Palette</h3>
                        <p className="text-[9px] text-slate-400 font-bold italic">Drag and drop or click to add</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-8">
                        {/* Text Category */}
                        <section className="space-y-3">
                            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-2">Text Content</h4>
                            <div className="grid gap-2">
                                <button onClick={() => addBlock("MARKDOWN")} className="group flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-900 transition-all text-left">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-110">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black">Markdown Block</p>
                                        <p className="text-[9px] text-slate-400 font-bold">Text, tables, formatting</p>
                                    </div>
                                    <Plus className="w-3 h-3 text-slate-300 group-hover:text-indigo-500" />
                                </button>
                            </div>
                        </section>

                        {/* Media Category */}
                        <section className="space-y-3">
                            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-2">Multimedia</h4>
                            <div className="grid gap-2">
                                <button onClick={() => addBlock("EMBEDDED_MEDIA")} className="group flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-rose-500/50 hover:bg-white dark:hover:bg-slate-900 transition-all text-left">
                                    <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 transition-transform group-hover:scale-110">
                                        <Video className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black">Media Element</p>
                                        <p className="text-[9px] text-slate-400 font-bold">Video, YouTube, Images</p>
                                    </div>
                                    <Plus className="w-3 h-3 text-slate-300 group-hover:text-rose-500" />
                                </button>
                            </div>
                        </section>

                        {/* Assessments Category */}
                        <section className="space-y-3">
                            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-2">Assessments</h4>
                            <div className="grid gap-2">
                                <button onClick={() => addBlock("FLASHCARD_SET")} className="group flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-white dark:hover:bg-slate-900 transition-all text-left">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 transition-transform group-hover:scale-110">
                                        <Layers className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black">Vocab Drill</p>
                                        <p className="text-[9px] text-slate-400 font-bold">Interactive flashcards</p>
                                    </div>
                                    <Plus className="w-3 h-3 text-slate-300 group-hover:text-emerald-500" />
                                </button>
                                <button onClick={() => addBlock("QUIZ_LINK")} className="group flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-blue-500/50 hover:bg-white dark:hover:bg-slate-900 transition-all text-left">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                                        <Puzzle className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black">Knowledge Quiz</p>
                                        <p className="text-[9px] text-slate-400 font-bold">Linked assessment</p>
                                    </div>
                                    <Plus className="w-3 h-3 text-slate-300 group-hover:text-blue-500" />
                                </button>
                            </div>
                        </section>
                    </div>

                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                        <button className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:border-indigo-500 transition-all">
                            <Sparkles className="w-3 h-3" />
                            AI Assist Designer
                        </button>
                    </div>
                </aside>

                {/* Center: Lesson Canvas */}
                <main className="flex-1 flex flex-col overflow-y-auto z-10 scrollbar-hide">
                    <div className="p-12 max-w-4xl mx-auto w-full space-y-8">
                        <div className="flex items-center justify-between px-4">
                            <div>
                                <h1 className="text-4xl font-black tracking-tight mb-2">Lesson Canvas</h1>
                                <p className="text-sm font-bold text-slate-400">Order and sequence your educational modules</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{blocks.length} Blocks</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Active Sequence</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {blocks.map((block, index) => (
                                    <motion.div
                                        key={block.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="group relative flex items-center gap-6 p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-indigo-500/50 transition-all"
                                    >
                                        {/* Drag/Order Indicator */}
                                        <div className="flex flex-col items-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => moveBlock(index, 'up')}
                                                disabled={index === 0}
                                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 disabled:opacity-0"
                                            >
                                                <ChevronRight className="w-4 h-4 -rotate-90" />
                                            </button>
                                            <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-xs font-black border border-slate-100 dark:border-slate-800">
                                                {index + 1}
                                            </div>
                                            <button
                                                onClick={() => moveBlock(index, 'down')}
                                                disabled={index === blocks.length - 1}
                                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 disabled:opacity-0"
                                            >
                                                <ChevronRight className="w-4 h-4 rotate-90" />
                                            </button>
                                        </div>

                                        {/* Block Icon */}
                                        <div className={`aspect-square size-16 rounded-3xl flex items-center justify-center shadow-lg ${block.type === 'MARKDOWN' ? 'bg-indigo-600 text-white shadow-indigo-500/20' :
                                            block.type === 'FLASHCARD_SET' ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                                                block.type === 'EMBEDDED_MEDIA' ? 'bg-rose-500 text-white shadow-rose-500/20' :
                                                    'bg-blue-600 text-white shadow-blue-500/20'
                                            }`}>
                                            {block.type === 'MARKDOWN' ? <FileText className="w-7 h-7" /> :
                                                block.type === 'FLASHCARD_SET' ? <Layers className="w-7 h-7" /> :
                                                    block.type === 'EMBEDDED_MEDIA' ? <Video className="w-7 h-7" /> :
                                                        <Puzzle className="w-7 h-7" />}
                                        </div>

                                        {/* Content Preview */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${block.type === 'MARKDOWN' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800' :
                                                    block.type === 'FLASHCARD_SET' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800' :
                                                        block.type === 'EMBEDDED_MEDIA' ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800' :
                                                            'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800'
                                                    }`}>
                                                    {block.type.replace("_", " ")}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white truncate tracking-tight">
                                                {block.content.title || 'Untitled Blueprint Section'}
                                            </h3>
                                            <p className="text-xs text-slate-400 font-bold line-clamp-1 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                {block.type === 'MARKDOWN' ? block.content.markdownText?.replace(/[#*`]/g, '').substring(0, 100) :
                                                    block.type === 'FLASHCARD_SET' ? `${block.content.wordIds?.length || 0} active vocabulary entities` :
                                                        block.type === 'EMBEDDED_MEDIA' ? `${block.content.mediaType || 'Media'} from ${block.content.mediaUrl || 'Unconfigured source'}` :
                                                            `Linked to Quiz: ${allQuizzes.find(q => q.id === block.content.quizId)?.title || 'None'}`}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3 pr-4">
                                            <button
                                                onClick={() => setEditingBlock(block)}
                                                className="p-4 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all shadow-sm border border-slate-100 dark:border-slate-800"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => removeBlock(block.id)}
                                                className="p-4 bg-slate-50 dark:bg-slate-950 hover:bg-rose-600 hover:text-white rounded-2xl transition-all shadow-sm border border-slate-100 dark:border-slate-800"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {blocks.length === 0 && (
                                <div className="flex flex-col items-center justify-center p-20 border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] text-slate-300 gap-6 grayscale">
                                    <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                                        <Layers2 className="w-12 h-12 opacity-20" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl font-black tracking-tight">Empty Architecture</h3>
                                        <p className="text-sm font-bold opacity-50">Drag blocks from the palette to start building your lesson.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* Right: Lesson Metadata */}
                <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md overflow-y-auto z-10">
                    <div className="p-8 space-y-10">
                        <section>
                            <h3 className="font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-6">Blueprint Info</h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Lesson Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                        placeholder="e.g. Basic Ngoko Greetings"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">URL Slug</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 pl-14 text-xs font-mono focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                            placeholder="lesson-slug"
                                        />
                                        <BookOpen className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="h-px bg-slate-100 dark:bg-slate-800" />

                        <section>
                            <h3 className="font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-6">Course Linkage</h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Module</label>
                                    <select
                                        value={moduleId}
                                        onChange={(e) => setModuleId(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-[10px] font-black uppercase tracking-widest outline-none transition-all"
                                    >
                                        <option value="">Detached Lesson</option>
                                        {allModules.map(m => (
                                            <option key={m.id} value={m.id}>{m.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-[1.5rem] flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">Status</p>
                                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">{published ? 'Visible to Learners' : 'Internal Blueprint'}</p>
                                    </div>
                                    <div
                                        onClick={() => setPublished(!published)}
                                        className={`w-12 h-6 rounded-full relative transition-all cursor-pointer ${published ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${published ? 'left-7' : 'left-1'}`} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="space-y-3 pt-6">
                            <button className="w-full flex items-center justify-center gap-2 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                <Eye className="w-4 h-4" />
                                <span>Preview Lesson</span>
                            </button>
                            <button className="w-full flex items-center justify-center gap-2 py-4 border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                <Archive className="w-4 h-4" />
                                <span>Archive Lesson</span>
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

            {editingBlock && (
                <BlockEditorDialog
                    isOpen={!!editingBlock}
                    onClose={() => setEditingBlock(null)}
                    onSave={handleSaveBlock}
                    block={editingBlock}
                    allVocabulary={allVocabulary}
                    allQuizzes={allQuizzes}
                />
            )}
        </div>
    );
}
