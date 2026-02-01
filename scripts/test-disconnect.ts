
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Testing Lesson-Quiz disconnection...");

    // Find a lesson with a quiz
    const lessonWithQuiz = await prisma.lesson.findFirst({
        where: { quiz: { isNot: null } },
        include: { quiz: true }
    });

    if (!lessonWithQuiz) {
        console.log("No lesson found with a quiz. Please run seed first.");
        return;
    }

    console.log(`Found lesson "${lessonWithQuiz.title}" with quiz "${lessonWithQuiz.quiz?.title}"`);

    try {
        console.log("Attempting to disconnect quiz...");
        const updatedLesson = await prisma.lesson.update({
            where: { id: lessonWithQuiz.id },
            data: {
                quiz: {
                    disconnect: true
                }
            },
            include: { quiz: true }
        });

        if (!updatedLesson.quiz) {
            console.log("✅ Successfully disconnected quiz!");
        } else {
            console.error("❌ Quiz still attached!");
        }

        // Reconnect it back just in case
        console.log("Reconnecting quiz...");
        await prisma.lesson.update({
            where: { id: lessonWithQuiz.id },
            data: {
                quiz: {
                    connect: { id: lessonWithQuiz.quiz!.id }
                }
            }
        });
        console.log("✅ Successfully reconnected quiz.");

    } catch (error: any) {
        console.error("❌ Error during disconnection test:");
        console.error(error.message);
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
