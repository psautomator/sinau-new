"use client";

import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

interface Message {
    id: string;
    text: string;
    sender: "user" | "ai";
    timestamp: string;
    tip?: string;
    translation?: string;
    isCorrect?: boolean;
}

export default function AITutorPage() {
    const [activeScenario, setActiveScenario] = useState("warung");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "Sugeng rawuh! 👋 Arep pesen opo nang warung iki? Kene ono soto, rawon, karo gudeg.",
            sender: "ai",
            timestamp: "10:23 AM",
            translation: "Welcome! What would you like to order at this stall? We have soto, rawon, and gudeg."
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = (text: string) => {
        if (!text.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text,
            sender: "user",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isCorrect: true
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputValue("");
        setIsTyping(true);

        // Mock AI response
        setTimeout(() => {
            setIsTyping(false);
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "Inggih, soto ayam napa soto daging, Mas? Ngangge sekul napa mboten?",
                sender: "ai",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                translation: "Yes, chicken soto or beef soto? With rice or not?"
            };
            setMessages((prev) => [...prev, aiMsg]);
        }, 1500);
    };

    return (
        <>
            <Sidebar />
            <main className="flex-1 flex overflow-hidden bg-background-light dark:bg-background-dark relative">
                {/* Inner Sidebar: Scenarios */}
                <aside className="w-[350px] flex flex-col border-r border-gray-100 dark:border-gray-800 bg-surface-light dark:bg-surface-dark hidden lg:flex">
                    <div className="p-6 pb-2">
                        <h1 className="text-2xl font-bold mb-4 text-text-main-light dark:text-text-main-dark">
                            Choose a Scenario
                        </h1>
                        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                            <button className="whitespace-nowrap px-4 py-2 rounded-xl bg-primary text-text-main-light text-sm font-bold shadow-sm shadow-primary/30">
                                Recommended
                            </button>
                            <button className="whitespace-nowrap px-4 py-2 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                Daily Life
                            </button>
                            <button className="whitespace-nowrap px-4 py-2 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                Travel
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
                        <div
                            className={`group relative p-4 rounded-2xl shadow-sm border-2 cursor-pointer transition-all ${activeScenario === 'warung' ? 'bg-surface-light dark:bg-surface-dark border-primary' : 'bg-surface-light dark:bg-surface-dark border-transparent hover:border-gray-200 dark:hover:border-gray-700'}`}
                            onClick={() => setActiveScenario('warung')}
                        >
                            {activeScenario === 'warung' && (
                                <div className="absolute -right-2 -top-2 bg-primary text-text-main-light text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">Active</div>
                            )}
                            <div className="flex gap-4 items-start">
                                <div className="size-14 rounded-xl bg-cover bg-center shrink-0" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBKCEfU87Zm4PtQNkBWVATjDx24NffQ_H4GGA7NnGYTpOo8RZqs3tOXD2Elq563YKfCeJVE2Tm0DZ5EmyTIzJHdHkjke8vI90RuqXb_D8shFIf0Xt6rvSS8LlE_Tl851ZReTeoFuWJ40ON0GUjY8P6XUio8ZFOII4mGEQIk-lqv4lDpR-KScp6lCsdBIl5u97JqOjxLtYyCpl4Wp741KOaNol86ihp_j-OSPI2k15GQgv0gJ6_pPgA9mmffoVdKspY1AXWNZ7gJRio')" }}></div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-base truncate text-text-main-light dark:text-text-main-dark">Ordering at a Warung</h3>
                                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 line-clamp-2">Practice ordering food in Ngoko & Krama Alus with a local vendor.</p>
                                    <div className="mt-3">
                                        <div className="flex justify-between text-[10px] font-bold text-text-secondary-light dark:text-text-secondary-dark mb-1">
                                            <span>PROGRESS</span>
                                            <span>15%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary w-[15%] rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="group relative bg-surface-light dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer hover:shadow-md transition-all">
                            <div className="flex gap-4 items-start">
                                <div className="size-14 rounded-xl bg-cover bg-center shrink-0" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDCfBr2GohQSYVJFlL-MeqUdns48EhHkkauR2LXf74-td7aALB6lgsREV_kgXa34cs9IUIXEvtTU1x0uK_cojKYyJWR1dj-6RJPNNApNWFVQBJwLG2vihtz8k8SU0wZKJ0Wd4tFUdKROyXJD9ObXPl-VRJbVRluZIuLLRAaucYmLv4olp_Iv36qW4U4gD5zSlrudxyVUSUpqX8dyWSdoP54OeEE_L4R8sYhVtMW_CDeaJ8Pvg6ZEDsbYXYHSR3w81SBf705JrGIcYI')" }}></div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-base truncate text-text-main-light dark:text-text-main-dark">Bargaining at Pasar Gede</h3>
                                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 line-clamp-2">Learn numbers and bargaining phrases in a busy market setting.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Right Side: Chat Interface */}
                <section className="flex-1 flex flex-col bg-background-light dark:bg-background-dark relative h-full">
                    {/* Chat Header */}
                    <div className="h-16 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 bg-surface-light/80 dark:bg-surface-dark/90 backdrop-blur-sm z-10 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="size-10 bg-primary/20 rounded-full flex items-center justify-center text-primary-dark dark:text-primary">
                                <span className="material-symbols-outlined">restaurant</span>
                            </div>
                            <div>
                                <h2 className="font-bold text-sm md:text-base leading-tight text-text-main-light dark:text-text-main-dark">Ordering at a Warung</h2>
                                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Daily Life • Ngoko & Krama Alus</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <span className="material-symbols-outlined text-[18px]">translate</span>
                                <span>Dictionary</span>
                            </button>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse ml-auto max-w-[80%]' : 'max-w-[80%]'}`}>
                                {msg.sender === 'ai' ? (
                                    <div className="size-10 rounded-full bg-cover bg-center shrink-0 border border-gray-100 dark:border-gray-700" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBS94_sg9fgl-czeASZ5w5xcLHGoVZ1k1k0wUmUgabn9XQG_hzSE3zqhI_EZkXHR-W5_WyDAA2YpQ3Kfi8n5SgvSfVutMIeb44_PuLrcp_lgGD8u_ilKw5lJVtSVsTT9ckzPwSQvMn0oluy-ga8ephXxERaDVDp8fjnW6oIYPlTIVGqhZof-Oxa4s92W2-ee2THSvKLaOVYFZyY0WyZZ7tp1TrYai_RW3LpbKgZmcICvNDt05jD9U-GZhMu_GdZLt5M89NKihTvt7k')" }}></div>
                                ) : (
                                    <div className="size-10 rounded-full bg-cover bg-center shrink-0 border-2 border-primary" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuClTxNYdt-oCn9K6WnkjjCBSFrlQWgc5oi9bQpHLXJC50AwOB4737NrBrJiPgRpH5jPdf1KNkMWNqjfkEuQfLzUPleMrnn_SWPl8k4L8efWCZeqeKmk4hc1tuu3ykUn-k9WkeZhOS6fedx8GVg2-cBf-T7E2k7RflV43sm11KiFKapYIAeMervogMkCwi28EDq1yP6VzVOWiKcjBTyEGyGg6BxHgxHPyt51LldIrWfdGjmY3dYP29Xr30lCwoogaHyUyIUrZpg78_w')" }}></div>
                                )}
                                <div className={`flex flex-col gap-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                    <span className="text-xs font-bold text-gray-500">{msg.sender === 'ai' ? 'Furnie AI' : 'You'}</span>
                                    <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm border ${msg.sender === 'user'
                                            ? 'bg-primary text-text-main-light border-transparent rounded-tr-none'
                                            : 'bg-white dark:bg-surface-dark text-text-main-light dark:text-gray-100 border-gray-100 dark:border-gray-800 rounded-tl-none'
                                        }`}>
                                        <p>{msg.text}</p>
                                        {msg.translation && (
                                            <p className="mt-2 text-xs opacity-60 italic border-t border-black/5 dark:border-white/5 pt-2">{msg.translation}</p>
                                        )}
                                    </div>
                                    {msg.tip && (
                                        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-xl p-3 mt-2 max-w-sm">
                                            <div className="flex gap-2 items-start">
                                                <span className="material-symbols-outlined text-orange-500 text-[18px] mt-0.5">auto_awesome</span>
                                                <p className="text-xs text-text-main-light dark:text-gray-300 leading-normal">{msg.tip}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex gap-4 max-w-[80%]">
                                <div className="size-10 rounded-full bg-cover bg-center shrink-0 border border-gray-100 dark:border-gray-700" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBS94_sg9fgl-czeASZ5w5xcLHGoVZ1k1k0wUmUgabn9XQG_hzSE3zqhI_EZkXHR-W5_WyDAA2YpQ3Kfi8n5SgvSfVutMIeb44_PuLrcp_lgGD8u_ilKw5lJVtSVsTT9ckzPwSQvMn0oluy-ga8ephXxERaDVDp8fjnW6oIYPlTIVGqhZof-Oxa4s92W2-ee2THSvKLaOVYFZyY0WyZZ7tp1TrYai_RW3LpbKgZmcICvNDt05jD9U-GZhMu_GdZLt5M89NKihTvt7k')" }}></div>
                                <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-800 shadow-sm flex gap-1">
                                    <span className="size-1.5 rounded-full bg-gray-400 animate-bounce"></span>
                                    <span className="size-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="size-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 md:px-8 md:pb-8 bg-surface-light dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 shrink-0">
                        <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
                            <button onClick={() => handleSendMessage("Soto ayam mawon")} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary transition-colors whitespace-nowrap">
                                Soto ayam mawon
                            </button>
                            <button onClick={() => handleSendMessage("Kula nyuwun soto daging")} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary transition-colors whitespace-nowrap">
                                Kula nyuwun soto daging
                            </button>
                        </div>
                        <div className="relative flex items-end gap-2">
                            <div className="flex-1 relative">
                                <input
                                    className="w-full bg-gray-50 dark:bg-background-dark border-0 rounded-2xl py-4 pl-5 pr-12 text-text-main-light dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary/50 shadow-inner resize-none"
                                    placeholder="Hold mic to speak or type here..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                                    type="text"
                                />
                                <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined">sentiment_satisfied</span>
                                </button>
                            </div>
                            <button className="size-14 rounded-2xl bg-primary text-text-main-light shadow-lg shadow-primary/40 hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[28px]">mic</span>
                            </button>
                            <button
                                onClick={() => handleSendMessage(inputValue)}
                                className="size-14 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center shrink-0"
                            >
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
