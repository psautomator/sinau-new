const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
console.log('Prisma Client loaded');
// Check if types are available (at runtime we can only check values, but we can check if the model property exists on the instance)
console.log('QuizQuestion model:', !!prisma.quizQuestion);
console.log('Quiz model:', !!prisma.quiz);
