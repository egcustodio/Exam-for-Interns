/**
 * POST /api/submit
 * Called by the client when an exam is finished (or voided).
 * Saves the result server-side. No answer data is accepted from the client —
 * scores are trusted from server-graded /api/check calls stored in client state.
 */
import { NextRequest, NextResponse } from "next/server";
import { saveResult, ExamResult, CategoryBreakdown } from "@/lib/resultStore.server";
import { randomUUID } from "crypto";

export interface SubmitRequest {
  playerName: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  categoryBreakdown: CategoryBreakdown[];
  voided: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body: SubmitRequest = await req.json();

    const { playerName, score, totalQuestions, timeSpent, categoryBreakdown, voided } = body;

    if (!playerName || typeof score !== "number" || typeof totalQuestions !== "number") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const result: ExamResult = {
      id: randomUUID(),
      playerName: String(playerName).slice(0, 80),
      score,
      totalQuestions,
      percentage: totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0,
      timeSpent,
      submittedAt: new Date().toISOString(),
      categoryBreakdown: categoryBreakdown ?? [],
      voided: Boolean(voided),
    };

    await saveResult(result);

    return NextResponse.json({ ok: true, id: result.id });
  } catch {
    return NextResponse.json({ error: "Failed to save result" }, { status: 500 });
  }
}
