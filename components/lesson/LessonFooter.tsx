import Link from "next/link";

interface LessonFooterProps {
    lessonId?: string;
    quizId?: string;
    nextLessonSlug?: string | null;
}

export default function LessonFooter({ lessonId, quizId, nextLessonSlug }: LessonFooterProps) {
    return (
        <div className="w-full max-w-5xl mx-auto mt-8 mb-16">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-light dark:bg-surface-dark p-4 md:p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <p className="font-bold text-lg dark:text-white">
                        Ready to practice?
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Test your knowledge on this lesson.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <Link
                        href={lessonId ? `/flashcards?lessonId=${lessonId}` : "/flashcards"}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-surface-dark border-2 border-gray-100 dark:border-gray-700 font-bold text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined">style</span>
                        <span>Flashcards</span>
                    </Link>
                    {quizId && (
                        <Link href={`/quiz/${quizId}`} className="flex-1 sm:flex-none h-12 px-8 bg-primary text-text-main-light rounded-xl font-bold text-sm shadow-md shadow-primary/30 hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                            <span>Start Quiz</span>
                            <span className="material-symbols-outlined text-lg">
                                arrow_forward
                            </span>
                        </Link>
                    )}
                    {nextLessonSlug && (
                        <Link href={`/lessons/${nextLessonSlug}`} className="flex-1 sm:flex-none h-12 px-8 bg-surface-light dark:bg-surface-dark text-text-main-light dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                            <span>Next Lesson</span>
                            <span className="material-symbols-outlined text-lg">
                                skip_next
                            </span>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
