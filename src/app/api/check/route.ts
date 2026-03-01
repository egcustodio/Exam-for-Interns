import { NextRequest, NextResponse } from "next/server";
import { checkAnswer } from "@/data/answerKey.server";

export interface CheckRequest {
  questionId: number;
  selectedIndex: number | null;
}

export interface CheckResponse {
  isCorrect: boolean;
}

export async function POST(req: NextRequest): Promise<NextResponse<CheckResponse>> {
  try {
    const body: CheckRequest = await req.json();
    const { questionId, selectedIndex } = body;

    // Skipped questions are never correct
    if (
      typeof questionId !== "number" ||
      typeof selectedIndex !== "number"
    ) {
      return NextResponse.json({ isCorrect: false });
    }

    const isCorrect = checkAnswer(questionId, selectedIndex);
    return NextResponse.json({ isCorrect });
  } catch {
    return NextResponse.json({ isCorrect: false }, { status: 400 });
  }
}
