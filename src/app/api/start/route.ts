/**
 * POST /api/start
 *
 * Builds a randomised exam on the server and returns the question list.
 * Only client-safe Question objects (no correctIndex / explanation) are sent.
 */
import { NextResponse } from "next/server";
import { buildExam } from "@/data/questionBank.server";

export async function POST() {
  const questions = buildExam();
  return NextResponse.json({ questions });
}
