"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { submitFeedbackAction } from "@/app/actions/feedback";
import { MOCK_USER_ID } from "@/lib/mock-auth";

export default function FeedbackButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [type, setType] = useState("BUG");
    const [priority, setPriority] = useState("MEDIUM");
    const [success, setSuccess] = useState(false);
    const pathname = usePathname();

    // Auto-detect context from URL
    const isLessonPage = pathname.startsWith("/lessons/");
    const lessonSlug = isLessonPage ? pathname.split("/").pop() : null;

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append("userId", MOCK_USER_ID);
        formData.append("message", message);
        formData.append("feedbackType", type);
        formData.append("pageUrl", typeof window !== "undefined" ? window.location.href : "");
        formData.append("priority", priority);

        // In a real app, we might want to look up lessonId from slug, 
        // but for now we'll pass the URL which the admin can use.
        // We could also add lessonId if we had it in props, but this is a global button.

        const res = await submitFeedbackAction(formData);

        if (res.success) {
            setSuccess(true);
            setTimeout(() => {
                setIsOpen(false);
                setSuccess(false);
                setMessage("");
            }, 2000);
        } else {
            alert(res.error || "Failed to submit feedback.");
        }
        setIsSubmitting(false);
    };

    if (pathname.startsWith("/admin")) return null;

    return (
        <>
            {/* Floating Button */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 z-[100] bg-indigo-600 dark:bg-indigo-500 text-white p-4 rounded-3xl shadow-2xl shadow-indigo-500/30 flex items-center justify-center transition-shadow hover:shadow-indigo-500/50 group overflow-hidden"
            >
                <div className="absolute inset-0 bg-batik-pattern opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <span className="material-symbols-outlined text-2xl relative z-10 transition-transform group-hover:rotate-12">
                    chat_bubble
                </span>
                <span className="max-w-0 group-hover:max-w-xs group-hover:ml-2 overflow-hidden transition-all duration-500 text-xs font-black uppercase tracking-widest whitespace-nowrap relative z-10">
                    Feedback
                </span>
            </motion.button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isSubmitting && setIsOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                        >
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none dark:invert batik-pattern"></div>

                            {success ? (
                                <div className="p-12 text-center space-y-6 relative z-10">
                                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
                                        <span className="material-symbols-outlined text-4xl">check_circle</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Terima Kasih!</h2>
                                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Je feedback is succesvol verzonden.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 relative z-20">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Feedback & Rapportage</h2>
                                            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Help ons AyoSinau te verbeteren</p>
                                        </div>
                                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                            <span className="material-symbols-outlined text-slate-400">close</span>
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="p-10 space-y-8 relative z-10">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 ml-1">Type Feedback</label>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                {[
                                                    { id: "TYPO", icon: "edit", label: "Typfout" },
                                                    { id: "BUG", icon: "bug_report", label: "Bug" },
                                                    { id: "CONTENT_ISSUE", icon: "menu_book", label: "Inhoud" },
                                                    { id: "SUGGESTION", icon: "lightbulb", label: "Idee" },
                                                ].map((t) => (
                                                    <button
                                                        key={t.id}
                                                        type="button"
                                                        onClick={() => setType(t.id)}
                                                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${type === t.id
                                                            ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 scale-[1.02]"
                                                            : "bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                            }`}
                                                    >
                                                        <span className="material-symbols-outlined text-xl">{t.icon}</span>
                                                        <span className="text-[10px] font-bold uppercase">{t.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bericht</label>
                                            <textarea
                                                required
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder="Beschrijf het probleem of geef een suggestie..."
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-4 focus:ring-indigo-500/10 outline-none min-h-[120px] resize-none"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between pt-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2">Prioriteit</span>
                                                <div className="flex gap-2">
                                                    {["LOW", "MEDIUM", "HIGH"].map((p) => (
                                                        <button
                                                            key={p}
                                                            type="button"
                                                            onClick={() => setPriority(p)}
                                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${priority === p
                                                                ? p === "HIGH" ? "bg-red-500 text-white" : p === "MEDIUM" ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
                                                                : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                                                }`}
                                                        >
                                                            {p}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isSubmitting || message.length < 3}
                                                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black uppercase text-xs tracking-widest px-8 py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2"
                                            >
                                                {isSubmitting ? (
                                                    <span className="material-symbols-outlined animate-spin">sync</span>
                                                ) : (
                                                    <span className="material-symbols-outlined">send</span>
                                                )}
                                                Verzenden
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
