import { notFound } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import LessonHeader from "@/components/lesson/LessonHeader";
import DialogueSection from "@/components/lesson/DialogueSection";
import VocabularyList from "@/components/lesson/VocabularyList";
import LessonNotes from "@/components/lesson/LessonNotes"; // Changed from GrammarSection
import CulturalNote from "@/components/lesson/CulturalNote";
import LessonFooter from "@/components/lesson/LessonFooter";
import LessonSection from "@/components/lesson/LessonSection";
import ScrollProgressTracker from "@/components/lesson/ScrollProgressTracker";
import { getLessonBySlug, getNextLesson } from "@/dal/lessons";
import { getWordsByIds } from "@/dal/vocabulary";
import { getLessonNote } from "@/app/actions/notes";
import { MOCK_USER_ID } from "@/lib/mock-auth";

type LessonContent = {
    sections: {
        type: string;
        content: string;
        order: number;
        wordIds?: string[];
    }[];
};

export default async function LessonPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ preview?: string }> }) {
    const { slug } = await params;
    const { preview } = await searchParams;
    const lesson = await getLessonBySlug(slug);

    if (!lesson) {
        notFound();
    }

    // Check if lesson is published (allow preview mode to bypass this check)
    if (!lesson.published && preview !== 'true') {
        notFound();
    }

    const content = lesson.content as unknown as LessonContent;
    // 1. Process sections to extract cultural content if present
    const mainSections: any[] = [];
    const culturalSplitToken = "### 🌱 Samenvatting & Cultuurreflectie";
    let culturalContent = "";

    (content.sections || [])
        .sort((a, b) => a.order - b.order)
        .forEach((section: any) => {
            // Check if it's explicitly marked as CULTURAL_INSIGHT by our parser
            if (section.type === "CULTURAL_INSIGHT") {
                const text = section.content?.markdownText || "";
                culturalContent += (culturalContent ? "\n\n" : "") + `### ${section.content?.title || "Cultuurreflectie"}\n${text}`;
                return;
            }

            // Legacy support for splitting within MARKDOWN blocks
            if (section.type === "MARKDOWN") {
                const text = typeof section.content === "string"
                    ? section.content
                    : (section.content as any)?.markdownText || "";

                if (text.includes(culturalSplitToken)) {
                    const [main, cultural] = text.split(culturalSplitToken);
                    culturalContent += (culturalContent ? "\n\n" : "") + `${culturalSplitToken}${cultural}`;

                    const updatedContent = typeof section.content === "string"
                        ? main
                        : { ...(section.content as any), markdownText: main };
                    mainSections.push({ ...section, content: updatedContent });
                    return;
                }
            }

            mainSections.push(section);
        });

    const sections = mainSections;

    // 2. Fetch all words for flashcard sections
    const allWordIds = sections
        .filter(s => s.type === "FLASHCARD_SET")
        .flatMap(s => (s as any).wordIds || (s.content as any)?.wordIds || []);

    const words = allWordIds.length > 0 ? await getWordsByIds(allWordIds) : [];

    // Mock User ID for demo purposes (matching seed)
    const initialNote = await getLessonNote(MOCK_USER_ID, lesson.id);

    // Get next lesson
    const nextLesson = await getNextLesson(lesson.moduleId!, lesson.order);
    const nextLessonSlug = nextLesson?.slug || null;

    return (
        <>
            <Sidebar />
            <main className="flex-1 overflow-y-auto h-full p-4 md:p-8 bg-background-light dark:bg-background-dark relative">
                <LessonHeader title={lesson.title} moduleTitle={lesson.module.title} />

                {/* Modular Layout: All sections rendered in order */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-5xl mx-auto">
                    {/* Left Column: Lesson Content (Span 8) */}
                    <div className="lg:col-span-8 flex flex-col gap-10">
                        {sections.map((section, idx) => (
                            <LessonSection
                                key={`section-${idx}`}
                                section={section as any}
                                words={words}
                                quizId={lesson.quiz?.id}
                                lessonId={lesson.id}
                            />
                        ))}

                        {/* Notes Section - Persistent at bottom */}
                        <LessonNotes
                            userId={MOCK_USER_ID}
                            lessonId={lesson.id}
                            initialNote={initialNote}
                        />
                    </div>

                    {/* Right Column: Sidebar (Span 4) */}
                    <div className="flex flex-col gap-6 lg:col-span-4">
                        {culturalContent && <CulturalNote content={culturalContent} />}
                    </div>
                </div>

                <LessonFooter
                    lessonId={lesson.id}
                    nextLessonSlug={nextLessonSlug}
                    quizId={lesson.quiz?.id}
                />

                <ScrollProgressTracker lessonId={lesson.id} />
            </main>
        </>
    );
}
