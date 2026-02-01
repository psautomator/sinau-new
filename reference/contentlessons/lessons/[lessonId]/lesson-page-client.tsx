
'use client';

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { LessonWithModuleAndProgress } from "./page";
import type { ContentBlock, FlashcardSetSectionContent, QuizLinkSectionContent, EmbeddedMediaContentBlock, Quiz as QuizType } from '@/lib/data';
import type { Word, Quiz } from '@prisma/client';
import { InteractiveFlashcardViewer } from "./interactive-flashcard-viewer";
import { QuizPlayer } from '@/components/quiz/quiz-player';
import { prismaQuizToClientQuizHelper } from '@/lib/data';
import { completeLessonAction } from './actions';
import { useToast } from "@/hooks/use-toast";
import {
    ArrowLeft, ArrowRight, Check, Lightbulb, Loader2, AlertTriangle, BookOpenText, FileQuestion, Youtube, Headphones, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FeedbackButton } from "@/components/feedback-button";
import { Separator } from "@/components/ui/separator";
import { upsertQuizProgress, awardXpForQuizCompletion } from '@/app/quizzes/actions';


interface LessonPageClientProps {
    lesson: LessonWithModuleAndProgress;
    words: Word[];
    quizzes: Quiz[];
    prevLessonUrl: string | null;
    nextLessonUrl: string | null;
}

export function LessonPageClient({ lesson, words: allWordsForFlashcards, quizzes: allQuizzesForLinks, prevLessonUrl, nextLessonUrl }: LessonPageClientProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isCompleting, setIsCompleting] = React.useState(false);
    
    const isCompleted = lesson.progress && lesson.progress.length > 0 && lesson.progress[0].status === 'COMPLETED';

    const handleCompleteLesson = async () => {
        setIsCompleting(true);
        const result = await completeLessonAction(lesson.id);

        if (result.success) {
            toast({
                title: "Les Voltooid!",
                description: "Goed gedaan! Je hebt 50 XP verdiend.",
                className: "bg-green-100 dark:bg-green-900 border-green-300",
            });
            if (result.nextLessonUrl) {
                router.push(result.nextLessonUrl);
            } else {
                router.push(result.moduleUrl || '/modules');
            }
        } else {
            toast({
                variant: "destructive",
                title: "Oeps!",
                description: result.error || "Er is iets misgegaan bij het voltooien van de les.",
            });
            setIsCompleting(false);
        }
    };
    
    const handleQuizComplete = async (quizId: string, score: number, total: number) => {
        const scorePercentage = total > 0 ? (score / total) : 0;
        
        upsertQuizProgress(quizId, score, total);
        awardXpForQuizCompletion(quizId, scorePercentage).then(xpResult => {
             if (xpResult.success && xpResult.xpAwarded > 0) {
                toast({
                    title: `+${xpResult.xpAwarded} XP!`,
                    description: `Goed gedaan met de quiz!`,
                });
            }
        });
        toast({
            title: "Quiz Voortgang Opgeslagen!",
            description: `Je score van ${score}/${total} is bewaard.`,
        });
    };

  return (
    <>
        <main className="flex-1 p-4 sm:px-6 sm:py-6 space-y-8">
            <header className="mb-6">
                <p className="text-sm font-medium text-primary">Les {lesson.order} in <Link href={`/modules/${lesson.moduleId}`} className="hover:underline">{lesson.module.title}</Link></p>
                <h1 className="text-4xl font-bold mt-1">{lesson.title}</h1>
                {lesson.description && (
                    <div className="prose dark:prose-invert max-w-none text-muted-foreground mt-2">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.description}</ReactMarkdown>
                    </div>
                )}
            </header>

             <div className="space-y-12">
                {(lesson.sectionsJson as ContentBlock[])
                    .sort((a,b) => a.order - b.order)
                    .map((section, index) => (
                     <div key={section.id}>
                        {index > 0 && <Separator className="my-8" />}
                        {(() => {
                            switch (section.type) {
                                case 'MARKDOWN':
                                    return (
                                        <Card className="shadow-md">
                                            <CardHeader>
                                                <div className="flex items-center">
                                                    <Lightbulb className="h-6 w-6 text-primary mr-3" />
                                                    <CardTitle className="text-2xl">{section.content.title || 'Lesinzichten'}</CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="prose dark:prose-invert max-w-none text-foreground/90">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                                    {section.content.markdownText || ''}
                                                </ReactMarkdown>
                                            </CardContent>
                                        </Card>
                                    );
                                case 'FLASHCARD_SET':
                                    const flashcardContent = section.content as FlashcardSetSectionContent['content'];
                                    const wordIds = flashcardContent.wordIds || [];
                                    const wordsForSection = allWordsForFlashcards.filter(w => wordIds.includes(w.id));
                                    
                                    if (wordIds.length > 0 && wordsForSection.length === 0) {
                                        return (
                                            <Card className="bg-destructive/10 border-destructive/50">
                                                <CardHeader>
                                                    <CardTitle className="text-destructive flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Data Fout in Flashcard Blok</CardTitle>
                                                    <CardDescription className="text-destructive/80">Deze flashcard set is geconfigureerd met {wordIds.length} woord-ID's, maar geen van deze woorden kon worden gevonden in de database. Controleer de browser console (F12) voor debug-informatie.</CardDescription>
                                                </CardHeader>
                                            </Card>
                                        );
                                    }
                                    if (wordsForSection.length === 0) return null;
                                    return (
                                        <div>
                                            <div className="flex items-center mb-6"><BookOpenText className="h-8 w-8 text-primary mr-3" /><h2 className="text-3xl font-semibold">{flashcardContent.title || "Woordenschat Oefenen"}</h2></div>
                                            <InteractiveFlashcardViewer key={section.id} words={wordsForSection} />
                                        </div>
                                    );
                                case 'QUIZ_LINK':
                                    const quizContent = section.content as QuizLinkSectionContent['content'];
                                    const quizData = allQuizzesForLinks.find(q => q.id === quizContent.quizId);
                                    if (!quizData) {
                                        return (
                                            <Card className="bg-destructive/10 border-destructive/50">
                                                <CardHeader>
                                                    <CardTitle className="text-destructive flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Data Fout in Quizblok</CardTitle>
                                                    <CardDescription className="text-destructive/80">De quiz met ID '{quizContent.quizId}' kon niet worden gevonden in de database. Controleer of de quiz bestaat en gepubliceerd is.</CardDescription>
                                                </CardHeader>
                                            </Card>
                                        );
                                    }
                                    const clientSafeQuiz = prismaQuizToClientQuizHelper(quizData);
                                    if (!clientSafeQuiz) return null;
                                    return (
                                        <div>
                                            <div className="flex items-center mb-6"><FileQuestion className="h-8 w-8 text-primary mr-3" /><h2 className="text-3xl font-semibold">{quizContent.title || quizData.title}</h2></div>
                                            <QuizPlayer
                                                quiz={clientSafeQuiz}
                                                onQuizComplete={(score, total) => handleQuizComplete(clientSafeQuiz.id, score, total)}
                                            />
                                        </div>
                                    );

                                case 'EMBEDDED_MEDIA':
                                    const mediaContent = section.content as EmbeddedMediaContentBlock['content'];
                                    const mediaType = mediaContent.mediaType === 'YOUTUBE' ? 'YouTube' : 'Audio';
                                    return (
                                        <Card className="shadow-md">
                                            <CardHeader>
                                                <div className="flex items-center">
                                                    {mediaContent.mediaType === 'YOUTUBE' ? <Youtube className="h-6 w-6 text-red-500 mr-3" /> : <Headphones className="h-6 w-6 text-blue-500 mr-3" />}
                                                    <CardTitle className="text-2xl">{mediaContent.title || mediaType}</CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {mediaContent.mediaType === 'YOUTUBE' ? (
                                                    <div className="aspect-video"><iframe className="w-full h-full rounded-lg" src={mediaContent.mediaUrl} title={mediaContent.title || "YouTube video player"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe></div>
                                                ) : (
                                                    <audio controls src={mediaContent.mediaUrl} className="w-full">Your browser does not support the audio element.</audio>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )
                                default: return null;
                            }
                        })()}
                    </div>
                ))}
            </div>
            
            <Card className="shadow-sm mt-12">
                <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Button asChild variant="outline" disabled={!prevLessonUrl}>
                        <Link href={prevLessonUrl || '#'}>
                            <ArrowLeft className="mr-2 h-4 w-4"/>Vorige Les
                        </Link>
                    </Button>
                    
                    {isCompleted ? (
                        <Button size="lg" disabled>
                            <CheckCircle className="mr-2 h-5 w-5" /> Les Voltooid
                        </Button>
                    ) : (
                        <Button size="lg" onClick={handleCompleteLesson} disabled={isCompleting}>
                            {isCompleting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Check className="mr-2 h-5 w-5"/>}
                            Les Voltooien
                        </Button>
                    )}

                    <Button asChild variant="outline" disabled={!nextLessonUrl}>
                       <Link href={nextLessonUrl || '#'}>
                            Volgende Les<ArrowRight className="ml-2 h-4 w-4"/>
                       </Link>
                    </Button>
                </CardContent>
            </Card>

        </main>
        <footer className="border-t bg-background">
            <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-6">
                <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} AyoSinau. Alle rechten voorbehouden.</p>
                <FeedbackButton />
            </div>
        </footer>
    </>
  );
}
