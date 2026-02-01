import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const modulesCount = await prisma.module.count();
    const lessonsCount = await prisma.lesson.count();
    const vocabCount = await prisma.vocabulary.count();
    const quizzesCount = await prisma.quiz.count();
    const questionsCount = await prisma.quizQuestion.count();

    console.log("📊 Database Verification Results:");
    console.log(`- Modules: ${modulesCount}`);
    console.log(`- Lessons: ${lessonsCount}`);
    console.log(`- Vocabulary: ${vocabCount}`);
    console.log(`- Quizzes: ${quizzesCount}`);
    console.log(`- Quiz Questions: ${questionsCount}`);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
