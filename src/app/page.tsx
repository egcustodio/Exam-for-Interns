"use client";

import { useState } from "react";
import { User, Zap, Trophy, Clock, BookOpen, Star, Shield, ChevronRight } from "lucide-react";
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

/* ── Floating decorative shapes ─────────────────────────────────────────────── */
function FloatingShape({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <div
      className={`absolute rounded-2xl opacity-20 animate-float ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

/* ── Star particle ───────────────────────────────────────────────────────────── */
function StarParticle({ style }: { style: React.CSSProperties }) {
  return (
    <div className="absolute animate-twinkle" style={style}>
      <Star size={8} className="text-violet-300 fill-violet-300" />
    </div>
  );
}

/* ── Category pill ───────────────────────────────────────────────────────────── */
const CATEGORY_CONFIG = [
  { label: "HTML / CSS", color: "from-orange-500 to-pink-500", icon: "🎨", delay: 0 },
  { label: "JavaScript", color: "from-yellow-400 to-orange-500", icon: "⚡", delay: 0.1 },
  { label: "Git", color: "from-green-400 to-emerald-500", icon: "🌿", delay: 0.2 },
  { label: "Databases", color: "from-blue-400 to-cyan-500", icon: "🗄️", delay: 0.3 },
  { label: "Programming", color: "from-purple-400 to-violet-500", icon: "💻", delay: 0.4 },
  { label: "⭐ Bonus", color: "from-pink-400 to-rose-500", icon: "🎁", delay: 0.5 },
];

const STARS: React.CSSProperties[] = [
  { top: "10%", left: "8%",  animationDelay: "0s",    animationDuration: "2.1s" },
  { top: "18%", left: "92%", animationDelay: "0.4s",  animationDuration: "2.8s" },
  { top: "35%", left: "5%",  animationDelay: "0.8s",  animationDuration: "1.9s" },
  { top: "55%", left: "95%", animationDelay: "1.2s",  animationDuration: "2.4s" },
  { top: "72%", left: "12%", animationDelay: "0.6s",  animationDuration: "3.0s" },
  { top: "80%", left: "85%", animationDelay: "1.5s",  animationDuration: "2.2s" },
  { top: "90%", left: "45%", animationDelay: "0.3s",  animationDuration: "1.7s" },
  { top: "25%", left: "50%", animationDelay: "1.0s",  animationDuration: "2.6s" },
];

export default function Home() {
  const [landingName, setLandingName] = useState("");

  const {
    state,
    currentQuestion,
    totalQuestions,
    score,
    isDeviceLocked,
    showIntro,
    startExam,
    answerQuestion,
    skipQuestion,
    restartExam,
    voidExam,
  } = useExam();

  const isInExam = state.status === "in-progress";
  const { tabWarning, countdown, voidTriggered } = useAntiCheat(isInExam);

  if (voidTriggered && state.status === "in-progress") {
    voidExam();
  }

  const timeSpent = TOTAL_TIME_SECONDS - state.timeRemaining;
  const canProceed = landingName.trim().length >= 2;

  // Device is permanently locked — show blocked screen immediately
  if (isDeviceLocked) {
    return (
      <VoidedScreen
        playerName=""
        locked={true}
        onRestart={restartExam}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#0d0221] text-white flex flex-col overflow-x-hidden">

      {/* ── Tab warning overlay ──────────────────────────────────────────────── */}
      {tabWarning && <TabWarningOverlay countdown={countdown} />}

      {/* ── Voided screen ───────────────────────────────────────────────────── */}
      {state.status === "voided" && (
        <VoidedScreen playerName={state.playerName} locked={true} onRestart={restartExam} />
      )}

      {/* ── Exam header ─────────────────────────────────────────────────────── */}
      {state.status === "in-progress" && (
        <header className="sticky top-0 z-50 w-full bg-[#0d0221]/90 backdrop-blur border-b border-white/[0.07] px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-6">
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
                <Zap size={16} className="text-white fill-white" />
              </div>
              <span className="text-sm font-bold text-slate-300 hidden sm:block">TechQuiz</span>
            </div>
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 flex-shrink-0">
              <User size={14} className="text-slate-500" />
              <span className="text-sm font-medium text-slate-300">{state.playerName}</span>
            </div>
            <div className="flex-1">
              <ProgressBar current={state.currentQuestionIndex} total={totalQuestions} />
            </div>
            <div className="flex-shrink-0 text-sm text-slate-400">
              Score <span className="text-white font-bold text-base ml-1">{score}</span>
            </div>
            <Timer timeRemaining={state.timeRemaining} />
          </div>
        </header>
      )}

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">

        {/* ════════════════════════════════════════════════════════════════════
            LANDING PAGE  — Kahoot-style
        ════════════════════════════════════════════════════════════════════ */}
        {state.status === "idle" && (
          <div className="relative w-full flex flex-col items-center">

            {/* Radial glow blobs */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
              <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-violet-700/30 animate-glow-pulse" style={{ filter: "blur(80px)" }} />
              <div className="absolute bottom-[-5%] right-[15%] w-[400px] h-[400px] rounded-full bg-indigo-600/25 animate-glow-pulse" style={{ filter: "blur(70px)", animationDelay: "1.5s" }} />
              <div className="absolute top-[40%] left-[-5%] w-[300px] h-[300px] rounded-full bg-fuchsia-700/20 animate-glow-pulse" style={{ filter: "blur(60px)", animationDelay: "0.8s" }} />
            </div>

            {/* Floating shapes */}
            <FloatingShape className="w-16 h-16 bg-violet-500 top-8 left-[8%] rotate-12"  delay={0} />
            <FloatingShape className="w-10 h-10 bg-pink-500   top-20 right-[10%] -rotate-6" delay={0.8} />
            <FloatingShape className="w-12 h-12 bg-blue-500   bottom-32 left-[12%] rotate-45" delay={1.4} />
            <FloatingShape className="w-8  h-8  bg-yellow-400 bottom-20 right-[8%] rotate-12" delay={0.4} />

            {/* Star particles */}
            {STARS.map((s, i) => <StarParticle key={i} style={s} />)}

            {/* ── Main card ────────────────────────────────────────────────── */}
            <div className="relative z-10 w-full max-w-lg flex flex-col items-center gap-8 text-center animate-fade-up">

              {/* Logo */}
              <div className="relative">
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-900/60 animate-bounce-slow">
                  <Zap size={52} className="text-white fill-white drop-shadow-lg" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg animate-spin-slow">
                  <Star size={14} className="text-yellow-900 fill-yellow-900" />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-3">
                <h1 className="text-6xl font-black tracking-tight leading-none">
                  <span className="shimmer-text">TechQuiz</span>
                </h1>
                <p className="text-xl font-semibold text-slate-300">
                  Intern Assessment Challenge
                </p>
                <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                  Test your knowledge across HTML/CSS, JavaScript, Git, Databases &amp; more — in a race against the clock!
                </p>
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-center gap-2 w-full">
                {[
                  { icon: <BookOpen size={14} />, label: "130 Questions", color: "text-violet-400" },
                  { icon: <Clock size={14} />,    label: "80 Minutes",    color: "text-blue-400"   },
                  { icon: <Trophy size={14} />,   label: "5 Sections",    color: "text-yellow-400" },
                ].map(({ icon, label, color }) => (
                  <div key={label} className="flex-1 flex items-center justify-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-xl py-3 px-2">
                    <span className={color}>{icon}</span>
                    <span className="text-xs font-semibold text-slate-300">{label}</span>
                  </div>
                ))}
              </div>

              {/* Name input */}
              <div className="w-full space-y-3">
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={landingName}
                    onChange={(e) => setLandingName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && canProceed) showIntro(landingName.trim()); }}
                    placeholder="Enter your full name to join..."
                    maxLength={60}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    suppressHydrationWarning
                    className="w-full bg-white/[0.06] border-2 border-white/15 rounded-2xl pl-10 pr-5 py-4 text-white text-base
                      placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20
                      transition-all font-medium"
                  />
                </div>

                <button
                  disabled={!canProceed}
                  onClick={() => showIntro(landingName.trim())}
                  suppressHydrationWarning
                  className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500
                    text-white font-black text-lg rounded-2xl transition-all shadow-lg shadow-violet-900/50
                    disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none
                    flex items-center justify-center gap-3 group"
                >
                  <Zap size={20} className="fill-white group-hover:animate-bounce-slow" />
                  Let&apos;s Go!
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Category pills */}
              <div className="w-full">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Topics Covered</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {CATEGORY_CONFIG.map(({ label, color, icon, delay }) => (
                    <div
                      key={label}
                      className={`animate-pop-in flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${color} text-white text-xs font-bold shadow-lg`}
                      style={{ animationDelay: `${delay + 0.3}s` }}
                    >
                      <span>{icon}</span>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anti-cheat warning */}
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-xs text-amber-400">
                <Shield size={14} className="flex-shrink-0" />
                <span>Anti-cheat is active. Tab switching will void your exam.</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Instructions screen ──────────────────────────────────────────── */}
        {state.status === "intro" && (
          <IntroScreen initialName={state.playerName} onStart={startExam} />
        )}

        {/* ── Active exam ──────────────────────────────────────────────────── */}
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

        {/* ── Results ──────────────────────────────────────────────────────── */}
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

      {state.status !== "in-progress" && (
        <footer className="text-center text-slate-700 text-xs py-4 border-t border-white/[0.04]">
          TechQuiz &copy; {new Date().getFullYear()} · Powered by MyNaga
        </footer>
      )}
    </main>
  );
}
