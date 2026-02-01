
'use server';

import {
  findDuplicateWords as findDuplicateWordsDal,
  fixSingleAudioPath as fixSingleAudioPathDal,
  fixMultipleAudioPaths as fixMultipleAudioPathsDal,
} from '@/lib/dal';

import {
  validateAudioPaths as validateAudioPathsDal,
  validateDialogueAudio as validateDialogueAudioDal,
  generateBatchDialogueAudio as generateBatchDialogueAudioDal,
  generateSeedScript as generateSeedScriptDal,
} from '@/lib/data-tools-dal';

// --- Functions from dal.ts (no node dependencies) ---

export async function findDuplicateWords() {
  const result = await findDuplicateWordsDal();
  return result;
}

export async function fixSingleAudioPath(wordId: string, correctPath: string) {
  const result = await fixSingleAudioPathDal(wordId, correctPath);
  return result;
}

export async function fixMultipleAudioPaths(fixes: { wordId: string; correctPath: string }[]) {
  const result = await fixMultipleAudioPathsDal(fixes);
  return result;
}

// --- Functions from data-tools-dal.ts (WITH node dependencies) ---

export async function generateSeedScript() {
  const result = await generateSeedScriptDal();
  return result;
}

export async function validateAudioPaths() {
  const result = await validateAudioPathsDal();
  return result;
}

export async function validateDialogueAudio() {
  const result = await validateDialogueAudioDal();
  return result;
}

export async function generateBatchDialogueAudio(
  items: Array<{ dialogueText: string; audioPath: string }>,
  voice: string
) {
  const result = await generateBatchDialogueAudioDal(items, voice);
  return result;
}
