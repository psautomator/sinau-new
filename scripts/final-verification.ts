import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("--- FINAL VERIFICATION ---");

    // Check Formality
    const formalityCounts = await prisma.vocabulary.groupBy({
        by: ['formality'],
        _count: {
            id: true
        }
    });
    console.log("Formality Distribution:", formalityCounts);

    // Check Level on Lessons
    const lessonLevelCounts = await prisma.lesson.groupBy({
        by: ['level'],
        _count: {
            id: true
        }
    });
    console.log("Lesson Level Distribution:", lessonLevelCounts);

    // Check Level on Vocabulary
    const vocabLevelCounts = await prisma.vocabulary.groupBy({
        by: ['level'],
        _count: {
            id: true
        }
    });
    console.log("Vocab Level Distribution:", vocabLevelCounts);

    // Sample NEUTRAL words
    const neutralWords = await prisma.vocabulary.findMany({
        where: { formality: 'NEUTRAL' },
        take: 5,
        select: { word: true, translation: true, level: true }
    });
    console.log("Sample Neutral Words:", neutralWords);

    console.log("--- END ---");
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
