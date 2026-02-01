import { notFound } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import QuizClient from "@/components/quiz/QuizClient";
import { getQuizById } from "@/dal/quizzes";

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const quiz = await getQuizById(id);

    if (!quiz) notFound();

    return (
        <>
            <Sidebar />

            <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark relative p-4 md:p-8 flex flex-col items-center">
                <div className="w-full max-w-[1100px]">
                    <QuizClient quiz={quiz} />
                </div>
            </main>
        </>
    );
}
