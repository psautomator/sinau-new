"use client";

import { useState, useEffect, useCallback } from "react";
import { saveLessonNote } from "@/app/actions/notes";

// Debounce helper
function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function LessonNotes({
    userId,
    lessonId,
    initialNote
}: {
    userId: string;
    lessonId: string;
    initialNote: string
}) {
    const [note, setNote] = useState(initialNote);
    const [status, setStatus] = useState<"saved" | "saving" | "error">("saved");

    const debouncedNote = useDebounce(note, 1000);

    useEffect(() => {
        // Only save if the note has changed from initial
        if (debouncedNote !== initialNote) {
            const save = async () => {
                setStatus("saving");
                const result = await saveLessonNote(userId, lessonId, debouncedNote);
                if (result.success) {
                    setStatus("saved");
                } else {
                    setStatus("error");
                }
            };
            save();
        }
    }, [debouncedNote, userId, lessonId, initialNote]);

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">edit_note</span>
                    <h3 className="text-lg font-bold">Jouw Notities</h3>
                </div>
                <div className="text-xs font-medium">
                    {status === "saving" && <span className="text-gray-400">Saving...</span>}
                    {status === "saved" && <span className="text-green-500 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">check</span>Saved</span>}
                    {status === "error" && <span className="text-red-500">Error saving</span>}
                </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Gebruik dit veld om je eigen aantekeningen over grammatica of woordenschat te maken.
            </p>
            <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Schrijf hier je notities..."
                className="w-full h-40 p-4 rounded-xl bg-background-light dark:bg-background-dark border-2 border-transparent focus:border-primary/50 outline-none resize-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm leading-relaxed"
            />
        </div>
    );
}
