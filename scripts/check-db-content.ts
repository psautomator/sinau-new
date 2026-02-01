import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const lesson = await prisma.lesson.findFirst({
        where: { slug: "01-de-eerste-schooldag" }
    });

    if (!lesson) {
        console.log("Lesson not found");
        return;
    }

    console.log("--- START CONTENT ---");
    console.log(JSON.stringify((lesson.content as any).sections[0].content));
    console.log("--- END CONTENT ---");
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
