import Sidebar from "@/components/Sidebar";
import FlashcardPageClient from "@/components/flashcards/FlashcardPageClient";
import { getFlashcardsByLesson, getVocabulary } from "@/dal/vocabulary";
import { getLessonById } from "@/dal/lessons";
import { getPublishedModules } from "@/dal/modules";

export default async function FlashcardsPage({
    searchParams,
}: {
    searchParams: Promise<{ lessonId?: string }>;
}) {
    const { lessonId } = await searchParams;

    // Fetch everything needed for filtering in selection screen
    const [allVocabulary, allModules] = await Promise.all([
        getVocabulary({ take: 1000 }), // Get a large enough set for mixing
        getPublishedModules()
    ]);

    let initialWords = [];
    let initialTitle = "Daily Mix";
    let backToLessonUrl = undefined;
    let autoStart = false;

    if (lessonId) {
        const [lessonWords, lesson] = await Promise.all([
            getFlashcardsByLesson(lessonId),
            getLessonById(lessonId)
        ]);
        initialWords = lessonWords;
        initialTitle = `Flashcards: ${lesson?.title || "Lesson"}`;
        if (lesson?.slug) backToLessonUrl = `/lessons/${lesson.slug}`;
        autoStart = true;
    } else {
        initialWords = allVocabulary.vocabulary;
    }

    // Extract unique levels for the filter
    const levels = Array.from(new Set(allVocabulary.vocabulary.map((v: any) => v.level).filter(Boolean))) as string[];

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden batik-pattern">
            <Sidebar />
            <main className="flex-1 overflow-y-auto relative py-12 px-6">
                <FlashcardPageClient
                    allVocabulary={allVocabulary.vocabulary as any}
                    allModules={allModules as any}
                    levels={levels}
                    initialWords={initialWords as any}
                    initialTitle={initialTitle}
                    backToLessonUrl={backToLessonUrl}
                    autoStart={autoStart}
                />
            </main>
        </div>
    );
}
