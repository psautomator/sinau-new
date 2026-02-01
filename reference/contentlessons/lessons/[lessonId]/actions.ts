
'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth-utils';
import { markLessonAsComplete } from '@/lib/dal';

export async function completeLessonAction(lessonId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Niet ingelogd' };
  }

  try {
    const result = await markLessonAsComplete(user.id, lessonId);
    
    // Always revalidate paths to ensure UI updates, even if already completed
    if (result.moduleUrl) {
      revalidatePath(result.moduleUrl);
    }
    revalidatePath(`/modules/.*/lessons/${lessonId}`);
    revalidatePath('/dashboard');
    
    return { success: true, ...result };
  } catch (error) {
    console.error(`Kon les ${lessonId} niet als voltooid markeren voor gebruiker ${user.id}`, error);
    const errorMessage = error instanceof Error ? error.message : "Er is een onbekende fout opgetreden.";
    return { success: false, error: errorMessage };
  }
}
