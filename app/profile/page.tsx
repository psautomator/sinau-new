"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/components/ToastProvider";
import { useTheme, ACCENT_COLORS } from "@/components/ThemeProvider";

export default function ProfilePage() {
    const { showToast } = useToast();
    const { theme, accentColor, mounted, setTheme, setAccentColor, toggleTheme } = useTheme();
    const isDarkMode = theme === "dark";
    const [name, setName] = useState("Budi Santoso");
    const [email, setEmail] = useState("budi.santoso@example.com");

    // Don't render parts that depend on localStorage until mounted
    const safeIsActive = (colorName: string) => mounted && accentColor.name === colorName;
    const safeIsDarkMode = mounted ? isDarkMode : false;

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        showToast("Profile settings saved successfully!", "success");
    };

    return (
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <Sidebar />

            <main className="flex-1 overflow-y-auto h-full p-4 md:p-12 relative overflow-x-hidden">
                {/* Deep Batik Decoration Background */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-batik-pattern opacity-[0.03] dark:opacity-[0.07] pointer-events-none rounded-bl-[10rem] mask-image-gradient" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="max-w-[1100px] mx-auto flex flex-col gap-10 relative z-10 font-sans">
                    <header className="flex flex-col gap-2 relative z-10 px-2">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/25">
                                <span className="material-symbols-outlined text-2xl">settings</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Account Preferences</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight mt-1">
                            Your <span className="text-primary">Settings</span>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base max-w-2xl">
                            Manage your account preferences, appearance, and discover your learning stats.
                        </p>
                    </header>

                    {/* Profile Header Card - High Fidelity */}
                    <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[3rem] p-8 md:p-10 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col md:flex-row gap-10 items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="relative size-24 md:size-32 shrink-0 p-1 bg-primary rounded-[2.5rem] shadow-xl shadow-primary/20">
                                <div
                                    className="h-full w-full rounded-[2.2rem] bg-cover bg-center border-4 border-white dark:border-slate-800"
                                    style={{
                                        backgroundImage:
                                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuClTxNYdt-oCn9K6WnkjjCBSFrlQWgc5oi9bQpHLXJC50AwOB4737NrBrJiPgRpH5jPdf1KNkMWNqjfkEuQfLzUPleMrnn_SWPl8k4L8efWCZeqeKmk4hc1tuu3ykUn-k9WkeZhOS6fedx8GVg2-cBf-T7E2k7RflV43sm11KiFKapYIAeMervogMkCwi28EDq1yP6VzVOWiKcjBTyEGyGg6BxHgxHPyt51LldIrWfdGjmY3dYP29Xr30lCwoogaHyUyIUrZpg78_w')",
                                    }}
                                ></div>
                                <div className="absolute -bottom-2 -right-2 size-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800">
                                    <span className="material-symbols-outlined text-xl">verified</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{name}</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">AyoStudent since January 2024</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-primary/10 px-6 py-4 rounded-[1.5rem] border border-primary/20 shadow-sm">
                            <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/25">
                                <span className="material-symbols-outlined text-2xl">military_tech</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Mastery XP</span>
                                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">1,250</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-10 lg:grid-cols-12">
                        {/* Forms Column */}
                        <div className="lg:col-span-12 space-y-10">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {/* Personal Info Card */}
                                <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
                                    <div className="mb-8 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Personal Information</h3>
                                        <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest italic">Encrypted</span>
                                    </div>
                                    <form className="space-y-6" onSubmit={handleSaveProfile}>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1" htmlFor="fullName">Full Name</label>
                                            <div className="relative group">
                                                <input
                                                    className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 py-4 pl-12 pr-6 text-sm font-black text-slate-900 dark:text-white placeholder-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all"
                                                    id="fullName"
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                />
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-slate-300 group-focus-within:text-primary transition-colors">person</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1" htmlFor="email">Email Address</label>
                                            <div className="relative group">
                                                <input
                                                    className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 py-4 pl-12 pr-6 text-sm font-black text-slate-900 dark:text-white placeholder-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all"
                                                    id="email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                />
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-slate-300 group-focus-within:text-primary transition-colors">mail</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-end pt-4">
                                            <button
                                                className="h-14 bg-primary text-white px-10 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                                type="submit"
                                            >
                                                Save Settings
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Appearance Settings Card */}
                                <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col">
                                    <div className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Visual Interface</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Customize your learning environment.</p>
                                    </div>
                                    <div className="flex-1 space-y-10">
                                        {/* Dark Mode Toggle */}
                                        <div className="flex items-center justify-between group">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Dark Mode</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{safeIsDarkMode ? "Night Mode Active" : "Day Mode Active"}</span>
                                            </div>
                                            <button
                                                onClick={toggleTheme}
                                                className={`relative h-10 w-20 rounded-full transition-all duration-500 overflow-hidden border-2 p-1 ${safeIsDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}
                                            >
                                                <div className={`size-7 rounded-full transition-all duration-500 flex items-center justify-center shadow-lg ${safeIsDarkMode ? 'translate-x-10 bg-primary text-white' : 'translate-x-0 bg-white text-amber-500'}`}>
                                                    <span className="material-symbols-outlined text-lg">{safeIsDarkMode ? 'dark_mode' : 'light_mode'}</span>
                                                </div>
                                            </button>
                                        </div>
                                        {/* Accent Color Picker */}
                                        <div className="space-y-4">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Theme Accent Color</span>
                                            <div className="flex flex-wrap gap-4">
                                                {ACCENT_COLORS.map((color) => {
                                                    const isActive = safeIsActive(color.name);
                                                    return (
                                                        <button
                                                            key={color.name}
                                                            onClick={() => {
                                                                setAccentColor(color);
                                                                showToast(`Thema kleur aangepast naar ${color.name}`, "success");
                                                            }}
                                                            className={`group relative h-12 w-12 rounded-[1rem] hover:scale-110 transition-transform shadow-sm flex items-center justify-center ${isActive ? "ring-4 ring-primary/20 shadow-xl shadow-primary/10" : ""}`}
                                                            style={{ backgroundColor: color.primary }}
                                                        >
                                                            {isActive && (
                                                                <div className="size-6 bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                                                    <span className="material-symbols-outlined text-lg text-white font-black">check</span>
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 rounded-[1rem] opacity-0 group-hover:opacity-100 bg-white/10 transition-opacity" />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 mb-10 border-t border-slate-100 dark:border-slate-800 pt-10 text-center">
                        <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em]">© 2024 AyoSinau Ecosystem — All rights reserved.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
