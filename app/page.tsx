import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import StatsCards from "@/components/StatsCards";
import CourseProgress from "@/components/CourseProgress";
import RightSidebar from "@/components/RightSidebar";
import { getUserWithStats, getLeaderboard } from "@/dal/user";
import { getPublishedModules } from "@/dal/modules";
import { getUserModuleProgress } from "@/dal/lessons";
import { getWordOfTheDay, getVocabulary } from "@/dal/vocabulary";
import { MOCK_USER_ID } from "@/lib/mock-auth";

export default async function Home() {
  const user = await getUserWithStats(MOCK_USER_ID);
  const leaderboardData = await getLeaderboard(5);
  const modules = await getPublishedModules();
  const { vocabulary } = await getVocabulary({ take: 10 });
  const wordOfTheDay = await getWordOfTheDay(MOCK_USER_ID);

  // Pick first module as "active" for now
  const activeModule = modules[0] || null;
  const progress = activeModule ? await getUserModuleProgress(MOCK_USER_ID, activeModule.id) : 0;

  // Map level mapping or fallback
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
      <main className="flex-1 overflow-y-auto h-full p-4 md:p-8 bg-background-light dark:bg-background-dark relative">
        {/* Background Batik Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-batik-pattern opacity-30 pointer-events-none rounded-bl-full mask-image-gradient"></div>

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
              activeModule={activeModule}
              progress={progress}
            />
            <RightSidebar
              wordOfTheDay={wordOfTheDay}
              leaderboard={leaderboardData}
            />
          </div>
        </div>
      </main>
    </>
  );
}

