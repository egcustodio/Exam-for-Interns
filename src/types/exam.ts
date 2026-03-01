import { Category, Question } from "@/data/questions";

export type ExamStatus = "idle" | "intro" | "in-progress" | "finished" | "voided";

export interface Answer {
  questionId: number;
  selectedIndex: number | null;
  isCorrect: boolean;
}

export interface CategoryResult {
  category: Category;
  correct: number;
  total: number;
  percentage: number;
}

export interface ExamState {
  status: ExamStatus;
  playerName: string;
  currentQuestionIndex: number;
  answers: Answer[];
  timeRemaining: number;
  startedAt: number | null;
  examQuestions: Question[];
}
