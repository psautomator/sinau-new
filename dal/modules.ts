import { prisma } from "./index";

/**
 * Fetches all published modules for the learner dashboard.
 */
export async function getPublishedModules() {
    return await prisma.module.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
        include: {
            _count: {
                select: { lessons: true },
            },
            lessons: {
                take: 1,
                orderBy: { order: "asc" },
                select: { slug: true }
            }
        },
    });
}

/**
 * Fetches a single module by ID with its lessons.
 */
export async function getModuleWithLessons(id: string) {
    return await prisma.module.findUnique({
        where: { id },
        include: {
            lessons: {
                orderBy: { order: "asc" },
            },
        },
    });
}

/**
 * Admin: Fetches modules with filtering and pagination.
 */
export async function getAdminModules(params: {
    search?: string;
    level?: string;
    published?: boolean;
    skip?: number;
    take?: number;
} = {}) {
    const { search, level, published, skip, take } = params;

    const where: any = {};
    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
        ];
    }
    if (level) where.level = level;
    if (published !== undefined) where.published = published;

    const [modules, total] = await Promise.all([
        prisma.module.findMany({
            where,
            orderBy: { order: "asc" },
            include: {
                _count: {
                    select: { lessons: true },
                },
            },
            skip,
            take,
        }),
        prisma.module.count({ where }),
    ]);

    return { modules, total };
}

/**
 * Admin: Creates a new module.
 */
export async function createModule(data: {
    title: string;
    description: string;
    level: string;
    order: number;
    icon?: string;
    imageColor?: string;
    published?: boolean;
}) {
    return await prisma.module.create({
        data,
    });
}

/**
 * Admin: Updates an existing module.
 */
export async function updateModule(id: string, data: Partial<{
    title: string;
    description: string;
    level: string;
    order: number;
    icon?: string;
    imageColor?: string;
    published?: boolean;
}>) {
    return await prisma.module.update({
        where: { id },
        data,
    });
}

/**
 * Admin: Deletes a module.
 */
export async function deleteModule(id: string) {
    return await prisma.module.delete({
        where: { id },
    });
}

/**
 * Fetches all modules (simple list) for dropdowns.
 */
export async function getAllModulesSimple() {
    return await prisma.module.findMany({
        select: { id: true, title: true },
        orderBy: { order: "asc" },
    });
}

/**
 * Admin: Bulk upserts modules from an array.
 */
export async function bulkUpsertModules(modules: any[]) {
    let createdCount = 0;
    let updatedCount = 0;

    for (const moduleData of modules) {
        // Try to find by title as a unique-ish identifier for import
        const existing = await prisma.module.findFirst({
            where: { title: moduleData.title }
        });

        const payload = {
            title: moduleData.title,
            description: moduleData.description,
            level: moduleData.level || "A1",
            order: moduleData.order || 0,
            published: moduleData.isPublished ?? moduleData.published ?? false,
        };

        if (existing) {
            await prisma.module.update({
                where: { id: existing.id },
                data: payload
            });
            updatedCount++;
        } else {
            await prisma.module.create({
                data: payload
            });
            createdCount++;
        }
    }

    return { createdCount, updatedCount };
}
