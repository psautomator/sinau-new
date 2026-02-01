import Sidebar from "@/components/Sidebar";
import FlashcardClient from "@/components/flashcards/FlashcardClient";
import { getFlashcardsByLesson, getVocabulary } from "@/dal/vocabulary";
import { getLessonById } from "@/dal/lessons";

export default async function FlashcardsPage({
    searchParams,
}: {
    searchParams: Promise<{ lessonId?: string }>;
}) {
    const { lessonId } = await searchParams;

    let words = [];
    let title = "Daily Mix";

    let backToLessonUrl = undefined;

    if (lessonId) {
        const [lessonWords, lesson] = await Promise.all([
            getFlashcardsByLesson(lessonId),
            getLessonById(lessonId)
        ]);
        words = lessonWords;
        title = lesson?.title ? `Flashcards: ${lesson.title}` : "Lesson Flashcards";
        if (lesson?.slug) backToLessonUrl = `/lessons/${lesson.slug}`;
    } else {
        const { vocabulary } = await getVocabulary({ take: 20 });
        words = vocabulary;
    }

    return (
        <>
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark relative p-4 md:p-8 flex flex-col items-center">
                <FlashcardClient
                    words={words as any}
                    title={title}
                    backToLessonUrl={backToLessonUrl}
                />
            </main>
        </>
    );
}
