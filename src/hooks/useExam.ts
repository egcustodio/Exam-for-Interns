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

const VOID_LOCK_KEY = "techquiz_voided_lock";

export default function useExam() {
  const [state, setState] = useState<ExamState>(INITIAL_STATE);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Device lock (persists across page reloads via localStorage) ────────────
  const [isDeviceLocked, setIsDeviceLocked] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem(VOID_LOCK_KEY));
  });

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
      // Grade instantly client-side using the correctIndex loaded at exam start.
      // No network round-trip needed — /api/check is no longer called.
      setState((prev) => {
        if (prev.status !== "in-progress") return prev;
        const currentQ = prev.examQuestions[prev.currentQuestionIndex];
        const isCorrect = selectedIndex === currentQ.correctIndex;
        const newAnswer: Answer = { questionId: currentQ.id, selectedIndex, isCorrect };
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
    // Write permanent device lock to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(VOID_LOCK_KEY, new Date().toISOString());
    }
    setIsDeviceLocked(true);
    // Keep all exam data (answers, examQuestions, startedAt) intact so the
    // auto-submit useEffect can read them — only flip the status to "voided".
    setState((prev) => ({
      ...prev,
      status: "voided" as ExamState["status"],
    }));
  }, [stopTimer]);

  // ── Auto-submit when exam finishes or is voided ────────────────────────────
  const submittedRef = useRef<string | null>(null); // tracks last submitted status+playerName

  useEffect(() => {
    if (state.status !== "finished" && state.status !== "voided") return;

    // Build a key to avoid double-submitting the same result
    const key = `${state.status}:${state.playerName}:${state.startedAt ?? Date.now()}`;
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
    isDeviceLocked,
    setPlayerName,
    showIntro,
    startExam,
    answerQuestion,
    skipQuestion,
    restartExam,
    voidExam,
  };
}
