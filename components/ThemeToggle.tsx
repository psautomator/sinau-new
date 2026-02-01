"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

    useEffect(() => {
        // Initialize state from localStorage
        const stored = localStorage.getItem("theme") as "light" | "dark" | null;
        if (stored) {
            setTheme(stored);
            // Force sync class
            if (stored === "dark") {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        } else {
            // System default
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                // But wait, if system is dark, and we are in system mode, shouldn't we check?
                // The layout script already handles system default. 
                // Just need to ensure state reflects "system".
            }
        }
    }, []);

    const updateTheme = (newTheme: "light" | "dark" | "system") => {
        setTheme(newTheme);
        if (newTheme === "system") {
            localStorage.removeItem("theme");
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        } else {
            localStorage.setItem("theme", newTheme);
            if (newTheme === "dark") {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        }
    };

    return (
        <button
            onClick={() => updateTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl text-gray-400 hover:text-text-main-light dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={`Current: ${theme} (Click to toggle)`}
        >
            <span className="material-symbols-outlined">
                {theme === "dark" ? "dark_mode" : "light_mode"}
            </span>
        </button>
    );
}
