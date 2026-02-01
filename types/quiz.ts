export type QuestionType =
    | "MULTIPLE_CHOICE"
    | "FILL_IN_THE_BLANK"
    | "MATCH_PAIRS"
    | "REORDER_SENTENCE"
    | "AUDIO_CHOICE"
    | "TYPE_HEARD_AUDIO"
    | "AUDIO_STORY_MCQ"
    | "MULTI_SELECT_AUDIO_WORDS";

export interface QuizQuestion {
    id: string;
    questionText: string;
    questionType: QuestionType;
    options: any;
    explanation: string;
    order: number;
}
