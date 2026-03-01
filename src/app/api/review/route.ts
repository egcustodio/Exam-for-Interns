import { NextRequest, NextResponse } from "next/server";
import { answerKey } from "@/data/answerKey.server";

export interface ReviewRequest {
  questionIds: number[];
}

export interface ReviewEntry {
  id: number;
  correctIndex: number;
  explanation: string;
}

export interface ReviewResponse {
  entries: ReviewEntry[];
}

/**
 * POST /api/review
 * Accepts an array of question IDs (from a completed exam).
 * Returns correctIndex + explanation for each — only used by ResultsScreen.
 * Does NOT expose this data during an active exam.
 */
export async function POST(req: NextRequest): Promise<NextResponse<ReviewResponse>> {
  try {
    const body: ReviewRequest = await req.json();
    const { questionIds } = body;

    if (!Array.isArray(questionIds)) {
      return NextResponse.json({ entries: [] }, { status: 400 });
    }

    const entries: ReviewEntry[] = questionIds
      .map((id) => {
        const entry = answerKey.get(id);
        if (!entry) return null;
        return { id, correctIndex: entry.correctIndex, explanation: entry.explanation };
      })
      .filter((e): e is ReviewEntry => e !== null);

    return NextResponse.json({ entries });
  } catch {
    return NextResponse.json({ entries: [] }, { status: 400 });
  }
}
