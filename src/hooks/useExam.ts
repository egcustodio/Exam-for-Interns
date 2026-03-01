"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { TOTAL_TIME_SECONDS, categories } from "@/data/questions";
import { ExamState, Answer } from "@/types/exam";

const INITIAL_STATE: ExamState = {
  status: "idle",
  playerName: "",
  currentQuestionIndex: 0,
  answers: [],
  timeRemaining: TOTAL_TIME_SECONDS,
  startedAt: null,
  examQuestions: [],
};

export default function useExam() {
  const [state, setState] = useState<ExamState>(INITIAL_STATE);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Timer ──────────────────────────────────────────────────────────────────
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (state.status === "in-progress") {
      timerRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.timeRemaining <= 1) {
            stopTimer();
            return { ...prev, timeRemaining: 0, status: "finished" };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    }
    return () => stopTimer();
  }, [state.status, stopTimer]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const setPlayerName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, playerName: name }));
  }, []);

  const showIntro = useCallback((name: string) => {
    setState((prev) => ({ ...prev, playerName: name, status: "intro" }));
  }, []);

  const startExam = useCallback(async () => {
    // Fetch the randomised question list from the server.
    // buildExam() runs server-side so correctIndex is never in the bundle.
    let examQuestions: ExamState["examQuestions"] = [];
    try {
      const res = await fetch("/api/start", { method: "POST" });
      const data = await res.json();
      examQuestions = data.questions ?? [];
    } catch {
      // If the request fails, examQuestions stays empty and the UI can show an error.
    }
    setState((prev) => ({
      ...INITIAL_STATE,
      playerName: prev.playerName,
      status: "in-progress",
      startedAt: Date.now(),
      examQuestions,
    }));
  }, []);

  const answerQuestion = useCallback(
    async (selectedIndex: number) => {
      // Capture current question before any state change
      let questionId = -1;
      setState((prev) => {
        if (prev.status !== "in-progress") return prev;
        questionId = prev.examQuestions[prev.currentQuestionIndex].id;
        return prev; // no change yet
      });
      if (questionId === -1) return;

      // Ask the server — answers never evaluated on the client
      let isCorrect = false;
      try {
        const res = await fetch("/api/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId, selectedIndex }),
        });
        const data: { isCorrect: boolean } = await res.json();
        isCorrect = data.isCorrect;
      } catch {
        // Network error — count as incorrect, continue exam
        isCorrect = false;
      }

      setState((prev) => {
        if (prev.status !== "in-progress") return prev;
        const newAnswer: Answer = { questionId, selectedIndex, isCorrect };
        const updatedAnswers = [...prev.answers, newAnswer];
        const nextIndex = prev.currentQuestionIndex + 1;
        const isLast = nextIndex >= prev.examQuestions.length;
        if (isLast) {
          stopTimer();
          return { ...prev, answers: updatedAnswers, status: "finished" };
        }
        return { ...prev, answers: updatedAnswers, currentQuestionIndex: nextIndex };
      });
    },
    [stopTimer]
  );

  const skipQuestion = useCallback(() => {
    setState((prev) => {
      if (prev.status !== "in-progress") return prev;
      const q = prev.examQuestions[prev.currentQuestionIndex];
      const skippedAnswer: Answer = { questionId: q.id, selectedIndex: null, isCorrect: false };
      const updatedAnswers = [...prev.answers, skippedAnswer];
      const nextIndex = prev.currentQuestionIndex + 1;
      const isLast = nextIndex >= prev.examQuestions.length;

      if (isLast) {
        stopTimer();
        return { ...prev, answers: updatedAnswers, status: "finished" };
      }
      return { ...prev, answers: updatedAnswers, currentQuestionIndex: nextIndex };
    });
  }, [stopTimer]);

  const restartExam = useCallback(() => {
    stopTimer();
    setState(INITIAL_STATE);
  }, [stopTimer]);

  const voidExam = useCallback(() => {
    stopTimer();
    setState((prev) => ({
      ...INITIAL_STATE,
      status: "voided" as ExamState["status"],
      playerName: prev.playerName,
    }));
  }, [stopTimer]);

  // ── Auto-submit when exam finishes or is voided ────────────────────────────
  const submittedRef = useRef<string | null>(null); // tracks last submitted status+playerName

  useEffect(() => {
    if (state.status !== "finished" && state.status !== "voided") return;

    // Build a key to avoid double-submitting the same result
    const key = `${state.status}:${state.playerName}:${state.startedAt}`;
    if (submittedRef.current === key) return;
    submittedRef.current = key;

    const totalQs = state.examQuestions.length;
    const correctAnswers = state.answers.filter((a) => a.isCorrect);
    const scoreCount = correctAnswers.length;
    const timeSpent = TOTAL_TIME_SECONDS - state.timeRemaining;

    const categoryBreakdown = categories.map((cat) => {
      const catQuestions = state.examQuestions.filter((q) => q.category === cat);
      const catCorrect = state.answers.filter(
        (a) => a.isCorrect && catQuestions.some((q) => q.id === a.questionId)
      ).length;
      return {
        category: cat,
        correct: catCorrect,
        total: catQuestions.length,
        percentage: catQuestions.length > 0 ? Math.round((catCorrect / catQuestions.length) * 100) : 0,
      };
    });

    fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerName: state.playerName,
        score: scoreCount,
        totalQuestions: totalQs,
        timeSpent,
        categoryBreakdown,
        voided: state.status === "voided",
      }),
    }).catch(() => {/* fire and forget */});
  }, [state.status, state.playerName, state.startedAt, state.answers, state.examQuestions, state.timeRemaining]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const currentQuestion = state.examQuestions[state.currentQuestionIndex] ?? null;
  const totalQuestions = state.examQuestions.length;
  const score = state.answers.filter((a) => a.isCorrect).length;

  return {
    state,
    currentQuestion,
    totalQuestions,
    score,
    setPlayerName,
    showIntro,
    startExam,
    answerQuestion,
    skipQuestion,
    restartExam,
    voidExam,
  };
}
