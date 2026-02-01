"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { completeLessonAction } from "@/app/actions/progress";

// Using any to bypass lint issues with generated Prisma types
type QuizWithQuestions = any;

type QuestionOption = {
    id: string;
    text: string;
    isCorrect: boolean;
};

function prettyType(t: string) {
    return t
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, (m) => m.toUpperCase());
}

function shuffleArray<T>(array: T[]): T[] {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

export default function QuizClient({ quiz }: { quiz: QuizWithQuestions }) {
    const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [textInput, setTextInput] = useState("");
    const [isChecked, setIsChecked] = useState(false);

    // New states for complex question types
    const [multiSelected, setMultiSelected] = useState<string[]>([]);
    const [matchingLeft, setMatchingLeft] = useState<number | null>(null);
    const [matches, setMatches] = useState<Record<number, number>>({}); // { leftIdx: rightIdx }
    const [matchedIndices, setMatchedIndices] = useState<Set<number>>(new Set());
    const [shuffledRight, setShuffledRight] = useState<any[]>([]);
    const [shuffledFragments, setShuffledFragments] = useState<any[]>([]);
    const [orderedFragments, setOrderedFragments] = useState<any[]>([]);

    const questions = quiz.questions ?? [];
    const totalQuestions = questions.length;
    const currentQuestion = questions[currentQuestionIndex];

    const optionsData = (currentQuestion?.options as any) || {};
    const choices = (optionsData.choices as QuestionOption[]) || [];
    const acceptedAnswers = (optionsData.answers || optionsData.fillInAnswers as string[]) || [];
    const audioUrl = (optionsData.audioUrl || optionsData.audioPromptUrl as string) || null;
    const imageUrl = (optionsData.imageUrl || optionsData.imagePromptUrl as string) || null;
    const questionType = currentQuestion?.questionType;

    // Reset and initialize complex state when question changes
    useEffect(() => {
        setMatchingLeft(null);
        setMatches({});
        setMatchedIndices(new Set());
        setMultiSelected([]);
        setOrderedFragments([]);

        if (questionType === "MATCH_PAIRS") {
            const right = optionsData.matchItemsRight || [];
            // We store the original index in the right items to check correctness later
            const rightWithIdx = right.map((item: any, idx: number) => ({ ...item, originalIdx: idx }));
            setShuffledRight(shuffleArray(rightWithIdx));
        }

        if (questionType === "REORDER_SENTENCE") {
            const fragments = optionsData.sentencePartsToReorder || [];
            setShuffledFragments(shuffleArray([...fragments]));
        }
    }, [currentQuestionIndex, questionType, optionsData.matchItemsRight, optionsData.sentencePartsToReorder]);

    const isCorrect = useMemo(() => {
        if (!isChecked) return false;

        if (questionType === "FILL_IN_THE_BLANK" || questionType === "TYPE_HEARD_AUDIO") {
            const normalizedInput = textInput.trim().toLowerCase();
            return acceptedAnswers.some((ans: string) => ans.toLowerCase() === normalizedInput);
        }

        if (questionType === "MATCH_PAIRS") {
            const leftItems = optionsData.matchItemsLeft || [];
            if (Object.keys(matches).length !== leftItems.length) return false;
            // Check if every left index is matched to its correct original right index
            return Object.entries(matches).every(([lIdx, rIdx]) => {
                const rightItem = shuffledRight[rIdx];
                return parseInt(lIdx) === rightItem.originalIdx;
            });
        }

        if (questionType === "REORDER_SENTENCE") {
            const originalFragments = optionsData.sentencePartsToReorder || [];
            if (orderedFragments.length !== originalFragments.length) return false;
            return orderedFragments.every((frag, idx) => frag.value === originalFragments[idx].value);
        }

        if (questionType === "MULTI_SELECT_AUDIO_WORDS") {
            const correctIds = choices.filter(c => c.isCorrect).map(c => c.id);
            if (multiSelected.length !== correctIds.length) return false;
            return multiSelected.every(id => correctIds.includes(id));
        }

        // Default (Multiple Choice && Audio Choice && Story MCQ)
        const selected = choices.find((o) => o.id === selectedOption);
        return !!selected?.isCorrect;
    }, [isChecked, questionType, textInput, acceptedAnswers, choices, selectedOption, matches, shuffledRight, orderedFragments, multiSelected, optionsData.matchItemsLeft, optionsData.sentencePartsToReorder]);

    const progressPct = totalQuestions > 0 ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100) : 0;

    const handleSelect = (id: string) => {
        if (!isChecked) {
            if (questionType === "MULTI_SELECT_AUDIO_WORDS") {
                if (multiSelected.includes(id)) {
                    setMultiSelected(multiSelected.filter(i => i !== id));
                } else {
                    setMultiSelected([...multiSelected, id]);
                }
            } else {
                setSelectedOption(id);
            }
        }
    };

    const handleCheck = () => {
        if (questionType === "FILL_IN_THE_BLANK" || questionType === "TYPE_HEARD_AUDIO") {
            if (textInput.trim().length > 0) setIsChecked(true);
        } else if (questionType === "MATCH_PAIRS") {
            const leftItems = optionsData.matchItemsLeft || [];
            if (Object.keys(matches).length === leftItems.length) setIsChecked(true);
        } else if (questionType === "REORDER_SENTENCE") {
            const fragments = optionsData.sentencePartsToReorder || [];
            if (orderedFragments.length === fragments.length) setIsChecked(true);
        } else if (questionType === "MULTI_SELECT_AUDIO_WORDS") {
            if (multiSelected.length > 0) setIsChecked(true);
        } else {
            if (selectedOption) setIsChecked(true);
        }
    };

    const handleMatchingClick = (side: 'left' | 'right', idx: number) => {
        if (isChecked) return;

        if (side === 'left') {
            setMatchingLeft(idx);
        } else if (side === 'right' && matchingLeft !== null) {
            // Create match
            const newMatches = { ...matches, [matchingLeft]: idx };
            setMatches(newMatches);
            setMatchingLeft(null);
        }
    };

    const handleFragmentClick = (fragment: any, fromResult: boolean = false) => {
        if (isChecked) return;

        if (fromResult) {
            setOrderedFragments(orderedFragments.filter(f => f !== fragment));
            setShuffledFragments([...shuffledFragments, fragment]);
        } else {
            setShuffledFragments(shuffledFragments.filter(f => f !== fragment));
            setOrderedFragments([...orderedFragments, fragment]);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex === 0) return;
        setCurrentQuestionIndex((p) => p - 1);
        setSelectedOption(null);
        setTextInput("");
        setIsChecked(false);
    };

    const handleNext = async () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex((p) => p + 1);
            setSelectedOption(null);
            setTextInput("");
            setIsChecked(false);
        } else {
            // Quiz finished
            try {
                await completeLessonAction(quiz.lessonId);
            } catch (err) {
                console.error("Failed to complete lesson", err);
            }
            router.push(`/lessons/${quiz.lesson.slug}`);
        }
    };

    if (!currentQuestion) {
        return (
            <div className="w-full flex items-center justify-center p-12">
                <div className="text-slate-400 font-bold uppercase tracking-widest">No questions found.</div>
            </div>
        );
    }

    const formalityLabel = (quiz as any)?.formalityLabel ?? (quiz as any)?.formality ?? "Standard";

    return (
        <div className="w-full text-text-main-light dark:text-text-main-dark">
            <div className="relative w-full min-h-[calc(100vh-2rem)] px-4 py-6 md:px-8 md:py-8 bg-background-light dark:bg-background-dark overflow-hidden">
                <div className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.18] [background-image:radial-gradient(rgba(16,185,129,0.25)_1px,transparent_1px)] [background-size:26px_26px]" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/70 dark:from-black/10 dark:to-black/10" />

                <div className="relative mx-auto w-full max-w-5xl">
                    <div className="flex items-center justify-between gap-4 mb-5">
                        <div className="flex items-center gap-3">
                            <div className="size-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/25 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-[18px]">school</span>
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="font-extrabold text-slate-900 dark:text-white">AyoSinau Quiz</span>
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{prettyType(currentQuestion.questionType)}</span>
                            </div>
                        </div>
                        <Link href={`/lessons/${quiz.lesson.slug}`} className="size-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/70 dark:hover:bg-slate-800/60 transition-all">
                            <span className="material-symbols-outlined">close</span>
                        </Link>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-center justify-between gap-3 mb-2">
                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-800/40">{formalityLabel}</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-slate-200/80 dark:bg-slate-700/60 overflow-hidden">
                            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progressPct}%` }} />
                        </div>
                    </div>

                    <section className="relative rounded-3xl bg-surface-light dark:bg-surface-dark border border-slate-200/70 dark:border-slate-800/70 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/40 overflow-hidden">
                        <div className="h-1.5 w-full bg-primary" />

                        <div className="p-6 md:p-10">
                            <div className="mb-6">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase bg-indigo-50 dark:bg-indigo-900/25 text-indigo-700 dark:text-indigo-200 border border-indigo-100 dark:border-indigo-800/40">
                                    <span className="material-symbols-outlined text-[16px]">
                                        {questionType.includes("AUDIO") ? "volume_up" : questionType === "MATCH_PAIRS" ? "grid_view" : "checklist"}
                                    </span>
                                    {prettyType(currentQuestion.questionType)}
                                </span>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-extrabold leading-tight text-slate-900 dark:text-white mb-6">
                                {currentQuestion.questionText}
                            </h1>

                            {imageUrl && (
                                <div className="mb-6 flex justify-center">
                                    <img src={imageUrl} alt="Question" className="max-w-full h-auto rounded-2xl border border-slate-200 dark:border-slate-800" />
                                </div>
                            )}

                            {audioUrl && (
                                <div className="mb-8 flex justify-center">
                                    <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-4 w-full flex items-center justify-center border border-slate-200 dark:border-slate-700/50 overflow-hidden">
                                        <audio controls key={audioUrl} className="w-full max-w-sm">
                                            <source src={audioUrl} type="audio/mpeg" />
                                            Your browser does not support the audio element.
                                        </audio>
                                    </div>
                                </div>
                            )}

                            <div className="mt-8">
                                {/***************** FILL IN THE BLANK / LISTEN & TYPE *****************/}
                                {(questionType === "FILL_IN_THE_BLANK" || questionType === "TYPE_HEARD_AUDIO") && (
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={textInput}
                                                onChange={(e) => !isChecked && setTextInput(e.target.value)}
                                                disabled={isChecked}
                                                placeholder="Type your answer here..."
                                                className={`w-full p-4 rounded-xl border-2 text-lg outline-none transition-all ${isChecked ? (isCorrect ? "border-green-500 bg-green-50 text-green-900" : "border-red-500 bg-red-50 text-red-900") : "border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/20 focus:border-primary text-slate-800 dark:text-slate-100"}`}
                                                autoFocus
                                            />
                                            {isChecked && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    <span className={`material-symbols-outlined text-2xl ${isCorrect ? "text-green-500" : "text-red-500"}`}>{isCorrect ? "check_circle" : "error"}</span>
                                                </div>
                                            )}
                                        </div>
                                        {isChecked && !isCorrect && (
                                            <div className="text-sm text-slate-500">Correct answer: <span className="font-bold text-slate-800 dark:text-slate-200">{acceptedAnswers[0]}</span></div>
                                        )}
                                    </div>
                                )}

                                {/***************** MATCH PAIRS *****************/}
                                {questionType === "MATCH_PAIRS" && (
                                    <div className="grid grid-cols-2 gap-8 md:gap-16">
                                        <div className="space-y-3">
                                            {(optionsData.matchItemsLeft || []).map((item: any, idx: number) => {
                                                const isMatched = matches[idx] !== undefined;
                                                const isSelected = matchingLeft === idx;
                                                return (
                                                    <button
                                                        key={`left-${idx}`}
                                                        onClick={() => handleMatchingClick('left', idx)}
                                                        disabled={isChecked || isMatched}
                                                        className={`w-full p-4 rounded-xl border-2 text-left font-bold transition-all ${isSelected ? "border-primary bg-emerald-50 text-emerald-900 scale-[1.02] shadow-md" : isMatched ? "border-slate-100 bg-slate-50 text-slate-400 opacity-60" : "border-slate-200 hover:border-primary/50 text-slate-700 dark:text-slate-200"}`}
                                                    >
                                                        {item.value || item.text}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="space-y-3">
                                            {shuffledRight.map((item, idx) => {
                                                const matchedLeftIdx = Object.entries(matches).find(([_, rIdx]) => rIdx === idx)?.[0];
                                                const isMatched = matchedLeftIdx !== undefined;
                                                const canMatch = matchingLeft !== null;

                                                let borderCls = "border-slate-200";
                                                let bgCls = "bg-white dark:bg-slate-800";

                                                if (isMatched && isChecked) {
                                                    const isPairCorrect = parseInt(matchedLeftIdx) === item.originalIdx;
                                                    borderCls = isPairCorrect ? "border-green-500" : "border-red-500";
                                                    bgCls = isPairCorrect ? "bg-green-50" : "bg-red-50";
                                                } else if (isMatched) {
                                                    borderCls = "border-primary bg-emerald-50";
                                                } else if (canMatch) {
                                                    borderCls = "border-dashed border-primary/50 hover:bg-emerald-50/30";
                                                }

                                                return (
                                                    <button
                                                        key={`right-${idx}`}
                                                        onClick={() => handleMatchingClick('right', idx)}
                                                        disabled={isChecked || isMatched}
                                                        className={`w-full p-4 rounded-xl border-2 text-left font-bold transition-all ${borderCls} ${bgCls} ${isMatched ? "" : "text-slate-700 dark:text-slate-200"}`}
                                                    >
                                                        {item.value || item.text}
                                                        {isMatched && !isChecked && <span className="ml-2 text-[10px] text-primary opacity-60">Connected to Left #{parseInt(matchedLeftIdx) + 1}</span>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/***************** REORDER SENTENCE *****************/}
                                {questionType === "REORDER_SENTENCE" && (
                                    <div className="space-y-8">
                                        <div className="min-h-[100px] p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-wrap gap-2 items-center justify-center bg-slate-50/50 dark:bg-slate-900/10">
                                            {orderedFragments.length === 0 && <span className="text-slate-400 font-medium">Click fragments below to build the sentence...</span>}
                                            {orderedFragments.map((frag, idx) => (
                                                <button
                                                    key={`ordered-${idx}`}
                                                    onClick={() => handleFragmentClick(frag, true)}
                                                    disabled={isChecked}
                                                    className="px-4 py-2 bg-white dark:bg-slate-800 border-2 border-primary text-slate-800 dark:text-slate-200 rounded-xl font-bold shadow-sm hover:scale-[1.05] transition-all"
                                                >
                                                    {frag.value}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {shuffledFragments.map((frag, idx) => (
                                                <button
                                                    key={`bank-${idx}`}
                                                    onClick={() => handleFragmentClick(frag)}
                                                    disabled={isChecked}
                                                    className="px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:border-primary/50 transition-all"
                                                >
                                                    {frag.value}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/***************** MCQ / MULTI SELECT / AUDIO CHOICE / STORY MCQ *****************/}
                                {!["FILL_IN_THE_BLANK", "TYPE_HEARD_AUDIO", "MATCH_PAIRS", "REORDER_SENTENCE"].includes(questionType) && (
                                    <div className="grid grid-cols-1 gap-4">
                                        {choices.map((option, index) => {
                                            const isSelected = questionType === "MULTI_SELECT_AUDIO_WORDS" ? multiSelected.includes(option.id) : selectedOption === option.id;
                                            const showCorrect = isChecked && option.isCorrect;
                                            const showIncorrect = isChecked && isSelected && !option.isCorrect;

                                            const base = "group relative flex items-center gap-4 w-full p-4 rounded-2xl border-2 text-left transition-all duration-150";
                                            let cls = `${base} border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/10 hover:border-primary`;
                                            if (isSelected) cls = `${base} border-primary bg-emerald-50 dark:bg-emerald-900/10 ring-1 ring-primary`;
                                            if (isChecked && option.isCorrect) cls = `${base} border-green-500 bg-green-50 ring-1 ring-green-500`;
                                            if (isChecked && isSelected && !option.isCorrect) cls = `${base} border-red-500 bg-red-50 ring-1 ring-red-500`;
                                            if (isChecked && !option.isCorrect && !isSelected) cls = `${base} opacity-50 border-slate-100 bg-slate-50`;

                                            return (
                                                <button key={option.id} type="button" onClick={() => handleSelect(option.id)} disabled={isChecked} className={cls}>
                                                    <div className={`flex-shrink-0 size-9 rounded-xl font-extrabold flex items-center justify-center transition-colors ${isChecked && option.isCorrect ? "bg-green-500 text-white" : isChecked && isSelected && !option.isCorrect ? "bg-red-500 text-white" : isSelected ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
                                                        {questionType === "MULTI_SELECT_AUDIO_WORDS" ? (isSelected ? "✓" : "") : String.fromCharCode(65 + index)}
                                                    </div>
                                                    <span className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100">{option.text}</span>
                                                    {showCorrect && <span className="ml-auto size-7 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md"><span className="material-symbols-outlined text-[18px]">check</span></span>}
                                                    {showIncorrect && <span className="ml-auto size-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md"><span className="material-symbols-outlined text-[18px]">close</span></span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {isChecked && (
                                <div className="mt-10 pt-8 border-t border-slate-200/70 dark:border-slate-800/70">
                                    <div className={`flex gap-4 p-6 rounded-3xl border transition-all ${isCorrect ? "bg-green-50/70 border-green-200 text-green-800" : "bg-red-50/70 border-red-200 text-red-800"}`}>
                                        <span className="material-symbols-outlined text-[32px]">{isCorrect ? "check_circle" : "error"}</span>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-xl font-black">{isCorrect ? "Excellent!" : "Not quite right."}</p>
                                            <p className="font-medium opacity-90">{currentQuestion.explanation || "No explanation provided for this question."}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-6 md:px-10 py-6 bg-slate-50/50 dark:bg-slate-900/10 border-t border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between gap-4">
                            <button type="button" onClick={handlePrev} disabled={currentQuestionIndex === 0} className={`inline-flex items-center gap-2 text-sm font-bold transition-all ${currentQuestionIndex === 0 ? "text-slate-300 cursor-not-allowed" : "text-slate-500 hover:text-slate-800"}`}>
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                Previous
                            </button>

                            {!isChecked ? (
                                <button
                                    type="button"
                                    onClick={handleCheck}
                                    disabled={
                                        questionType === "FILL_IN_THE_BLANK" || questionType === "TYPE_HEARD_AUDIO"
                                            ? !textInput.trim()
                                            : questionType === "MATCH_PAIRS"
                                                ? Object.keys(matches).length !== (optionsData.matchItemsLeft || []).length
                                                : questionType === "REORDER_SENTENCE"
                                                    ? orderedFragments.length !== (optionsData.sentencePartsToReorder || []).length
                                                    : questionType === "MULTI_SELECT_AUDIO_WORDS"
                                                        ? multiSelected.length === 0
                                                        : !selectedOption
                                    }
                                    className={`inline-flex items-center gap-2 px-8 py-3 rounded-2xl font-black shadow-lg transition-all active:scale-[0.98] ${(questionType === "FILL_IN_THE_BLANK" || questionType === "TYPE_HEARD_AUDIO" ? textInput.trim() : (questionType === "MATCH_PAIRS" ? Object.keys(matches).length === (optionsData.matchItemsLeft || []).length : (questionType === "REORDER_SENTENCE" ? orderedFragments.length === (optionsData.sentencePartsToReorder || []).length : (questionType === "MULTI_SELECT_AUDIO_WORDS" ? multiSelected.length > 0 : selectedOption)))) ? "bg-primary hover:bg-emerald-600 text-white shadow-emerald-500/25" : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"}`}
                                >
                                    Check Answer
                                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                </button>
                            ) : (
                                <button type="button" onClick={handleNext} className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl font-black bg-primary hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98]">
                                    {currentQuestionIndex < totalQuestions - 1 ? "Continue" : "Finish Quiz"}
                                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                </button>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
