import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";

import { ThemeProvider } from "@/components/ThemeProvider";
import FeedbackButton from "@/components/FeedbackButton";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "AyoSinau Personal Dashboard",
  description: "Javanese Learning Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${plusJakartaSans.variable} font-sans bg-background-light dark:bg-background-dark text-text-main-light dark:text-text-main-dark transition-colors duration-200 antialiased`}
      >
        <ThemeProvider>
          <ToastProvider>
            <div className="flex h-screen w-full overflow-hidden">
              {children}
            </div>
            <FeedbackButton />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
