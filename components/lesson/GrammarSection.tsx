import MarkdownRenderer from "./MarkdownRenderer";

export default function GrammarSection({ content }: { content: string }) {
    return (
        <section>
            <div className="flex items-center gap-3 mb-5 mt-4">
                <span className="material-symbols-outlined text-primary text-3xl">
                    menu_book
                </span>
                <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">
                    Grammar Notes
                </h2>
            </div>
            <div className="bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <MarkdownRenderer content={content || "No specific grammar notes for this section."} />
            </div>
        </section>
    );
}
