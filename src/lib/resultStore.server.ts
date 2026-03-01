/**
 * SERVER-ONLY — Supabase-backed result store.
 * All reads/writes go through the service-role client (never the browser).
 */
import "server-only";
import { supabaseAdmin } from "./supabase.server";

export interface CategoryBreakdown {
  category: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface ExamResult {
  id: string;
  playerName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;   // seconds
  submittedAt: string; // ISO string
  categoryBreakdown: CategoryBreakdown[];
  voided: boolean;
}

// ── Map DB row ↔ ExamResult ────────────────────────────────────────────────────

type DbRow = {
  id: string;
  player_name: string;
  score: number;
  total_questions: number;
  percentage: number;
  time_spent: number;
  submitted_at: string;
  category_breakdown: unknown;
  voided: boolean;
};

function rowToResult(row: DbRow): ExamResult {
  return {
    id: row.id,
    playerName: row.player_name,
    score: row.score,
    totalQuestions: row.total_questions,
    percentage: row.percentage,
    timeSpent: row.time_spent,
    submittedAt: row.submitted_at,
    categoryBreakdown: row.category_breakdown as CategoryBreakdown[],
    voided: row.voided,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getAllResults(): Promise<ExamResult[]> {
  const { data, error } = await supabaseAdmin
    .from("exam_results")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("[resultStore] getAllResults error:", error.message);
    return [];
  }
  return (data as DbRow[]).map(rowToResult);
}

export async function saveResult(result: ExamResult): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = {
    id: result.id,
    player_name: result.playerName,
    score: result.score,
    total_questions: result.totalQuestions,
    percentage: result.percentage,
    time_spent: result.timeSpent,
    submitted_at: result.submittedAt,
    category_breakdown: result.categoryBreakdown,
    voided: result.voided,
  };
  const { error } = await supabaseAdmin.from("exam_results").insert(payload);

  if (error) {
    console.error("[resultStore] saveResult error:", error.message);
    throw new Error(error.message);
  }
}

export async function deleteResult(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("exam_results")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[resultStore] deleteResult error:", error.message);
    throw new Error(error.message);
  }
}
