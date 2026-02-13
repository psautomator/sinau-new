"use server";

import Sidebar from "@/components/Sidebar";
import QuizClient from "@/components/quiz/QuizClient";
import { getRandomQuizQuestions } from "@/dal/quizzes";
import { MOCK_USER_ID } from "@/lib/mock-auth";

export default async function RandomQuizPage() {
    // Fetch 10 random questions from started modules
    const quiz = await getRandomQuizQuestions(MOCK_USER_ID, 10);

    return (
        <>
            <Sidebar />

            <main className="flex-1 overflow-y-auto h-full p-4 md:p-8 bg-background-light dark:bg-background-dark relative">
                <div className="max-w-[1100px] mx-auto">
                    <QuizClient quiz={quiz} isRandomMode={true} />
                </div>
            </main>
        </>
    );
}
