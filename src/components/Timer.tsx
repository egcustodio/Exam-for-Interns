"use client";

import { Clock } from "lucide-react";
import { TOTAL_TIME_SECONDS } from "@/data/questions";

interface TimerProps {
  timeRemaining: number;
}

export default function Timer({ timeRemaining }: TimerProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const pct = (timeRemaining / TOTAL_TIME_SECONDS) * 100;

  const isDanger  = timeRemaining <= 60;
  const isWarning = timeRemaining <= 300 && !isDanger;

  const ringColor = isDanger  ? "#ef4444"
                  : isWarning ? "#f59e0b"
                  : "#6366f1";

  const textColor = isDanger  ? "text-red-400"
                  : isWarning ? "text-amber-400"
                  : "text-indigo-300";

  const size = 72;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke={ringColor} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Clock size={16} className={textColor} />
        </div>
      </div>
      <span className={`text-2xl font-mono font-bold tabular-nums ${textColor}`}>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}


interface TimerProps {
  timeRemaining: number;
}
