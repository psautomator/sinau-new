"use client";

import { useState } from "react";
import { completeLessonAction } from "@/app/actions/progress";

interface MarkCompleteButtonProps {
    lessonId: string;
    isCompleted: boolean;
}

export default function MarkCompleteButton({ lessonId, isCompleted }: MarkCompleteButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleMarkComplete = async (e: React.MouseEvent) => {
        // Prevent default navigation if this is inside a link, though it should preferably not be
        e.preventDefault();
        e.stopPropagation();

        if (loading) return;
        setLoading(true);

        try {
            await completeLessonAction(lessonId);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (isCompleted) {
        return (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Completed</span>
            </div>
        );
    }

    return (
        <button
            onClick={handleMarkComplete}
            disabled={loading}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300 text-xs font-bold ${loading
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-wait"
                : "bg-white dark:bg-slate-800 text-gray-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5 dark:text-gray-400 dark:hover:text-primary dark:border-gray-700"
                }`}
            title="Mark as done"
        >
            <span className={`material-symbols-outlined text-[18px] ${loading ? "animate-spin" : ""}`}>
                {loading ? "refresh" : "check_circle_outline"}
            </span>
            <span className="hidden sm:inline">{loading ? "Saving..." : "Mark Complete"}</span>
        </button>
    );
}
