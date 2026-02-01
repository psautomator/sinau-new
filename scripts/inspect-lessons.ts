import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function inspectLessons() {
    const lessons = await prisma.lesson.findMany({
        select: {
            id: true,
            title: true,
            description: true,
            content: true,
            level: true,
            languageStyle: true
        }
    });

    console.log(`Found ${lessons.length} lessons.`);

    for (const lesson of lessons) {
        console.log(`\n--- Lesson: ${lesson.title} (ID: ${lesson.id}) ---`);
        console.log(`Current DB Level: ${lesson.level}, Style: ${lesson.languageStyle}`);
        console.log(`Description: ${lesson.description}`);

        const content = lesson.content as any;
        if (content && content.sections) {
            const intros = content.sections.filter((s: any) => s.type === 'MARKDOWN');
            intros.forEach((s: any, i: number) => {
                console.log(`Markdown Block ${i + 1}: ${s.content?.markdownText?.substring(0, 100)}...`);
            });
        }
    }
}

inspectLessons()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
