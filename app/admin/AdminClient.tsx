"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    deleteModuleAction,
    toggleModulePublishAction,
    deleteVocabularyAction,
    addModuleAction,
    updateModuleAction,
    addVocabularyAction,
    updateVocabularyAction,
    bulkMatchAudioAction
} from "@/app/actions/admin";
import { saveLessonAction, deleteLessonAction, saveQuizAction, deleteQuizAction, deleteUserAction, toggleLessonPublishAction } from "./actions";
import LessonBlockEditor from "@/components/admin/LessonBlockEditor";
import QuizQuestionEditor from "@/components/admin/QuizQuestionEditor";

interface AdminClientProps {
    initialModules: any[];
    initialVocabulary: any[];
    initialQuizzes: any[];
    initialLessons: any[];
    initialStats: any;
    currentPage: number;
    totalModulesCount: number;
    totalVocabularyCount: number;
    totalQuizzesCount: number;
    totalLessonsCount: number;
    pageSize: number;
    allModules: any[];
    allQuizzes: any[];
    allLessons: any[];
    allVocabulary: any[];
    initialUsers: any[];
    totalUsersCount: number;
}

export default function AdminClient({
    initialModules,
    initialVocabulary,
    initialQuizzes,
    initialLessons,
    initialStats,
    currentPage,
    totalModulesCount,
    totalVocabularyCount,
    totalQuizzesCount,
    totalLessonsCount,
    pageSize,
    allModules,
    allQuizzes,
    allLessons,
    allVocabulary,
    initialUsers,
    totalUsersCount
}: AdminClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Tab & Filter States
    const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "modules");
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const [levelFilter, setLevelFilter] = useState(searchParams.get("level") || "");
    const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "");
    const [formalityFilter, setFormalityFilter] = useState(searchParams.get("formality") || "");
    const [audioStatusFilter, setAudioStatusFilter] = useState(searchParams.get("audioStatus") || "");
    const [quizStatusFilter, setQuizStatusFilter] = useState(searchParams.get("quizStatus") || "all");
    const [quizModuleFilter, setQuizModuleFilter] = useState(searchParams.get("quizModuleId") || "");
    const [quizPublishedFilter, setQuizPublishedFilter] = useState(searchParams.get("quizPublished") || "");
    const [quizSortBy, setQuizSortBy] = useState(searchParams.get("quizSortBy") || "createdAt");
    const [quizSortOrder, setQuizSortOrder] = useState(searchParams.get("quizSortOrder") || "desc");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Modal States
    const [selectedVocab, setSelectedVocab] = useState<any>(null);
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<any>(null);
    const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
    const [editingVocab, setEditingVocab] = useState<any>(null);
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState<any>(null);

    const [isBlockEditorOpen, setIsBlockEditorOpen] = useState(false);
    const [blockEditingLesson, setBlockEditingLesson] = useState<any>(null);

    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<any>(null);
    const [isMatching, setIsMatching] = useState(false);

    const playAudio = (url: string) => {
        const audio = new Audio(url);
        audio.play().catch((err) => console.error("Playback failed:", err));
    };

    const totalCount = activeTab === 'modules' ? totalModulesCount : (activeTab === 'vocabulary' ? totalVocabularyCount : (activeTab === 'quizzes' ? totalQuizzesCount : (activeTab === 'users' ? totalUsersCount : totalLessonsCount)));
    const totalPages = Math.ceil(totalCount / pageSize);

    // Filter Logic
    const updateFilters = (updates: any) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.keys(updates).forEach(key => {
            if (updates[key]) params.set(key, updates[key]);
            else params.delete(key);
        });
        if (!updates.page) params.set("page", "1");
        router.push(`/admin?${params.toString()}`);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters({ search: searchQuery });
    };

    const handlePageChange = (newPage: number) => {
        updateFilters({ page: newPage.toString() });
    };

    // Action Handlers
    const handleDeleteModule = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const result = await deleteModuleAction(id);
        if (!result.success) alert(result.error);
    };

    const handleToggleModulePublish = async (id: string) => {
        // Find the module to get its current published status
        const module = initialModules.find(m => m.id === id);
        if (!module) return;
        const result = await toggleModulePublishAction(id, !module.published);
        if (!result.success) alert(result.error);
    };

    const handleDeleteVocabulary = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const result = await deleteVocabularyAction(id);
        if (!result.success) alert(result.error);
    };

    const handleDeleteLesson = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const result = await deleteLessonAction(id);
        if (!result.success) alert((result as any).error || "Failed to delete lesson");
    };

    const handleToggleLessonPublish = async (id: string) => {
        const lesson = initialLessons.find(l => l.id === id);
        if (!lesson) return;
        const result = await toggleLessonPublishAction(id, !lesson.published);
        if (!result.success) alert(result.error);
    };

    const handleDeleteQuiz = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const result = await deleteQuizAction(id);
        if (!result.success) alert((result as any).error || "Failed to delete quiz");
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const result = await deleteUserAction(id);
        if (!result.success) alert((result as any).error || "Failed to delete user");
    };

    const handleBulkMatchAudio = async () => {
        if (!confirm("This will attempt to match vocabulary words with audio files in public/audio/uploads based on their names. Continue?")) return;

        setIsMatching(true);
        try {
            const result = await bulkMatchAudioAction();
            if (result.success) {
                alert(`Matching complete!\n- Matches found: ${result.matches}\n- Files analyzed: ${result.totalFiles}\n- Vocabulary items checked: ${result.totalVocab}`);
            } else {
                alert(result.error || "Failed to match audio files");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred during matching.");
        } finally {
            setIsMatching(false);
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-sans">

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 transition-all animate-in fade-in duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed md:static inset-y-0 left-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-full w-72 flex-shrink-0 z-[40] transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
                <div className="flex flex-col h-full p-6">
                    <div className="mb-10 px-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <span className="material-symbols-outlined text-2xl">auto_stories</span>
                            </div>
                            <div>
                                <h1 className="text-slate-900 dark:text-white text-xl font-black tracking-tight leading-tight">AyoSinau</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">Control Panel</p>
                            </div>
                        </div>
                        {/* mobile close */}
                        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <nav className="flex-1 flex flex-col gap-2">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
                            { id: 'modules', label: 'Modules', icon: 'book' },
                            { id: 'lessons', label: 'Lessons', icon: 'menu_book' },
                            { id: 'vocabulary', label: 'Vocabulary', icon: 'list' },
                            { id: 'quizzes', label: 'Quizzes', icon: 'quiz' },
                            { id: 'users', label: 'Users', icon: 'group' },
                            { id: 'queue', label: 'Queue', icon: 'reorder' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setIsSidebarOpen(false);
                                    const params = new URLSearchParams(searchParams.toString());
                                    params.set("tab", item.id);
                                    params.set("page", "1");
                                    router.push(`/admin?${params.toString()}`);
                                }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <span className={`material-symbols-outlined ${activeTab === item.id ? 'fill-1' : ''}`}>{item.icon}</span>
                                <span className="text-sm font-bold">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-700">
                        <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
                            <span className="material-symbols-outlined text-[20px]">logout</span>
                            <span className="text-sm font-bold">Exit Admin</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Section */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <header className="px-8 pt-8 pb-4 flex flex-col gap-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 z-10">
                    <div className="flex justify-between items-end flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="md:hidden p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300"
                            >
                                <span className="material-symbols-outlined">menu</span>
                            </button>
                            <div>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                    <span>Administration</span>
                                    <span className="text-slate-300">/</span>
                                    <span className="text-blue-600">{activeTab}</span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter capitalize">{activeTab}</h1>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Link
                                href="/admin/bulk-import"
                                className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3.5 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-3 transition-all hover:bg-slate-100 dark:hover:bg-slate-700 hover:-translate-y-0.5 active:scale-95"
                            >
                                <span className="material-symbols-outlined text-emerald-600 text-[20px]">upload_file</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Bulk Import</span>
                            </Link>
                            <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center min-w-[100px]">
                                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Total Items</span>
                                <span className="text-xl font-black">{totalCount}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto px-8 py-8 bg-slate-50/50 dark:bg-slate-950/20 scroll-smooth">
                    <div className="flex flex-col gap-8 max-w-[1400px] mx-auto pb-20">

                        {/* Toolbar */}
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700 flex flex-col gap-6">
                            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                                <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-3 w-full max-w-2xl">
                                    <div className="relative flex-1">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                            <span className="material-symbols-outlined text-[20px]">search</span>
                                        </span>
                                        <input
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                            placeholder={`Search by title or translation...`}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-colors">Search</button>
                                </form>
                                <button
                                    onClick={() => {
                                        if (activeTab === 'modules') { setEditingModule(null); setIsModuleModalOpen(true); }
                                        else if (activeTab === 'lessons') { setEditingLesson(null); setIsLessonModalOpen(true); }
                                        else if (activeTab === 'quizzes') { setEditingQuiz(null); setIsQuizModalOpen(true); }
                                        else { setEditingVocab(null); setIsVocabModalOpen(true); }
                                    }}
                                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1 active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                                    <span>Add New</span>
                                </button>

                                {activeTab === 'vocabulary' && (
                                    <button
                                        onClick={handleBulkMatchAudio}
                                        disabled={isMatching}
                                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">{isMatching ? 'sync' : 'auto_fix_high'}</span>
                                        <span>{isMatching ? 'Matching...' : 'Auto-match Audio'}</span>
                                    </button>
                                )}
                            </div>

                            {/* Dropdown Filters */}
                            <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                {activeTab === 'modules' && (
                                    <select
                                        className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500"
                                        value={levelFilter}
                                        onChange={(e) => { setLevelFilter(e.target.value); updateFilters({ level: e.target.value }); }}
                                    >
                                        <option value="">All Levels</option>
                                        <option value="A1">Level A1</option>
                                        <option value="A2">Level A2</option>
                                        <option value="B1">Level B1</option>
                                    </select>
                                )}
                                {activeTab === 'vocabulary' && (
                                    <>
                                        <select
                                            className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500"
                                            value={categoryFilter}
                                            onChange={(e) => { setCategoryFilter(e.target.value); updateFilters({ category: e.target.value }); }}
                                        >
                                            <option value="">All Categories</option>
                                            <option value="Begroeting">Begroeting</option>
                                            <option value="Familie">Familie</option>
                                            <option value="Dagelijks Leven">Dagelijks Leven</option>
                                            <option value="Uitspraak">Uitspraak</option>
                                            <option value="Eten">Eten</option>
                                            <option value="Drinken">Drinken</option>
                                            <option value="School">School</option>
                                            <option value="Lichaamsdelen">Lichaamsdelen</option>
                                            <option value="Dieren">Dieren</option>
                                            <option value="Tijd">Tijd</option>
                                        </select>
                                        <select
                                            className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500"
                                            value={formalityFilter}
                                            onChange={(e) => { setFormalityFilter(e.target.value); updateFilters({ formality: e.target.value }); }}
                                        >
                                            <option value="">All Formality</option>
                                            <option value="NEUTRAL">Neutral</option>
                                            <option value="NGOKO">Ngoko</option>
                                            <option value="KRAMA">Krama</option>
                                            <option value="KRAMA_INGGIL">Krama Inggil</option>
                                        </select>
                                        <select
                                            className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500"
                                            value={audioStatusFilter}
                                            onChange={(e) => { setAudioStatusFilter(e.target.value); updateFilters({ audioStatus: e.target.value }); }}
                                        >
                                            <option value="">All Media</option>
                                            <option value="hasAudio">With Audio</option>
                                            <option value="noAudio">Without Audio</option>
                                        </select>
                                        <select
                                            className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500"
                                            value={levelFilter}
                                            onChange={(e) => { setLevelFilter(e.target.value); updateFilters({ level: e.target.value }); }}
                                        >
                                            <option value="">All Levels</option>
                                            <option value="A1">A1</option>
                                            <option value="A2">A2</option>
                                            <option value="B1">B1</option>
                                            <option value="C1">C1</option>
                                        </select>
                                    </>
                                )}
                                {activeTab === 'lessons' && (
                                    <>
                                        <select
                                            className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500"
                                            onChange={(e) => updateFilters({ moduleId: e.target.value })}
                                        >
                                            <option value="">All Modules</option>
                                            {initialModules.map(m => (
                                                <option key={m.id} value={m.id}>{m.title}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500"
                                            onChange={(e) => updateFilters({ lessonLevel: e.target.value })}
                                        >
                                            <option value="">All Levels</option>
                                            <option value="A1">A1</option>
                                            <option value="A2">A2</option>
                                            <option value="B1">B1</option>
                                            <option value="B2">B2</option>
                                        </select>
                                        <select
                                            className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500"
                                            onChange={(e) => updateFilters({ lessonStyle: e.target.value })}
                                        >
                                            <option value="">All Styles</option>
                                            <option value="Ngoko">Ngoko</option>
                                            <option value="Krama">Krama</option>
                                            <option value="Krama Inggil">Krama Inggil</option>
                                        </select>
                                    </>
                                )}
                                {activeTab === 'quizzes' && (
                                    <>
                                        <select
                                            className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500"
                                            value={quizModuleFilter}
                                            onChange={(e) => { setQuizModuleFilter(e.target.value); updateFilters({ quizModuleId: e.target.value }); }}
                                        >
                                            <option value="">All Modules</option>
                                            {allModules.map(m => (
                                                <option key={m.id} value={m.id}>{m.title}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500"
                                            value={quizPublishedFilter}
                                            onChange={(e) => { setQuizPublishedFilter(e.target.value); updateFilters({ quizPublished: e.target.value }); }}
                                        >
                                            <option value="">All Visibility</option>
                                            <option value="true">Published</option>
                                            <option value="false">Draft</option>
                                        </select>
                                        <select
                                            className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500"
                                            value={quizStatusFilter}
                                            onChange={(e) => { setQuizStatusFilter(e.target.value); updateFilters({ quizStatus: e.target.value }); }}
                                        >
                                            <option value="all">Any Health</option>
                                            <option value="complete">Healthy Only</option>
                                            <option value="incomplete">Has Issues</option>
                                        </select>
                                        <select
                                            className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500"
                                            value={`${quizSortBy}-${quizSortOrder}`}
                                            onChange={(e) => {
                                                const [by, order] = e.target.value.split('-');
                                                setQuizSortBy(by);
                                                setQuizSortOrder(order as any);
                                                updateFilters({ quizSortBy: by, quizSortOrder: order });
                                            }}
                                        >
                                            <option value="createdAt-desc">Newest First</option>
                                            <option value="createdAt-asc">Oldest First</option>
                                            <option value="title-asc">Title (A-Z)</option>
                                            <option value="title-desc">Title (Z-A)</option>
                                        </select>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Data Display */}
                        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-200/50 dark:border-slate-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-separate border-spacing-0">
                                    <thead>
                                        <tr className="bg-slate-50/50 dark:bg-slate-800/80 text-[10px] uppercase font-black tracking-[0.15em] text-slate-400">
                                            {activeTab === 'dashboard' ? (
                                                <>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Statistic</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Value</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                                </>
                                            ) : activeTab === 'modules' ? (
                                                <>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Module Name</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Proficiency</th>
                                                    <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Lessons</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                                                </>
                                            ) : activeTab === 'lessons' ? (
                                                <>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Lesson Title</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Module</th>
                                                    <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Order</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                                                </>
                                            ) : activeTab === 'vocabulary' ? (
                                                <>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Javanese Word</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Translation</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Level</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Formality</th>
                                                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                                                </>
                                            ) : activeTab === 'quizzes' ? (
                                                <>
                                                    <th
                                                        className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:text-blue-600 transition-colors"
                                                        onClick={() => {
                                                            const order = quizSortBy === 'title' && quizSortOrder === 'asc' ? 'desc' : 'asc';
                                                            setQuizSortBy('title');
                                                            setQuizSortOrder(order);
                                                            updateFilters({ quizSortBy: 'title', quizSortOrder: order });
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Quiz Title
                                                            {quizSortBy === 'title' && (
                                                                <span className="material-symbols-outlined text-xs">{quizSortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>
                                                            )}
                                                        </div>
                                                    </th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Lesson / Module</th>
                                                    <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Questions</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                                                </>
                                            ) : activeTab === 'users' ? (
                                                <>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">User</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Email</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Role / Level</th>
                                                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                                                </>
                                            ) : (
                                                <>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Queue Task</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Priority</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                        {activeTab === 'dashboard' ? (
                                            [
                                                { label: 'Total Modules', value: initialStats.modulesCount, status: 'Healthy' },
                                                { label: 'Total Lessons', value: initialStats.lessonsCount, status: 'Active' },
                                                { label: 'Total Vocabulary', value: initialStats.vocabularyCount, status: 'Growing' },
                                                { label: 'Total Quizzes', value: initialStats.quizzesCount, status: 'Testing' },
                                                { label: 'Total Users', value: totalUsersCount, status: 'Healthy' },
                                            ].map((stat, i) => (
                                                <tr key={i} className="group hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                                                    <td className="px-8 py-6 text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">{stat.label}</td>
                                                    <td className="px-8 py-6 text-2xl font-black text-blue-600">{stat.value}</td>
                                                    <td className="px-8 py-6">
                                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg">{stat.status}</span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : activeTab === 'modules' ? (
                                            initialModules.map((module) => (
                                                <tr key={module.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <p className="text-base font-black text-slate-900 dark:text-white truncate tracking-tight">{module.title}</p>
                                                        <p className="text-xs text-slate-500 line-clamp-1">{module.description}</p>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg">{module.level}</span>
                                                    </td>
                                                    <td className="px-8 py-6 text-center text-sm font-bold text-slate-500">{module._count?.lessons || 0}</td>
                                                    <td className="px-8 py-6">
                                                        <button
                                                            onClick={() => handleToggleModulePublish(module.id)}
                                                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${module.published ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                                                        >
                                                            {module.published ? 'Published' : 'Draft'}
                                                        </button>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                                            <button
                                                                onClick={() => { setEditingModule(module); setIsModuleModalOpen(true); }}
                                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl"
                                                            >
                                                                <span className="material-symbols-outlined">edit</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteModule(module.id)}
                                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                                                            >
                                                                <span className="material-symbols-outlined">delete</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : activeTab === 'lessons' ? (
                                            initialLessons.map((lesson) => (
                                                <tr key={lesson.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <p className="text-base font-black text-slate-900 dark:text-white truncate tracking-tight">{lesson.title}</p>
                                                        <p className="text-xs text-slate-500 line-clamp-1">{lesson.description}</p>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">{lesson.module?.title}</span>
                                                    </td>
                                                    <td className="px-8 py-6 text-center text-sm font-bold text-slate-500">{lesson.order}</td>
                                                    <td className="px-8 py-6">
                                                        <button
                                                            onClick={() => handleToggleLessonPublish(lesson.id)}
                                                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${lesson.published ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                                                        >
                                                            {lesson.published ? 'Published' : 'Draft'}
                                                        </button>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                                            <button
                                                                onClick={() => window.open(`/lessons/${lesson.slug}?preview=true`, '_blank')}
                                                                className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl"
                                                                title="Preview Lesson"
                                                            >
                                                                <span className="material-symbols-outlined">visibility</span>
                                                            </button>
                                                            <button
                                                                onClick={() => { setBlockEditingLesson(lesson); setIsBlockEditorOpen(true); }}
                                                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl"
                                                                title="Designer Mode (Blocks)"
                                                            >
                                                                <span className="material-symbols-outlined leading-none">architecture</span>
                                                            </button>
                                                            <button onClick={() => { setEditingLesson(lesson); setIsLessonModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl">
                                                                <span className="material-symbols-outlined">edit</span>
                                                            </button>
                                                            <button onClick={() => handleDeleteLesson(lesson.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl">
                                                                <span className="material-symbols-outlined">delete</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : activeTab === 'vocabulary' ? (
                                            initialVocabulary.map((vocab) => (
                                                <tr key={vocab.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/20 cursor-pointer transition-colors" onClick={() => setSelectedVocab(vocab)}>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">{vocab.word}</span>
                                                            {vocab.audioUrl ? (
                                                                vocab.audioFileExists ? (
                                                                    <span className="material-symbols-outlined text-blue-500 text-sm fill-1" title="Has Audio (Verified)">volume_up</span>
                                                                ) : (
                                                                    <span className="material-symbols-outlined text-red-500 text-sm animate-pulse" title="Audio Path set, but FILE MISSING in public/uploads">warning</span>
                                                                )
                                                            ) : (
                                                                <span className="material-symbols-outlined text-slate-300 text-sm" title="No Audio Path set">volume_off</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-sm font-medium text-slate-600">{vocab.translation}</td>
                                                    <td className="px-8 py-6"><span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg">{vocab.category || "General"}</span></td>
                                                    <td className="px-8 py-6"><span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg">{vocab.level || "A1"}</span></td>
                                                    <td className="px-8 py-6 text-[10px] font-black uppercase text-slate-400">{vocab.formality}</td>
                                                    <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                                            {vocab.audioUrl && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); playAudio(vocab.audioUrl); }}
                                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl"
                                                                >
                                                                    <span className="material-symbols-outlined">volume_up</span>
                                                                </button>
                                                            )}
                                                            <button onClick={() => { setEditingVocab(vocab); setIsVocabModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl">
                                                                <span className="material-symbols-outlined">edit</span>
                                                            </button>
                                                            <button onClick={() => handleDeleteVocabulary(vocab.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl">
                                                                <span className="material-symbols-outlined">delete</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : activeTab === 'quizzes' ? (
                                            initialQuizzes.map((quiz) => (
                                                <tr key={quiz.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <p className="text-base font-black text-slate-900 dark:text-white truncate tracking-tight">{quiz.title}</p>
                                                        <p className="text-xs text-slate-500 line-clamp-1">{quiz.description}</p>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{quiz.lesson?.title}</div>
                                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{quiz.lesson?.module?.title}</div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center text-sm font-bold text-slate-500">{quiz._count?.questions || 0}</td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${quiz.published ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                                {quiz.published ? 'Published' : 'Draft'}
                                                            </span>
                                                            {!quiz.isValid ? (
                                                                <span
                                                                    className="material-symbols-outlined text-red-500 cursor-help"
                                                                    title={quiz.issues?.join('\n')}
                                                                >
                                                                    report
                                                                </span>
                                                            ) : (
                                                                <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                                            <button onClick={() => { setEditingQuiz(quiz); setIsQuizModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl">
                                                                <span className="material-symbols-outlined">edit</span>
                                                            </button>
                                                            <button onClick={() => handleDeleteQuiz(quiz.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl">
                                                                <span className="material-symbols-outlined">delete</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : activeTab === 'users' ? (
                                            initialUsers.map((user) => (
                                                <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-black text-slate-600 dark:text-slate-300">{user.name?.charAt(0) || user.email?.charAt(0)}</div>
                                                            <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">{user.name || "Unknown"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-sm font-medium text-slate-600">{user.email}</td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">{user.role}</span>
                                                            <span className="text-[10px] font-bold text-slate-400">Level {user.stats?.level || 1}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                                            <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl">
                                                                <span className="material-symbols-outlined">delete</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr className="group hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                                                <td className="px-8 py-6 text-sm font-black text-slate-400 uppercase tracking-widest" colSpan={3}>Queue is empty. No pending tasks.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-6 mt-4">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:border-blue-500 transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Page {currentPage} of {totalPages}</span>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:border-blue-500 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Comprehensive Vocabulary Detail Modal */}
            {selectedVocab && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedVocab(null)} />
                    <div className="relative w-full max-w-3xl bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300">
                        <div className="h-full max-h-[90vh] overflow-y-auto">
                            <div className="p-10">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-[2rem] bg-blue-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-blue-500/30">
                                            {selectedVocab.word.substring(0, 1).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{selectedVocab.word}</h2>
                                                {selectedVocab.audioUrl && (
                                                    <button
                                                        onClick={() => playAudio(selectedVocab.audioUrl)}
                                                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-400 hover:text-blue-600 flex items-center justify-center transition-all"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px] fill-1">volume_up</span>
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-blue-600 font-bold text-xl tracking-wide">{selectedVocab.phonetic || "/phonetic/"}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedVocab(null)} className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all"><span className="material-symbols-outlined text-3xl">close</span></button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-2 block">Dutch Translation</label>
                                        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{selectedVocab.translation}</p>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Formality</span>
                                            <span className="px-4 py-1.5 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full">{selectedVocab.formality}</span>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</span>
                                            <span className="text-sm font-black text-slate-700 dark:text-slate-300">{selectedVocab.category || "General"}</span>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Level</span>
                                            <span className="text-sm font-black text-slate-700 dark:text-slate-300">{selectedVocab.level || "A1"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {selectedVocab.aiHint && (
                                        <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-8 rounded-[2rem] border border-indigo-100/50 dark:border-indigo-900/20">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="material-symbols-outlined text-indigo-500">auto_awesome</span>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Mnemonic / AI Hint</label>
                                            </div>
                                            <p className="text-lg font-bold text-slate-800 dark:text-slate-200 tracking-tight">"{selectedVocab.aiHint}"</p>
                                        </div>
                                    )}

                                    {(selectedVocab.exampleJavanese || selectedVocab.exampleDutch) && (
                                        <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-8 rounded-[2rem] border border-emerald-100/50 dark:border-emerald-900/20">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="material-symbols-outlined text-emerald-600">translate</span>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Example Sentence</label>
                                            </div>
                                            <div className="space-y-3">
                                                <p className="text-xl font-black text-slate-900 dark:text-white">{selectedVocab.exampleJavanese}</p>
                                                <p className="text-sm font-bold text-emerald-700/70 border-l-2 border-emerald-200 pl-4 italic">{selectedVocab.exampleDutch}</p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedVocab.notes && (
                                        <div className="bg-amber-50/50 dark:bg-amber-900/10 p-8 rounded-[2rem] border border-amber-100/50 dark:border-amber-900/20">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="material-symbols-outlined text-amber-600">sticky_note_2</span>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-amber-600">Usage Notes</label>
                                            </div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{selectedVocab.notes}</p>
                                        </div>
                                    )}

                                    {selectedVocab.tags && selectedVocab.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedVocab.tags.map((tag: string) => (
                                                <span key={tag} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 hover:text-white transition-all cursor-default">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="px-10 py-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-5">
                                <button onClick={() => setSelectedVocab(null)} className="px-8 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all">Dismiss</button>
                                <button
                                    onClick={() => { setSelectedVocab(null); setEditingVocab(selectedVocab); setIsVocabModalOpen(true); }}
                                    className="px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95"
                                >
                                    Modify Entry
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Module Add/Edit Modal */}
            {isModuleModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModuleModalOpen(false)} />
                    <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <form action={async (formData) => {
                            const result = editingModule
                                ? await updateModuleAction(editingModule.id, formData)
                                : await addModuleAction(formData);
                            if (result.success) setIsModuleModalOpen(false);
                            else alert(result.error);
                        }}>
                            <div className="p-10">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter">
                                    {editingModule ? 'Modify Module' : 'Configure New Module'}
                                </h2>
                                <div className="grid gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Module Title</label>
                                        <input name="title" required defaultValue={editingModule?.title} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Educational Description</label>
                                        <textarea name="description" required defaultValue={editingModule?.description} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-medium min-h-[120px] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Level</label>
                                            <select name="level" defaultValue={editingModule?.level || 'A1'} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-black uppercase tracking-widest">
                                                <option value="A1">A1 - Beginner</option><option value="A2">A2 - Elementary</option><option value="B1">B1 - Intermediate</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sequence Order</label>
                                            <input name="order" type="number" defaultValue={editingModule?.order || 0} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-10 py-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-4">
                                <button type="button" onClick={() => setIsModuleModalOpen(false)} className="px-8 py-3 text-sm font-bold text-slate-500">Cancel</button>
                                <button type="submit" className="px-12 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:-translate-y-1 transition-all">Persist Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Vocabulary Add/Edit Modal - EXTENDED */}
            {isVocabModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsVocabModalOpen(false)} />
                    <div className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden leading-relaxed">
                        <form action={async (formData) => {
                            const result = editingVocab
                                ? await updateVocabularyAction(editingVocab.id, formData)
                                : await addVocabularyAction(formData);
                            if (result.success) setIsVocabModalOpen(false);
                            else alert(result.error);
                        }} className="h-full max-h-[95vh] overflow-y-auto">
                            <div className="p-10">
                                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-10 tracking-tighter">
                                    {editingVocab ? 'Update Dictionary Entry' : 'New Dictionary Entry'}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {/* Left Column: Basic Info */}
                                    <div className="space-y-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-600">Javanese Word</label>
                                            <input name="word" required defaultValue={editingVocab?.word} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-xl tracking-tight focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" placeholder="e.g., Sapa" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dutch Translation</label>
                                            <input name="translation" required defaultValue={editingVocab?.translation} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" placeholder="e.g., Wie" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phonetic</label>
                                                <input name="phonetic" defaultValue={editingVocab?.phonetic} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl font-medium" placeholder="/phonetic/" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Formality</label>
                                                <select name="formality" defaultValue={editingVocab?.formality || 'NEUTRAL'} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest">
                                                    <option value="NEUTRAL">Neutral</option><option value="NGOKO">Ngoko</option><option value="KRAMA">Krama</option><option value="KRAMA_INGGIL">Krama Inggil</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Level</label>
                                                <select name="level" defaultValue={editingVocab?.level || 'A1'} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest">
                                                    <option value="A1">A1</option><option value="A2">A2</option><option value="B1">B1</option><option value="C1">C1</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Audio URL / Path</label>
                                            <input name="audioUrl" defaultValue={editingVocab?.audioUrl} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-medium" placeholder="/uploads/audio.mp3" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tags (Comma separated)</label>
                                            <input name="tags" defaultValue={editingVocab?.tags?.join(", ")} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-medium" placeholder="uitspraak, vraagwoord, etc." />
                                        </div>
                                    </div>

                                    {/* Right Column: Detailed Context */}
                                    <div className="space-y-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Mnemonic / AI Hint</label>
                                            <input name="aiHint" defaultValue={editingVocab?.aiHint} className="w-full px-6 py-4 bg-indigo-50/20 dark:bg-indigo-900/5 border border-indigo-100 dark:border-indigo-900/20 rounded-2xl font-bold" placeholder="Hint to remember the word..." />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Example Javanese</label>
                                            <input name="exampleJavanese" defaultValue={editingVocab?.exampleJavanese} className="w-full px-6 py-4 bg-emerald-50/20 dark:bg-emerald-900/5 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl font-bold" placeholder="Sapa jenengmu?" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Example Dutch</label>
                                            <input name="exampleDutch" defaultValue={editingVocab?.exampleDutch} className="w-full px-6 py-4 bg-emerald-50/20 dark:bg-emerald-900/5 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl font-medium italic" placeholder="Wie is jouw naam?" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-amber-600">Linguistic Notes</label>
                                            <textarea name="notes" defaultValue={editingVocab?.notes} className="w-full px-6 py-4 bg-amber-50/20 dark:bg-amber-900/5 border border-amber-100 dark:border-amber-900/20 rounded-2xl font-medium min-h-[100px]" placeholder="Special rules, pronunciation tips, etc." />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-10 py-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-4 mt-auto">
                                <button type="button" onClick={() => setIsVocabModalOpen(false)} className="px-8 py-3 text-sm font-bold text-slate-500">Cancel</button>
                                <button type="submit" className="px-12 py-4 bg-blue-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 hover:-translate-y-1 transition-all">Store Vocabulary</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Lesson Add/Edit Modal */}
            {isLessonModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsLessonModalOpen(false)} />
                    <div className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <form action={async (formData) => {
                            const result = await saveLessonAction(formData);
                            if (result.success) setIsLessonModalOpen(false);
                            else alert("Failed to save lesson");
                        }} className="h-full max-h-[95vh] overflow-y-auto">
                            <input type="hidden" name="id" value={editingLesson?.id || ""} />
                            <div className="p-10">
                                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-10 tracking-tighter">
                                    {editingLesson ? 'Edit Lesson' : 'Create New Lesson'}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-600">Lesson Title</label>
                                            <input name="title" required defaultValue={editingLesson?.title} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-xl tracking-tight focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Slug (URL friendly)</label>
                                            <input name="slug" required defaultValue={editingLesson?.slug} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order</label>
                                                <input name="order" type="number" defaultValue={editingLesson?.order || 0} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Module</label>
                                                <select name="moduleId" defaultValue={editingLesson?.moduleId} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest">
                                                    {allModules.map(m => (
                                                        <option key={m.id} value={m.id}>{m.title}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                                            <textarea name="description" defaultValue={editingLesson?.description} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-medium min-h-[100px]" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Linked Quiz</label>
                                            <select name="quizId" defaultValue={editingLesson?.quiz?.id} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest">
                                                <option value="">No Quiz</option>
                                                {allQuizzes.map(q => (
                                                    <option key={q.id} value={q.id}>{q.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                            <input type="checkbox" name="published" defaultChecked={editingLesson?.published} id="lesson-published" className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                            <label htmlFor="lesson-published" className="text-sm font-bold text-slate-700 dark:text-white">Published</label>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Content Blocks</label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsLessonModalOpen(false);
                                                    setBlockEditingLesson(editingLesson);
                                                    setIsBlockEditorOpen(true);
                                                }}
                                                className="w-full px-6 py-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-2xl font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all flex items-center justify-center gap-2"
                                            >
                                                <span className="material-symbols-outlined">architecture</span>
                                                <span>Configure Blocks</span>
                                            </button>
                                            <p className="text-xs text-slate-500 mt-1">Use the block editor to manage lesson sections, vocabulary, and quizzes.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-10 py-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-4 mt-auto">
                                <button type="button" onClick={() => setIsLessonModalOpen(false)} className="px-8 py-3 text-sm font-bold text-slate-500">Cancel</button>
                                <button type="submit" className="px-12 py-4 bg-blue-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:-translate-y-1 transition-all">Save Lesson</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Quiz Add/Edit Modal */}
            {isQuizModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsQuizModalOpen(false)} />
                    <div className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <form action={async (formData) => {
                            const result = await saveQuizAction(formData);
                            if (result.success) setIsQuizModalOpen(false);
                            else alert("Failed to save quiz");
                        }} className="h-full max-h-[95vh] overflow-y-auto">
                            <input type="hidden" name="id" value={editingQuiz?.id || ""} />
                            <div className="p-10">
                                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-10 tracking-tighter">
                                    {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-600">Quiz Title</label>
                                            <input name="title" required defaultValue={editingQuiz?.title} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-xl tracking-tight focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Linked Lesson</label>
                                            <select name="lessonId" required defaultValue={editingQuiz?.lessonId} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest">
                                                {allLessons.map(l => (
                                                    <option key={l.id} value={l.id}>{l.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                            <input type="checkbox" name="published" defaultChecked={editingQuiz?.published} id="quiz-published" className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                            <label htmlFor="quiz-published" className="text-sm font-bold text-slate-700 dark:text-white">Published</label>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                                            <textarea name="description" defaultValue={editingQuiz?.description} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-medium min-h-[100px]" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <QuizQuestionEditor initialQuestions={editingQuiz?.questions} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-10 py-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-4 mt-auto">
                                <button type="button" onClick={() => setIsQuizModalOpen(false)} className="px-8 py-3 text-sm font-bold text-slate-500">Cancel</button>
                                <button type="submit" className="px-12 py-4 bg-blue-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:-translate-y-1 transition-all">Save Quiz</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Lesson Block Editor Modal */}
            {isBlockEditorOpen && (
                <LessonBlockEditor
                    isOpen={isBlockEditorOpen}
                    onClose={() => setIsBlockEditorOpen(false)}
                    lesson={blockEditingLesson}
                    allVocabulary={allVocabulary}
                    allQuizzes={allQuizzes}
                />
            )}
        </div>
    );
}
