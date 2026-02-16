"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type ColorOption = {
    name: string;
    primary: string;
    dark: string;
};

export const ACCENT_COLORS: ColorOption[] = [
    { name: 'emerald', primary: '#2bee79', dark: '#23c263' },
    { name: 'purple', primary: '#a855f7', dark: '#9333ea' },
    { name: 'blue', primary: '#3b82f6', dark: '#2563eb' },
    { name: 'orange', primary: '#f97316', dark: '#ea580c' },
    { name: 'pink', primary: '#ec4899', dark: '#db2777' },
];

type ThemeContextType = {
    theme: 'light' | 'dark';
    accentColor: ColorOption;
    mounted: boolean;
    setTheme: (theme: 'light' | 'dark') => void;
    setAccentColor: (color: ColorOption) => void;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<'light' | 'dark'>('light');
    const [accentColor, setAccentColorState] = useState<ColorOption>(ACCENT_COLORS[0]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // 1. Theme Initialization
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        setThemeState(initialTheme);
        if (initialTheme === 'dark') {
            document.documentElement.classList.add('dark');
        }

        // 2. Accent Color Initialization
        const savedColorName = localStorage.getItem('accent-color');
        const initialColor = ACCENT_COLORS.find(c => c.name === savedColorName) || ACCENT_COLORS[0];
        setAccentColorState(initialColor);
        applyAccentColor(initialColor);
    }, []);

    const setTheme = (newTheme: 'light' | 'dark') => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const setAccentColor = (color: ColorOption) => {
        setAccentColorState(color);
        localStorage.setItem('accent-color', color.name);
        applyAccentColor(color);
    };

    const applyAccentColor = (color: ColorOption) => {
        const root = document.documentElement;
        root.style.setProperty('--primary', color.primary);
        root.style.setProperty('--primary-dark', color.dark);
    };

    return (
        <ThemeContext.Provider value={{ theme, accentColor, mounted, setTheme, setAccentColor, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
