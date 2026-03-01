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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-rose-950/95 backdrop-blur-sm">
      {/* Pulsing outer ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-80 h-80 rounded-full border-4 border-rose-500/30 animate-ping" />
      </div>

      <div className="relative flex flex-col items-center gap-8 text-center px-6">
        {/* Warning icon */}
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-rose-800/60 ring-4 ring-rose-500/40">
          <AlertTriangle className="w-10 h-10 text-rose-300" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            You left the exam tab!
          </h1>
          <p className="text-rose-300 text-lg">
            Return immediately or your exam will be{" "}
            <span className="font-bold text-rose-200">permanently voided</span>.
          </p>
        </div>

        {/* Circular countdown */}
        <div className="relative flex items-center justify-center">
          <svg width="128" height="128" className="-rotate-90">
            {/* Track */}
            <circle
              cx="64" cy="64" r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={stroke}
            />
            {/* Progress */}
            <circle
              cx="64" cy="64" r={radius}
              fill="none"
              stroke={countdown <= 2 ? "#f87171" : "#fca5a5"}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span
              className={`text-5xl font-black tabular-nums ${
                countdown <= 2 ? "text-red-400 animate-pulse" : "text-white"
              }`}
            >
              {countdown}
            </span>
            <span className="text-xs text-rose-400 uppercase tracking-widest mt-1">
              seconds
            </span>
          </div>
        </div>

        {/* Sub-message */}
        <p className="text-rose-400 text-sm max-w-xs">
          Switching tabs, minimizing, or navigating away is a violation of exam rules.
        </p>
      </div>
    </div>
  );
}
