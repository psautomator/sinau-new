"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "success") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <style jsx global>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.9); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .toast-enter {
                    animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`toast-enter pointer-events-auto min-w-[320px] p-4 rounded-2xl shadow-xl border flex items-center gap-4 backdrop-blur-md transition-all ${toast.type === "success"
                                ? "bg-emerald-50/95 dark:bg-emerald-900/50 border-emerald-100 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300"
                                : toast.type === "error"
                                    ? "bg-red-50/95 dark:bg-red-900/50 border-red-100 dark:border-red-800 text-red-900 dark:text-red-300"
                                    : toast.type === "warning"
                                        ? "bg-amber-50/95 dark:bg-amber-900/50 border-amber-100 dark:border-amber-800 text-amber-900 dark:text-amber-300"
                                        : "bg-blue-50/95 dark:bg-blue-900/50 border-blue-100 dark:border-blue-800 text-blue-900 dark:text-blue-300"
                            }`}
                    >
                        <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${toast.type === "success" ? "bg-emerald-500/20 text-emerald-600" :
                                toast.type === "error" ? "bg-red-500/20 text-red-600" :
                                    toast.type === "warning" ? "bg-amber-500/20 text-amber-600" :
                                        "bg-blue-500/20 text-blue-600"
                            }`}>
                            <span className="material-symbols-outlined text-[20px]">
                                {toast.type === "success" ? "check_circle" :
                                    toast.type === "error" ? "error" :
                                        toast.type === "warning" ? "warning" : "info"}
                            </span>
                        </div>
                        <span className="text-sm font-bold flex-1">{toast.message}</span>
                        <button
                            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                            className="opacity-40 hover:opacity-100 transition-opacity p-1"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
