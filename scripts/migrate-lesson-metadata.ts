import { PrismaClient } from "@prisma/client";
import { extractLessonMetadata } from "../lib/metadata-utils.ts";
const prisma = new PrismaClient();

async function migrateMetadata() {
    const lessons = await prisma.lesson.findMany();
    console.log(`Analyzing ${lessons.length} lessons...`);

    let updatedCount = 0;

    for (const lesson of lessons) {
        const { level: detectedLevel, languageStyle: detectedStyle } = extractLessonMetadata({
            description: lesson.description,
            content: lesson.content
        });

        // Use detected values if found, otherwise keep current (but cleanup junk)
        let finalLevel = detectedLevel || lesson.level;
        let finalStyle = detectedStyle || lesson.languageStyle;

        // Cleanup legacy junk from previous failed runs
        if (finalStyle === '**') finalStyle = 'Ngoko';
        if (!finalLevel) finalLevel = 'A1';
        if (!finalStyle) finalStyle = 'Ngoko';

        if (finalLevel !== lesson.level || finalStyle !== lesson.languageStyle) {
            console.log(`Updating ${lesson.title}: [${lesson.level} -> ${finalLevel}], [${lesson.languageStyle} -> ${finalStyle}]`);
            await prisma.lesson.update({
                where: { id: lesson.id },
                data: {
                    level: finalLevel,
                    languageStyle: finalStyle
                }
            });
            updatedCount++;
        }
    }

    console.log(`Migration complete. Updated ${updatedCount} lessons.`);
}

migrateMetadata()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
