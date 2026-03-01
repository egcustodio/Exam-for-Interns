"use client";

import { XCircle, ShieldAlert, Ban } from "lucide-react";

interface VoidedScreenProps {
  playerName: string;
  locked: boolean;        // true = device permanently locked, no restart
  onRestart: () => void;
}

export default function VoidedScreen({ playerName, locked, onRestart }: VoidedScreenProps) {
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-[#0d0221] px-4">
      {/* Red glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-rose-900/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg text-center space-y-7 animate-scale-in">

        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-rose-900/40 ring-8 ring-rose-800/30 flex items-center justify-center">
              {locked
                ? <Ban className="w-14 h-14 text-rose-400" />
                : <XCircle className="w-14 h-14 text-rose-500" />
              }
            </div>
            <div className="absolute -top-1 -right-1 w-9 h-9 rounded-full bg-rose-600 flex items-center justify-center shadow-lg">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-5xl font-black text-rose-400 tracking-tight">
            {locked ? "Access Blocked" : "Exam Voided"}
          </h1>
          {locked ? (
            <p className="text-slate-300 text-base leading-relaxed">
              You&apos;ve been detected using <span className="text-yellow-300 font-semibold">Alt+Tab</span> or
              {" "}changing the tab to other apps during the exam.
              <br /><br />
              <span className="text-rose-400 font-bold">
                This device has been permanently blocked from retaking the exam.
              </span>
            </p>
          ) : (
            <p className="text-slate-400 text-base leading-relaxed">
              You navigated away from the exam tab during the assessment.
              <br />This is considered a violation of the exam rules.
            </p>
          )}
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
          <p className="text-rose-400 font-semibold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
            <ShieldAlert size={14} /> Exam Rules Violated
          </p>
          {[
            "Do not switch browser tabs or apps during the exam",
            "Do not use Alt+Tab, Cmd+Tab, or similar shortcuts",
            "Do not minimize or navigate away from the exam",
          ].map((rule) => (
            <div key={rule} className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
              <span className="text-slate-400 text-sm">{rule}</span>
            </div>
          ))}
        </div>

        {/* Action */}
        {locked ? (
          <div className="bg-rose-950/60 border border-rose-800/50 rounded-2xl px-6 py-4">
            <p className="text-rose-300 text-sm font-semibold">
              🔒 This device is permanently locked.
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Contact your exam administrator to request a re-attempt.
            </p>
          </div>
        ) : (
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-3 bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-bold text-lg px-10 py-4 rounded-2xl transition-all duration-150 shadow-lg cursor-pointer"
          >
            Start Over
          </button>
        )}

        <p className="text-slate-600 text-xs">
          Contact your exam administrator if you believe this is an error.
        </p>
      </div>
    </div>
  );
}
