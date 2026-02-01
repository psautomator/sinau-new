import Sidebar from "@/components/Sidebar";

export default function AchievementsPage() {
    return (
        <>
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark relative">
                <div className="w-full max-w-[1200px] mx-auto px-6 py-8 md:px-10 lg:py-10 flex flex-col gap-8">
                    {/* Header Section */}
                    <header className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-text-main-light dark:text-text-main-dark text-4xl font-black leading-tight tracking-tight">
                                Achievements
                            </h1>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark text-base font-normal max-w-2xl">
                                Track your learning journey, earn badges, and showcase your mastery of the Javanese language.
                            </p>
                        </div>

                        {/* Stats & Progress Dashboard */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                            {/* Stats Columns */}
                            <div className="flex gap-8 w-full md:w-auto">
                                <div className="flex flex-col gap-1">
                                    <span className="text-text-secondary-light dark:text-text-secondary-dark text-sm uppercase tracking-wider font-semibold">
                                        Total XP
                                    </span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black text-text-main-light dark:text-text-main-dark">
                                            1,250
                                        </span>
                                        <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>
                                            bolt
                                        </span>
                                    </div>
                                </div>
                                <div className="w-px bg-gray-200 dark:bg-gray-800"></div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-text-secondary-light dark:text-text-secondary-dark text-sm uppercase tracking-wider font-semibold">
                                        Current Level
                                    </span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black text-text-main-light dark:text-text-main-dark">
                                            5
                                        </span>
                                        <span className="text-base font-medium text-text-main-light dark:text-gray-300">
                                            Sastrawan
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar Section */}
                            <div className="flex flex-col gap-3 w-full md:max-w-md">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-semibold text-text-main-light dark:text-text-main-dark">
                                        Level Progress
                                    </span>
                                    <span className="text-sm font-bold text-primary">80%</span>
                                </div>
                                <div className="h-3 w-full bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full" style={{ width: "80%" }}></div>
                                </div>
                                <div className="flex justify-between text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                    <span>Level 5</span>
                                    <span>250 XP to Level 6</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Filters & Controls */}
                    <section className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center sticky top-0 z-10 bg-background-light dark:bg-background-dark py-4 -my-4 mb-2">
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-text-main-light dark:bg-white text-white dark:text-black font-medium text-sm transition-transform hover:scale-105 active:scale-95 shadow-md">
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                All
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-text-main-light dark:text-gray-300 font-medium text-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-800">
                                <span className="material-symbols-outlined text-[18px]">lock_open</span>
                                Unlocked
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-text-main-light dark:text-gray-300 font-medium text-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-800">
                                <span className="material-symbols-outlined text-[18px]">lock</span>
                                Locked
                            </button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            <span className="material-symbols-outlined text-[20px]">info</span>
                            <span>Tap badge for details</span>
                        </div>
                    </section>

                    {/* Badges Grid */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                        {/* Badge 1: Early Bird (Unlocked) */}
                        <div className="group badge-card bg-surface-light dark:bg-surface-dark rounded-xl p-6 border-2 border-primary/20 dark:border-primary/20 hover:border-primary dark:hover:border-primary cursor-pointer relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                            <div className="absolute top-0 right-0 p-3">
                                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-md">
                                    EARNED
                                </span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="size-24 rounded-full bg-gradient-to-br from-[#e0f7ea] to-[#b9f6ca] dark:from-[#1a3826] dark:to-[#0f291a] flex items-center justify-center shadow-inner">
                                    <span className="material-symbols-outlined text-5xl text-primary drop-shadow-sm">
                                        wb_twilight
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark group-hover:text-primary transition-colors">
                                        Early Bird
                                    </h3>
                                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                        7-day learning streak
                                    </p>
                                </div>
                                <div className="mt-2 text-xs font-medium text-gray-400 dark:text-gray-500">
                                    Earned Oct 24, 2023
                                </div>
                            </div>
                        </div>

                        {/* Badge 2: Word Smith (Unlocked) */}
                        <div className="group badge-card bg-surface-light dark:bg-surface-dark rounded-xl p-6 border-2 border-primary/20 dark:border-primary/20 hover:border-primary dark:hover:border-primary cursor-pointer relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                            <div className="absolute top-0 right-0 p-3">
                                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-md">
                                    EARNED
                                </span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="size-24 rounded-full bg-gradient-to-br from-[#e0f7ea] to-[#b9f6ca] dark:from-[#1a3826] dark:to-[#0f291a] flex items-center justify-center shadow-inner">
                                    <span className="material-symbols-outlined text-5xl text-primary drop-shadow-sm">
                                        school
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark group-hover:text-primary transition-colors">
                                        Word Smith
                                    </h3>
                                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                        Learned 50 words
                                    </p>
                                </div>
                                <div className="mt-2 text-xs font-medium text-gray-400 dark:text-gray-500">
                                    Earned Nov 01, 2023
                                </div>
                            </div>
                        </div>

                        {/* Badge 3: Sastrawan (Unlocked) */}
                        <div className="group badge-card bg-surface-light dark:bg-surface-dark rounded-xl p-6 border-2 border-primary/20 dark:border-primary/20 hover:border-primary dark:hover:border-primary cursor-pointer relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                            <div className="absolute top-0 right-0 p-3">
                                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-md">
                                    EARNED
                                </span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="size-24 rounded-full bg-gradient-to-br from-[#e0f7ea] to-[#b9f6ca] dark:from-[#1a3826] dark:to-[#0f291a] flex items-center justify-center shadow-inner">
                                    <span className="material-symbols-outlined text-5xl text-primary drop-shadow-sm">
                                        history_edu
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark group-hover:text-primary transition-colors">
                                        Sastrawan
                                    </h3>
                                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                        Reached Level 5
                                    </p>
                                </div>
                                <div className="mt-2 text-xs font-medium text-gray-400 dark:text-gray-500">
                                    Earned Nov 12, 2023
                                </div>
                            </div>
                        </div>

                        {/* Badge 4: Polyglot (Locked) */}
                        <div className="group badge-card bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 cursor-not-allowed relative">
                            <div className="absolute top-0 right-0 p-3">
                                <span className="material-symbols-outlined text-gray-400 dark:text-gray-600">
                                    lock
                                </span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-4 opacity-70 grayscale">
                                <div className="size-24 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-5xl text-gray-400 dark:text-gray-600">
                                        language
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400">
                                        Polyglot
                                    </h3>
                                    <p className="text-sm text-gray-400 dark:text-gray-500">
                                        Learn 500 words
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-gray-400 dark:bg-gray-600 h-full w-1/4"></div>
                            </div>
                            <p className="text-center text-xs text-gray-400 mt-2">125 / 500</p>
                        </div>

                        {/* Badge 5: Devotee (Locked) */}
                        <div className="group badge-card bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 cursor-not-allowed relative">
                            <div className="absolute top-0 right-0 p-3">
                                <span className="material-symbols-outlined text-gray-400 dark:text-gray-600">
                                    lock
                                </span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-4 opacity-70 grayscale">
                                <div className="size-24 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-5xl text-gray-400 dark:text-gray-600">
                                        local_fire_department
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400">
                                        Devotee
                                    </h3>
                                    <p className="text-sm text-gray-400 dark:text-gray-500">
                                        30-day streak
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-gray-400 dark:bg-gray-600 h-full w-[45%]"></div>
                            </div>
                            <p className="text-center text-xs text-gray-400 mt-2">14 / 30 Days</p>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
