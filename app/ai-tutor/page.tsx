"use client";

import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";
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
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100">
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden relative">
                {/* Deep Batik Decoration Background */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] -mr-64 -mt-64 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -ml-48 -mb-48 pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none batik-pattern z-0" />

                <div className="flex-1 grid grid-cols-1 xl:grid-cols-[380px_1fr] 2xl:grid-cols-[380px_1fr_340px] relative z-10 overflow-hidden min-w-0 min-h-0 w-full">
                    {/* Column 1: Scenarios (Left) */}
                    <aside className="flex flex-col border-r border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl hidden xl:flex overflow-hidden relative">
                        <div className="p-10 pb-6">
                            <div className="flex flex-col gap-2 mb-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 w-fit">
                                    <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Spreken & Dialogen</span>
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mt-2">
                                    Learning <span className="text-primary">Paths</span>
                                </h1>
                            </div>

                            <div className="flex gap-2 p-1.5 bg-slate-100/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <button
                                    onClick={() => setActiveTab("recommended")}
                                    className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'recommended' ? 'bg-white dark:bg-slate-700 text-primary shadow-md shadow-primary/5' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                                >
                                    Focus
                                </button>
                                <button
                                    onClick={() => setActiveTab("daily")}
                                    className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'daily' ? 'bg-white dark:bg-slate-700 text-primary shadow-md shadow-primary/5' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                                >
                                    Explore
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-4 custom-scrollbar">
                            {isLoadingData ? (
                                <div className="space-y-4 pt-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-32 bg-slate-200/50 dark:bg-slate-800/50 animate-pulse rounded-[2.5rem]" />
                                    ))}
                                </div>
                            ) : (
                                scenarios
                                    .filter(s => s.published !== false)
                                    .filter(s => activeTab === 'recommended' ? s.category === 'Recommended' : s.category !== 'Recommended')
                                    .map((scenario) => (
                                        <div
                                            key={scenario.id}
                                            className={`group relative p-6 rounded-[2.5rem] border-2 transition-all duration-300 cursor-pointer ${activeScenario === scenario.slug
                                                ? 'bg-white dark:bg-slate-900 border-primary shadow-2xl shadow-primary/10'
                                                : 'bg-white/30 dark:bg-slate-950/30 border-transparent hover:border-slate-200 dark:hover:border-slate-800'}`}
                                            onClick={() => setActiveScenario(scenario.slug)}
                                        >
                                            <div className="flex gap-5 items-start">
                                                <div className={`size-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${activeScenario === scenario.slug ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/25' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                                    <span className="material-symbols-outlined text-3xl font-light leading-none">{scenario.icon}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/70">{scenario.category}</span>
                                                    </div>
                                                    <h3 className="font-black text-lg truncate text-slate-900 dark:text-white tracking-tight leading-none mb-1.5">{scenario.title}</h3>
                                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">{scenario.description}</p>
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
                    <section className="flex-1 flex flex-col relative h-full min-w-0 min-h-0 bg-white/20 dark:bg-slate-950/20 backdrop-blur-sm">
                        {/* Chat Header */}
                        <div className="h-28 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-10 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl z-20 shrink-0">
                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-primary/20 rounded-[1.5rem] blur-xl group-hover:scale-125 transition-transform" />
                                    <div className="relative size-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-xl border-2 border-white dark:border-slate-800 overflow-hidden">
                                        <Image
                                            src="/images/chat-avatar.png"
                                            alt="Furnie Avatar"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h2 className="font-black text-2xl tracking-tighter text-slate-900 dark:text-white leading-none">
                                        {scenarios.find(s => s.slug === activeScenario)?.title || 'AI Tutor'}
                                    </h2>
                                    <div className="flex items-center gap-2.5">
                                        <span className="size-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500/50" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Furnie AI • Ngoko Specialisme</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="hidden md:flex flex-col items-end mr-4">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Status</span>
                                    <span className="text-xs font-black text-primary">ONLINE</span>
                                </div>
                                {/* Mobile Scenario Switcher */}
                                <div className="xl:hidden">
                                    <button className="size-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 border border-slate-100 dark:border-slate-800 shadow-sm">
                                        <span className="material-symbols-outlined">menu_open</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-6 md:px-12 py-12 space-y-10 custom-scrollbar relative z-10">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex gap-6 ${msg.sender === 'user' ? 'flex-row-reverse ml-auto' : ''} max-w-[90%] md:max-w-[80%]`}>
                                    <div className={`size-12 rounded-[1.25rem] shrink-0 flex items-center justify-center border-2 transition-all mt-6 overflow-hidden ${msg.sender === 'ai'
                                        ? 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 shadow-sm'
                                        : 'bg-primary border-primary shadow-lg shadow-primary/20'}`}>
                                        {msg.sender === 'ai' ? (
                                            <div className="relative size-full">
                                                <Image
                                                    src="/images/chat-avatar.png"
                                                    alt="Furnie"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <span className="material-symbols-outlined text-2xl font-light text-white">
                                                person
                                            </span>
                                        )}
                                    </div>
                                    <div className={`flex flex-col gap-2.5 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-3 px-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{msg.sender === 'ai' ? 'Furnie AI' : 'Jij'}</span>
                                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{msg.timestamp}</span>
                                        </div>
                                        <div className={`group relative p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none transition-all ${msg.sender === 'user'
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-tr-[0.5rem]'
                                            : 'bg-white dark:bg-slate-900/80 backdrop-blur-xl text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-tl-[0.5rem]'
                                            }`}>
                                            <div className="prose dark:prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-strong:text-primary prose-strong:font-black text-[15px] md:text-[16px] font-medium leading-relaxed">
                                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                                            </div>

                                            {msg.translation && (
                                                <div className="mt-5 text-sm font-bold text-blue-600 dark:text-blue-400 p-5 bg-blue-50/50 dark:bg-blue-900/20 rounded-[1.5rem] border border-blue-100 dark:border-blue-900/50 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <div className="flex items-center gap-2.5 mb-2">
                                                        <div className="size-6 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-xs">translate</span>
                                                        </div>
                                                        <span className="text-[10px] uppercase font-black tracking-[0.2em]">Vertaling</span>
                                                    </div>
                                                    <p className="leading-relaxed">{msg.translation}</p>
                                                </div>
                                            )}

                                            {/* Quick Actions Hover for AI Messages */}
                                            {msg.sender === 'ai' && !msg.isStreaming && (
                                                <div className="absolute top-0 -right-14 opacity-0 group-hover:opacity-100 transition-all flex flex-col gap-3 py-2">
                                                    <button
                                                        onClick={() => handleTranslate(msg.id, msg.text)}
                                                        className="size-11 bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary hover:scale-110 active:scale-95 transition-all group/btn"
                                                        title="Vertaal"
                                                    >
                                                        <span className="material-symbols-outlined text-2xl font-light">translate</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleSaveWord(msg.id, msg.text)}
                                                        disabled={msg.isSaving}
                                                        className="size-11 bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary hover:scale-110 active:scale-95 transition-all disabled:opacity-30 group/btn"
                                                        title="Sla woord op"
                                                    >
                                                        <span className="material-symbols-outlined text-2xl font-light">{msg.isSaving ? 'sync' : 'bookmark_add'}</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex gap-6 max-w-[80%]">
                                    <div className="size-12 rounded-[1.25rem] bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0 animate-pulse mt-6 shadow-sm overflow-hidden">
                                        <div className="relative size-full">
                                            <Image
                                                src="/images/chat-avatar.png"
                                                alt="Furnie Loading"
                                                fill
                                                className="object-cover grayscale"
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] rounded-tl-[0.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex gap-2.5 items-center">
                                        <span className="size-2 rounded-full bg-primary animate-bounce"></span>
                                        <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-8 md:px-14 md:pb-12 bg-white/60 dark:bg-slate-950/60 backdrop-blur-2xl border-t border-slate-200/50 dark:border-slate-800/50 shrink-0 relative z-20">
                            {/* Suggestions */}
                            <div className="flex gap-3 mb-8 overflow-x-auto scrollbar-hide pb-2">
                                {suggestions.map((suggestion, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSendMessage(suggestion)}
                                        className="px-6 py-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary hover:shadow-xl hover:shadow-primary/5 transition-all whitespace-nowrap active:scale-95 flex items-center gap-3 group/sug"
                                    >
                                        <span className="size-2 bg-primary/20 rounded-full group-hover/sug:bg-primary transition-colors" />
                                        {suggestion}
                                    </button>
                                ))}
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSendMessage(inputValue);
                                }}
                                className="relative flex items-center gap-5 bg-white dark:bg-slate-900 p-2.5 pl-8 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none focus-within:border-primary focus-within:ring-8 focus-within:ring-primary/5 transition-all duration-500"
                            >
                                <div className="flex-1">
                                    <input
                                        ref={inputRef}
                                        className="w-full bg-transparent border-none py-5 text-slate-900 dark:text-white font-bold text-lg placeholder:text-slate-300 placeholder:font-black placeholder:uppercase placeholder:text-[10px] placeholder:tracking-[0.4em] outline-none"
                                        placeholder="Typ je bericht in Ngoko..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isTyping}
                                    className="size-16 rounded-full bg-primary text-white shadow-2xl shadow-primary/30 hover:bg-primary-dark hover:scale-110 active:scale-95 transition-all flex items-center justify-center shrink-0 disabled:opacity-30 disabled:scale-100 group/send"
                                >
                                    <span className="material-symbols-outlined text-4xl font-light group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">send</span>
                                </button>
                            </form>
                        </div>
                    </section>

                    {/* Column 3: Learning Insights (Right) */}
                    <aside className="flex flex-col border-l border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl hidden 2xl:flex overflow-hidden">
                        <div className="p-10 space-y-12">
                            {/* Progress Section */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 px-1">Learning Mastery</h4>
                                {userProgress && (
                                    <div className="space-y-8">
                                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-125 transition-transform duration-700">
                                                <span className="material-symbols-outlined text-7xl leading-none">military_tech</span>
                                            </div>
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Huidige Rank</p>
                                                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Niveau {userProgress.level}</h3>
                                                <div className="mt-6 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(43,238,121,0.5)]" style={{ width: `${(userProgress.xp % 100)}%` }} />
                                                </div>
                                                <div className="flex justify-between items-center mt-3">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{(userProgress.xp % 100)} / 100 XP</p>
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">VOLGENDE NIVEAU</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm text-center group hover:border-orange-500/30 transition-colors">
                                                <div className="size-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-500 mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                    <span className="material-symbols-outlined text-2xl font-light">bolt</span>
                                                </div>
                                                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-1">{userProgress.xp}</p>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total XP</p>
                                            </div>
                                            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm text-center group hover:border-blue-500/30 transition-colors">
                                                <div className="size-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-500 mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                    <span className="material-symbols-outlined text-2xl font-light">menu_book</span>
                                                </div>
                                                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-1">{userProgress.completedLessons}</p>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Lessen</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Context Insights */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 px-1">Scenario Expert</h4>
                                <div className="space-y-6">
                                    <div className="bg-indigo-50/50 dark:bg-indigo-900/20 p-8 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800 relative overflow-hidden group">
                                        <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:rotate-12 transition-transform">
                                            <span className="material-symbols-outlined text-8xl">psychology</span>
                                        </div>
                                        <div className="flex items-center gap-3 mb-4 relative z-10">
                                            <div className="size-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                                                <span className="material-symbols-outlined text-lg">lightbulb</span>
                                            </div>
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Furnie's Tip</label>
                                        </div>
                                        <p className="text-[13px] font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic relative z-10 pr-4">
                                            "Probeer eens te antwoorden met **Maturnuwun** als je iemand wilt bedanken!"
                                        </p>
                                    </div>

                                    <div className="p-8 rounded-[2.5rem] bg-slate-900 dark:bg-black text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
                                        <div className="absolute inset-0 batik-pattern opacity-5" />
                                        <h5 className="font-black text-base mb-3 relative z-10 tracking-tight">Wist je dat?</h5>
                                        <p className="text-[12px] text-slate-400 leading-relaxed font-medium relative z-10 opacity-90 pr-4">
                                            In het Ngoko-Javaans houden we zinnen kort en informeel. Het is alsof je met je beste vriend praat!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
