import MarkdownRenderer from "./MarkdownRenderer";
import VocabularyList from "./VocabularyList";
import Link from "next/link";
import InteractiveFlashcards from "./InteractiveFlashcards";

interface SectionContent {
    title?: string;
    markdownText?: string;
    wordIds?: string[];
    quizId?: string;
}

type SectionProps = {
    section: {
        type: string;
        content: SectionContent;
        wordIds?: string[];
    };
    words?: Array<{
        id: string;
        word: string;
        translation: string;
        audioUrl?: string | null;
        exampleJavanese?: string | null;
    }>;
    quizId?: string;
    lessonId?: string;
};

export default function LessonSection({ section, words = [], quizId, lessonId }: SectionProps) {
    switch (section.type) {
        case "MARKDOWN": {
            const markdownText = typeof section.content === 'string'
                ? section.content
                : (section.content?.markdownText || "");
            const title = typeof section.content === 'object' ? section.content?.title : null;

            return (
                <div className="bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                    {title && (
                        <h3 className="text-xl font-bold text-text-main-light dark:text-text-main-dark mb-4 drop-shadow-sm">
                            {title}
                        </h3>
                    )}
                    <MarkdownRenderer content={markdownText} />
                </div>
            );
        }
        case "FLASHCARD_SET":
            return (
                <div className="space-y-6">
                    {section.content?.markdownText && (
                        <div className="bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                            <MarkdownRenderer content={section.content.markdownText} />
                        </div>
                    )}
                    <InteractiveFlashcards
                        words={words.filter(w => section.content?.wordIds?.includes(w.id))}
                        title={section.content?.title}
                        lessonId={lessonId}
                    />
                </div>
            );
        case "QUIZ_LINK":
            return (
                <div className="space-y-6">
                    {section.content?.markdownText && (
                        <div className="bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                            <MarkdownRenderer content={section.content.markdownText} />
                        </div>
                    )}
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 flex flex-col items-center gap-6 text-center">
                        <span className="material-symbols-outlined text-primary text-5xl">
                            quiz
                        </span>
                        <div>
                            <h3 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark mb-2">
                                Klaar voor de test?
                            </h3>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark max-w-md">
                                Test je kennis over deze les met een korte quiz en verdien extra XP!
                            </p>
                        </div>
                        <Link
                            href={(section.content?.quizId || quizId) ? `/quiz/${section.content?.quizId || quizId}` : "#"}
                            className="inline-flex items-center justify-center rounded-xl font-bold px-8 h-14 bg-primary text-black hover:bg-primary-dark transition-all shadow-md shadow-primary/20 active:scale-95"
                        >
                            Start Quiz
                        </Link>
                    </div>
                </div>
            );
        default:
            return null;
    }
}
