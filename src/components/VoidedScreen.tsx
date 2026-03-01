"use client";

import { XCircle, RotateCcw, ShieldAlert } from "lucide-react";

interface VoidedScreenProps {
  playerName: string;
  onRestart: () => void;
}

export default function VoidedScreen({ playerName, onRestart }: VoidedScreenProps) {
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-[#080b14] px-4">
      <div className="w-full max-w-lg text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-rose-900/30 ring-8 ring-rose-800/30 flex items-center justify-center">
              <XCircle className="w-14 h-14 text-rose-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-5xl font-black text-rose-400 tracking-tight">
            Exam Voided
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            You navigated away from the exam tab during the assessment.
            <br />
            This is considered a violation of the exam rules.
          </p>
        </div>

        {/* Player card */}
        {playerName && (
          <div className="inline-flex items-center gap-3 bg-slate-800/60 border border-slate-700/50 rounded-2xl px-6 py-3">
            <div className="w-8 h-8 rounded-full bg-rose-700/40 flex items-center justify-center">
              <span className="text-rose-300 font-bold text-sm">
                {playerName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-slate-300 font-medium">{playerName}</span>
          </div>
        )}

        {/* Rules reminder */}
        <div className="bg-slate-800/40 border border-rose-900/40 rounded-2xl p-5 text-left space-y-2">
          <p className="text-rose-400 font-semibold text-sm uppercase tracking-wider mb-3">
            Exam Rules Violated
          </p>
          {[
            "Do not switch browser tabs during the exam",
            "Do not minimize or navigate away from the exam",
            "Stay on this page for the entire exam duration",
          ].map((rule) => (
            <div key={rule} className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
              <span className="text-slate-400 text-sm">{rule}</span>
            </div>
          ))}
        </div>

        {/* Restart button */}
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-3 bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-bold text-lg px-10 py-4 rounded-2xl transition-all duration-150 shadow-lg cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          Start Over
        </button>

        <p className="text-slate-600 text-xs">
          Contact your exam administrator if you believe this is an error.
        </p>
      </div>
    </div>
  );
}
