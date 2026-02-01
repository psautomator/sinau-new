import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const vocabItems = await prisma.vocabulary.findMany({
        take: 5,
        orderBy: { id: 'desc' }
    });

    console.log("--- VOCABULARY ITEMS ---");
    vocabItems.forEach(item => {
        console.log(`Word: ${item.word}, Level: ${item.level}`);
    });
    console.log("--- END ---");
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
