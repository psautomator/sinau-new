"use server";

import Sidebar from "@/components/Sidebar";
import QuizClient from "@/components/quiz/QuizClient";
import { getRandomQuizQuestions } from "@/dal/quizzes";
import { MOCK_USER_ID } from "@/lib/mock-auth";

export default async function RandomQuizPage() {
    // Fetch 10 random questions from started modules
    const quiz = await getRandomQuizQuestions(MOCK_USER_ID, 10);

    return (
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <Sidebar />

            <main className="flex-1 overflow-y-auto h-full p-4 md:p-12 relative overflow-x-hidden">
                {/* Deep Batik Decoration Background */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none" />

                <div className="relative max-w-[1100px] mx-auto">
                    <QuizClient quiz={quiz} isRandomMode={true} />
                </div>
            </main>
        </div>
    );
}
