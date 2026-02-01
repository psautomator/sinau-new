interface StatsCardsProps {
    xp?: number;
    level?: string;
    streak?: number;
}

export default function StatsCards({
    xp = 1250,
    level = "Beginner II",
    streak = 5
}: StatsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                <div className="size-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <span className="material-symbols-outlined">military_tech</span>
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total XP</p>
                    <p className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">{xp.toLocaleString()}</p>
                </div>
            </div>
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                <div className="size-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <span className="material-symbols-outlined">school</span>
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Current Level</p>
                    <p className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">{level}</p>
                </div>
            </div>
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 relative overflow-hidden">
                {/* Subtle flame glow */}
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-orange-400/10 rounded-full blur-xl"></div>
                <div className="size-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500 dark:text-orange-400 z-10">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                </div>
                <div className="z-10">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Day Streak</p>
                    <p className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">{streak} Days</p>
                </div>
            </div>
        </div>
    );
}
