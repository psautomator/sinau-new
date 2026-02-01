import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const categories = await prisma.vocabulary.groupBy({
        by: ['category'],
    });
    console.log("Categories found in DB:", categories.map(c => c.category).filter(Boolean));
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
