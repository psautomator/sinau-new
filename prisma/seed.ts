import { PrismaClient, Formality } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting seeding...");

    // 1. Seed Admin User
    const adminId = "yRqMwBeKucN3haI66Gn0ccyZj482";
    await prisma.user.upsert({
        where: { id: adminId },
        update: {},
        create: {
            id: adminId,
            name: "Urrel Mozes",
            email: "earlfm@gmail.com",
            role: "ADMIN",
            xp: 500,
            level: 5,
            learningStreak: 12,
            stats: {
                create: {
                    xp: 500,
                    level: 5,
                    streak: 12,
                },
            },
        },
    });
    console.log("✅ Admin user seeded.");

    // 2. Process Lesmateriaal
    const lesmateriaalDir = path.join(process.cwd(), "reference", "lesmateriaal");
    if (!fs.existsSync(lesmateriaalDir)) {
        console.error("❌ Reference directory not found!");
        return;
    }

    const moduleDirs = fs
        .readdirSync(lesmateriaalDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory() && /^module-/i.test(dirent.name))
        .sort((a, b) => {
            const aNum = parseInt(a.name.match(/\d+/)?.[0] || "0");
            const bNum = parseInt(b.name.match(/\d+/)?.[0] || "0");
            return aNum - bNum;
        });

    for (const mDir of moduleDirs) {
        const moduleNumber = parseInt(mDir.name.match(/\d+/)?.[0] || "0");
        const modulePath = path.join(lesmateriaalDir, mDir.name);
        const moduleJsonPath = path.join(modulePath, "module.json");

        if (!fs.existsSync(moduleJsonPath)) continue;

        const moduleData = JSON.parse(fs.readFileSync(moduleJsonPath, "utf-8"));

        const seededModule = await prisma.module.upsert({
            where: { id: `mod-${moduleNumber}` }, // Stable ID based on module number
            update: {
                title: moduleData.title,
                description: moduleData.description,
                level: moduleData.level || "A1",
                order: moduleNumber,
                published: true,
            },
            create: {
                id: `mod-${moduleNumber}`,
                title: moduleData.title,
                description: moduleData.description,
                level: moduleData.level || "A1",
                order: moduleNumber,
                published: true,
            },
        });

        console.log(`📦 Module [${seededModule.order}]: ${seededModule.title}`);

        // Process Lessons in this module
        const lessonMdFiles = fs
            .readdirSync(modulePath)
            .filter((f) => f.endsWith(".md"))
            .sort();

        for (const [lIdx, mdFile] of lessonMdFiles.entries()) {
            const baseName = mdFile.replace(".md", "");
            const jsonFile = `${baseName}.json`;
            const jsonPath = path.join(modulePath, jsonFile);
            const mdPath = path.join(modulePath, mdFile);

            const contentMd = fs.readFileSync(mdPath, "utf-8");
            let vocabData = [];

            if (fs.existsSync(jsonPath)) {
                vocabData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
            }

            // Upsert Vocabulary and collect IDs
            const wordIds: string[] = [];
            for (const word of vocabData) {
                // Since Vocabulary doesn't have a unique constraint, we'll find or create
                let vocabItem = await prisma.vocabulary.findFirst({
                    where: {
                        word: word.javanese,
                        translation: word.dutch,
                        moduleId: seededModule.id,
                    },
                });

                if (!vocabItem) {
                    vocabItem = await prisma.vocabulary.create({
                        data: {
                            word: word.javanese,
                            translation: word.dutch,
                            category: word.category,
                            formality: mapFormality(word.formality),
                            moduleId: seededModule.id,
                            audioUrl: word.audioJavanese,
                            aiHint: word.aiHint,
                            exampleJavanese: word.exampleSentenceJavanese,
                            exampleDutch: word.exampleSentenceDutch,
                            notes: word.notes,
                            tags: word.tags || [],
                        },
                    });
                } else {
                    vocabItem = await prisma.vocabulary.update({
                        where: { id: vocabItem.id },
                        data: {
                            category: word.category,
                            formality: mapFormality(word.formality),
                            audioUrl: word.audioJavanese,
                            aiHint: word.aiHint,
                            exampleJavanese: word.exampleSentenceJavanese,
                            exampleDutch: word.exampleSentenceDutch,
                            notes: word.notes,
                            tags: word.tags || [],
                        },
                    });
                }
                wordIds.push(vocabItem.id);
            }

            // Parse markdown to extract description and sections
            const { parseMarkdownLesson } = await import("../lib/markdown-parser");
            const parsed = parseMarkdownLesson(contentMd);

            // Extract title from markdown
            const lessonTitle = extractTitleFromMd(contentMd) || baseName;

            // Use the description parsed by the library (which skips the section header)
            const lessonDescription = parsed.description || extractDescriptionFromMd(contentMd) || "";

            // 2. Map word IDs to their Javanese terms for easier matching
            const wordMap = new Map<string, string>();
            vocabData.forEach((word: any, vIdx: number) => {
                wordMap.set(wordIds[vIdx], word.javanese);
            });

            // 3. Process sections to match words based on presence in text
            const matchedWordIds = new Set<string>();
            const lessonSections = parsed.sections.map(section => {
                const text = (section.content.rawMarkdown || section.content.markdownText || "") + " " + (section.content.title || "");
                const sectionWordIds: string[] = [];

                for (const [dbId, javanese] of wordMap.entries()) {
                    // Match if the word is found in the text (case-insensitive)
                    // We check for several common patterns in the markdown
                    const lowerText = text.toLowerCase();
                    const lowerWord = javanese.toLowerCase();

                    if (lowerText.includes(lowerWord) ||
                        lowerText.includes(`\`${lowerWord}\``) ||
                        lowerText.includes(`**${lowerWord}**`)) {
                        sectionWordIds.push(dbId);

                        // Only mark as "matched" for fallback purposes if it lands in a FLASHCARD_SET
                        if (section.type === 'FLASHCARD_SET') {
                            matchedWordIds.add(dbId);
                        }
                    }
                }

                if (sectionWordIds.length > 0) {
                    // Only assign wordIds to sections that are explicitly meant for flashcards
                    if (section.type === 'FLASHCARD_SET') {
                        return {
                            ...section,
                            content: {
                                ...section.content,
                                wordIds: sectionWordIds
                            }
                        };
                    }
                }
                return section;
            });

            // 4. Handle remaining words that weren't matched to any section
            const remainingWordIds = wordIds.filter(id => !matchedWordIds.has(id));
            if (remainingWordIds.length > 0) {
                lessonSections.push({
                    id: `section-vocab-fallback`,
                    type: 'FLASHCARD_SET',
                    order: lessonSections.length + 1,
                    content: {
                        title: 'Extra Vocabulaire',
                        markdownText: 'Hieronder zie je de overige woorden uit deze les.',
                        wordIds: remainingWordIds
                    }
                } as any);
            }

            const seededLesson = await prisma.lesson.upsert({
                where: { slug: baseName },
                update: {
                    title: lessonTitle,
                    description: lessonDescription,
                    content: { sections: lessonSections } as any,
                    order: lIdx + 1,
                    moduleId: seededModule.id,
                    level: parsed.level || "A1",
                    languageStyle: parsed.languageStyle || "Ngoko",
                    published: true, // Auto-publish seeded lessons
                },
                create: {
                    title: lessonTitle,
                    slug: baseName,
                    description: lessonDescription,
                    content: { sections: lessonSections } as any,
                    order: lIdx + 1,
                    moduleId: seededModule.id,
                    level: parsed.level || "A1",
                    languageStyle: parsed.languageStyle || "Ngoko",
                    published: true, // Auto-publish seeded lessons
                },
            });
            console.log(`  📖 Lesson: ${lessonTitle}`);

            // 4. Process Quiz for this lesson
            const quizFile = `${baseName}-quiz.json`;
            const quizPath = path.join(modulePath, quizFile);

            if (fs.existsSync(quizPath)) {
                const quizData = JSON.parse(fs.readFileSync(quizPath, "utf-8"));

                const quiz = await prisma.quiz.upsert({
                    where: { lessonId: seededLesson.id },
                    update: {
                        title: quizData.title,
                        description: quizData.description,
                        published: true,
                    },
                    create: {
                        lessonId: seededLesson.id,
                        title: quizData.title,
                        description: quizData.description,
                        published: true,
                    }
                });

                // Upsert Quiz Questions
                for (const [idx, q] of quizData.questions.entries()) {
                    // Robust option mapping (matching dal/quizzes.ts and QuizClient expectations)
                    const options: any = {};
                    if (q.options) options.choices = q.options;
                    if (q.choices) options.choices = q.choices;
                    if (q.fillInAnswers) options.fillInAnswers = q.fillInAnswers;
                    if (q.matchItemsLeft) options.matchItemsLeft = q.matchItemsLeft;
                    if (q.matchItemsRight) options.matchItemsRight = q.matchItemsRight;
                    if (q.sentencePartsToReorder) options.sentencePartsToReorder = q.sentencePartsToReorder;
                    if (q.audioPromptUrl) options.audioPromptUrl = q.audioPromptUrl;
                    if (q.imagePromptUrl) options.imagePromptUrl = q.imagePromptUrl;

                    await prisma.quizQuestion.upsert({
                        where: { id: `${quiz.id}-q-${q.order || idx + 1}` },
                        update: {
                            order: q.order || idx + 1,
                            questionText: q.questionText,
                            questionType: q.questionType,
                            options: options,
                            explanation: q.explanation,
                        },
                        create: {
                            id: `${quiz.id}-q-${q.order || idx + 1}`,
                            quizId: quiz.id,
                            order: q.order || idx + 1,
                            questionText: q.questionText,
                            questionType: q.questionType,
                            options: options,
                            explanation: q.explanation,
                        }
                    });
                }
                // 5. Update Lesson again to link the quiz ID in sections if needed
                const updatedSections = lessonSections.map(section => {
                    if (section.type === "QUIZ_LINK" && section.content.quizSlug === `${baseName}-quiz`) {
                        return {
                            ...section,
                            content: {
                                ...section.content,
                                quizId: quiz.id
                            }
                        };
                    }
                    return section;
                });

                await prisma.lesson.update({
                    where: { id: seededLesson.id },
                    data: {
                        content: { sections: updatedSections } as any
                    }
                });

                console.log(`    🧠 Quiz: ${quizData.title} (${quizData.questions.length} questions)`);
            }
        }
    }

    console.log("✨ Seeding complete!");
}

function mapFormality(f: string): Formality {
    switch (f) {
        case "Ngoko":
            return Formality.NGOKO;
        case "KramaMadya":
        case "KramaInggil":
            if (f === "KramaInggil") return Formality.KRAMA_INGGIL;
            return Formality.KRAMA;
        case "Neutral":
        default:
            return Formality.NGOKO;
    }
}

function extractTitleFromMd(md: string): string | null {
    const match = md.match(/^#\s+(.+)$/m);
    return match ? match[1] : null;
}

function extractDescriptionFromMd(md: string): string | null {
    const match = md.match(/^##\s+📜\s+Beschrijving\n([\s\S]+?)(?=\n##|###|$)/);
    return match ? match[1].trim().split('\n')[0] : null;
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
