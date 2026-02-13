"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === "/") {
            return pathname === "/";
        }
        return pathname.startsWith(path);
    };

    const navItems = [
        { href: "/", label: "Dashboard", icon: "dashboard" },
        { href: "/modules", label: "Modules", icon: "menu_book" },
        { href: "/flashcards", label: "Flashcards", icon: "style" },
        { href: "/ai-tutor", label: "AI Tutor", icon: "smart_toy", badge: "Beta" },
        { href: "/pronunciation", label: "Pronunciation", icon: "record_voice_over" },
        { href: "/achievements", label: "Achievements", icon: "emoji_events" },
        { href: "/leaderboard", label: "Leaderboard", icon: "leaderboard" },
    ];

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden fixed top-4 left-4 z-[40] bg-white dark:bg-surface-dark p-2 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 text-text-main-light dark:text-text-main-dark flex items-center justify-center transition-all active:scale-95"
            >
                <span className="material-symbols-outlined">menu</span>
            </button>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[50] transition-all animate-in fade-in duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`fixed md:static inset-y-0 left-0 z-[60] flex flex-col w-64 h-full bg-surface-light dark:bg-surface-dark border-r border-gray-100 dark:border-gray-800 flex-shrink-0 transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Header */}
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary aspect-square rounded-xl size-10 flex items-center justify-center text-text-main-light shadow-sm overflow-hidden relative">
                            <Image src="/logo.png" alt="AyoSinau Logo" fill className="object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-text-main-light dark:text-text-main-dark text-lg font-bold leading-none tracking-tight">
                                AyoSinau
                            </h1>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs font-medium mt-1">
                                Javanese Learning
                            </p>
                        </div>
                    </div>

                    {/* Theme Toggle & Close (Mobile) */}
                    <div className="flex items-center gap-2">
                        <div className="md:hidden">
                            <ThemeToggle />
                        </div>
                        <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all relative overflow-hidden group ${active
                                    ? "bg-primary/20 text-text-main-light dark:text-white"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    }`}
                            >
                                {active && (
                                    <div className="absolute inset-0 bg-batik-pattern opacity-50 pointer-events-none"></div>
                                )}
                                <span
                                    className="material-symbols-outlined z-10"
                                    style={{ fontVariationSettings: active ? "'FILL' 1" : undefined }}
                                >
                                    {item.icon}
                                </span>
                                <span className="z-10">{item.label}</span>
                                {item.badge && (
                                    <span className="ml-auto bg-primary/20 text-primary-dark dark:text-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase z-10">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}

                    <div className="my-2 border-t border-gray-100 dark:border-gray-800"></div>
                    <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-sm ${isActive("/admin")
                            ? "bg-primary/20 text-text-main-light dark:text-white"
                            : "text-gray-500 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                    >
                        <span className="material-symbols-outlined">admin_panel_settings</span>
                        <span>Admin Panel</span>
                    </Link>
                </nav>

                {/* Footer / Profile */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-2 px-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Theme</span>
                        <ThemeToggle />
                    </div>
                    <Link
                        href="/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <div
                            className="size-10 rounded-full bg-gray-200 bg-cover bg-center border-2 border-white dark:border-gray-700 shadow-sm"
                            style={{
                                backgroundImage:
                                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB-av2hlIVBxc2iq2Re3gsL1jApS0FF4DXF2KTIFjPdQvqYCmAKWX7k9VZhOOdj3WwICYLTWWDfOTeA-uo7J5cDrqx9NXN4bzFFXns3CCV1uzZRNqyMYiA4KngO_5bgFbKgro_nljo3vqRIL3zNgmtqhTnHbOTqlwgsPma2WIOeJCRKRqXGw-PEj8aRSeesm6yJZ7lTDD3Y4ViwclfWYadM8UVzqi0Ranbo-WJVJfJRW6O0xSAVskJiswmA4tlsXDVPUDFXJWaA5-A')",
                            }}
                        ></div>
                        <div className="flex flex-col min-w-0">
                            <p className="text-sm font-bold text-text-main-light dark:text-text-main-dark truncate">
                                Budi Santoso
                            </p>
                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">
                                Free Account
                            </p>
                        </div>
                        <span className="material-symbols-outlined text-gray-400 ml-auto">
                            settings
                        </span>
                    </Link>
                </div>
            </aside>
        </>
    );
}
