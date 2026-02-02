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

            const cleanMarkdown = markdownText
                .split('\n')
                .filter((line: string) => !line.match(/\*\*Niveau:\*\*/i) && !line.match(/\*\*Taalstijl:\*\*/i) && !line.startsWith('# '))
                .join('\n')
                .trim();

            return (
                <div className="bg-white dark:bg-surface-dark border border-gray-200/60 dark:border-gray-800/60 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-shadow">
                    {title && (
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <span className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                                <span className="material-symbols-outlined">info</span>
                            </span>
                            {title}
                        </h3>
                    )}
                    <MarkdownRenderer content={cleanMarkdown} />
                </div>
            );
        }
        case "FLASHCARD_SET":
            return (
                <div className="space-y-8">
                    {section.content?.markdownText && (
                        <div className="bg-white dark:bg-surface-dark border border-gray-200/60 dark:border-gray-800/60 rounded-[2rem] p-8 shadow-sm">
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
                <div className="space-y-8">
                    {section.content?.markdownText && (
                        <div className="bg-white dark:bg-surface-dark border border-gray-200/60 dark:border-gray-800/60 rounded-[2rem] p-8 shadow-sm">
                            <MarkdownRenderer content={section.content.markdownText} />
                        </div>
                    )}
                    <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-[2rem] p-10 flex flex-col items-center gap-6 text-center relative overflow-hidden group">
                        <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                            <span className="material-symbols-outlined text-9xl text-primary">quiz</span>
                        </div>

                        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                            <span className="material-symbols-outlined text-5xl">quiz</span>
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                                Klaar voor de test?
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md font-medium leading-relaxed">
                                Test je kennis over deze les met een korte quiz en verdien extra XP!
                            </p>
                        </div>

                        <Link
                            href={(section.content?.quizId || quizId) ? `/quiz/${section.content?.quizId || quizId}` : "#"}
                            className="relative z-10 inline-flex items-center justify-center rounded-2xl font-bold px-10 h-14 bg-primary text-white hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
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
