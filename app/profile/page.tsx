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
        <>
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark relative">
                <div className="mx-auto max-w-4xl px-6 py-8 md:px-10 lg:py-12">
                    {/* Page Heading */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-text-main-light dark:text-text-main-dark">
                                Settings
                            </h1>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1 text-sm">
                                Manage your account settings and preferences.
                            </p>
                        </div>
                    </div>

                    {/* Profile Header Card */}
                    <div className="mb-8 rounded-2xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-all">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-5">
                                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-primary p-1">
                                    <div
                                        className="h-full w-full rounded-full bg-cover bg-center"
                                        style={{
                                            backgroundImage:
                                                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuClTxNYdt-oCn9K6WnkjjCBSFrlQWgc5oi9bQpHLXJC50AwOB4737NrBrJiPgRpH5jPdf1KNkMWNqjfkEuQfLzUPleMrnn_SWPl8k4L8efWCZeqeKmk4hc1tuu3ykUn-k9WkeZhOS6fedx8GVg2-cBf-T7E2k7RflV43sm11KiFKapYIAeMervogMkCwi28EDq1yP6VzVOWiKcjBTyEGyGg6BxHgxHPyt51LldIrWfdGjmY3dYP29Xr30lCwoogaHyUyIUrZpg78_w')",
                                        }}
                                    ></div>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">
                                        {name}
                                    </h2>
                                    <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                                        Joined January 2024
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl bg-primary/10 px-5 py-3 border border-primary/20">
                                <span className="material-symbols-outlined text-primary-dark dark:text-primary">
                                    military_tech
                                </span>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                                        Total XP
                                    </span>
                                    <span className="text-lg font-black text-text-main-light dark:text-text-main-dark">
                                        1,250
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Left Column: Personal Information */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Personal Info Card */}
                            <div className="rounded-2xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                                <div className="mb-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                                    <h3 className="text-lg font-semibold text-text-main-light dark:text-text-main-dark">
                                        Personal Information
                                    </h3>
                                    <span className="text-xs font-medium text-text-secondary-light opacity-50 italic">
                                        Last updated 2 days ago
                                    </span>
                                </div>
                                <form className="space-y-5" onSubmit={handleSaveProfile}>
                                    <div className="grid gap-5 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label
                                                className="text-sm font-medium text-text-main-light dark:text-text-main-dark"
                                                htmlFor="fullName"
                                            >
                                                Full Name
                                            </label>
                                            <div className="relative">
                                                <input
                                                    className="w-full rounded-lg border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark py-2.5 pl-10 pr-4 text-sm font-medium text-text-main-light dark:text-text-main-dark placeholder-text-secondary-light focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors dark:placeholder-gray-500"
                                                    id="fullName"
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                />
                                                <span className="material-symbols-outlined absolute left-3 top-2.5 text-lg text-gray-400">
                                                    person
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label
                                                className="text-sm font-medium text-text-main-light dark:text-text-main-dark"
                                                htmlFor="email"
                                            >
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <input
                                                    className="w-full rounded-lg border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark py-2.5 pl-10 pr-4 text-sm font-medium text-text-main-light dark:text-text-main-dark placeholder-text-secondary-light focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors dark:placeholder-gray-500"
                                                    id="email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                />
                                                <span className="material-symbols-outlined absolute left-3 top-2.5 text-lg text-gray-400">
                                                    mail
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <button
                                            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark transition-all active:scale-95"
                                            type="submit"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Right Column: Appearance Settings */}
                        <div className="lg:col-span-1 space-y-8">
                            {/* Theme Customization Card */}
                            <div className="rounded-2xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-full">
                                <div className="mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                                    <h3 className="text-lg font-semibold text-text-main-light dark:text-text-main-dark">
                                        Appearance
                                    </h3>
                                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                                        Customize how AyoSinau looks on your device.
                                    </p>
                                </div>
                                <div className="space-y-8">
                                    {/* Dark Mode Toggle */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-text-main-light dark:text-text-main-dark">
                                                Dark Mode
                                            </span>
                                            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                                {safeIsDarkMode ? "Currently Dark" : "Currently Light"}
                                            </span>
                                        </div>
                                        <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                            <input
                                                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300 left-0 border-gray-300 peer checked:left-6 checked:border-primary"
                                                id="toggle"
                                                name="toggle"
                                                type="checkbox"
                                                checked={safeIsDarkMode}
                                                onChange={toggleTheme}
                                            />
                                            <label
                                                className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer transition-colors duration-300 peer-checked:bg-primary"
                                                htmlFor="toggle"
                                            ></label>
                                        </div>
                                    </div>
                                    {/* Accent Color Picker */}
                                    <div className="space-y-3">
                                        <span className="text-sm font-medium text-text-main-light dark:text-text-main-dark">
                                            Accent Color
                                        </span>
                                        <div className="flex flex-wrap gap-3">
                                            {ACCENT_COLORS.map((color) => {
                                                const isActive = safeIsActive(color.name);
                                                return (
                                                    <button
                                                        key={color.name}
                                                        onClick={() => {
                                                            setAccentColor(color);
                                                            showToast(`Thema kleur aangepast naar ${color.name}`, "success");
                                                        }}
                                                        aria-label={`Select ${color.name} Theme`}
                                                        className={`group relative h-8 w-8 rounded-full hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-surface-dark ${isActive ? "ring-2 ring-offset-2 ring-primary shadow-lg shadow-primary/20" : ""
                                                            }`}
                                                        style={{ backgroundColor: color.primary }}
                                                    >
                                                        {isActive && (
                                                            <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-sm text-black mix-blend-overlay font-bold">
                                                                check
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 border-t border-gray-100 dark:border-gray-800 pt-8 text-center text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        <p>© 2024 AyoSinau. All rights reserved.</p>
                    </div>
                </div>
            </main>
        </>
    );
}
