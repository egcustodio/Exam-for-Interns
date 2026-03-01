"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, MinusCircle, RotateCcw, ChevronDown, ChevronUp, Trophy, Target, Clock, Loader2 } from "lucide-react";
import { categories } from "@/data/questions";
import { Answer, CategoryResult } from "@/types/exam";
import CategoryBadge from "./CategoryBadge";
import { Category, Question } from "@/data/questions";
import type { ReviewEntry } from "@/app/api/review/route";

interface ResultsScreenProps {
  playerName: string;
  answers: Answer[];
  examQuestions: Question[];
  timeSpent: number;
  onRestart: () => void;
}

function getRank(pct: number): { label: string; color: string; ringColor: string } {
  if (pct >= 90) return { label: "Outstanding",       color: "text-emerald-300",  ringColor: "#10b981" };
  if (pct >= 75) return { label: "Excellent",         color: "text-indigo-300",   ringColor: "#6366f1" };
  if (pct >= 60) return { label: "Satisfactory",      color: "text-blue-300",     ringColor: "#60a5fa" };
  if (pct >= 50) return { label: "Average",           color: "text-slate-300",    ringColor: "#94a3b8" };
  return            { label: "Needs Improvement",  color: "text-rose-300",     ringColor: "#f87171" };
}

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function ResultsScreen({ playerName, answers, examQuestions, timeSpent, onRestart }: ResultsScreenProps) {
  const [reviewOpen, setReviewOpen] = useState(false);
  // Server-fetched answer data — only loaded when review is opened
  const [reviewMap, setReviewMap] = useState<Map<number, ReviewEntry>>(new Map());
  const [reviewLoading, setReviewLoading] = useState(false);

  // Fetch correct answers + explanations from server when review is first opened
  useEffect(() => {
    if (!reviewOpen || reviewMap.size > 0) return;
    let cancelled = false;
    (async () => {
      setReviewLoading(true);
      try {
        const res = await fetch("/api/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionIds: examQuestions.map((q) => q.id) }),
        });
        const { entries }: { entries: ReviewEntry[] } = await res.json();
        if (!cancelled) {
          const map = new Map<number, ReviewEntry>(entries.map((e) => [e.id, e]));
          setReviewMap(map);
        }
      } catch { /* silent fail */ }
      finally { if (!cancelled) setReviewLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [reviewOpen, reviewMap.size, examQuestions]);

  const totalCorrect = answers.filter((a) => a.isCorrect).length;
  const totalSkipped = answers.filter((a) => a.selectedIndex === null).length;
  const totalWrong = answers.length - totalCorrect - totalSkipped;
  const total = examQuestions.length;
  const pct = total > 0 ? Math.round((totalCorrect / total) * 100) : 0;
  const rank = getRank(pct);

  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;

  const categoryResults: CategoryResult[] = categories.map((cat) => {
    const catQs = examQuestions.filter((q) => q.category === cat);
    const catAnswers = answers.filter((a) => catQs.some((q) => q.id === a.questionId));
    const correct = catAnswers.filter((a) => a.isCorrect).length;
    const catTotal = catQs.length;
    return { category: cat, correct, total: catTotal, percentage: catTotal > 0 ? Math.round((correct / catTotal) * 100) : 0 };
  });

  const circleSize = 160;
  const stroke = 10;
  const r = (circleSize - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto py-10 animate-fade-up">
      {/* Header */}
      <div>
        <p className="text-slate-400 text-base">Results for</p>
        <h2 className="text-3xl font-bold text-white mt-0.5">{playerName}</h2>
      </div>

      {/* Score hero */}
      <div className="flex items-center gap-8 bg-white/[0.04] border border-white/10 rounded-2xl p-8">
        <div className="relative flex-shrink-0">
          <svg width={circleSize} height={circleSize} className="-rotate-90">
            <circle cx={circleSize/2} cy={circleSize/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
            <circle
              cx={circleSize/2} cy={circleSize/2} r={r} fill="none"
              stroke={rank.ringColor} strokeWidth={stroke}
              strokeDasharray={circ} strokeDashoffset={offset}
              strokeLinecap="round" className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-white">{pct}%</span>
            <span className="text-sm text-slate-400 mt-1">Score</span>
          </div>
        </div>

        <div className="flex flex-col gap-5 flex-1">
          <div>
            <p className={`text-2xl font-bold ${rank.color}`}>{rank.label}</p>
            <p className="text-slate-400 mt-1">{totalCorrect} of {total} questions correct</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
              <CheckCircle2 size={20} className="text-emerald-400 mx-auto mb-1" />
              <p className="text-emerald-300 font-bold text-xl">{totalCorrect}</p>
              <p className="text-slate-500 text-xs mt-0.5">Correct</p>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-center">
              <XCircle size={20} className="text-rose-400 mx-auto mb-1" />
              <p className="text-rose-300 font-bold text-xl">{totalWrong}</p>
              <p className="text-slate-500 text-xs mt-0.5">Wrong</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <MinusCircle size={20} className="text-slate-400 mx-auto mb-1" />
              <p className="text-slate-300 font-bold text-xl">{totalSkipped}</p>
              <p className="text-slate-500 text-xs mt-0.5">Skipped</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Clock size={14} />
            Time used: <span className="text-white font-semibold">{String(minutes).padStart(2,"0")}:{String(seconds).padStart(2,"0")}</span>
          </div>
        </div>
      </div>

      {/* Section breakdown */}
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-7 flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-indigo-400" />
          <p className="text-base font-semibold text-white">Performance by Section</p>
        </div>
        {categoryResults.map((res) => (
          <div key={res.category} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <CategoryBadge category={res.category as Category} size="md" />
              <span className="text-base text-slate-400 tabular-nums">
                {res.correct}/{res.total}
                <span className="text-white font-bold ml-2">{res.percentage}%</span>
              </span>
            </div>
            <div className="w-full h-2 bg-white/8 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  res.percentage >= 75 ? "bg-indigo-500" : res.percentage >= 50 ? "bg-blue-500" : "bg-rose-500"
                }`}
                style={{ width: `${res.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Answer review */}
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden">
        <button
          onClick={() => setReviewOpen((p) => !p)}
          className="w-full flex items-center justify-between px-7 py-5 text-base font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            Review All Answers
          </div>
          {reviewOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {reviewOpen && (
          <div className="border-t border-white/10 divide-y divide-white/[0.06]">
            {reviewLoading && (
              <div className="flex items-center justify-center gap-3 py-10 text-slate-400">
                <Loader2 size={20} className="animate-spin" />
                Loading answer review…
              </div>
            )}
            {!reviewLoading && examQuestions.map((q, qi) => {
              const ans = answers.find((a) => a.questionId === q.id);
              const isSkipped = !ans || ans.selectedIndex === null;
              const isCorrect = ans?.isCorrect ?? false;
              const reviewEntry = reviewMap.get(q.id);

              return (
                <div key={q.id} className="px-7 py-6 flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      {isSkipped  ? <MinusCircle size={20} className="text-slate-500" />
                      : isCorrect ? <CheckCircle2 size={20} className="text-emerald-400" />
                                  : <XCircle size={20} className="text-rose-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-base text-white font-medium leading-relaxed">
                        <span className="text-slate-500 mr-2">Q{qi + 1}.</span>
                        {q.question}
                      </p>
                      <div className="mt-1">
                        <CategoryBadge category={q.category as Category} />
                      </div>
                    </div>
                  </div>

                  <div className="ml-9 flex flex-col gap-2">
                    {q.options.map((opt, oi) => {
                      const isSelected = ans?.selectedIndex === oi;
                      const isAnswer   = reviewEntry?.correctIndex === oi;
                      let style = "border-white/5 text-slate-500 bg-transparent";
                      if (isAnswer)                      style = "border-emerald-500/40 bg-emerald-500/10 text-emerald-200";
                      else if (isSelected && !isAnswer)  style = "border-rose-500/40 bg-rose-500/10 text-rose-300";

                      return (
                        <div key={oi} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${style}`}>
                          <span className="font-bold w-5 flex-shrink-0">{OPTION_LABELS[oi]}</span>
                          <span className="flex-1">{opt}</span>
                          {isAnswer && <span className="text-emerald-400 font-semibold text-xs whitespace-nowrap">Correct answer</span>}
                          {isSelected && !isAnswer && <span className="text-rose-400 font-semibold text-xs whitespace-nowrap">Your answer</span>}
                        </div>
                      );
                    })}
                  </div>

                  {reviewEntry?.explanation && (
                    <p className="ml-9 text-sm text-slate-500 leading-relaxed">{reviewEntry.explanation}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Retake */}
      <button
        onClick={onRestart}
        className="flex items-center justify-center gap-3 w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-bold rounded-2xl transition-colors"
      >
        <RotateCcw size={20} />
        Retake Examination
      </button>
    </div>
  );
}
