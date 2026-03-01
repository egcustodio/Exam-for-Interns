/**
 * SERVER-ONLY — never imported by client components.
 * The `server-only` package enforces this: any accidental client-side import
 * will cause a hard build error.
 *
 * This file maps question IDs → { correctIndex, explanation }.
 * It is never shipped to the browser bundle.
 */
import "server-only";
import { questionBank } from "./questionBank.server";

export interface AnswerEntry {
  correctIndex: number;
  explanation: string;
}

/** Map of questionId → answer data. Built once at module load. */
export const answerKey: ReadonlyMap<number, AnswerEntry> = new Map(
  questionBank.map((q) => [q.id, { correctIndex: q.correctIndex, explanation: q.explanation }])
);

/**
 * Check a single answer server-side.
 * Returns { isCorrect } only — never leaks the correct index to the caller.
 */
export function checkAnswer(questionId: number, selectedIndex: number): boolean {
  const entry = answerKey.get(questionId);
  if (!entry) return false;
  return entry.correctIndex === selectedIndex;
}
