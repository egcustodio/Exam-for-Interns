"use client";

import { useState } from "react";
import { Question } from "@/data/questions";
import CategoryBadge from "./CategoryBadge";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (index: number) => Promise<void>;
  onSkip: () => void;
}

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onSkip,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSelect = (idx: number) => {
    if (submitting) return;
    setSelected(idx);
  };

  const handleConfirm = async () => {
    if (selected === null || submitting) return;
    setSubmitting(true);
    await onAnswer(selected);
    setSelected(null);
    setSubmitting(false);
  };

  const handleSkip = () => {
    if (submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      onSkip();
      setSelected(null);
      setSubmitting(false);
    }, 150);
  };

  return (
    <div className="flex flex-col gap-7 w-full animate-scale-in">
      {/* Header row */}
      <div className="flex items-center justify-between select-none">
        <CategoryBadge category={question.category} size="md" />
        <span className="text-base text-slate-400">
          Question{" "}
          <span className="text-white font-bold text-lg">{questionNumber}</span>
          <span className="text-slate-600"> / </span>
          <span className="text-slate-300">{totalQuestions}</span>
        </span>
      </div>

      {/* Question box */}
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl px-8 py-7">
        <p className="text-xl font-semibold text-white leading-relaxed select-none">
          {question.question}
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {question.options.map((option, idx) => {
          const isSelected = selected === idx;
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={submitting}
              className={`flex items-center gap-5 w-full px-7 py-5 rounded-2xl border text-left transition-all duration-150
                ${isSelected
                  ? "border-indigo-500 bg-indigo-500/15 ring-1 ring-indigo-500/40"
                  : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20"
                }`}
            >
              <span
                className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border transition-colors
                  ${isSelected
                    ? "bg-indigo-500 border-indigo-400 text-white"
                    : "bg-white/5 border-white/15 text-slate-400"
                  }`}
              >
                {OPTION_LABELS[idx]}
              </span>
              <span className="text-base text-slate-200 select-none leading-snug">{option}</span>
            </button>
          );
        })}
      </div>

      {/* Action row */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={handleSkip}
          disabled={submitting}
          className="text-base text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 disabled:opacity-40"
        >
          Skip question
        </button>
        <button
          onClick={handleConfirm}
          disabled={selected === null || submitting}
          className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500
            disabled:opacity-30 disabled:cursor-not-allowed
            text-white text-base font-bold rounded-2xl transition-all"
        >
          Confirm Answer
        </button>
      </div>
    </div>
  );
}
