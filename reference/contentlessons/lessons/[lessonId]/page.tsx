
import { getLessonWithProgressForUser, getWordsByIds, getQuizzesByIds, getNextLesson, getPreviousLesson, getModuleById } from '@/lib/dal';
import { notFound } from 'next/navigation';
import type { ContentBlock, FlashcardSetSectionContent, QuizLinkSectionContent } from '@/lib/data';
import type { Word, Quiz, UserLessonProgress, Module } from '@prisma/client';
import { LessonPageClient } from './lesson-page-client';
import type { Prisma } from '@prisma/client';
import { AppLayout } from '@/components/layout/app-layout';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth-utils';


export type LessonWithModuleAndProgress = Prisma.LessonGetPayload<{
    include: { module: true, progress: true }
}>

export default async function LessonDetailPage(props: { params: Promise<{ lessonId: string, moduleId: string }> }) {
    const { params } = props;
    const resolvedParams = await params;
    const { lessonId } = resolvedParams;
    const user = await getCurrentUser();

    if (!user) {
        notFound();
    }
    
    const lesson = await getLessonWithProgressForUser(lessonId, user.id);

    if (!lesson || !lesson.isPublished) {
        notFound();
    }
    
    const sections = lesson.sectionsJson as ContentBlock[] || [];

    const wordIds = sections
        .filter((s): s is FlashcardSetSectionContent => s.type === 'FLASHCARD_SET')
        .flatMap(s => (s.content?.wordIds && Array.isArray(s.content.wordIds) ? s.content.wordIds : []))
        .filter((id, index, self) => self.indexOf(id) === index);
        
    const quizIds = sections
        .filter((s): s is QuizLinkSectionContent => s.type === 'QUIZ_LINK')
        .map(s => s.content.quizId)
        .filter((id, index, self) => id && self.indexOf(id) === index);
    
    const [wordsForLesson, quizzesForLesson, prevLesson, nextLesson] = await Promise.all([
        getWordsByIds(wordIds),
        getQuizzesByIds(quizIds),
        getPreviousLesson(lessonId),
        getNextLesson(lessonId)
    ]);
    
    const prevLessonUrl = prevLesson ? `/modules/${prevLesson.moduleId}/lessons/${prevLesson.id}` : null;
    const nextLessonUrl = nextLesson ? `/modules/${nextLesson.moduleId}/lessons/${nextLesson.id}` : null;

    const headerContent = (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/modules" className="hover:text-foreground">Modules</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/modules/${lesson.moduleId}`} className="hover:text-foreground truncate max-w-48 md:max-w-96">{lesson.module.title}</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-semibold text-foreground truncate">{lesson.title}</span>
      </div>
    );

    return (
        <AppLayout headerContent={headerContent}>
            <LessonPageClient 
                lesson={lesson as LessonWithModuleAndProgress} 
                words={wordsForLesson} 
                quizzes={quizzesForLesson}
                prevLessonUrl={prevLessonUrl}
                nextLessonUrl={nextLessonUrl}
            />
        </AppLayout>
    );
}
