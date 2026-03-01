/**
 * POST /api/start
 *
 * Builds a randomised exam on the server and returns the question list.
 * correctIndex is included so the client can grade instantly without a
 * round-trip to /api/check on every answer.
 * Options are already shuffled server-side so the correct position varies.
 */
import { NextResponse } from "next/server";
import { buildExamWithAnswers } from "@/data/questionBank.server";

export async function POST() {
  const questions = buildExamWithAnswers();
  return NextResponse.json({ questions });
}
