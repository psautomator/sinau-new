"use client";

import React from 'react';

interface AITutorScenarioEditorProps {
    scenario: any;
    allModules: any[];
    onClose: () => void;
    onSave: (formData: FormData) => Promise<void>;
}

export default function AITutorScenarioEditor({ scenario, allModules, onClose, onSave }: AITutorScenarioEditorProps) {
    const isNew = !scenario?.id;

    return (
        <div className="fixed inset-0 z-[300] flex justify-end">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl h-full border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-500 ease-in-out">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-20">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {isNew ? 'New Scenario' : 'Edit Scenario'}
                        </h2>
                        <p className="text-slate-400 mt-1 font-bold uppercase text-[10px] tracking-widest">AI Tutor Context Management</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-all active:scale-90"
                    >
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    <form
                        id="scenario-editor-form"
                        className="p-8 space-y-10"
                        action={onSave}
                    >
                        {scenario?.id && <input type="hidden" name="id" value={scenario.id} />}

                        {/* Visibility Status */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">visibility</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">Visibility Status</p>
                                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-black tracking-widest">Control if this is live for students</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="published"
                                    value="true"
                                    defaultChecked={scenario?.published !== false}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-blue-600 rounded-full"></div>
                                <span className="ml-3 text-[10px] font-black uppercase text-slate-400 peer-checked:text-blue-600">
                                    {scenario?.published !== false ? 'Published' : 'Draft'}
                                </span>
                            </label>
                        </div>

                        {/* Basic Information Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-sm">info</span>
                                </div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Basic Information</h4>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Title</label>
                                    <input
                                        name="title"
                                        required
                                        defaultValue={scenario?.title}
                                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-lg font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                        placeholder="e.g. At the Doctor"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Slug</label>
                                    <input
                                        name="slug"
                                        required
                                        defaultValue={scenario?.slug}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 font-mono text-sm outline-none focus:border-blue-500/30"
                                        placeholder="e.g. doctor-visit"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                                        <select
                                            name="category"
                                            defaultValue={scenario?.category || 'Daily Life'}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 font-bold text-sm outline-none appearance-none"
                                        >
                                            <option value="Recommended">Recommended</option>
                                            <option value="Daily Life">Daily Life</option>
                                            <option value="Professional">Professional</option>
                                            <option value="Cultural">Cultural</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Icon (Material Name)</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">{scenario?.icon || 'chat'}</span>
                                            <input
                                                name="icon"
                                                defaultValue={scenario?.icon || 'chat'}
                                                className="w-full pl-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 font-bold text-sm outline-none"
                                                placeholder="e.g. medical_services"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Associated Module</label>
                                    <select
                                        name="moduleId"
                                        defaultValue={scenario?.moduleId || ''}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none appearance-none"
                                    >
                                        <option value="">None / General</option>
                                        {allModules.map(m => (
                                            <option key={m.id} value={m.id}>{m.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
                                    <textarea
                                        name="description"
                                        defaultValue={scenario?.description}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm outline-none min-h-[100px] resize-none"
                                        placeholder="Briefly describe the scenario..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* AI Content Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-sm">smart_toy</span>
                                </div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">AI Content</h4>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 ml-1">Initial AI Message</label>
                                    <textarea
                                        name="initialMessage"
                                        required
                                        defaultValue={scenario?.initialMessage}
                                        className="w-full bg-emerald-50/5 dark:bg-emerald-900/5 border-2 border-dashed border-emerald-100 dark:border-emerald-800/50 rounded-2xl px-5 py-4 text-sm font-bold outline-none min-h-[140px] focus:border-emerald-500/30 transition-all"
                                        placeholder="Greeting message sent to student..."
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1 px-1 leading-relaxed italic">This is the first message the AI Tutor will send when a user enters the scenario.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Initial Suggestions (Comma separated)</label>
                                    <textarea
                                        name="initialSuggestions"
                                        defaultValue={scenario?.initialSuggestions?.join(', ')}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none min-h-[100px] resize-none"
                                        placeholder="Option 1, Option 2, etc."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Display Order</label>
                                    <input
                                        name="order"
                                        type="number"
                                        defaultValue={scenario?.order || 0}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 font-bold text-sm outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="h-20" /> {/* Spacer */}
                    </form>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4 sticky bottom-0 z-20 backdrop-blur-xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                        type="button"
                    >
                        Cancel
                    </button>
                    <button
                        form="scenario-editor-form"
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3"
                    >
                        <span className="material-symbols-outlined text-[20px]">save</span>
                        {isNew ? 'Create Scenario' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
