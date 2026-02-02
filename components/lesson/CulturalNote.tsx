import MarkdownRenderer from "./MarkdownRenderer";

export default function CulturalNote({ content }: { content: string }) {
    return (
        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-[2rem] p-8 relative overflow-hidden group">
            {/* Background Icon */}
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl text-primary/10 pointer-events-none select-none group-hover:rotate-12 transition-transform duration-500">
                temple_buddhist
            </span>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <span className="p-2 bg-primary/20 text-primary rounded-xl">
                        <span className="material-symbols-outlined">self_improvement</span>
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                        Cultural Insight
                    </h3>
                </div>
                <div className="prose prose-sm dark:prose-invert prose-slate max-w-none prose-p:font-medium prose-p:leading-relaxed text-slate-700 dark:text-slate-300">
                    <MarkdownRenderer content={content} />
                </div>
            </div>
        </div>
    );
}
