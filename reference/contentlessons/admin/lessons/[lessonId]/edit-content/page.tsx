
import { notFound } from 'next/navigation';
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLessonById, getWordsFromDb, getQuizzesFromDb } from '@/lib/dal';
import { LessonContentEditor } from './lesson-content-editor';


export default async function EditLessonContentPage(props: { params: Promise<{ lessonId: string }> }) {
  const params = await props.params;
  const lesson = await getLessonById(params.lessonId, { includeModule: true });
  // Fetch all words and quizzes for the selector dialogs, with a high limit to simulate fetching all.
  const { data: allWords } = await getWordsFromDb(
    {}, 
    { page: 1, limit: 10000 }
  );
  const allQuizzes = await getQuizzesFromDb({});

  if (!lesson) {
    notFound();
  }

  return (
    <div className="space-y-6">
        <div>
            <Button asChild variant="outline" size="sm">
            <Link href={`/admin/lessons/${params.lessonId}/edit`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Terug naar Les Metadata
            </Link>
            </Button>
      </div>

       <LessonContentEditor 
        lesson={lesson as any} 
        allWords={allWords} 
        allQuizzes={allQuizzes} 
      />

    </div>
  );
}
