"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Hamburger Button */}
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

            <aside className={`fixed md:static inset-y-0 left-0 z-[60] flex flex-col w-64 h-full bg-surface-light dark:bg-surface-dark border-r border-gray-100 dark:border-gray-800 flex-shrink-0 transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
                    {/* Close button for mobile */}
                    <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                    {/* Dashboard (Active) */}
                    <Link
                        href="/"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/20 text-text-main-light dark:text-white font-medium relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-batik-pattern opacity-50 pointer-events-none"></div>
                        <span
                            className="material-symbols-outlined z-10"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            dashboard
                        </span>
                        <span className="z-10">Dashboard</span>
                    </Link>
                    <Link
                        href="/modules"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                    >
                        <span className="material-symbols-outlined">menu_book</span>
                        <span>Modules</span>
                    </Link>
                    <Link
                        href="/flashcards"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                    >
                        <span className="material-symbols-outlined">style</span>
                        <span>Flashcards</span>
                    </Link>
                    <Link
                        href="/ai-tutor"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                    >
                        <span className="material-symbols-outlined">smart_toy</span>
                        <span>AI Tutor</span>
                        <span className="ml-auto bg-primary/20 text-primary-dark dark:text-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                            Beta
                        </span>
                    </Link>
                    <Link
                        href="/achievements"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                    >
                        <span className="material-symbols-outlined">emoji_events</span>
                        <span>Achievements</span>
                    </Link>
                    <Link
                        href="/leaderboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                    >
                        <span className="material-symbols-outlined">leaderboard</span>
                        <span>Leaderboard</span>
                    </Link>
                    <div className="my-2 border-t border-gray-100 dark:border-gray-800"></div>
                    <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors text-sm"
                    >
                        <span className="material-symbols-outlined">admin_panel_settings</span>
                        <span>Admin Panel</span>
                    </Link>
                </nav>
                <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                    <Link
                        href="/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <div
                            className="size-10 rounded-full bg-gray-200 bg-cover bg-center border-2 border-white dark:border-gray-700 shadow-sm"
                            data-alt="Portrait of Budi, the user"
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
