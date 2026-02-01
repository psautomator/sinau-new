import { prisma } from "./index";

export async function getQuizzes(options?: {
    search?: string;
    skip?: number;
    take?: number;
}) {
    const { search, skip = 0, take = 10 } = options || {};

    const where = search ? {
        OR: [
            { title: { contains: search, mode: "insensitive" as any } },
            { description: { contains: search, mode: "insensitive" as any } },
        ]
    } : {};

    const [quizzes, total] = await Promise.all([
        prisma.quiz.findMany({
            where,
            include: {
                lesson: {
                    select: {
                        title: true,
                        module: {
                            select: { title: true }
                        }
                    }
                },
                _count: {
                    select: { questions: true }
                },
                questions: {
                    orderBy: { order: "asc" }
                }
            },
            orderBy: { createdAt: "desc" },
            skip,
            take,
        }),
        prisma.quiz.count({ where }),
    ]);

    return { quizzes, total };
}

export async function getQuizById(id: string) {
    return await prisma.quiz.findUnique({
        where: { id },
        include: {
            questions: {
                orderBy: { order: "asc" }
            },
            lesson: true
        }
    });
}

/**
 * Fetches all quizzes (simple list) for dropdowns.
 */
export async function getAllQuizzesSimple() {
    return await prisma.quiz.findMany({
        select: { id: true, title: true },
        orderBy: { createdAt: "desc" },
    });
}

/**
 * Creates a new quiz.
 */
export async function createQuiz(data: any) {
    return await prisma.quiz.create({
        data: {
            title: data.title,
            description: data.description,
            lessonId: data.lessonId,
            published: data.published || false,
            questions: data.questions ? {
                create: data.questions.map((q: any, index: number) => ({
                    order: q.order || index,
                    questionText: q.questionText,
                    questionType: q.questionType || "MULTIPLE_CHOICE",
                    options: q.options || {},
                    explanation: q.explanation || "",
                }))
            } : undefined
        },
    });
}

/**
 * Updates an existing quiz.
 */
export async function updateQuiz(id: string, data: any) {
    // Basic approach: delete existing questions and recreate
    // This is simpler for JSON-based bulk editing
    if (data.questions) {
        await prisma.quizQuestion.deleteMany({
            where: { quizId: id }
        });
    }

    return await prisma.quiz.update({
        where: { id },
        data: {
            title: data.title,
            description: data.description,
            lessonId: data.lessonId,
            published: data.published,
            questions: data.questions ? {
                create: data.questions.map((q: any, index: number) => ({
                    order: q.order || index,
                    questionText: q.questionText,
                    questionType: q.questionType || "MULTIPLE_CHOICE",
                    options: q.options || {},
                    explanation: q.explanation || "",
                }))
            } : undefined
        },
    });
}

/**
 * Deletes a quiz.
 */
export async function deleteQuiz(id: string) {
    return await prisma.quiz.delete({
        where: { id },
    });
}

/**
 * Admin: Bulk upserts quizzes. Matches with lessons by title/slug if lessonId is missing.
 */
export async function bulkUpsertQuizzes(quizzes: any[]) {
    let createdCount = 0;
    let updatedCount = 0;

    for (const quizData of quizzes) {
        let lessonId = quizData.lessonId;

        // Heuristic: If lessonId is missing, try to find a lesson with a matching title or slug
        if (!lessonId) {
            // Try to match title or parts of the quiz title
            // e.g. "Module 1: Les 1 Quiz - De Eerste Schooldag" -> "De Eerste Schooldag"
            const searchTitle = quizData.title.split(' - ').pop() || quizData.title;
            const lesson = await prisma.lesson.findFirst({
                where: {
                    OR: [
                        { title: { contains: searchTitle, mode: 'insensitive' } },
                        { slug: { contains: searchTitle.toLowerCase().replace(/\s+/g, '-'), mode: 'insensitive' } }
                    ]
                }
            });
            if (lesson) lessonId = lesson.id;
        }

        if (!lessonId) {
            console.warn(`Skipping quiz "${quizData.title}": No matching lesson found.`);
            continue;
        }

        const existing = await prisma.quiz.findUnique({
            where: { lessonId }
        });

        const questionsPayload = {
            create: quizData.questions.map((q: any, idx: number) => {
                // Combine all properties into options to maintain compatibility
                const options: any = { ...q.options };

                if (q.fillInAnswers) options.fillInAnswers = q.fillInAnswers;
                if (q.matchItemsLeft) options.matchItemsLeft = q.matchItemsLeft;
                if (q.matchItemsRight) options.matchItemsRight = q.matchItemsRight;
                if (q.sentencePartsToReorder) options.sentencePartsToReorder = q.sentencePartsToReorder;
                if (q.audioPromptUrl) options.audioPromptUrl = q.audioPromptUrl;
                if (q.imagePromptUrl) options.imagePromptUrl = q.imagePromptUrl;
                if (q.choices) options.choices = q.choices; // Sometimes choices are top-level in legacy

                return {
                    order: q.order || idx + 1,
                    questionText: q.questionText,
                    questionType: q.questionType || "MULTIPLE_CHOICE",
                    options: options,
                    explanation: q.explanation || "",
                };
            })
        };

        if (existing) {
            // Delete old questions first
            await prisma.quizQuestion.deleteMany({ where: { quizId: existing.id } });

            await prisma.quiz.update({
                where: { id: existing.id },
                data: {
                    title: quizData.title,
                    description: quizData.description || "",
                    published: quizData.published ?? quizData.isPublished ?? false,
                    questions: questionsPayload
                }
            });
            updatedCount++;
        } else {
            await prisma.quiz.create({
                data: {
                    title: quizData.title,
                    description: quizData.description || "",
                    lessonId,
                    published: quizData.published ?? quizData.isPublished ?? false,
                    questions: questionsPayload
                }
            });
            createdCount++;
        }
    }

    return { createdCount, updatedCount };
}
