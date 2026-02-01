"use client";

import { useState } from "react";
import {
    Wand2, FileText, Layers, Puzzle, ArrowUp, ArrowDown, Edit, Trash2,
    Save, Plus, X, Loader2
} from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import BlockEditorDialog from "./BlockEditorDialog";
import { saveLessonSectionsAction } from "@/app/admin/actions";

interface LessonBlockEditorProps {
    isOpen: boolean;
    onClose: () => void;
    lesson: any;
    allVocabulary: any[];
    allQuizzes: any[];
}

export default function LessonBlockEditor({
    isOpen,
    onClose,
    lesson,
    allVocabulary,
    allQuizzes
}: LessonBlockEditorProps) {
    const [blocks, setBlocks] = useState<any[]>(
        (lesson?.content?.sections || []).sort((a: any, b: any) => a.order - b.order)
    );
    const [editingBlock, setEditingBlock] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleAddBlock = (type: string) => {
        const newOrder = blocks.length > 0 ? Math.max(...blocks.map(b => b.order)) + 1 : 1;
        let newBlock: any = {
            id: uuidv4(),
            type,
            order: newOrder,
            content: {}
        };

        if (type === "MARKDOWN") {
            newBlock.content = { markdownText: "### New Content Section\n\nEnter text here...", title: "Content" };
        } else if (type === "FLASHCARD_SET") {
            newBlock.content = { title: "Vocabulary Practice", wordIds: [] };
        } else if (type === "QUIZ_LINK") {
            newBlock.content = { title: "Start Quiz", quizId: "" };
        }

        setBlocks([...blocks, newBlock]);
        setEditingBlock(newBlock);
    };

    const handleMove = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === blocks.length - 1) return;

        const newBlocks = [...blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];

        // Re-assign order
        const reordered = newBlocks.map((b, i) => ({ ...b, order: i + 1 }));
        setBlocks(reordered);
    };

    const handleSaveBlock = (updatedBlock: any) => {
        setBlocks(blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b));
        setEditingBlock(null);
    };

    const handlePermanentSave = async () => {
        setIsSaving(true);
        const result = await saveLessonSectionsAction(lesson.id, blocks);
        setIsSaving(false);
        if (result.success) {
            onClose();
        } else {
            alert("Error saving sections: " + result.error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[105] flex flex-col bg-slate-50 dark:bg-slate-900 animate-in fade-in duration-300">
            {/* Action Bar */}
            <div className="h-24 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-12 shadow-sm">
                <div className="flex items-center gap-6">
                    <button onClick={onClose} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl transition-all">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                            Content Architecture: <span className="text-blue-600">{lesson?.title}</span>
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Design the sequence of educational blocks</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handlePermanentSave}
                        disabled={isSaving}
                        className="px-10 py-4 bg-blue-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Persist Sequence
                    </button>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 overflow-y-auto px-12 py-12 flex justify-center">
                <div className="w-full max-w-4xl space-y-8">
                    {/* Add Buttons */}
                    <div className="grid grid-cols-3 gap-6">
                        <button
                            onClick={() => handleAddBlock("MARKDOWN")}
                            className="p-8 bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-4 hover:border-blue-500 hover:text-blue-600 transition-all group"
                        >
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                                <FileText className="w-8 h-8 text-blue-600" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">Add Text Block</span>
                        </button>
                        <button
                            onClick={() => handleAddBlock("FLASHCARD_SET")}
                            className="p-8 bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-4 hover:border-emerald-500 hover:text-emerald-600 transition-all group"
                        >
                            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                                <Layers className="w-8 h-8 text-emerald-600" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">Add Vocab Practice</span>
                        </button>
                        <button
                            onClick={() => handleAddBlock("QUIZ_LINK")}
                            className="p-8 bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-4 hover:border-indigo-500 hover:text-indigo-600 transition-all group"
                        >
                            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                                <Puzzle className="w-8 h-8 text-indigo-600" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">Add Quiz Link</span>
                        </button>
                    </div>

                    {/* Block Sequence */}
                    <div className="space-y-4">
                        {blocks.map((block, index) => (
                            <div key={block.id} className="group relative bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                                {/* Order Indicator */}
                                <div className="flex flex-col items-center gap-1 min-w-[3rem]">
                                    <button
                                        onClick={() => handleMove(index, 'up')}
                                        disabled={index === 0}
                                        className="p-1 hover:bg-slate-50 rounded-lg text-slate-300 hover:text-blue-600 disabled:opacity-0 transition-all"
                                    >
                                        <ArrowUp className="w-4 h-4" />
                                    </button>
                                    <span className="text-sm font-black text-slate-400">{index + 1}</span>
                                    <button
                                        onClick={() => handleMove(index, 'down')}
                                        disabled={index === blocks.length - 1}
                                        className="p-1 hover:bg-slate-50 rounded-lg text-slate-300 hover:text-blue-600 disabled:opacity-0 transition-all"
                                    >
                                        <ArrowDown className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Icon Decorator */}
                                <div className={`aspect-square size-14 rounded-2xl flex items-center justify-center ${block.type === 'MARKDOWN' ? 'bg-blue-50 text-blue-600' :
                                        block.type === 'FLASHCARD_SET' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                    {block.type === 'MARKDOWN' ? <FileText className="w-6 h-6" /> :
                                        block.type === 'FLASHCARD_SET' ? <Layers className="w-6 h-6" /> : <Puzzle className="w-6 h-6" />}
                                </div>

                                {/* Content Preview */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{block.type.replace("_", " ")}</p>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                                        {block.content.title || (block.type === 'MARKDOWN' ? 'Content Text' : 'Untitled section')}
                                    </h3>
                                    {block.type === 'MARKDOWN' && (
                                        <p className="text-xs text-slate-500 line-clamp-1 mt-1 opacity-70">
                                            {block.content.markdownText?.replace(/[#*`]/g, '').substring(0, 100)}...
                                        </p>
                                    )}
                                    {block.type === 'FLASHCARD_SET' && (
                                        <p className="text-xs text-slate-500 mt-1 opacity-70">
                                            Contains {block.content.wordIds?.length || 0} vocabulary items
                                        </p>
                                    )}
                                    {block.type === 'QUIZ_LINK' && (
                                        <p className="text-xs text-slate-500 mt-1 opacity-70">
                                            Linked to: {allQuizzes.find(q => q.id === block.content.quizId)?.title || "None selected"}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button
                                        onClick={() => setEditingBlock(block)}
                                        className="p-3 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setBlocks(blocks.filter(b => b.id !== block.id))}
                                        className="p-3 bg-slate-50 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {blocks.length === 0 && (
                            <div className="py-24 text-center">
                                <p className="text-slate-400 font-bold">The canvas is empty. Add your first block above!</p>
                            </div>
                        )}
                    </div>
                </div>
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
