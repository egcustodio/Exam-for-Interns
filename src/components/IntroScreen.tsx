"use client";

import { useState } from "react";
import { ClipboardList, Clock, ShieldAlert, ChevronRight, User } from "lucide-react";
import { categories, QUESTIONS_PER_SECTION, BONUS_QUESTIONS_COUNT, TOTAL_TIME_SECONDS } from "@/data/questions";
import CategoryBadge from "./CategoryBadge";
import { Category } from "@/data/questions";

interface IntroScreenProps {
  initialName: string;
  onStart: (name: string) => void | Promise<void>;
}

const totalMinutes = Math.round(TOTAL_TIME_SECONDS / 60);

export default function IntroScreen({ initialName, onStart }: IntroScreenProps) {
  const [name, setName] = useState(initialName);
  const canStart = name.trim().length >= 2;

  return (
    <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto py-10 animate-fade-up">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Technology Assessment
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          Read the instructions below, then begin when ready.
        </p>
      </div>

      {/* Name input */}
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-7">
        <label className="block text-sm font-semibold text-slate-300 mb-3">
          <User size={15} className="inline mr-2 text-indigo-400" />
          Your Full Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name to continue..."
          maxLength={60}
          className="w-full bg-white/5 border border-white/15 rounded-xl px-5 py-4 text-white text-lg placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center flex-shrink-0">
            <ClipboardList size={22} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-white font-bold text-2xl">{categories.length * QUESTIONS_PER_SECTION + BONUS_QUESTIONS_COUNT}</p>
            <p className="text-slate-400 text-sm mt-0.5">Total Questions</p>
            <p className="text-slate-500 text-xs mt-1">{QUESTIONS_PER_SECTION}/section + {BONUS_QUESTIONS_COUNT} bonus · randomised</p>
          </div>
        </div>
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center flex-shrink-0">
            <Clock size={22} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-white font-bold text-2xl">{totalMinutes} min</p>
            <p className="text-slate-400 text-sm mt-0.5">Time Limit</p>
            <p className="text-slate-500 text-xs mt-1">Timer starts immediately</p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
          Exam Sections
        </p>
        <div className="flex flex-wrap gap-2.5">
          {categories.map((cat) => (
            <CategoryBadge key={cat} category={cat as Category} size="md" />
          ))}
          <CategoryBadge category="Bonus" size="md" />
        </div>
        <p className="text-slate-500 text-xs mt-3">
          ★ Bonus round (5 questions) about the <span className="text-slate-400">mynaga-crud-app</span> — appended after the main sections.
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
          Instructions
        </p>
        <ul className="flex flex-col gap-3 text-base text-slate-300">
          <li className="flex items-start gap-3">
            <ChevronRight size={16} className="text-indigo-400 mt-1 flex-shrink-0" />
            Each of the 5 main sections has {QUESTIONS_PER_SECTION} multiple-choice questions drawn randomly from the question bank, followed by {BONUS_QUESTIONS_COUNT} Bonus questions.
          </li>
          <li className="flex items-start gap-3">
            <ChevronRight size={16} className="text-indigo-400 mt-1 flex-shrink-0" />
            Select your answer, then click <strong className="text-white">Confirm Answer</strong> to proceed.
          </li>
          <li className="flex items-start gap-3">
            <ChevronRight size={16} className="text-indigo-400 mt-1 flex-shrink-0" />
            No answer feedback is shown during the exam — results are revealed at the end.
          </li>
          <li className="flex items-start gap-3">
            <ChevronRight size={16} className="text-indigo-400 mt-1 flex-shrink-0" />
            Skipped questions are recorded as incorrect.
          </li>
          <li className="flex items-start gap-3">
            <ShieldAlert size={16} className="text-amber-400 mt-1 flex-shrink-0" />
            Copy, paste, right-click, and common keyboard shortcuts are disabled.
          </li>
          <li className="flex items-start gap-3">
            <ShieldAlert size={16} className="text-amber-400 mt-1 flex-shrink-0" />
            Screen capture and developer tools shortcuts are blocked.
          </li>
        </ul>
      </div>

      {/* Start */}
      <button
        disabled={!canStart}
        onClick={() => onStart(name.trim())}
        className="w-full py-5 text-lg font-bold rounded-2xl transition-all
          bg-indigo-600 hover:bg-indigo-500 text-white
          disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Begin Examination
      </button>
    </div>
  );
}
