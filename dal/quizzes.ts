import { prisma } from "./index";
import * as fs from "fs";
import * as path from "path";

export async function getQuizzes(options?: {
    search?: string;
    status?: 'all' | 'complete' | 'incomplete';
    moduleId?: string;
    published?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    skip?: number;
    take?: number;
}) {
    const {
        search,
        status = 'all',
        moduleId,
        published,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        skip = 0,
        take = 10
    } = options || {};

    let where: any = {};
    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" as any } },
            { description: { contains: search, mode: "insensitive" as any } },
        ];
    }

    if (moduleId) {
        where.lesson = {
            moduleId: moduleId
        };
    }

    if (published !== undefined) {
        where.published = published;
    }

    const orderBy: any = {};
    if (sortBy === 'title' || sortBy === 'createdAt') {
        orderBy[sortBy] = sortOrder;
    } else {
        orderBy.createdAt = 'desc';
    }

    const [quizzesData, total] = await Promise.all([
        prisma.quiz.findMany({
            where,
            include: {
                lesson: {
                    select: {
                        title: true,
                        slug: true,
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
            orderBy,
            // We can't easily paginate in DB if we filter by validation status (which is computed)
            // But if status is 'all', we can use skip/take.
            // If status is filtered, we'll fetch more and filter in JS for now or handle it better.
            // For simplicity in this small app, we fetch all for the current search and filter.
            // In a larger app, we'd store the 'isValid' status in the DB.
            skip: status === 'all' ? skip : undefined,
            take: status === 'all' ? take : undefined,
        }),
        prisma.quiz.count({ where }),
    ]);

    const quizzesWithValidation = quizzesData.map(quiz => {
        const validation = validateQuiz(quiz);
        return {
            ...quiz,
            isValid: validation.isValid,
            issues: validation.issues
        };
    });

    let finalQuizzes = quizzesWithValidation;
    let finalTotal = total;

    if (status !== 'all') {
        finalQuizzes = quizzesWithValidation.filter(q => status === 'complete' ? q.isValid : !q.isValid);
        finalTotal = finalQuizzes.length;
        // Manual pagination for filtered results
        finalQuizzes = finalQuizzes.slice(skip, skip + take);
    }

    return { quizzes: finalQuizzes, total: finalTotal };
}

/**
 * Validates a quiz for completeness and audio file presence.
 */
export function validateQuiz(quiz: any) {
    const issues: string[] = [];
    const questions = quiz.questions || [];

    if (questions.length === 0) {
        issues.push("Quiz has no questions.");
    }

    questions.forEach((q: any, idx: number) => {
        const qNum = idx + 1;
        const options = (q.options as any) || {};

        if (!q.questionText || q.questionText.trim() === "") {
            issues.push(`Q${qNum}: Question text is empty.`);
        }

        // Audio Checks
        const audioUrl = options.audioUrl || options.audioPromptUrl;
        const audioDependentTypes = ["TYPE_HEARD_AUDIO", "MULTI_SELECT_AUDIO_WORDS", "AUDIO_CHOICE"];

        if (audioDependentTypes.includes(q.questionType) && !audioUrl) {
            issues.push(`Q${qNum}: Missing required audio for type ${q.questionType}.`);
        }

        if (audioUrl) {
            const relativePath = audioUrl.startsWith('/') ? audioUrl.substring(1) : audioUrl;
            const fullPath = path.join(process.cwd(), "public", relativePath);
            if (!fs.existsSync(fullPath)) {
                issues.push(`Q${qNum}: Audio file not found: ${audioUrl}`);
            }
        }

        // MCQ Checks
        if (q.questionType === "MULTIPLE_CHOICE" || q.questionType === "AUDIO_CHOICE" || q.questionType === "STORY_MCQ") {
            const choices = options.choices || [];
            if (choices.length === 0) {
                issues.push(`Q${qNum}: No choices provided.`);
            } else if (!choices.some((c: any) => c.isCorrect)) {
                issues.push(`Q${qNum}: No correct answer designated.`);
            }
        }

        // Fill-in Checks
        if (q.questionType === "FILL_IN_THE_BLANK" || q.questionType === "TYPE_HEARD_AUDIO") {
            const answers = options.answers || options.fillInAnswers || [];
            if (answers.length === 0) {
                issues.push(`Q${qNum}: No accepted answers provided.`);
            }
        }

        // Match Pairs Checks
        if (q.questionType === "MATCH_PAIRS") {
            const left = options.matchItemsLeft || [];
            const right = options.matchItemsRight || [];
            if (left.length === 0 || right.length === 0) {
                issues.push(`Q${qNum}: Missing match items.`);
            } else if (left.length !== right.length) {
                issues.push(`Q${qNum}: Left and right match items count mismatch.`);
            }
        }
    });

    return {
        isValid: issues.length === 0,
        issues
    };
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
