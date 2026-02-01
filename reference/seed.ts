
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { ContentBlock, Quiz as ClientQuiz, LessonImportData, WordImportData } from '@/lib/data';
import { ALL_ACHIEVEMENTS } from '@/lib/achievements-data';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.user.count();
  } catch (e: any) {
    if (e.code === 'P2021' || (e.message && e.message.includes('does not exist'))) {
      console.error(`
[Seed Script Error] Database tables not found.
Please run 'npx prisma migrate dev' to create the database tables,
and then run this seed command again.
      `);
      process.exit(1);
    }
    throw e;
  }

  console.log(`Start seeding ...`);

  // --- Seed Users (example) ---
  console.log('Seeding users...');
  const usersData = [
    {
      id: "yRqMwBeKucN3haI66Gn0ccyZj482",
      name: "Urrel Mozes",
      email: "earlfm@gmail.com",
      role: "ADMIN" as const,
      photoURL: "https://lh3.googleusercontent.com/a/ACg8ocLXPwjdFPW9as90r_ZUvo9bk0yhDH83_JTJt-osVmSmbmBTeA=s96-c",
      xp: 0,
      level: 1,
      learningStreak: 0,
      themePreference: 'theme-sky-blue',
      quizCompletions: 0,
      moduleCompletions: 0,
      feedbackSubmissionsCount: 0,
      lessonNotesCount: 0,
      lessonsCompletedCount: 0,
      learnedWordsViaSrsCount: 0,
    }
  ];
  for (const userData of usersData) {
    await prisma.user.upsert({
      where: { id: userData.id },
      update: {},
      create: userData,
    });
  }
  console.log(`Seeded ${usersData.length} users.`);
  
  // --- Upsert Achievements ---
  console.log('Seeding achievement definitions...');
  for (const achDef of ALL_ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { code: achDef.code },
      update: { ...achDef, criteria: achDef.criteria as any },
      create: { ...achDef, criteria: achDef.criteria as any }
    });
  }
  console.log(`Seeded ${ALL_ACHIEVEMENTS.length} achievement definitions.`);
  
  // --- Process and Seed Content from 'lesmateriaal' ---
  console.log('--- Starting Content Seeding from Files ---');
  await seedContentFromLesmateriaal();
  console.log('--- Finished Content Seeding ---');
}

async function seedContentFromLesmateriaal() {
    const lesmateriaalDir = path.join(process.cwd(), 'docs', 'lesmateriaal');
    if (!fs.existsSync(lesmateriaalDir)) {
        console.log("Directory 'docs/lesmateriaal' not found, skipping content seeding.");
        return;
    }

    const moduleDirs = fs.readdirSync(lesmateriaalDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('module-'))
        .sort((a, b) => a.name.localeCompare(b.name));

    for (const [moduleIndex, moduleDir] of moduleDirs.entries()) {
        const modulePath = path.join(lesmateriaalDir, moduleDir.name);
        const moduleJsonPath = path.join(modulePath, 'module.json');

        if (!fs.existsSync(moduleJsonPath)) {
            console.warn(`Skipping module ${moduleDir.name}: module.json not found.`);
            continue;
        }

        const moduleJsonContent = fs.readFileSync(moduleJsonPath, 'utf-8');
        const moduleData = JSON.parse(moduleJsonContent);
        
        const seededModule = await prisma.module.upsert({
            where: { title: moduleData.title },
            update: { ...moduleData, order: moduleIndex + 1 },
            create: { ...moduleData, order: moduleIndex + 1 },
        });
        console.log(`[Module] Upserted: ${seededModule.title}`);

        const lessonFiles = fs.readdirSync(modulePath)
            .filter(file => file.endsWith('.json') && !file.includes('module.json') && !file.includes('-quiz'));
        
        for (const [lessonIndex, lessonFile] of lessonFiles.entries()) {
            const lessonPath = path.join(modulePath, lessonFile);
            const lessonContent = fs.readFileSync(lessonPath, 'utf-8');
            const lessonData = JSON.parse(lessonContent) as any; // Allow any for seed data flexibility

            const lessonPayload = {
                title: lessonData.title,
                description: lessonData.description,
                order: lessonData.order ?? lessonIndex + 1,
                isPublished: lessonData.isPublished ?? false,
                moduleId: seededModule.id,
                sectionsJson: (lessonData.sections as any) || [],
            };

            await prisma.lesson.upsert({
                where: { title_moduleId: { title: lessonData.title, moduleId: seededModule.id } },
                update: lessonPayload,
                create: lessonPayload,
            });
            console.log(`  [Lesson] Upserted: ${lessonData.title}`);
        }

        // Separate logic for quizzes if they are still separate files
        const quizFiles = fs.readdirSync(modulePath).filter(file => file.endsWith('-quiz.json'));
        for(const quizFile of quizFiles) {
            const quizPath = path.join(modulePath, quizFile);
            const quizFileContent = fs.readFileSync(quizPath, 'utf-8');
            const quizzesToSeed: ClientQuiz[] = JSON.parse(quizFileContent);

            for (const quizData of quizzesToSeed) {
                const quizQuestionsForPrisma = quizData.questions.map(q => ({...q}));

                await prisma.quiz.upsert({
                    where: { title: quizData.title },
                    update: { ...quizData, questions: quizQuestionsForPrisma as any },
                    create: { ...quizData, questions: quizQuestionsForPrisma as any },
                });
            }
        }
    }

    // Now, handle supplementary word imports if they exist in a different directory
    const importsDir = path.join(process.cwd(), 'imports');
    if (fs.existsSync(importsDir)) {
      const wordImportFiles = fs.readdirSync(importsDir).filter(file => file.endsWith('.json'));
      for (const file of wordImportFiles) {
        console.log(`[Words] Processing supplementary word file: ${file}`);
        const filePath = path.join(importsDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        try {
          const wordsToImport: WordImportData = JSON.parse(fileContent);
          await bulkUpsertWords(wordsToImport);
        } catch (e) {
          console.error(`Error parsing or importing words from ${file}:`, e);
        }
      }
    }
}

// This function is kept separate as it can be used by the Admin UI as well
export async function bulkUpsertWords(words: WordImportData): Promise<{
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  warnings: string[];
}> {
  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  const warnings: string[] = [];

  const allLessons = await prisma.lesson.findMany({ select: { sectionsJson: true } });
  const usedWordIds = new Set<string>();
  allLessons.forEach((lesson) => {
    const sections = (lesson.sectionsJson as ContentBlock[]) || [];
    sections.forEach((section) => {
      if (section.type === 'FLASHCARD_SET' && Array.isArray(section.content.wordIds)) {
        section.content.wordIds.forEach(id => usedWordIds.add(id));
      }
    });
  });

  for (const importedWord of words) {
    await prisma.$transaction(async (tx) => {
      const { tags, ...restOfWordData } = importedWord;
      const dataForDb = {
        ...restOfWordData,
        id: importedWord.id || uuidv4(),
        tags: tags ? JSON.stringify(tags) : '[]'
      };
      
      const existingWordById = importedWord.id ? await tx.word.findUnique({ where: { id: importedWord.id } }) : null;
      const existingWordByTerm = await tx.word.findUnique({ where: { javanese_dutch: { javanese: importedWord.javanese, dutch: importedWord.dutch } } });

      if (existingWordById) {
        await tx.word.update({ where: { id: importedWord.id }, data: dataForDb });
        updatedCount++;
      } else if (existingWordByTerm) {
         warnings.push(`SKIPPED: "${importedWord.javanese}" already exists with a different ID (${existingWordByTerm.id}). Your import file tried to use ID ${dataForDb.id || 'new'}.`)
         skippedCount++;
      } else {
        await tx.word.create({ data: dataForDb });
        createdCount++;
      }
    });
  }

  return { createdCount, updatedCount, skippedCount, warnings };
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

    