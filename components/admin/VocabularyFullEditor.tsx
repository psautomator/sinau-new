"use client";

import React from 'react';

interface VocabularyFullEditorProps {
    vocab: any;
    onClose: () => void;
    onSave: (formData: FormData) => Promise<void>;
}

export default function VocabularyFullEditor({ vocab, onClose, onSave }: VocabularyFullEditorProps) {
    const isNew = !vocab?.id;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 lg:p-12">
            {/* Backdrop with click-to-close */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
                onClick={onClose}
            />

            <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Batik Overlay Decoration */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none dark:invert batik-pattern"></div>

                {/* Header - Always Visible */}
                <div className="px-12 py-8 border-b border-slate-100 dark:border-slate-800 relative z-20 flex items-center justify-between bg-white dark:bg-slate-900">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {isNew ? 'Create New Entry' : 'Update Dictionary Entry'}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold uppercase text-[10px] tracking-widest">Linguistic Repository Control</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[1.5rem] text-slate-400 transition-all active:scale-90"
                    >
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>
                </div>

                {/* Form Body - Scrollable */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
                    <form
                        id="full-vocab-form"
                        className="px-12 py-10"
                        action={onSave}
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                            {/* Section 1: Core Linguistics */}
                            <div className="space-y-10">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-xl">translate</span>
                                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Core Linguistics</h2>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">Javanese Word</label>
                                        <input
                                            name="word"
                                            required
                                            defaultValue={vocab?.word}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] px-8 py-5 text-2xl font-black text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
                                            placeholder="Ketik kata..."
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Dutch Translation</label>
                                        <input
                                            name="translation"
                                            required
                                            defaultValue={vocab?.translation}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[1.5rem] px-8 py-4 text-xl font-bold text-slate-700 dark:text-slate-200 focus:ring-4 focus:ring-blue-500/10 outline-none"
                                            placeholder="Nederlandse betekenis..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phonetic</label>
                                            <input
                                                name="phonetic"
                                                defaultValue={vocab?.phonetic}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 font-mono text-sm text-slate-500 italic outline-none"
                                                placeholder="/phonetic/"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Formality</label>
                                            <select
                                                name="formality"
                                                defaultValue={vocab?.formality || 'NGOKO'}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 font-black uppercase text-xs tracking-widest outline-none appearance-none"
                                            >
                                                <option value="NGOKO">Ngoko</option>
                                                <option value="KRAMA">Krama</option>
                                                <option value="KRAMA_INGGIL">Krama Inggil</option>
                                                <option value="NEUTRAL">Neutral</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">CEFR Level</label>
                                            <select
                                                name="level"
                                                defaultValue={vocab?.level || 'A1'}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 font-black uppercase text-xs tracking-widest outline-none appearance-none"
                                            >
                                                <option value="A1">A1</option>
                                                <option value="A2">A2</option>
                                                <option value="B1">B1</option>
                                                <option value="C1">C1</option>
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                                            <input
                                                name="category"
                                                defaultValue={vocab?.category}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 font-bold text-sm outline-none"
                                                placeholder="Family, Time, Food..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Audio URL / Asset</label>
                                        <div className="relative group">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-300 group-focus-within:text-blue-500 transition-colors">audio_file</span>
                                            <input
                                                name="audioUrl"
                                                defaultValue={vocab?.audioUrl}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[1.5rem] pl-16 pr-8 py-4 font-mono text-xs text-slate-400 outline-none"
                                                placeholder="/uploads/kata.mp3"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Context & Learning */}
                            <div className="space-y-10">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-xl">psychology</span>
                                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Context & Learning</h2>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">Mnemonic / AI Hint</label>
                                        <input
                                            name="aiHint"
                                            defaultValue={vocab?.aiHint}
                                            className="w-full bg-blue-50/30 dark:bg-blue-900/10 border-none rounded-[1.5rem] px-8 py-5 text-sm font-bold italic text-blue-600 dark:text-blue-400 outline-none"
                                            placeholder="Memory hook..."
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 ml-1">Example Javanese</label>
                                        <div className="bg-emerald-50/30 dark:bg-emerald-900/10 rounded-[1.5rem] border border-emerald-100/30 dark:border-emerald-900/20 p-6">
                                            <textarea
                                                name="exampleJavanese"
                                                defaultValue={vocab?.exampleJavanese}
                                                className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-white font-bold text-lg focus:ring-0 resize-none min-h-[80px]"
                                                placeholder="Ukara Jawa..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 ml-1">Example Dutch</label>
                                        <div className="bg-emerald-50/10 dark:bg-emerald-900/5 rounded-[1.5rem] border border-emerald-100/10 dark:border-emerald-900/10 p-6">
                                            <textarea
                                                name="exampleDutch"
                                                defaultValue={vocab?.exampleDutch}
                                                className="w-full bg-transparent border-none p-0 text-slate-600 dark:text-slate-400 italic text-lg focus:ring-0 resize-none min-h-[60px]"
                                                placeholder="Nederlandse vertaling..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-amber-600 ml-1">Linguistic Notes</label>
                                        <div className="bg-amber-50/30 dark:bg-amber-900/10 rounded-[1.5rem] border border-amber-100/30 dark:border-amber-900/20 p-6">
                                            <textarea
                                                name="notes"
                                                defaultValue={vocab?.notes}
                                                className="w-full bg-transparent border-none p-0 text-slate-700 dark:text-slate-300 text-sm focus:ring-0 resize-none min-h-[100px]"
                                                placeholder="Etymology, cultural context, usage variations..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tags (Comma separated)</label>
                                        <input
                                            name="tags"
                                            defaultValue={vocab?.tags?.join(", ")}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-8 py-4 font-bold text-xs tracking-wider outline-none"
                                            placeholder="family, nature, verbs..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Actions - Always Visible */}
                <div className="px-12 py-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-6 relative z-20 bg-slate-50 dark:bg-slate-800">
                    <button
                        onClick={onClose}
                        className="px-10 py-5 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                        type="button"
                    >
                        Discard Changes
                    </button>
                    <button
                        form="full-vocab-form"
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3"
                    >
                        <span className="material-symbols-outlined text-[20px]">save</span>
                        {isNew ? 'Store Entry' : 'Update Entry'}
                    </button>
                </div>
            </div>
        </div>
    );
}


