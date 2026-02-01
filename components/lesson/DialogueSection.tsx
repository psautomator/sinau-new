import MarkdownRenderer from "./MarkdownRenderer";

export default function DialogueSection({ content }: { content: string }) {
    return (
        <section>
            <div className="flex items-center gap-3 mb-5">
                <span className="material-symbols-outlined text-primary text-3xl">
                    import_contacts
                </span>
                <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">
                    Lesinhoud
                </h2>
            </div>
            <div className="bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <MarkdownRenderer content={content} />
            </div>
        </section>
    );
}
