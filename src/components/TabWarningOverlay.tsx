"use client";

import { AlertTriangle, EyeOff } from "lucide-react";

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md">
      {/* Pulsing outer ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 rounded-full border-4 border-rose-500/20 animate-ping" />
      </div>

      <div className="relative flex flex-col items-center gap-7 text-center px-6 max-w-md animate-scale-in">

        {/* Icon */}
        <div className={`flex items-center justify-center w-24 h-24 rounded-full ring-4 transition-colors duration-300 ${
          danger
            ? "bg-rose-700/60 ring-rose-500/60"
            : "bg-amber-700/50 ring-amber-500/40"
        }`}>
          {danger
            ? <AlertTriangle className="w-12 h-12 text-rose-300" />
            : <EyeOff className="w-12 h-12 text-amber-300" />
          }
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className={`text-3xl font-black tracking-tight transition-colors duration-300 ${
            danger ? "text-rose-400" : "text-amber-300"
          }`}>
            {danger ? "⚠️ Final Warning!" : "🚨 Cheating Detected!"}
          </h1>
          <p className="text-white text-base font-semibold leading-relaxed">
            You&apos;ve been detected using <span className="text-yellow-300">Alt+Tab</span> or changing the tab to other apps.
          </p>
          <p className={`text-sm leading-relaxed transition-colors duration-300 ${
            danger ? "text-rose-300 font-bold" : "text-slate-400"
          }`}>
            {danger
              ? "Your exam will be PERMANENTLY VOIDED!"
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
