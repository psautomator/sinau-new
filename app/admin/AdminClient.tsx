"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
    deleteModuleAction,
    toggleModulePublishAction,
    deleteVocabularyAction,
    addModuleAction,
    updateModuleAction,
    addVocabularyAction,
    updateVocabularyAction,
    bulkMatchAudioAction,
    bulkUploadVocabAction
} from "@/app/actions/admin";
import {
    saveLessonAction,
    deleteLessonAction,
    saveQuizAction,
    deleteQuizAction,
    deleteUserAction,
    toggleLessonPublishAction
} from "@/app/admin/actions";
import LessonBlockEditor from "@/components/admin/LessonBlockEditor";
import QuizQuestionEditor from "@/components/admin/QuizQuestionEditor";
import QuizWorkspace from "@/components/admin/QuizWorkspace";
import LessonArchitect from "@/components/admin/LessonArchitect";
import VocabularyFullEditor from "@/components/admin/VocabularyFullEditor";
import AITutorScenarioEditor from "@/components/admin/AITutorScenarioEditor";
import { saveScenario } from "@/app/ai-tutor/actions";

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
    initialScenarios: any[];
    initialFeedback: any[];
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
    totalUsersCount,
    initialScenarios,
    initialFeedback
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
    const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
    const [isFullEditorOpen, setIsFullEditorOpen] = useState(false);
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState<any>(null);

    const [isBlockEditorOpen, setIsBlockEditorOpen] = useState(false);
    const [blockEditingLesson, setBlockEditingLesson] = useState<any>(null);

    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<any>(null);

    const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
    const [editingScenario, setEditingScenario] = useState<any>(null);
    const [isMatching, setIsMatching] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [previewVocab, setPreviewVocab] = useState<any[]>([]);

    const playAudio = (url: string) => {
        const audio = new Audio(url);
        audio.play().catch((err) => console.error("Playback failed:", err));
    };

    const totalCount = activeTab === 'reports' ? initialFeedback.length : (activeTab === 'scenarios' ? initialScenarios.length : (activeTab === 'modules' ? totalModulesCount : (activeTab === 'vocabulary' ? totalVocabularyCount : (activeTab === 'quizzes' ? totalQuizzesCount : (activeTab === 'users' ? totalUsersCount : totalLessonsCount)))));
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

    const handleSaveScenario = async (formData: FormData) => {
        const data = {
            id: formData.get("id") as string || undefined,
            title: formData.get("title") as string,
            slug: formData.get("slug") as string,
            description: formData.get("description") as string,
            initialMessage: formData.get("initialMessage") as string,
            initialSuggestions: (formData.get("initialSuggestions") as string).split(',').map(s => s.trim()).filter(Boolean),
            category: formData.get("category") as string,
            icon: formData.get("icon") as string,
            moduleId: formData.get("moduleId") as string || null,
            order: parseInt(formData.get("order") as string || "0"),
            published: formData.get("published") === "true",
        };

        try {
            await saveScenario(data);
            setIsScenarioModalOpen(false);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to save scenario.");
        }
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
            <aside className={`fixed md:static inset-y-0 left-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full w-72 flex-shrink-0 z-[40] transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="p-8 pb-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                <span className="material-symbols-outlined text-2xl">grid_view</span>
                            </div>
                            <div>
                                <h1 className="text-slate-900 dark:text-white text-xl font-black tracking-tight leading-none">AyoSinau</h1>
                                <p className="text-emerald-600 dark:text-emerald-500 text-[10px] font-bold uppercase tracking-widest mt-1">Content Admin</p>
                            </div>
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Sidebar Navigation */}
                    <nav className="flex-1 px-6 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
                            { id: 'modules', label: 'Course Modules', icon: 'layers' },
                            { id: 'lessons', label: 'Lesson Editor', icon: 'description' },
                            { id: 'vocabulary', label: 'Vocabulary Bank', icon: 'translate' },
                            { id: 'quizzes', label: 'Quiz Management', icon: 'quiz' },
                            { id: 'scenarios', label: 'AI Tutor Config', icon: 'smart_toy' },
                            { id: 'reports', label: 'Feedback Reports', icon: 'report', badge: initialFeedback.filter(f => f.status === 'NEW').length || undefined },
                            { id: 'users', label: 'Student Management', icon: 'group' },
                            { id: 'exit', label: 'Exit Admin', icon: 'logout', action: 'home' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (item.action === 'home') {
                                        router.push('/');
                                        return;
                                    }
                                    setActiveTab(item.id);
                                    setIsSidebarOpen(false);
                                    const params = new URLSearchParams(searchParams.toString());
                                    params.set("tab", item.id);
                                    params.set("page", "1");
                                    router.push(`/admin?${params.toString()}`);
                                }}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${activeTab === item.id
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-[22px] transition-transform group-hover:scale-110 ${activeTab === item.id ? 'fill-1' : ''}`}>{item.icon}</span>
                                <span className={`text-[13px] font-bold ${activeTab === item.id ? 'font-black' : ''}`}>{item.label}</span>
                                {item.badge && (
                                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-lg shadow-red-500/20">{item.badge}</span>
                                )}
                                {activeTab === item.id && !item.badge && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" />
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* Sidebar Footer / Content Pipeline */}
                    <div className="p-6 mt-auto border-t border-slate-100 dark:border-slate-800 space-y-6">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-700/50">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Content Pipeline</span>
                                <span className="text-[10px] font-black text-blue-600">78%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full w-[78%] shadow-sm" />
                            </div>
                            <p className="text-[9px] font-bold text-slate-500 mt-3 flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                                78% Q3 Modules Ready
                            </p>
                        </div>

                        <button className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 transition-all active:scale-95 group">
                            <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">publish</span>
                            Mass Publish
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Section */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <header className="px-8 py-5 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 z-10">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div className="flex items-center gap-2 text-[11px] font-bold tracking-tight text-slate-400">
                            <span>Admin</span>
                            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                            <span className="text-slate-900 dark:text-white font-black capitalize">
                                {activeTab === 'dashboard' ? 'Content Management Dashboard' : `${activeTab} Management`}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        {/* Notifications */}
                        <div className="relative group">
                            <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl transition-all">
                                <span className="material-symbols-outlined text-[24px]">notifications</span>
                                <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900" />
                            </button>
                        </div>

                        {/* Profile Section */}
                        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 pl-6 pr-2 py-2 rounded-3xl border border-slate-100 dark:border-slate-700">
                            <div className="text-right">
                                <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">Budi Santoso</p>
                                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Head of Education</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-600 overflow-hidden relative shadow-sm">
                                <Image
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-av2hlIVBxc2iq2Re3gsL1jApS0FF4DXF2KTIFjPdQvqYCmAKWX7k9VZhOOdj3WwICYLTWWDfOTeA-uo7J5cDrqx9NXN4bzFFXns3CCV1uzZRNqyMYiA4KngO_5bgFbKgro_nljo3vqRIL3zNgmtqhTnHbOTqlwgsPma2WIOeJCRKRqXGw-PEj8aRSeesm6yJZ7lTDD3Y4ViwclfWYadM8UVzqi0Ranbo-WJVJfJRW6O0xSAVskJiswmA4tlsXDVPUDFXJWaA5-A"
                                    alt="Admin Profile"
                                    fill
                                    className="object-cover"
                                />
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
                                        else if (activeTab === 'scenarios') { setEditingScenario(null); setIsScenarioModalOpen(true); }
                                        else { setEditingVocab(null); setIsFullEditorOpen(true); }
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

                                {activeTab === 'vocabulary' && (
                                    <button
                                        onClick={() => setIsImportModalOpen(true)}
                                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 transition-all hover:-translate-y-1 active:scale-95"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">upload_file</span>
                                        <span>Bulk Import</span>
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
                                            value={searchParams.get("moduleId") || ""}
                                            onChange={(e) => updateFilters({ moduleId: e.target.value })}
                                        >
                                            <option value="">All Modules</option>
                                            {(allModules || []).map(m => (
                                                <option key={m.id} value={m.id}>{m.title}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500"
                                            value={searchParams.get("lessonLevel") || ""}
                                            onChange={(e) => updateFilters({ lessonLevel: e.target.value })}
                                        >
                                            <option value="">All Levels</option>
                                            <option value="A1">A1</option>
                                            <option value="A2">A2</option>
                                            <option value="B1">B1</option>
                                            <option value="B2">B2</option>
                                            <option value="C1">C1</option>
                                        </select>
                                        <select
                                            className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500"
                                            value={searchParams.get("lessonStyle") || ""}
                                            onChange={(e) => updateFilters({ lessonStyle: e.target.value })}
                                        >
                                            <option value="">All Styles</option>
                                            <option value="Ngoko">Ngoko</option>
                                            <option value="Krama">Krama</option>
                                            <option value="Mixed">Mixed</option>
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
                        {activeTab === 'dashboard' ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Total Students', value: (totalUsersCount || 0).toLocaleString(), icon: 'groups', color: 'bg-slate-100', text: 'text-slate-600', badge: 'Active', badgeColor: 'bg-emerald-50 text-emerald-600', action: () => setActiveTab('users') },
                                        { label: 'Total Vocabulary', value: (initialStats?.vocabularyCount || 0).toLocaleString(), icon: 'translate', color: 'bg-blue-50', text: 'text-blue-600', badge: '+42 New', badgeColor: 'bg-blue-50 text-blue-600', action: () => setActiveTab('vocabulary') },
                                        { label: 'Total Lessons', value: (initialStats?.lessonsCount || 0).toLocaleString(), icon: 'menu_book', color: 'bg-emerald-50', text: 'text-emerald-600', badge: '8 Stages', badgeColor: 'bg-emerald-50 text-emerald-600', action: () => setActiveTab('lessons') },
                                        { label: 'Feedback Reports', value: (initialStats?.queueCount || 0).toLocaleString(), icon: 'report', color: 'bg-amber-50', text: 'text-amber-600', badge: `${initialStats?.newFeedbackCount || 0} New`, badgeColor: 'bg-amber-50 text-amber-600', action: () => setActiveTab('reports') },
                                    ].map((stat, i) => (
                                        <div key={i} onClick={stat.action} className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`p-4 ${stat.color} ${stat.text} rounded-2xl`}>
                                                    <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
                                                </div>
                                                <span className={`px-3 py-1 ${stat.badgeColor} text-[10px] font-black uppercase tracking-widest rounded-lg`}>{stat.badge}</span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                                                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</p>
                                            </div>
                                            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-slate-50 dark:bg-slate-900/50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
                                        </div>
                                    ))}
                                </div>

                                {/* Charts & Queue Section */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Student Engagement Chart */}
                                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                                        <div className="flex justify-between items-center mb-10">
                                            <div>
                                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Student Engagement</h3>
                                                <p className="text-sm font-bold text-slate-400 mt-1">Daily active learners over the last 30 days</p>
                                            </div>
                                            <div className="flex bg-slate-50 dark:bg-slate-900 p-1.5 rounded-2xl gap-2">
                                                <button className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">Weekly</button>
                                                <button className="px-4 py-2 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest">Monthly</button>
                                            </div>
                                        </div>

                                        {/* Simplified SVG Area Chart */}
                                        <div className="h-[240px] w-full relative group">
                                            <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200" preserveAspectRatio="none">
                                                <defs>
                                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                                                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                                    </linearGradient>
                                                </defs>
                                                <path
                                                    d="M0,150 Q100,145 200,100 T400,110 T600,60 T800,40"
                                                    fill="none"
                                                    stroke="#10b981"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    className="animate-in slide-in-from-left duration-1000"
                                                />
                                                <path
                                                    d="M0,150 Q100,145 200,100 T400,110 T600,60 T800,40 L800,200 L0,200 Z"
                                                    fill="url(#chartGradient)"
                                                />
                                                {/* Dots for key points */}
                                                {[0, 200, 400, 600, 800].map((x, i) => (
                                                    <circle key={i} cx={x} cy={i === 0 ? 150 : i === 1 ? 100 : i === 2 ? 110 : i === 3 ? 60 : 40} r="5" fill="#10b981" className="cursor-pointer hover:r-8 transition-all" />
                                                ))}
                                            </svg>

                                            {/* X-Axis Labels */}
                                            <div className="flex justify-between mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                                                <span>Nov 01</span>
                                                <span>Nov 10</span>
                                                <span>Nov 20</span>
                                                <span>Nov 30</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Publication Queue */}
                                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col">
                                        <div className="flex justify-between items-center mb-8">
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Publication Queue</h3>
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg">3 Pending</span>
                                        </div>

                                        <div className="space-y-4 flex-1">
                                            {[
                                                { title: 'Intermediate Ngoko', type: 'Lesson Set • Admin Update', time: '12m ago' },
                                                { title: 'Wayang Terminology', type: 'Vocab Pack • Content Team', time: '1h ago' },
                                                { title: 'Politeness Levels Quiz', type: 'Interactive • AI Generated', time: '3h ago' },
                                            ].map((task, i) => (
                                                <div key={i} className="p-5 rounded-3xl border border-slate-100 dark:border-slate-700/50 hover:border-blue-500/20 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-all group">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{task.title}</h4>
                                                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter mt-1">{task.type}</p>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{task.time}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <button className="py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Approve</button>
                                                        <button className="py-2 bg-slate-50 dark:bg-slate-700 text-slate-500 hover:bg-red-50 hover:text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Reject</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <button className="w-full mt-6 py-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">history</span>
                                            View Publication History
                                        </button>
                                    </div>
                                </div>

                                {/* Content Asset Health */}
                                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                                    <div className="p-8 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center">
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Content Asset Health</h3>
                                        <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-1 hover:underline">
                                            Full Audit
                                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-slate-50 dark:bg-slate-900/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    <th className="px-8 py-5">Component Type</th>
                                                    <th className="px-8 py-5">Coverage</th>
                                                    <th className="px-8 py-5">Success Rate</th>
                                                    <th className="px-8 py-5">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                                                {[
                                                    { name: 'Krama Alus Modules', sub: 'Formal Polite Dialect', coverage: '100%', rate: '98.2%', status: 'Optimized', statusColor: 'text-emerald-500 bg-emerald-50' },
                                                    { name: 'Ngoko Lessons', sub: 'Casual Everyday Javanese', coverage: '85%', rate: '94.5%', status: 'Stable', statusColor: 'text-blue-500 bg-blue-50' },
                                                    { name: 'Batik Vocabulary Pack', sub: 'Thematic Cultural Lexicon', coverage: '42%', rate: 'N/A', status: 'Draft', statusColor: 'text-slate-400 bg-slate-100' },
                                                ].map((row, i) => (
                                                    <tr key={i} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                        <td className="px-8 py-6">
                                                            <p className="font-black text-slate-900 dark:text-white text-sm">{row.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 mt-1">{row.sub}</p>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="h-1.5 w-32 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-emerald-500 rounded-full"
                                                                        style={{ width: row.coverage }}
                                                                    />
                                                                </div>
                                                                <span className="text-[11px] font-black text-slate-600 dark:text-slate-400">{row.coverage}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-2 text-blue-600">
                                                                {row.rate !== 'N/A' && <span className="material-symbols-outlined text-[18px]">check_circle</span>}
                                                                <span className="text-[11px] font-black">{row.rate}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${row.statusColor}`}>
                                                                {row.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-200/50 dark:border-slate-700 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-separate border-spacing-0">
                                        <thead>
                                            <tr className="bg-slate-50/50 dark:bg-slate-800/80 text-[10px] uppercase font-black tracking-[0.15em] text-slate-400">
                                                {activeTab === 'modules' ? (
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
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Level</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Style</th>
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
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">Student Information</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">Email Address</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">Role & Level</th>
                                                        <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                                                    </>
                                                ) : activeTab === 'scenarios' ? (
                                                    <>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Scenario Name</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Module</th>
                                                        <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Order</th>
                                                        <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                                                    </>
                                                ) : activeTab === 'reports' ? (
                                                    <>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">Report Content</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">Student</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">Context</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">Status</th>
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
                                            {activeTab === 'modules' ? (
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
                                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-tighter truncate max-w-[100px] block">{lesson.module?.title}</span>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{lesson.level || 'A1'}</span>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">{lesson.languageStyle || 'Ngoko'}</span>
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
                                                    <tr key={vocab.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/20 cursor-pointer transition-colors" onClick={() => { setEditingVocab(vocab); setIsQuickEditOpen(true); }}>
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
                                                                <button onClick={() => { setEditingVocab(vocab); setIsFullEditorOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl">
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
                                            ) : activeTab === 'scenarios' ? (
                                                initialScenarios.map((scenario) => (
                                                    <tr key={scenario.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="size-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center relative">
                                                                    <span className="material-symbols-outlined text-blue-600 text-2xl">{scenario.icon}</span>
                                                                    {scenario.published === false && (
                                                                        <div className="absolute -top-1 -right-1 size-4 bg-amber-500 rounded-full border-2 border-white dark:border-slate-800" title="Draft"></div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="text-base font-black text-slate-900 dark:text-white truncate tracking-tight">{scenario.title}</p>
                                                                        {scenario.published === false && (
                                                                            <span className="text-[80%] font-black uppercase tracking-widest text-amber-500 px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 rounded-md">Draft</span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{scenario.description}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">{scenario.category}</span>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                                                    {allModules.find(m => m.id === scenario.moduleId)?.title || 'General Context'}
                                                                </span>
                                                                <span className="text-[10px] font-medium text-slate-400">Linked Module</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 text-center">
                                                            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-black text-slate-500 border border-slate-200 dark:border-slate-700">
                                                                {scenario.order}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                                <button
                                                                    onClick={() => { setEditingScenario(scenario); setIsScenarioModalOpen(true); }}
                                                                    className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                                                                    title="Edit Scenario"
                                                                >
                                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        if (!confirm("Are you sure? This action cannot be undone.")) return;
                                                                        const { deleteScenario } = await import('../ai-tutor/actions');
                                                                        await deleteScenario(scenario.id);
                                                                        router.refresh();
                                                                    }}
                                                                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                                    title="Delete Scenario"
                                                                >
                                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : activeTab === 'reports' ? (
                                                initialFeedback.map((report) => (
                                                    <tr key={report.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 font-sans">
                                                        <td className="px-8 py-6">
                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${report.feedbackType === 'BUG' ? 'bg-red-100 text-red-600' :
                                                                        report.feedbackType === 'TYPO' ? 'bg-blue-100 text-blue-600' :
                                                                            report.feedbackType === 'CONTENT_ISSUE' ? 'bg-amber-100 text-amber-600' :
                                                                                'bg-slate-100 text-slate-600'
                                                                        }`}>
                                                                        {report.feedbackType}
                                                                    </span>
                                                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${report.priority === 'HIGH' ? 'bg-red-500 text-white' :
                                                                        report.priority === 'MEDIUM' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                                                                        }`}>
                                                                        {report.priority}
                                                                    </span>
                                                                </div>
                                                                <div className="text-sm font-bold text-slate-900 dark:text-white leading-snug max-w-md">
                                                                    {report.message}
                                                                </div>
                                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                                    {new Date(report.createdAt).toLocaleString()}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            {report.user ? (
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-8 h-8 rounded-xl bg-slate-200 bg-cover bg-center border border-white dark:border-slate-700 shadow-sm" style={{ backgroundImage: `url(${report.user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + report.user.email})` }} />
                                                                    <div className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-tight truncate max-w-[100px]">{report.user.name || 'Student'}</div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anonymous</span>
                                                            )}
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex flex-col gap-1.5">
                                                                {report.lessonId && (
                                                                    <div className="flex items-center gap-2 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tight border border-blue-100/50 dark:border-blue-900/30">
                                                                        <span className="material-symbols-outlined text-[14px]">menu_book</span>
                                                                        <span className="truncate max-w-[120px]">{report.lesson?.title}</span>
                                                                    </div>
                                                                )}
                                                                {report.vocabId && (
                                                                    <div className="flex items-center gap-2 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-tight border border-amber-100/50 dark:border-amber-900/30">
                                                                        <span className="material-symbols-outlined text-[14px]">translate</span>
                                                                        <span>{report.vocab?.word}</span>
                                                                    </div>
                                                                )}
                                                                {!report.lessonId && !report.vocabId && (
                                                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-1.5 opacity-60">
                                                                        <span className="material-symbols-outlined text-[14px]">web</span>
                                                                        General UI
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${report.status === 'NEW' ? 'bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-600/20' :
                                                                report.status === 'IN_PROGRESS' ? 'bg-amber-400 text-white border-amber-500' :
                                                                    report.status === 'RESOLVED' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-slate-200 text-slate-500 border-slate-300'
                                                                }`}>
                                                                {report.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {report.status !== 'RESOLVED' && (
                                                                    <button
                                                                        onClick={async () => {
                                                                            const { updateFeedbackStatusAction } = await import('@/app/actions/feedback');
                                                                            await updateFeedbackStatusAction(report.id, 'RESOLVED');
                                                                            router.refresh();
                                                                        }}
                                                                        className="p-2.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
                                                                        title="Resolve Report"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                                                    </button>
                                                                )}
                                                                {report.status === 'NEW' && (
                                                                    <button
                                                                        onClick={async () => {
                                                                            const { updateFeedbackStatusAction } = await import('@/app/actions/feedback');
                                                                            await updateFeedbackStatusAction(report.id, 'IN_PROGRESS');
                                                                            router.refresh();
                                                                        }}
                                                                        className="p-2.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all"
                                                                        title="Mark In Progress"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[20px]">hourglass_empty</span>
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => {
                                                                        if (report.lessonId) {
                                                                            const lesson = allLessons.find(l => l.id === report.lessonId);
                                                                            if (lesson) {
                                                                                setBlockEditingLesson(lesson);
                                                                                setIsBlockEditorOpen(true);
                                                                            }
                                                                        } else if (report.vocabId) {
                                                                            const vocab = allVocabulary.find(v => v.id === report.vocabId);
                                                                            if (vocab) {
                                                                                setEditingVocab(vocab);
                                                                                setIsFullEditorOpen(true);
                                                                            }
                                                                        } else if (report.pageUrl) {
                                                                            window.open(report.pageUrl, '_blank');
                                                                        }
                                                                    }}
                                                                    className="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                                                                    title="Go to Context"
                                                                >
                                                                    <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr className="group hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                                                    <td className="px-8 py-6 text-sm font-black text-slate-400 uppercase tracking-widest" colSpan={3}>No results found for {activeTab}.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

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
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Level</label>
                                                <select name="level" defaultValue={editingLesson?.level || "A1"} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest">
                                                    <option value="A1">A1 (Beginner)</option>
                                                    <option value="A2">A2 (Elementary)</option>
                                                    <option value="B1">B1 (Intermediate)</option>
                                                    <option value="B2">B2 (Upper Int)</option>
                                                    <option value="C1">C1 (Advanced)</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Style</label>
                                                <select name="languageStyle" defaultValue={editingLesson?.languageStyle || "Ngoko"} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest">
                                                    <option value="Ngoko">Ngoko (Informal)</option>
                                                    <option value="Krama">Krama (Formal)</option>
                                                    <option value="Mixed">Mixed</option>
                                                </select>
                                            </div>
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
            {/* Quiz Add/Edit Workspace */}
            {isQuizModalOpen && (
                <QuizWorkspace
                    quiz={editingQuiz}
                    allLessons={allLessons}
                    onClose={() => setIsQuizModalOpen(false)}
                    onSave={async (formData: FormData) => {
                        const result = await saveQuizAction(formData);
                        if (result.success) setIsQuizModalOpen(false);
                        else alert("Failed to save quiz");
                    }}
                />
            )}

            {/* Lesson Architect Workspace */}
            {isBlockEditorOpen && (
                <LessonArchitect
                    lesson={blockEditingLesson}
                    allVocabulary={allVocabulary}
                    allQuizzes={allQuizzes}
                    allModules={initialModules}
                    onClose={() => setIsBlockEditorOpen(false)}
                    onSave={async (formData: FormData) => {
                        const result = await saveLessonAction(formData);
                        if (result.success) setIsBlockEditorOpen(false);
                        else alert("Failed to save lesson: " + result.error);
                    }}
                />
            )}

            {/* Quick Edit Drawer for Vocabulary */}
            <aside className={`fixed inset-y-0 right-0 w-full sm:w-[520px] bg-white dark:bg-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.2)] border-l border-slate-200 dark:border-slate-800 flex flex-col z-[150] transition-transform duration-500 ease-in-out ${isQuickEditOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Drawer Header */}
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{editingVocab ? 'Quick Edit Entry' : 'New Vocabulary'}</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Direct dictionary control</p>
                    </div>
                    <button
                        onClick={() => setIsQuickEditOpen(false)}
                        className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-all active:scale-90"
                    >
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                </div>

                {/* Drawer Body - Form */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                    <form
                        id="quick-edit-form"
                        action={async (formData) => {
                            const result = editingVocab
                                ? await updateVocabularyAction(editingVocab.id, formData)
                                : await addVocabularyAction(formData);
                            if (result.success) {
                                setIsQuickEditOpen(false);
                                router.refresh();
                            } else {
                                alert(result.error);
                            }
                        }}
                        className="space-y-8 relative z-10"
                    >
                        {/* Word & Translation */}
                        <div className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Javanese Word</label>
                                <input
                                    name="word"
                                    required
                                    key={editingVocab?.id || 'new'}
                                    defaultValue={editingVocab?.word}
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl font-black text-2xl tracking-tighter focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="Enter word..."
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Dutch Translation</label>
                                <input
                                    name="translation"
                                    required
                                    key={editingVocab?.id ? `trans-${editingVocab.id}` : 'new-trans'}
                                    defaultValue={editingVocab?.translation}
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-lg tracking-tight focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                    placeholder="Betekenis..."
                                />
                            </div>
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-slate-800" />

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Level</label>
                                <select
                                    name="level"
                                    key={editingVocab?.id ? `level-${editingVocab.id}` : 'new-level'}
                                    defaultValue={editingVocab?.level || 'A1'}
                                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest outline-none appearance-none"
                                >
                                    <option value="A1">A1</option><option value="A2">A2</option><option value="B1">B1</option><option value="C1">C1</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Formality</label>
                                <select
                                    name="formality"
                                    key={editingVocab?.id ? `formality-${editingVocab.id}` : 'new-formality'}
                                    defaultValue={editingVocab?.formality || 'NEUTRAL'}
                                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest outline-none appearance-none"
                                >
                                    <option value="NEUTRAL">Neutral</option><option value="NGOKO">Ngoko</option><option value="KRAMA">Krama</option><option value="KRAMA_INGGIL">Krama Inggil</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
                            <select
                                name="category"
                                key={editingVocab?.id ? `category-${editingVocab.id}` : 'new-category'}
                                defaultValue={editingVocab?.category || ''}
                                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest outline-none appearance-none"
                            >
                                <option value="">General</option>
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
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phonetic</label>
                            <input
                                name="phonetic"
                                key={editingVocab?.id ? `phonetic-${editingVocab.id}` : 'new-phonetic'}
                                defaultValue={editingVocab?.phonetic}
                                className="w-full px-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-medium italic text-slate-500"
                                placeholder="/phonetic/"
                            />
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-slate-800" />

                        {/* Learning Context */}
                        <div className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Mnemonic / AI Hint</label>
                                <input
                                    name="aiHint"
                                    key={editingVocab?.id ? `hint-${editingVocab.id}` : 'new-hint'}
                                    defaultValue={editingVocab?.aiHint}
                                    className="w-full px-6 py-4 bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-900/20 rounded-2xl font-bold text-sm tracking-tight"
                                    placeholder="Memory hook..."
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Contextual Example</label>
                                <input
                                    name="exampleJavanese"
                                    key={editingVocab?.id ? `ex-jv-${editingVocab.id}` : 'new-ex-jv'}
                                    defaultValue={editingVocab?.exampleJavanese}
                                    className="w-full px-6 py-4 bg-emerald-50/30 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-900/20 rounded-2xl font-black text-sm"
                                    placeholder="Javanese sentence..."
                                />
                                <input
                                    name="exampleDutch"
                                    key={editingVocab?.id ? `ex-nl-${editingVocab.id}` : 'new-ex-nl'}
                                    defaultValue={editingVocab?.exampleDutch}
                                    className="w-full px-6 py-4 bg-emerald-50/10 dark:bg-emerald-900/5 border border-emerald-100/20 dark:border-emerald-900/10 rounded-2xl font-medium italic text-sm"
                                    placeholder="Dutch translation..."
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-amber-600">Linguistic Notes</label>
                            <textarea
                                name="notes"
                                key={editingVocab?.id ? `notes-${editingVocab.id}` : 'new-notes'}
                                defaultValue={editingVocab?.notes}
                                className="w-full px-6 py-4 bg-amber-50/30 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-900/20 rounded-2xl font-medium text-sm min-h-[80px] resize-none"
                                placeholder="Usage tips, cultural context..."
                            />
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-slate-800" />

                        {/* Media & Tags */}
                        <div className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Audio Asset Path</label>
                                <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                                    <span className="material-symbols-outlined text-blue-600 p-2">audio_file</span>
                                    <input
                                        name="audioUrl"
                                        key={editingVocab?.id ? `audio-${editingVocab.id}` : 'new-audio'}
                                        defaultValue={editingVocab?.audioUrl}
                                        className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-slate-500"
                                        placeholder="/uploads/filename.mp3"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Categorization Tags</label>
                                <input
                                    name="tags"
                                    key={editingVocab?.id ? `tags-${editingVocab.id}` : 'new-tags'}
                                    defaultValue={editingVocab?.tags?.join(", ")}
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-xs"
                                    placeholder="Family, travel, food..."
                                />
                            </div>
                        </div>

                        <div className="h-24" />
                    </form>
                </div>

                {/* Drawer Footer */}
                <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl sticky bottom-0 z-10">
                    <button
                        form="quick-edit-form"
                        type="submit"
                        className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/30 transition-all hover:-translate-y-1 active:scale-[0.98] active:translate-y-0"
                    >
                        {editingVocab ? 'Update Entry' : 'Store Entry'}
                    </button>
                </div>
            </aside>

            {/* Drawer Overlay */}
            {isQuickEditOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[140] animate-in fade-in duration-500"
                    onClick={() => setIsQuickEditOpen(false)}
                />
            )}

            {/* Bulk Import Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsImportModalOpen(false)} />
                    <div className="relative w-full max-w-5xl bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">Bulk Vocabulary Import</h2>
                                <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Upload JSON or CSV dictionary files</p>
                            </div>
                            <button onClick={() => setIsImportModalOpen(false)} className="p-4 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all">
                                <span className="material-symbols-outlined text-3xl">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
                            {previewVocab.length === 0 ? (
                                <div
                                    className="border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center gap-6 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all cursor-pointer group"
                                    onClick={() => document.getElementById('vocab-upload')?.click()}
                                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const file = e.dataTransfer.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (re) => {
                                                try {
                                                    const data = JSON.parse(re.target?.result as string);
                                                    setPreviewVocab(Array.isArray(data) ? data : [data]);
                                                } catch (err) {
                                                    alert("Failed to parse JSON file");
                                                }
                                            };
                                            reader.readAsText(file);
                                        }
                                    }}
                                >
                                    <input
                                        type="file"
                                        id="vocab-upload"
                                        className="hidden"
                                        accept=".json,.csv"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (re) => {
                                                    try {
                                                        const data = JSON.parse(re.target?.result as string);
                                                        setPreviewVocab(Array.isArray(data) ? data : [data]);
                                                    } catch (err) {
                                                        alert("Failed to parse JSON file");
                                                    }
                                                };
                                                reader.readAsText(file);
                                            }
                                        }}
                                    />
                                    <div className="w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-5xl text-blue-600">upload_file</span>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Drag & Drop Vocabulary File</h3>
                                        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">or click to browse local files</p>
                                    </div>
                                    <div className="flex gap-3 mt-4">
                                        <span className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-[10px] font-black uppercase text-slate-500 tracking-widest">Supports JSON</span>
                                        <span className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-[10px] font-black uppercase text-slate-500 tracking-widest">Auto-Upsert</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Import Preview ({previewVocab.length} items)</h3>
                                        <button onClick={() => setPreviewVocab([])} className="text-xs font-black uppercase tracking-widest text-red-500 hover:underline">Clear List</button>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    <th className="px-8 py-4">Word</th>
                                                    <th className="px-8 py-4">Translation</th>
                                                    <th className="px-8 py-4">Level</th>
                                                    <th className="px-8 py-4">Category</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {previewVocab.slice(0, 50).map((v, i) => (
                                                    <tr key={i} className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                        <td className="px-8 py-4 text-blue-600 font-black">{v.word || v.javanese}</td>
                                                        <td className="px-8 py-4">{v.translation || v.dutch}</td>
                                                        <td className="px-8 py-4 uppercase">{v.level || "A1"}</td>
                                                        <td className="px-8 py-4">{v.category || "-"}</td>
                                                    </tr>
                                                ))}
                                                {previewVocab.length > 50 && (
                                                    <tr>
                                                        <td colSpan={4} className="px-8 py-4 text-center text-slate-400 text-xs italic">
                                                            + {previewVocab.length - 50} more items...
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-10 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex justify-end gap-6 items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-auto italic">
                                *Duplicates will be automatically updated
                            </span>
                            <button onClick={() => setIsImportModalOpen(false)} className="px-10 py-4 text-sm font-bold text-slate-500 hover:text-slate-900">Cancel</button>
                            <button
                                disabled={previewVocab.length === 0}
                                onClick={async () => {
                                    const result = await bulkUploadVocabAction(previewVocab) as any;
                                    if (result.success) {
                                        alert(`Success! Created: ${result.createdCount}, Updated: ${result.updatedCount}`);
                                        setIsImportModalOpen(false);
                                        setPreviewVocab([]);
                                        router.refresh();
                                    } else {
                                        alert(result.error);
                                    }
                                }}
                                className="px-16 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/20 disabled:opacity-30 disabled:translate-y-0 transition-all hover:-translate-y-1 active:scale-95"
                            >
                                Process & Import
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isFullEditorOpen && (
                <VocabularyFullEditor
                    vocab={editingVocab}
                    onClose={() => setIsFullEditorOpen(false)}
                    onSave={async (formData: FormData) => {
                        const result = editingVocab
                            ? await updateVocabularyAction(editingVocab.id, formData)
                            : await addVocabularyAction(formData);
                        if (result.success) {
                            setIsFullEditorOpen(false);
                            router.refresh();
                        } else {
                            alert(result.error);
                        }
                    }}
                />
            )}
            {isScenarioModalOpen && (
                <AITutorScenarioEditor
                    scenario={editingScenario}
                    allModules={allModules}
                    onClose={() => setIsScenarioModalOpen(false)}
                    onSave={handleSaveScenario}
                />
            )}
        </div>
    );
}
