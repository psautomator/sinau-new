"use client";

export default function VocabularyList({ words = [], title = "Vocabulary List" }: { words?: any[], title?: string }) {
    // Map formality/category to colors/icons if needed, or use defaults
    const getIcon = (w: any) => "school"; // Default

    const playAudio = (url: string) => {
        const audio = new Audio(url);
        audio.play().catch((err) => console.error("Playback failed:", err));
    };

    return (
        <section>
            <div className="flex items-center gap-3 mb-5 mt-4">
                <span className="material-symbols-outlined text-primary text-3xl">
                    style
                </span>
                <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">
                    {title}
                </h2>
            </div>
            {words.length === 0 ? (
                <p className="text-gray-500 italic">No vocabulary words for this section.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {words.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => item.audioUrl && playAudio(item.audioUrl)}
                            className={`bg-surface-light dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all group ${item.audioUrl ? "cursor-pointer active:scale-95" : ""}`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div
                                    className={`size-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400`}
                                >
                                    <span className="material-symbols-outlined">{getIcon(item)}</span>
                                </div>
                                {item.audioUrl && (
                                    <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transition-colors">
                                        volume_up
                                    </span>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">
                                {item.word}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                {item.translation}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
