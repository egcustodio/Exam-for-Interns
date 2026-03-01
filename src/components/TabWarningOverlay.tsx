"use client";

import { AlertTriangle } from "lucide-react";

interface TabWarningOverlayProps {
  countdown: number;
}

export default function TabWarningOverlay({ countdown }: TabWarningOverlayProps) {
  const radius  = 54;
  const stroke  = 8;
  const circ    = 2 * Math.PI * radius;
  const grace   = 5;
  const offset  = circ - (countdown / grace) * circ;
  const danger  = countdown <= 2;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-md transition-colors duration-500 ${
      danger ? "bg-rose-950/98" : "bg-red-900/95"
    }`}>
      {/* Pulsing red background flash */}
      <div className="absolute inset-0 bg-rose-600/10 animate-pulse pointer-events-none" />
      {/* Pulsing outer ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 rounded-full border-4 border-rose-500/40 animate-ping" />
      </div>

      <div className="relative flex flex-col items-center gap-7 text-center px-6 max-w-md animate-scale-in">

        {/* Icon */}
        <div className={`flex items-center justify-center w-24 h-24 rounded-full ring-4 transition-colors duration-300 ${
          danger
            ? "bg-rose-600/80 ring-white/60 animate-pulse"
            : "bg-rose-700/60 ring-rose-400/60"
        }`}>
          {danger
            ? <AlertTriangle className="w-12 h-12 text-white" />
            : <AlertTriangle className="w-12 h-12 text-rose-200" />
          }
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className={`text-3xl font-black tracking-tight transition-colors duration-300 ${
            danger ? "text-white animate-pulse" : "text-rose-300"
          }`}>
            {danger ? "⚠️ Final Warning!" : "🚨 Cheating Detected!"}
          </h1>
          <p className="text-rose-100 text-base font-semibold leading-relaxed">
            You&apos;ve been detected using <span className="text-yellow-300 font-black">Alt+Tab</span> or changing the tab to other apps.
          </p>
          <p className={`text-sm leading-relaxed font-bold transition-colors duration-300 ${
            danger ? "text-white" : "text-rose-200"
          }`}>
            {danger
              ? "🔴 Your exam will be PERMANENTLY VOIDED!"
              : "Return to the exam tab immediately or your exam will be permanently voided."
            }
          </p>
        </div>

        {/* Circular countdown */}
        <div className="relative flex items-center justify-center">
          <svg width="128" height="128" className="-rotate-90">
            <circle
              cx="64" cy="64" r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={stroke}
            />
            <circle
              cx="64" cy="64" r={radius}
              fill="none"
              stroke={danger ? "#f87171" : "#fbbf24"}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-black transition-colors duration-300 ${
              danger ? "text-rose-400" : "text-white"
            }`}>
              {countdown}
            </span>
            <span className="text-slate-400 text-xs font-medium">seconds</span>
          </div>
        </div>

        <p className="text-slate-500 text-xs">
          Anti-cheat system is active. This violation has been recorded.
        </p>
      </div>
    </div>
  );
}
