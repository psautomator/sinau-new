"use client";

import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { streamTutorResponse, translateMessage, saveWordToLibrary, getScenarios, getUserProgress, type ChatMessage } from "./actions";
import ReactMarkdown from "react-markdown";

interface DisplayMessage {
    id: string;
    text: string;
    sender: "user" | "ai";
    timestamp: string;
    translation?: string;
    isStreaming?: boolean;
    isSaving?: boolean;
}

export default function AITutorPage() {
    const [scenarios, setScenarios] = useState<any[]>([]);
    const [userProgress, setUserProgress] = useState<any>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [activeTab, setActiveTab] = useState("recommended");
    const [activeScenario, setActiveScenario] = useState("kennismaking");
    const [messages, setMessages] = useState<DisplayMessage[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    useEffect(() => {
        if (scenarios.length === 0) return;

        const currentScenarioData = scenarios.find(s => s.slug === activeScenario);
        if (!currentScenarioData) return;

        setMessages([{
            id: `init-${activeScenario}`,
            text: currentScenarioData.initialMessage,
            sender: "ai",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);

        setSuggestions(currentScenarioData.initialSuggestions || []);
    }, [activeScenario, scenarios]);

    // Load Scenarios and Progress on Mount
    useEffect(() => {
        async function loadInitialData() {
            try {
                const [scs, progress] = await Promise.all([
                    getScenarios(),
                    getUserProgress()
                ]);
                setScenarios(scs);
                setUserProgress(progress);

                // If there's a first scenario, set it
                if (scs.length > 0) {
                    setActiveScenario(scs[0].slug);
                }
            } catch (error) {
                console.error("Failed to load AI Tutor data:", error);
            } finally {
                setIsLoadingData(false);
            }
        }
        loadInitialData();
    }, []);
    // Focus Input without scrolling
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Prevent automatic scrolling on focus
        inputRef.current?.focus({ preventScroll: true });
    }, []);

    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    // Use container ref instead of element ref for scrolling
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        const container = chatContainerRef.current;
        if (container) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: "smooth"
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || isTyping) return;

        const userMsg: DisplayMessage = {
            id: Date.now().toString(),
            text,
            sender: "user",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const newDisplayMessages = [...messages, userMsg];
        setMessages(newDisplayMessages);
        setInputValue("");
        setIsTyping(true);

        // Re-focus input after sending
        inputRef.current?.focus({ preventScroll: true });

        // Convert DisplayMessage to ChatMessage for the API
        const history: ChatMessage[] = newDisplayMessages.map(m => ({
            role: m.sender === 'ai' ? 'model' : 'user',
            content: m.text
        }));

        try {
            const stream = await streamTutorResponse(history, "Leerling", activeScenario);
            const reader = stream.getReader();
            const decoder = new TextDecoder();

            const aiMsgId = (Date.now() + 1).toString();
            let accumulatedContent = "";

            // Add initial empty AI message
            setMessages(prev => [...prev, {
                id: aiMsgId,
                text: "",
                sender: "ai",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isStreaming: true
            }]);

            setIsTyping(false);

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                accumulatedContent += decoder.decode(value, { stream: true });

                // Parse suggestions if present
                const suggestionsMatch = accumulatedContent.match(/<suggestions>(.*?)<\/suggestions>/);
                if (suggestionsMatch) {
                    try {
                        const parsedSuggestions = JSON.parse(suggestionsMatch[1]);
                        setSuggestions(parsedSuggestions);
                    } catch (e) { }
                }

                const cleanedText = accumulatedContent.replace(/<suggestions>.*?<\/suggestions>/, "").trim();

                setMessages(prev => prev.map(m =>
                    m.id === aiMsgId ? { ...m, text: cleanedText } : m
                ));
            }

            // Final update to remove streaming flag
            setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, isStreaming: false } : m
            ));

        } catch (error) {
            console.error('Error in AI Tutor:', error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                text: "Oeps! Er ging iets mis bij het praten met Furnie. Probeer het later opnieuw.",
                sender: "ai",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }]);
            setIsTyping(false);
        }
    };

    // ... handleTranslate and handleSaveWord remain the same ...

    const handleTranslate = async (messageId: string, text: string) => {
        try {
            const translation = await translateMessage(text);
            setMessages(prev => prev.map(m =>
                m.id === messageId ? { ...m, translation } : m
            ));
        } catch (e) {
            console.error("Translation failed", e);
        }
    };

    const handleSaveWord = async (messageId: string, text: string) => {
        const boldMatch = text.match(/\*\*(.*?)\*\*/);
        const wordToSave = boldMatch ? boldMatch[1] : text.split(' ')[0];

        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isSaving: true } : m));

        try {
            await saveWordToLibrary(wordToSave, "Geleerd van AI Tutor");
            setTimeout(() => {
                setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isSaving: false, translation: `✅ Woord "${wordToSave}" opgeslagen!` } : m));
            }, 500);
        } catch (e) {
            console.error("Save failed", e);
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isSaving: false } : m));
        }
    };

    return (
        <>
            <Sidebar />
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-slate-50 dark:bg-slate-950 relative">
                {/* Background Decoration */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none batik-pattern z-0" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="flex-1 grid grid-cols-1 xl:grid-cols-[360px_1fr] 2xl:grid-cols-[360px_1fr_320px] relative z-10 overflow-hidden min-w-0 min-h-0 w-full">
                    {/* Column 1: Scenarios (Left) */}
                    <aside className="flex flex-col border-r border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl hidden xl:flex overflow-hidden relative">
                        <div className="p-8 pb-4">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-6">
                                Learning <span className="text-primary">Paths</span>
                            </h1>
                            <div className="flex gap-2 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/5 dark:border-slate-700/5">
                                <button
                                    onClick={() => setActiveTab("recommended")}
                                    className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'recommended' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Focus
                                </button>
                                <button
                                    onClick={() => setActiveTab("daily")}
                                    className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'daily' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Explore
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-4 custom-scrollbar">
                            {isLoadingData ? (
                                <div className="space-y-4 pt-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-32 bg-slate-200/50 dark:bg-slate-800/50 animate-pulse rounded-[2rem]" />
                                    ))}
                                </div>
                            ) : (
                                scenarios
                                    .filter(s => s.published !== false) // Only show published
                                    .filter(s => activeTab === 'recommended' ? s.category === 'Recommended' : s.category !== 'Recommended')
                                    .map((scenario) => (
                                        <div
                                            key={scenario.id}
                                            className={`group relative p-6 rounded-[2rem] border-2 transition-all duration-300 ${activeScenario === scenario.slug
                                                ? 'bg-white dark:bg-slate-800 border-primary shadow-xl shadow-primary/10'
                                                : 'bg-white/50 dark:bg-slate-900/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`}
                                            onClick={() => setActiveScenario(scenario.slug)}
                                        >
                                            <div className="flex gap-5 items-start">
                                                <div className={`size-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${activeScenario === scenario.slug ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/25' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                                    <span className="material-symbols-outlined text-2xl">{scenario.icon}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">{scenario.category}</span>
                                                    </div>
                                                    <h3 className="font-black text-lg truncate text-slate-900 dark:text-white tracking-tight">{scenario.title}</h3>
                                                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1 line-clamp-2 leading-relaxed">{scenario.description}</p>
                                                </div>
                                            </div>
                                            {activeScenario === scenario.slug && (
                                                <div className="absolute top-1/2 -right-1 translate-x-1/2 -translate-y-1/2 size-3 bg-primary rounded-full ring-4 ring-primary/20" />
                                            )}
                                        </div>
                                    ))
                            )}
                        </div>
                    </aside>

                    {/* Column 2: Chat Workspace (Center) */}
                    <section className="flex-1 flex flex-col relative h-full min-w-0 min-h-0">
                        {/* Chat Header */}
                        <div className="h-24 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-10 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md z-10 shrink-0">
                            <div className="flex items-center gap-5">
                                <div className="size-14 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                    <span className="material-symbols-outlined text-3xl">
                                        {scenarios.find(s => s.slug === activeScenario)?.icon || 'chat'}
                                    </span>
                                </div>
                                <div>
                                    <h2 className="font-black text-xl tracking-tighter text-slate-900 dark:text-white">
                                        {scenarios.find(s => s.slug === activeScenario)?.title || 'AI Tutor'}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="size-2 bg-primary rounded-full animate-pulse" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Furnie AI • Ngoko Specialist</p>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Scenario Switcher (Visible on medium/small) */}
                            <div className="xl:hidden">
                                <button className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500">
                                    <span className="material-symbols-outlined">menu_open</span>
                                </button>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-6 md:px-12 py-10 space-y-8 custom-scrollbar">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex gap-5 ${msg.sender === 'user' ? 'flex-row-reverse ml-auto max-w-[85%]' : 'max-w-[85%]'}`}>
                                    <div className={`size-12 rounded-2xl shrink-0 flex items-center justify-center border-2 transition-all ${msg.sender === 'ai'
                                        ? 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-primary shadow-sm'
                                        : 'bg-primary text-white border-primary shadow-lg shadow-primary/20'}`}>
                                        <span className="material-symbols-outlined text-2xl">
                                            {msg.sender === 'ai' ? 'smart_toy' : 'person_play'}
                                        </span>
                                    </div>
                                    <div className={`flex flex-col gap-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-3 px-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{msg.sender === 'ai' ? 'Furnie' : 'You'}</span>
                                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">{msg.timestamp}</span>
                                        </div>
                                        <div className={`group relative p-6 rounded-3xl text-[16px] leading-relaxed shadow-xl transition-all ${msg.sender === 'user'
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-tr-none'
                                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none'
                                            }`}>
                                            <div className="prose dark:prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-strong:text-primary prose-strong:font-black">
                                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                                            </div>

                                            {msg.translation && (
                                                <div className="mt-4 text-sm font-bold text-blue-600 dark:text-blue-400 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100/50 dark:border-blue-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="material-symbols-outlined text-sm">translate</span>
                                                        <span className="text-[10px] uppercase font-black tracking-widest">Translation</span>
                                                    </div>
                                                    {msg.translation}
                                                </div>
                                            )}

                                            {/* Quick Actions Hover for AI Messages */}
                                            {msg.sender === 'ai' && !msg.isStreaming && (
                                                <div className="absolute top-2 -right-12 opacity-0 group-hover:opacity-100 transition-all flex flex-col gap-2">
                                                    <button onClick={() => handleTranslate(msg.id, msg.text)} className="size-10 bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
                                                        <span className="material-symbols-outlined text-xl">translate</span>
                                                    </button>
                                                    <button onClick={() => handleSaveWord(msg.id, msg.text)} disabled={msg.isSaving} className="size-10 bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary transition-colors disabled:opacity-30">
                                                        <span className="material-symbols-outlined text-xl">{msg.isSaving ? 'sync' : 'bookmark_add'}</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex gap-5 max-w-[85%]">
                                    <div className="size-12 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center text-primary shrink-0 animate-pulse">
                                        <span className="material-symbols-outlined text-2xl">smart_toy</span>
                                    </div>
                                    <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-3xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm flex gap-1.5 items-center">
                                        <span className="size-2 rounded-full bg-primary animate-bounce"></span>
                                        <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 md:px-12 md:pb-10 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 shrink-0">
                            {/* Suggestions */}
                            <div className="flex gap-2.5 mb-6 overflow-x-auto scrollbar-hide pb-2">
                                {suggestions.map((suggestion, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSendMessage(suggestion)}
                                        className="px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 text-xs font-black text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-all whitespace-nowrap shadow-sm active:scale-95 flex items-center gap-2"
                                    >
                                        <span className="size-1.5 bg-primary/40 rounded-full" />
                                        {suggestion}
                                    </button>
                                ))}
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSendMessage(inputValue);
                                }}
                                className="relative flex items-center gap-4 bg-white dark:bg-slate-900 p-2 pl-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-2xl focus-within:ring-4 focus-within:ring-primary/10 transition-all"
                            >
                                <div className="flex-1">
                                    <input
                                        ref={inputRef}
                                        className="w-full bg-transparent border-none py-4 text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-black placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest outline-none"
                                        placeholder="Speak your mind in Ngoko..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isTyping}
                                    className="size-14 rounded-[2rem] bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all flex items-center justify-center shrink-0 disabled:opacity-30 disabled:scale-100"
                                >
                                    <span className="material-symbols-outlined text-3xl font-black">arrow_upward</span>
                                </button>
                            </form>
                        </div>
                    </section>

                    {/* Column 3: Learning Insights (Right) */}
                    <aside className="flex flex-col border-l border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl hidden 2xl:flex overflow-hidden">
                        <div className="p-8 space-y-8">
                            {/* Progress Section */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Learning Mastery</h4>
                                {userProgress && (
                                    <div className="space-y-6">
                                        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/20 dark:shadow-none relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                                <span className="material-symbols-outlined text-5xl">military_tech</span>
                                            </div>
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Rank Status</p>
                                                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Level {userProgress.level}</h3>
                                                <div className="mt-4 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${(userProgress.xp % 100)}%` }} />
                                                </div>
                                                <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">{(userProgress.xp % 100)} / 100 XP to next level</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm text-center">
                                                <span className="material-symbols-outlined text-orange-500 mb-2">bolt</span>
                                                <p className="text-xl font-black text-slate-900 dark:text-white">{userProgress.xp}</p>
                                                <p className="text-[80%] font-black uppercase tracking-widest text-slate-400">Total XP</p>
                                            </div>
                                            <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm text-center">
                                                <span className="material-symbols-outlined text-blue-500 mb-2">menu_book</span>
                                                <p className="text-xl font-black text-slate-900 dark:text-white">{userProgress.completedLessons}</p>
                                                <p className="text-[80%] font-black uppercase tracking-widest text-slate-400">Lessons</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Context Insights */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Scenario Context</h4>
                                <div className="space-y-4">
                                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-[2rem] border border-indigo-100/50 dark:border-indigo-800/50">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="material-symbols-outlined text-indigo-500 text-sm">psychology</span>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Furnie's Hint</label>
                                        </div>
                                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                            "Probeer eens te antwoorden met **Maturnuwun** als je iemand wilt bedanken!"
                                        </p>
                                    </div>

                                    <div className="p-6 rounded-[2rem] bg-slate-900 text-white shadow-2xl shadow-slate-900/20">
                                        <h5 className="font-black text-sm mb-2">Did you know?</h5>
                                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                            In Ngoko Javanese, we keep sentences short and casual. It's like talking to your best friend!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </>
    );
}
