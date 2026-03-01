export type Category =
  | "CSS & Styling"
  | "Coding & Deployment"
  | "Programming"
  | "Databases"
  | "Fundamentals & Technology"
  | "Bonus";

/**
 * Safe client-facing question type.
 * correctIndex and explanation are intentionally OMITTED — they live
 * server-side only in questionBank.server.ts / answerKey.server.ts
 */
export interface Question {
  id: number;
  category: Category;
  question: string;
  options: string[];
}

export const categories: Category[] = [
  "CSS & Styling",
  "Coding & Deployment",
  "Programming",
  "Databases",
  "Fundamentals & Technology",
];

export const QUESTIONS_PER_SECTION = 25;
export const BONUS_QUESTIONS_COUNT = 5;
export const TOTAL_QUESTIONS = categories.length * QUESTIONS_PER_SECTION + BONUS_QUESTIONS_COUNT; // 130
export const TOTAL_TIME_SECONDS = 80 * 60; // 80 minutes
