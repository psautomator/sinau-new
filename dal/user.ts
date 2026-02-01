import { prisma } from "./index";

/**
 * Fetches a user by ID with their stats.
 */
export async function getUserWithStats(id: string) {
    return await prisma.user.findUnique({
        where: { id },
        include: {
            stats: true,
        },
    });
}

/**
 * Updates a user's XP and checks for level up (simplified).
 */
export async function addExperience(userId: string, xpGain: number) {
    const stats = await prisma.userStats.findUnique({ where: { userId } });

    if (!stats) return null;

    const newTotalXp = stats.xp + xpGain;
    // Simple level formula: Level = floor(total_xp / 1000) + 1
    const newLevel = Math.floor(newTotalXp / 1000) + 1;

    return await prisma.userStats.update({
        where: { userId },
        data: {
            xp: newTotalXp,
            level: newLevel,
        },
    });
}

/**
 * Fetches the weekly leaderboard (top students by XP).
 */
export async function getLeaderboard(limit = 10) {
    return await prisma.userStats.findMany({
        orderBy: { xp: "desc" },
        take: limit,
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
    });
}

/**
 * Admin: Fetches users with search and pagination.
 */
export async function getUsers(options?: {
    search?: string;
    skip?: number;
    take?: number;
}) {
    const { search, skip = 0, take = 10 } = options || {};

    const where = search ? {
        OR: [
            { name: { contains: search, mode: "insensitive" as any } },
            { email: { contains: search, mode: "insensitive" as any } },
        ]
    } : {};

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            include: {
                stats: true,
            },
            orderBy: { createdAt: "desc" },
            skip,
            take,
        }),
        prisma.user.count({ where }),
    ]);

    return { users, total };
}

/**
 * Admin: Deletes a user.
 */
export async function deleteUser(id: string) {
    return await prisma.user.delete({
        where: { id },
    });
}
