interface DashboardHeaderProps {
    name?: string;
}

export default function DashboardHeader({ name = "Budi" }: DashboardHeaderProps) {
    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    return (
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl md:text-4xl font-extrabold text-text-main-light dark:text-text-main-dark tracking-tight">
                    Sugeng rawuh, {name}! 👋
                </h2>
                <p className="text-text-secondary-light dark:text-text-secondary-dark text-lg">
                    Ready to master Javanese today? Let's keep that streak alive.
                </p>
            </div>
            <div className="hidden md:block text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {today}
                </p>
            </div>
        </header>
    );
}
