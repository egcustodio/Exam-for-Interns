"use client";

import { useState } from "react";
import { Monitor, User, ArrowRight } from "lucide-react";
import { TOTAL_TIME_SECONDS } from "@/data/questions";
import useExam from "@/hooks/useExam";
import useAntiCheat from "@/hooks/useAntiCheat";
import IntroScreen from "@/components/IntroScreen";
import QuestionCard from "@/components/QuestionCard";
import ResultsScreen from "@/components/ResultsScreen";
import Timer from "@/components/Timer";
import ProgressBar from "@/components/ProgressBar";
import TabWarningOverlay from "@/components/TabWarningOverlay";
import VoidedScreen from "@/components/VoidedScreen";

export default function Home() {
  const [landingName, setLandingName] = useState("");

  const {
    state,
    currentQuestion,
    totalQuestions,
    score,
    showIntro,
    startExam,
    answerQuestion,
    skipQuestion,
    restartExam,
    voidExam,
  } = useExam();

  const isInExam = state.status === "in-progress";
  const { tabWarning, countdown, voidTriggered } = useAntiCheat(isInExam);

  // Trigger void when countdown hits 0
  if (voidTriggered && state.status === "in-progress") {
    voidExam();
  }

  const timeSpent = TOTAL_TIME_SECONDS - state.timeRemaining;
  const canProceed = landingName.trim().length >= 2;

  return (
    <main className="min-h-screen bg-[#080b14] text-white flex flex-col">

      {/* ── Tab-switch warning overlay ──────────────────────────────────────── */}
      {tabWarning && <TabWarningOverlay countdown={countdown} />}

      {/* ── Voided screen ───────────────────────────────────────────────────── */}
      {state.status === "voided" && (
        <VoidedScreen playerName={state.playerName} onRestart={restartExam} />
      )}

      {/* ── Sticky exam header ──────────────────────────────────────────────── */}
      {state.status === "in-progress" && (
        <header className="sticky top-0 z-50 w-full bg-[#080b14]/90 backdrop-blur border-b border-white/[0.07] px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-6">
            {/* Branding */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <Monitor size={20} className="text-indigo-400" />
              <span className="text-sm font-semibold text-slate-400 hidden sm:block">Tech Assessment</span>
            </div>

            {/* Player name */}
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 flex-shrink-0">
              <User size={14} className="text-slate-500" />
              <span className="text-sm font-medium text-slate-300">{state.playerName}</span>
            </div>

            {/* Progress */}
            <div className="flex-1">
              <ProgressBar current={state.currentQuestionIndex} total={totalQuestions} />
            </div>

            {/* Score */}
            <div className="flex-shrink-0 text-sm text-slate-400">
              Score <span className="text-white font-bold text-base ml-1">{score}</span>
            </div>

            {/* Timer */}
            <Timer timeRemaining={state.timeRemaining} />
          </div>
        </header>
      )}

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">

        {/* Landing */}
        {state.status === "idle" && (
          <div className="flex flex-col items-center gap-10 text-center max-w-xl w-full animate-fade-up">
            {/* Logo */}
            <div className="w-20 h-20 rounded-3xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center animate-pulse-ring">
              <Monitor size={38} className="text-indigo-400" />
            </div>

            {/* Title */}
            <div>
              <h1 className="text-5xl font-black text-white tracking-tight leading-tight">
                Technology<br />Assessment
              </h1>
              <p className="text-slate-400 mt-4 text-lg leading-relaxed">
                A timed examination covering CSS &amp; Styling, Coding &amp; Deployment,<br className="hidden sm:block"/>
                Programming, Databases, Technology Fundamentals &amp; a Bonus round.
              </p>
            </div>

            {/* Name input */}
            <div className="w-full">
              <label className="block text-sm font-semibold text-slate-400 text-left mb-2">
                <User size={14} className="inline mr-1.5" />
                Enter your name to begin
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={landingName}
                  onChange={(e) => setLandingName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && canProceed) showIntro(landingName.trim()); }}
                  placeholder="Your full name..."
                  maxLength={60}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  suppressHydrationWarning
                  className="flex-1 bg-white/[0.05] border border-white/15 rounded-xl px-5 py-4 text-white text-base placeholder-slate-600
                    focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                <button
                  disabled={!canProceed}
                  onClick={() => showIntro(landingName.trim())}
                  suppressHydrationWarning
                  className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all
                    disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <span>130 Questions</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span>5 Sections + Bonus</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span>80 min limit</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span>Randomised</span>
            </div>
          </div>
        )}

        {/* Instructions */}
        {state.status === "intro" && (
          <IntroScreen initialName={state.playerName} onStart={startExam} />
        )}

        {/* Exam */}
        {state.status === "in-progress" && currentQuestion && (
          <div className="w-full max-w-3xl">
            <QuestionCard
              question={currentQuestion}
              questionNumber={state.currentQuestionIndex + 1}
              totalQuestions={totalQuestions}
              onAnswer={answerQuestion}
              onSkip={skipQuestion}
            />
          </div>
        )}

        {/* Results */}
        {state.status === "finished" && (
          <ResultsScreen
            playerName={state.playerName}
            answers={state.answers}
            examQuestions={state.examQuestions}
            timeSpent={timeSpent}
            onRestart={restartExam}
          />
        )}
      </div>

      <footer className="text-center text-slate-700 text-sm py-5 border-t border-white/[0.05]">
        Technology Assessment &copy; {new Date().getFullYear()}
      </footer>
    </main>
  );
}
