import { prisma } from "./index";

export type FeedbackStatus = "NEW" | "IN_PROGRESS" | "RESOLVED" | "DISMISSED";
export type FeedbackType = "BUG" | "TYPO" | "SUGGESTION" | "CONTENT_ISSUE" | "OTHER";
export type FeedbackPriority = "LOW" | "MEDIUM" | "HIGH";

export async function createFeedback(data: {
    userId?: string;
    message: string;
    feedbackType?: FeedbackType;
    pageUrl?: string;
    lessonId?: string;
    vocabId?: string;
    priority?: FeedbackPriority;
}) {
    return await prisma.feedback.create({
        data: {
            ...data,
            status: "NEW",
        }
    });
}

export async function getFeedbackReports(filters?: {
    status?: FeedbackStatus;
    type?: FeedbackType;
}) {
    return await prisma.feedback.findMany({
        where: {
            ...(filters?.status && { status: filters.status }),
            ...(filters?.type && { feedbackType: filters.type }),
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    photoURL: true
                }
            },
            lesson: {
                select: {
                    title: true,
                    slug: true
                }
            },
            vocab: {
                select: {
                    word: true,
                    translation: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });
}

export async function updateFeedbackStatus(id: string, status: FeedbackStatus) {
    return await prisma.feedback.update({
        where: { id },
        data: { status }
    });
}

export async function deleteFeedback(id: string) {
    return await prisma.feedback.delete({
        where: { id }
    });
}
