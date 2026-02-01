
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import type { User as PrismaUser, Lesson as PrismaLesson, Module as PrismaModule, Quiz as PrismaQuiz, Word as PrismaWord, UserLessonNote, QuizProgressStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';


// --- ENUM & TYPE DEFINITIONS (Manually defined to be client-safe) ---

export type WordLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export const WORD_LEVEL_ZOD_TUPLE: [WordLevel, ...WordLevel[]] = ["A1", "A2", "B1", "B2", "C1", "C2"];
export const wordLevelValues: WordLevel[] = [...WORD_LEVEL_ZOD_TUPLE];

export type WordFormality = "Ngoko" | "KramaMadya" | "KramaInggil" | "Neutral";
export const WORD_FORMALITY_ZOD_TUPLE: [WordFormality, ...WordFormality[]] = ["Ngoko", "KramaMadya", "KramaInggil", "Neutral"];
export const wordFormalityValues: WordFormality[] = [...WORD_FORMALITY_ZOD_TUPLE];

export type ModuleLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export const MODULE_LEVEL_ZOD_TUPLE: [ModuleLevel, ...ModuleLevel[]] = ["A1", "A2", "B1", "B2", "C1", "C2"];
export const moduleLevelsList: ModuleLevel[] = [...MODULE_LEVEL_ZOD_TUPLE];

export type QuestionType = "MULTIPLE_CHOICE" | "FILL_IN_THE_BLANK" | "MATCH_PAIRS" | "REORDER_SENTENCE" | "AUDIO_CHOICE" | "TYPE_HEARD_AUDIO" | "AUDIO_STORY_MCQ" | "MULTI_SELECT_AUDIO_WORDS";
export const QUESTION_TYPE_ZOD_TUPLE: [QuestionType, ...QuestionType[]] = ["MULTIPLE_CHOICE", "FILL_IN_THE_BLANK", "MATCH_PAIRS", "REORDER_SENTENCE", "AUDIO_CHOICE", "TYPE_HEARD_AUDIO", "AUDIO_STORY_MCQ", "MULTI_SELECT_AUDIO_WORDS"];
export const questionTypeValues: QuestionType[] = [...QUESTION_TYPE_ZOD_TUPLE];

export type UserRole = "USER" | "CONTENT_EDITOR" | "ADMIN";
export const USER_ROLE_ZOD_TUPLE: [UserRole, ...UserRole[]] = ["USER", "CONTENT_EDITOR", "ADMIN"];
export const userRoleValues: UserRole[] = [...USER_ROLE_ZOD_TUPLE];

export type FeedbackStatus = "NEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export const FEEDBACK_STATUS_ZOD_TUPLE: [FeedbackStatus, ...FeedbackStatus[]] = ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"];
export const feedbackStatusValues: FeedbackStatus[] = [...FEEDBACK_STATUS_ZOD_TUPLE];

export const FEEDBACK_TYPE_ZOD_TUPLE = ["Bugrapport", "Suggestie", "Vraag", "Algemeen"] as const;
export type FeedbackType = (typeof FEEDBACK_TYPE_ZOD_TUPLE)[number];
export const feedbackTypeValues: FeedbackType[] = [...FEEDBACK_TYPE_ZOD_TUPLE];

export const ACHIEVEMENT_EVENT_TYPE_ZOD_TUPLE = [
  "user_registered", "profile_updated", "streak_updated", "lesson_completed", "module_completed",
  "all_modules_completed", "quiz_completed", "srs_session_started", "word_learned_srs",
  "pronunciation_session_completed", "feedback_submitted", "note_created"
] as const;
export type AchievementEventType = (typeof ACHIEVEMENT_EVENT_TYPE_ZOD_TUPLE)[number];
export const achievementEventTypeValues: AchievementEventType[] = [...ACHIEVEMENT_EVENT_TYPE_ZOD_TUPLE];

export type QuizProgressStatusType = QuizProgressStatus;
export const QUIZ_PROGRESS_STATUS_ZOD_TUPLE: [QuizProgressStatusType, ...QuizProgressStatusType[]] = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"];
export const quizProgressStatusValues: QuizProgressStatusType[] = [...QUIZ_PROGRESS_STATUS_ZOD_TUPLE];

export type AppUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  themePreference: string | null;
};

// --- HELPER FUNCTIONS & PRIMITIVE TYPE DEFINITIONS ---

const urlOrRelativePath = (val: string | undefined | null): boolean => {
  if (val === undefined || val === '' || val === null) return true;
  if (typeof val !== 'string') return false;
  const trimmedVal = val.trim();
  if (trimmedVal === '' || trimmedVal === null) return true;
  try {
    new URL(trimmedVal); return true;
  } catch (e) { return trimmedVal.startsWith('/'); }
};
const urlOrRelativePathMessage = "Must be a valid URL (e.g., https://example.com/file.png, /media/file.png, or https://www.youtube.com/embed/VIDEO_ID).";

const aiHintValidation = (val: string | undefined | null): boolean => {
  if (!val || val.trim() === '') return true;
  if (typeof val !== 'string') return false;
  const words = val.trim().split(/\s+/);
  return words.length <= 2;
};
const aiHintMessage = "AI Hint can have a maximum of two words.";

const isValidJsonString = (str: string | undefined | null): boolean => {
  if (!str) return true;
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

// --- TYPE DEFINITIONS for client-side data structures ---

export type ClientUser = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  photoURL: string | null;
  xp: number;
  level: number;
  learningStreak: number;
  lastActivityAt: string | null;
  themePreference: string | null;
  createdAt: string;
  updatedAt: string;
  quizCompletions: number;
  moduleCompletions: number;
  feedbackSubmissionsCount: number;
  lessonNotesCount: number;
  lessonsCompletedCount: number;
  learnedWordsViaSrsCount: number;
};

export type ClientWord = {
  id: string;
  javanese: string;
  dutch: string;
  image?: string | null;
  aiHint?: string | null;
  audioJavanese?: string | null;
  category?: string | null;
  exampleSentenceJavanese?: string | null;
  exampleSentenceDutch?: string | null;
  notes?: string | null;
  level?: WordLevel | null;
  formality?: WordFormality | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  audioFileExists?: boolean;
};

export interface EnrichedWord extends ClientWord {
  linkedLessons?: Array<{ id: string; title: string; moduleId: string; moduleTitle: string }>;
}

export type ContentBlockType = 'MARKDOWN' | 'FLASHCARD_SET' | 'QUIZ_LINK' | 'EMBEDDED_MEDIA';

export interface BaseContentBlock {
  id: string;
  order: number;
  content: { title?: string } & Record<string, any>;
}

export interface MarkdownContentBlock extends BaseContentBlock {
  type: 'MARKDOWN';
  content: { title?: string, markdownText: string };
}

export interface FlashcardSetSectionContent extends BaseContentBlock {
  type: 'FLASHCARD_SET';
  content: {
    title?: string;
    wordIds: string[];
  };
}

export interface QuizLinkSectionContent extends BaseContentBlock {
  type: 'QUIZ_LINK';
  content: {
    title?: string;
    quizId: string;
  };
}

export interface EmbeddedMediaContent {
  title?: string;
  mediaUrl: string;
  mediaType: 'YOUTUBE' | 'AUDIO_URL';
}
export interface EmbeddedMediaContentBlock extends BaseContentBlock {
  type: 'EMBEDDED_MEDIA';
  content: EmbeddedMediaContent;
}

export type ContentBlock = MarkdownContentBlock | FlashcardSetSectionContent | QuizLinkSectionContent | EmbeddedMediaContentBlock;

export type ClientLesson = {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  sections: ContentBlock[];
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};


export type ClientFeedbackItem = {
  id: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  pageUrl: string | null;
  feedbackType: string | null;
  message: string;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
};

export type ClientWordForDuplicates = {
  id: string;
  javanese: string;
  dutch: string;
  category: string | null;
};

export type UserProfileData = {
  id: string;
  name: string | null;
  email: string;
  photoURL: string | null;
  role: UserRole;
  themePreference: string | null;
  createdAt: string;
  xp: number;
  level: number;
  learningStreak: number;
};

export interface UserNoteDisplayItem {
  lessonTitle: string;
  lessonId: string;
  moduleId: string;
  content: string;
  updatedAt: string; // ISO string
}

// Client-safe version of a Module
export type ClientModule = {
  id: string;
  title: string;
  description: string | null;
  level: ModuleLevel;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  lessonCount?: number; // Optional, mainly for admin views
};

export type PracticeResult = {
  wordId: string;
  score: number;
  feedback: string;
  transcription?: string;
};

export type QuizWithProgress = PrismaQuiz & {
  userProgress: {
    status: QuizProgressStatus;
    lastScore: number | null;
  } | null;
};

// --- TYPE DEFINITIONS FOR DATA TOOLS ---
export interface AudioValidationResult {
  wordId: string;
  javanese: string;
  currentPath: string | null;
  expectedPath: string;
  fileExists: boolean;
  status: 'OK' | 'INCORRECT_PATH' | 'MISSING_FILE';
}

export interface DialogueAudioValidationResult {
  id: string;
  lessonFile: string;
  dialogueText: string;
  audioPath: string;
  fileExists: boolean;
  status: 'OK' | 'MISSING_FILE';
}


// --- ZOD SCHEMAS ---
export const wordFormSchema = z.object({
  javanese: z.string().min(1, { message: 'Javanese term is required.' }),
  dutch: z.string().min(1, { message: 'Dutch translation is required.' }),
  image: z.string().optional().nullable().refine(urlOrRelativePath, { message: urlOrRelativePathMessage }),
  aiHint: z.string().optional().nullable().refine(aiHintValidation, { message: aiHintMessage }),
  audioJavanese: z.string().optional().nullable().refine(urlOrRelativePath, { message: urlOrRelativePathMessage }),
  category: z.string().optional().nullable(),
  exampleSentenceJavanese: z.string().optional().nullable(),
  exampleSentenceDutch: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tagsInput: z.string().optional().nullable(),
  level: z.enum(WORD_LEVEL_ZOD_TUPLE).optional().nullable(),
  formality: z.enum(WORD_FORMALITY_ZOD_TUPLE).optional().nullable(),
});
export type WordFormData = z.infer<typeof wordFormSchema>;


export const updateUserSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  role: z.enum(USER_ROLE_ZOD_TUPLE, { message: 'Please select a valid role.' }),
});
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;


export const StringValueObjectSchema = z.object({ value: z.string() });
export type StringValueObject = z.infer<typeof StringValueObjectSchema>;

export const QuizOptionSchema = z.object({
  id: z.string().min(1).default(() => `opt-gen-${uuidv4()}`),
  text: z.string().default(''),
  isCorrect: z.boolean().default(false),
  wordId: z.string().optional().nullable(),
});
export type QuizOption = z.infer<typeof QuizOptionSchema>;

// Schemas for content blocks.
const MarkdownSectionSchema = z.object({
  id: z.string().min(1).default(() => `sec-gen-${uuidv4()}`),
  order: z.number().int().min(0).default(0),
  type: z.literal("MARKDOWN"),
  content: z.object({
    title: z.string().optional(),
    markdownText: z.string().optional().default(''),
  }),
});
const FlashcardSetSectionSchema = z.object({
  id: z.string().min(1).default(() => `sec-gen-${uuidv4()}`),
  order: z.number().int().min(0).default(0),
  type: z.literal("FLASHCARD_SET"),
  content: z.object({
    title: z.string().optional(),
    wordIds: z.array(z.string()),
  }),
});
const QuizLinkSectionSchema = z.object({
  id: z.string().min(1).default(() => `sec-gen-${uuidv4()}`),
  order: z.number().int().min(0).default(0),
  type: z.literal("QUIZ_LINK"),
  content: z.object({
    title: z.string().optional(),
    quizId: z.string().min(1, "Quiz ID cannot be empty.").default(''),
  }),
});
const EmbeddedMediaSectionSchema = z.object({
  id: z.string().min(1).default(() => `sec-gen-${uuidv4()}`),
  order: z.number().int().min(0).default(0),
  type: z.literal("EMBEDDED_MEDIA"),
  content: z.object({
    title: z.string().optional(),
    mediaUrl: z.string().min(1, "Media URL is vereist.").refine(urlOrRelativePath, { message: urlOrRelativePathMessage }).default(''),
    mediaType: z.preprocess(
      (val) => (typeof val === "string" ? val.toUpperCase() : val),
      z.enum(["YOUTUBE", "AUDIO_URL"], {
        required_error: "Selecteer een media type (YouTube of Audio URL).",
        invalid_type_error: "Ongeldig media type. Kies YOUTUBE of AUDIO_URL."
      })
    ).default('YOUTUBE'),
  }),
});


export const ContentBlockSchema = z.discriminatedUnion("type", [
  MarkdownSectionSchema,
  FlashcardSetSectionSchema,
  QuizLinkSectionSchema,
  EmbeddedMediaSectionSchema,
]);
export const ContentBlocksArraySchema = z.array(ContentBlockSchema);


export const QuizQuestionSchema = z.object({
  id: z.string().min(1).default(() => `q-gen-${uuidv4()}`),
  questionText: z.string().min(1, "Vraagtekst mag niet leeg zijn.").default(''),
  questionType: z.enum(QUESTION_TYPE_ZOD_TUPLE).default('MULTIPLE_CHOICE'),
  options: z.array(QuizOptionSchema).optional().default([]),
  dndCorrectAnswer: z.string().optional(),
  dndOptions: z.array(StringValueObjectSchema).optional().default([]),
  fillInAnswers: z.array(z.string()).optional().default([]),
  matchItemsLeft: z.array(StringValueObjectSchema).optional().default([]),
  matchItemsRight: z.array(StringValueObjectSchema).optional().default([]),
  sentencePartsToReorder: z.array(StringValueObjectSchema).optional().default([]),
  audioPromptUrl: z.string().optional().nullable().refine(urlOrRelativePath, { message: urlOrRelativePathMessage }),
  imagePromptUrl: z.string().optional().nullable().refine(urlOrRelativePath, { message: urlOrRelativePathMessage }),
  aiHint: z.string().optional().nullable().refine(aiHintValidation, { message: aiHintMessage }),
  wordId: z.string().optional().nullable(),
  explanation: z.string().optional().nullable(),
  order: z.number().int().min(0, "Order must be a non-negative integer.").optional(),
}).superRefine((data, ctx) => {
  const isChoiceType = ['MULTIPLE_CHOICE', 'AUDIO_CHOICE', 'AUDIO_STORY_MCQ', 'MULTI_SELECT_AUDIO_WORDS'].includes(data.questionType);
  const isFillType = ['FILL_IN_THE_BLANK', 'TYPE_HEARD_AUDIO'].includes(data.questionType);
  const isMatchType = data.questionType === 'MATCH_PAIRS';
  const isReorderType = data.questionType === 'REORDER_SENTENCE';

  if (isChoiceType) {
    if (!data.options || data.options.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimaal één antwoordoptie is vereist voor dit vraagtype.",
        path: ["options"],
      });
    } else {
      if (!data.options.some(opt => opt.isCorrect)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Minimaal één antwoordoptie moet als correct gemarkeerd zijn.",
          path: ["options"],
        });
      }
      data.options.forEach((opt, index) => {
        if (!opt.text || opt.text.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Optietekst mag niet leeg zijn.",
            path: ["options", index, "text"],
          });
        }
      });
    }
  }

  if (isFillType) {
    if (!data.fillInAnswers || data.fillInAnswers.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimaal één correct invulantwoord is vereist.",
        path: ["fillInAnswers"],
      });
    }
    data.fillInAnswers?.forEach((ans, index) => {
      if (!ans || ans.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invulantwoord mag niet leeg zijn.",
          path: ["fillInAnswers", index],
        });
      }
    });
  }

  if (isMatchType) {
    if (!data.matchItemsLeft || data.matchItemsLeft.length < 2 || !data.matchItemsRight || data.matchItemsRight.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimaal twee paren zijn vereist voor combineervragen.",
        path: ["matchItemsLeft"],
      });
    }
    if (data.matchItemsLeft?.length !== data.matchItemsRight?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Aantal linker- en rechteritems moet gelijk zijn.",
        path: ["matchItemsLeft"],
      });
    }
    data.matchItemsLeft?.forEach((item, index) => {
      if (!item.value || item.value.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Linker combineeritem mag niet leeg zijn.",
          path: ["matchItemsLeft", index, "value"],
        });
      }
    });
    data.matchItemsRight?.forEach((item, index) => {
      if (!item.value || item.value.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Rechter combineeritem mag niet leeg zijn.",
          path: ["matchItemsRight", index, "value"],
        });
      }
    });
  }

  if (isReorderType) {
    if (!data.sentencePartsToReorder || data.sentencePartsToReorder.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimaal twee zinsdelen zijn vereist om te herschikken.",
        path: ["sentencePartsToReorder"],
      });
    }
    data.sentencePartsToReorder?.forEach((part, index) => {
      if (!part.value || part.value.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Zinsdeel mag niet leeg zijn.",
          path: ["sentencePartsToReorder", index, "value"],
        });
      }
    });
  }

  if (data.questionType === 'AUDIO_STORY_MCQ' && (!data.audioPromptUrl || data.audioPromptUrl.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Een URL naar het audioverhaal is vereist voor dit vraagtype.",
      path: ["audioPromptUrl"],
    });
  }
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type QuizQuestionFormData = z.infer<typeof QuizQuestionSchema>;

export const QuizSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().min(1, "Quiz title cannot be empty."),
  questions: z.array(QuizQuestionSchema),
  description: z.string().optional().nullable(),
  isPublished: z.boolean().default(false),
});
export type Quiz = z.infer<typeof QuizSchema>;
export const QuizImportSchema = z.array(QuizSchema);
export type QuizImportData = z.infer<typeof QuizImportSchema>;


export const lessonSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long.' }),
  description: z.string().optional().nullable(),
  order: z.coerce.number().positive({ message: "Order must be a positive number." }).optional().nullable(),
  isPublished: z.boolean().default(false),
  moduleId: z.string().min(1, { message: 'Please select a module.' }),
  sections: ContentBlocksArraySchema.optional(),
});
export type LessonFormData = z.infer<typeof lessonSchema>;

// Nieuw, specifiek schema voor het metadata-formulier
export const lessonMetadataSchema = lessonSchema.omit({ sections: true });
export type LessonMetadataFormData = z.infer<typeof lessonMetadataSchema>;


export const moduleFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long.' }),
  description: z.string().optional().nullable(),
  order: z.coerce.number().min(1, { message: 'Order must be a positive number.' }),
  isPublished: z.boolean().default(false),
  level: z.string().min(2, 'Level is required.'), // Changed from enum
});
export type ModuleFormData = z.infer<typeof moduleFormSchema>;

export const ModuleImportObjectSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long.' }),
  description: z.string().optional().nullable(),
  order: z.coerce.number().min(1, 'Order must be a positive number.').optional(),
  isPublished: z.boolean().optional().default(false),
  level: z.string().min(2, 'Level is required.'), // Changed from enum
});

export const ModuleImportSchema = z.array(ModuleImportObjectSchema);
export type ModuleImportData = z.infer<typeof ModuleImportSchema>;


export const FeedbackFormSchema = z.object({
  feedbackType: z.enum(FEEDBACK_TYPE_ZOD_TUPLE).optional(),
  message: z.string().min(10, { message: 'Feedbackbericht moet minimaal 10 tekens lang zijn.' }).max(2000, { message: 'Feedback mag niet langer zijn dan 2000 tekens.' }),
  pageUrl: z.string().url({ message: 'Ongeldige pagina URL.' }).optional().or(z.literal('')),
});
export type FeedbackFormData = z.infer<typeof FeedbackFormSchema>;


// Quiz Metadata Schema
export const quizMetadataSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long.' }),
  description: z.string().optional(),
  isPublished: z.boolean().default(false),
});
export type QuizMetadataFormData = z.infer<typeof quizMetadataSchema>;

// Schema for validating the JSON array for bulk import
export const WordImportObjectSchema = z.object({
  id: z.string().optional(),
  javanese: z.string().min(1),
  dutch: z.string().min(1),
  image: z.string().optional().nullable(),
  aiHint: z.string().optional().nullable(),
  audioJavanese: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  exampleSentenceJavanese: z.string().optional().nullable(),
  exampleSentenceDutch: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  level: z.enum(WORD_LEVEL_ZOD_TUPLE).optional().nullable(),
  formality: z.enum(WORD_FORMALITY_ZOD_TUPLE).optional().nullable(),
});
export const WordImportSchema = z.array(WordImportObjectSchema);
export type WordImportData = z.infer<typeof WordImportSchema>;

// Schemas for lesson import
const MarkdownSectionImportSchema = z.object({
  id: z.string().optional(),
  order: z.number().int().positive().optional(),
  type: z.literal("MARKDOWN"),
  content: z.object({
    markdownText: z.string(),
    title: z.string().optional(),
  }),
});

const FlashcardSetSectionImportSchema = z.object({
  id: z.string().optional(),
  order: z.number().int().positive().optional(),
  type: z.literal("FLASHCARD_SET"),
  content: z.object({
    wordIds: z.array(z.string()),
    title: z.string().optional(),
  }),
});

const QuizLinkSectionImportSchema = z.object({
  id: z.string().optional(),
  order: z.number().int().positive().optional(),
  type: z.literal("QUIZ_LINK"),
  content: z.object({
    title: z.string(),
    quizId: z.string().optional(),
  }),
});

const LessonImportSectionSchema = z.discriminatedUnion("type", [
  MarkdownSectionImportSchema,
  FlashcardSetSectionImportSchema,
  QuizLinkSectionImportSchema,
]);

const LessonImportObjectSchema = z.object({
  title: z.string().min(1, "Lesson title is required."),
  description: z.string().optional(),
  order: z.number().int().positive().optional(),
  isPublished: z.boolean().optional().default(false),
  sections: z.array(LessonImportSectionSchema),
});

export const LessonImportSchema = z.array(LessonImportObjectSchema);
export type LessonImportData = z.infer<typeof LessonImportSchema>;

// Schema for Achievement Admin Form
export const achievementFormSchema = z.object({
  code: z.string().min(3, "Code is required and must be unique.").regex(/^[A-Z0-9_]+$/, "Code can only contain uppercase letters, numbers, and underscores."),
  name: z.string().min(3, "Name is required."),
  description: z.string().min(10, "Description is required."),
  iconName: z.string().min(2, "Lucide icon name is required."),
  xpValue: z.coerce.number().int().min(0, "XP value must be 0 or greater."),
  eventType: z.enum(ACHIEVEMENT_EVENT_TYPE_ZOD_TUPLE, { required_error: "Please select an event type." }),
  criteria: z.string().refine(isValidJsonString, { message: "Criteria must be a valid JSON object." }),
  isActive: z.boolean().default(true),
});
export type AchievementFormData = z.infer<typeof achievementFormSchema>;


// --- Prisma to Client Type Converters & Helpers ---

export function prismaWordToClientWord(prismaWord: PrismaWord | null | undefined): ClientWord | null {
  if (!prismaWord) return null;
  let parsedTags: string[] = [];
  if (prismaWord.tags && typeof prismaWord.tags === 'string') {
    try {
      const jsonData = JSON.parse(prismaWord.tags);
      if (Array.isArray(jsonData)) {
        parsedTags = jsonData.filter(t => typeof t === 'string');
      } else {
        parsedTags = prismaWord.tags.split(',').map(t => t.trim()).filter(Boolean);
      }
    } catch (e) {
      parsedTags = prismaWord.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
  }
  return {
    ...prismaWord,
    tags: parsedTags,
    createdAt: prismaWord.createdAt.toISOString(),
    updatedAt: prismaWord.updatedAt.toISOString(),
  };
}

export function prismaUserToClientUser(prismaUser: PrismaUser | null | undefined): ClientUser | null {
  if (!prismaUser) return null;
  return {
    ...prismaUser,
    lastActivityAt: prismaUser.lastActivityAt?.toISOString() || null,
    createdAt: prismaUser.createdAt.toISOString(),
    updatedAt: prismaUser.updatedAt.toISOString(),
  };
}


export function prismaQuizToClientQuizHelper(prismaQuiz: PrismaQuiz | null | undefined): Quiz | null {
  if (!prismaQuiz) return null;
  const questions = (Array.isArray(prismaQuiz.questions) ? prismaQuiz.questions : []) as unknown as QuizQuestion[];
  return {
    ...prismaQuiz,
    description: prismaQuiz.description ?? null,
    questions: questions.map(q => ({
      ...q,
      options: q.options?.map(opt => ({ ...opt, wordId: opt.wordId ?? undefined })) || [],
      fillInAnswers: q.fillInAnswers || [],
      matchItemsLeft: q.matchItemsLeft || [],
      matchItemsRight: q.matchItemsRight || [],
      sentencePartsToReorder: q.sentencePartsToReorder || [],
      audioPromptUrl: q.audioPromptUrl ?? undefined,
      imagePromptUrl: q.imagePromptUrl ?? undefined,
      aiHint: q.aiHint ?? undefined,
      wordId: q.wordId ?? undefined,
      explanation: q.explanation ?? undefined,
      order: q.order ?? 0,
    })).sort((a, b) => (a.order || 0) - (b.order || 0)),
  };
}

type PrismaLessonWithModuleTitle = Prisma.LessonGetPayload<{
  include?: { module?: { select: { title: true } } }
}>;

export function prismaLessonToClientLessonHelper(prismaLesson: PrismaLesson | PrismaLessonWithModuleTitle | null | undefined): ClientLesson | null {
  if (!prismaLesson) return null;

  const sections = (Array.isArray(prismaLesson.sectionsJson) ? prismaLesson.sectionsJson : []) as unknown as ContentBlock[];

  return {
    id: prismaLesson.id,
    moduleId: prismaLesson.moduleId,
    title: prismaLesson.title,
    description: prismaLesson.description || null,
    sections: sections.sort((a, b) => (a.order || 0) - (b.order || 0)),
    order: prismaLesson.order,
    isPublished: prismaLesson.isPublished,
    createdAt: prismaLesson.createdAt.toISOString(),
    updatedAt: prismaLesson.updatedAt.toISOString(),
  };
}

export function prismaModuleToClientModuleHelper(prismaModule: PrismaModule & { _count?: { lessons: number } } | null | undefined): ClientModule | null {
  if (!prismaModule) return null;
  return {
    id: prismaModule.id,
    title: prismaModule.title,
    description: prismaModule.description || null,
    level: prismaModule.level as ModuleLevel,
    order: prismaModule.order,
    isPublished: prismaModule.isPublished,
    createdAt: prismaModule.createdAt.toISOString(),
    updatedAt: prismaModule.updatedAt.toISOString(),
    lessonCount: prismaModule._count?.lessons ?? 0,
  };
}

export function prepareQuestionForPrismaStorage(question: QuizQuestion): Prisma.JsonObject {
  const prismaQuestion: any = { ...question };
  // Remove any keys with `undefined` values as Prisma Json cannot store them
  for (const key in prismaQuestion) {
    if (prismaQuestion[key] === undefined) {
      delete prismaQuestion[key];
    }
  }
  return prismaQuestion as Prisma.JsonObject;
}
