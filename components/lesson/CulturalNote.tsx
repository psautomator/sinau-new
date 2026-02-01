import MarkdownRenderer from "./MarkdownRenderer";

export default function CulturalNote({ content }: { content: string }) {
    return (
        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-3xl p-6 md:p-8 relative overflow-hidden">
            {/* Background Icon */}
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl text-primary/10 pointer-events-none select-none">
                temple_buddhist
            </span>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-primary text-2xl">
                        temple_buddhist
                    </span>
                    <h3 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">
                        Cultural Insight
                    </h3>
                </div>
                <MarkdownRenderer content={content} />
            </div>
        </div>
    );
}
