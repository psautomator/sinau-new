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

import LessonHero from "@/components/lesson/LessonHero";

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

    // Calculate progress for demo
    const progress = 65;

    return (
        <>
            <Sidebar />
            <main className="flex-1 overflow-y-auto h-full bg-background-light dark:bg-background-dark relative scroll-smooth batik-pattern">
                <LessonHeader progress={progress} />

                <div className="max-w-5xl mx-auto px-8 py-10">
                    <LessonHero
                        title={lesson.title}
                        moduleTitle={lesson.module.title}
                        description={(lesson as any).description || "Beheers de fundamenten van de Surinaams-Javaanse taal in deze interactieve les."}
                        level={lesson.level}
                        languageStyle={lesson.languageStyle}
                    />

                    {/* Modular Layout: All sections rendered in order */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
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
                        <div className="flex flex-col gap-8 lg:col-span-4">
                            {culturalContent && <CulturalNote content={culturalContent} />}

                            {/* Lesson Stats Card (Matches Reference) */}
                            <div className="bg-white dark:bg-surface-dark border border-gray-200/60 dark:border-gray-800/60 p-8 rounded-[2rem] shadow-sm text-center">
                                <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                                    <span className="material-symbols-outlined text-3xl">bolt</span>
                                </div>
                                <h4 className="font-black text-lg mb-1">Les Streak</h4>
                                <p className="text-xs text-gray-500 mb-6 font-medium">Voltooi deze les om je 5-daagse streak te bereiken!</p>
                                <div className="flex justify-between gap-1 px-1">
                                    {['M', 'D', 'W', 'D', 'V', 'Z', 'Z'].map((day, i) => (
                                        <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${i < 4 ? 'bg-primary text-white' : i === 4 ? 'bg-white dark:bg-surface-dark border-2 border-primary text-primary' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                            {day}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <LessonFooter
                        lessonId={lesson.id}
                        nextLessonSlug={nextLessonSlug}
                        quizId={lesson.quiz?.id}
                    />
                </div>

                <ScrollProgressTracker lessonId={lesson.id} />
            </main>
        </>
    );
}
