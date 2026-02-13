import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import StatsCards from "@/components/StatsCards";
import CourseProgress from "@/components/CourseProgress";
import RightSidebar from "@/components/RightSidebar";
import { getUserWithStats, getLeaderboard } from "@/dal/user";
import { getPublishedModules } from "@/dal/modules";
import { getUserModuleProgress, getActiveModule, getResumeLesson } from "@/dal/lessons";
import { getWordOfTheDay } from "@/dal/vocabulary";
import { MOCK_USER_ID } from "@/lib/mock-auth";

export default async function Home() {
  // Fetch user and system data
  const [user, leaderboardData, modules] = await Promise.all([
    getUserWithStats(MOCK_USER_ID),
    getLeaderboard(5),
    getPublishedModules()
  ]);

  // Fetch contextual card data
  const wordOfTheDay = await getWordOfTheDay(MOCK_USER_ID);

  // Find active module and resume lesson
  const activeModule = await getActiveModule(MOCK_USER_ID);
  const progress = activeModule ? await getUserModuleProgress(MOCK_USER_ID, activeModule.id) : 0;
  const resumeLesson = activeModule ? await getResumeLesson(MOCK_USER_ID, activeModule.id) : null;

  // Level naming logic
  const levelNames: Record<number, string> = {
    1: "Beginner I",
    2: "Beginner II",
    3: "Intermediate I",
    4: "Intermediate II",
    5: "Advanced I",
  };

  const levelName = user?.stats?.level ? levelNames[user.stats.level] || `Level ${user.stats.level}` : "Beginner I";

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-y-auto h-full p-4 md:p-12 bg-slate-50 dark:bg-slate-950 relative overflow-x-hidden">
        {/* Deep Batik Decoration Background */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-batik-pattern opacity-[0.03] dark:opacity-[0.07] pointer-events-none rounded-bl-[10rem] mask-image-gradient" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="max-w-[1100px] mx-auto flex flex-col gap-8">
          <DashboardHeader name={user?.name || "Budi"} />

          <StatsCards
            xp={user?.stats?.xp || 0}
            level={levelName}
            streak={user?.stats?.streak || 0}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <CourseProgress
              activeModule={activeModule as any}
              progress={progress}
              resumeLessonSlug={resumeLesson?.slug}
            />
            <RightSidebar
              wordOfTheDay={wordOfTheDay as any}
              leaderboard={leaderboardData as any}
            />
          </div>
        </div>
      </main>
    </>
  );
}

