
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Verifying Lesson Metadata...");

    const lessons = await prisma.lesson.findMany({
        select: {
            title: true,
            level: true,
            languageStyle: true,
        },
    });

    console.log(`Found ${lessons.length} lessons.`);

    const levels = new Set(lessons.map(l => l.level));
    const styles = new Set(lessons.map(l => l.languageStyle));

    console.log("Levels found:", Array.from(levels));
    console.log("Styles found:", Array.from(styles));

    // Check specific lesson "De Eerste Schooldag"
    const lesson1 = lessons.find(l => l.title.includes("Eerste Schooldag"));
    if (lesson1) {
        console.log(`\nLesson 1 Metadata: Level=${lesson1.level}, Style=${lesson1.languageStyle}`);
        if (lesson1.level?.includes("A1") && lesson1.languageStyle?.includes("Ngoko")) {
            console.log("✅ Lesson 1 metadata matches expected.");
        } else {
            console.error("❌ Lesson 1 metadata mismatch!");
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
