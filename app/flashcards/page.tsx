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
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto h-full p-4 md:p-12 relative overflow-x-hidden">
                {/* Deep Batik Decoration Background */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-batik-pattern opacity-[0.03] dark:opacity-[0.07] pointer-events-none rounded-bl-[10rem] mask-image-gradient" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="max-w-[1100px] mx-auto flex flex-col gap-8 relative z-10">
                    <FlashcardPageClient
                        allVocabulary={allVocabulary.vocabulary as any}
                        allModules={allModules as any}
                        levels={levels}
                        initialWords={initialWords as any}
                        initialTitle={initialTitle}
                        backToLessonUrl={backToLessonUrl}
                        autoStart={autoStart}
                    />
                </div>
            </main>
        </div>
    );
}
