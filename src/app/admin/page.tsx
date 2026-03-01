"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  LogOut,
  Trophy,
  Users,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Trash2,
  RefreshCw,
  AlertTriangle,
  XCircle,
  Award,
} from "lucide-react";

interface CategoryBreakdown {
  category: string;
  correct: number;
  total: number;
  percentage: number;
}

interface ExamResult {
  id: string;
  playerName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
  submittedAt: string;
  categoryBreakdown: CategoryBreakdown[];
  voided: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  "CSS & Styling": "bg-pink-500/15 text-pink-300 border-pink-500/30",
  "Coding & Deployment": "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  Programming: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  Databases: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  "Fundamentals & Technology": "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Bonus: "bg-yellow-400/15 text-yellow-300 border-yellow-400/30",
};

const BAR_COLORS: Record<string, string> = {
  "CSS & Styling": "bg-pink-500",
  "Coding & Deployment": "bg-cyan-500",
  Programming: "bg-violet-500",
  Databases: "bg-blue-500",
  "Fundamentals & Technology": "bg-amber-500",
  Bonus: "bg-yellow-400",
};

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function gradeBadge(pct: number, voided: boolean) {
  if (voided) return { label: "Voided", color: "text-rose-400 bg-rose-500/10 border-rose-500/30" };
  if (pct >= 90) return { label: "Outstanding", color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30" };
  if (pct >= 75) return { label: "Excellent", color: "text-indigo-300 bg-indigo-500/10 border-indigo-500/30" };
  if (pct >= 60) return { label: "Satisfactory", color: "text-blue-300 bg-blue-500/10 border-blue-500/30" };
  if (pct >= 50) return { label: "Average", color: "text-slate-300 bg-white/5 border-white/15" };
  return { label: "Needs Improvement", color: "text-rose-300 bg-rose-500/10 border-rose-500/30" };
}

// ── Login Screen ───────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (pw: string) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    // Test the password against the API
    const res = await fetch("/api/admin/results", {
      headers: { "x-admin-password": password },
    });
    setLoading(false);
    if (res.ok) {
      onLogin(password);
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b14] flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-6 animate-fade-up">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Shield size={32} className="text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm text-center">Enter the admin password to view exam results.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            autoFocus
            suppressHydrationWarning
            className="w-full bg-white/5 border border-white/15 rounded-xl px-5 py-4 text-white placeholder-slate-600
              focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          {error && (
            <p className="text-rose-400 text-sm flex items-center gap-2">
              <XCircle size={15} /> Incorrect password
            </p>
          )}
          <button
            type="submit"
            disabled={loading || password.length === 0}
            suppressHydrationWarning
            className="py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl
              disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Checking…" : "Enter Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Result Row ─────────────────────────────────────────────────────────────────
function ResultRow({
  result,
  rank,
  adminPw,
  onDelete,
}: {
  result: ExamResult;
  rank: number;
  adminPw: string;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const grade = gradeBadge(result.percentage, result.voided);

  const handleDelete = async () => {
    if (!confirm(`Delete result for "${result.playerName}"?`)) return;
    setDeleting(true);
    await fetch(`/api/admin/results?id=${result.id}`, {
      method: "DELETE",
      headers: { "x-admin-password": adminPw },
    });
    onDelete(result.id);
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
      {/* Row header */}
      <div className="flex items-center gap-4 px-6 py-4">
        {/* Rank */}
        <span className="text-slate-600 font-bold text-sm w-6 text-center flex-shrink-0">{rank}</span>

        {/* Avatar + name */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-indigo-300 font-bold text-sm">
              {result.playerName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold truncate">{result.playerName}</p>
            <p className="text-slate-500 text-xs">{formatDate(result.submittedAt)}</p>
          </div>
        </div>

        {/* Score */}
        <div className="text-center flex-shrink-0 hidden sm:block">
          <p className="text-white font-bold text-lg">{result.voided ? "—" : `${result.percentage}%`}</p>
          <p className="text-slate-500 text-xs">{result.voided ? "voided" : `${result.score}/${result.totalQuestions}`}</p>
        </div>

        {/* Time */}
        <div className="text-center flex-shrink-0 hidden md:block">
          <p className="text-slate-300 font-mono text-sm">{formatTime(result.timeSpent)}</p>
          <p className="text-slate-600 text-xs">time used</p>
        </div>

        {/* Grade badge */}
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border flex-shrink-0 hidden sm:inline ${grade.color}`}>
          {grade.label}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-2 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            title="Toggle breakdown"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-slate-600 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/10 disabled:opacity-30"
            title="Delete result"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Expanded breakdown */}
      {expanded && (
        <div className="border-t border-white/[0.06] px-6 py-5 flex flex-col gap-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
            Score Breakdown by Section
          </p>
          {result.voided ? (
            <div className="flex items-center gap-2 text-rose-400 text-sm">
              <AlertTriangle size={15} />
              This exam was voided due to a tab-switch violation.
            </div>
          ) : (
            result.categoryBreakdown.map((cat) => (
              <div key={cat.category} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-md border ${CATEGORY_COLORS[cat.category] ?? "text-slate-300 bg-white/5 border-white/10"}`}>
                    {cat.category}
                  </span>
                  <span className="text-sm text-slate-400 tabular-nums">
                    {cat.correct}/{cat.total}
                    <span className="text-white font-bold ml-2">{cat.percentage}%</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${BAR_COLORS[cat.category] ?? "bg-indigo-500"}`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [adminPw, setAdminPw] = useState<string | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "score" | "name">("date");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [filterVoided, setFilterVoided] = useState<"all" | "valid" | "voided">("all");

  const fetchResults = useCallback(
    async (pw: string) => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/results", {
          headers: { "x-admin-password": pw },
        });
        const data = await res.json();
        setResults(data.results ?? []);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (adminPw) fetchResults(adminPw);
  }, [adminPw, fetchResults]);

  if (!adminPw) {
    return <LoginScreen onLogin={(pw) => setAdminPw(pw)} />;
  }

  // ── Sort & filter ────────────────────────────────────────────────────────
  const filtered = results.filter((r) => {
    if (filterVoided === "valid") return !r.voided;
    if (filterVoided === "voided") return r.voided;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortBy === "score") cmp = a.percentage - b.percentage;
    else if (sortBy === "name") cmp = a.playerName.localeCompare(b.playerName);
    else cmp = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
    return sortDir === "desc" ? -cmp : cmp;
  });

  // ── Stats cards ──────────────────────────────────────────────────────────
  const validResults = results.filter((r) => !r.voided);
  const avgScore =
    validResults.length > 0
      ? Math.round(validResults.reduce((s, r) => s + r.percentage, 0) / validResults.length)
      : 0;
  const highest = validResults.length > 0 ? Math.max(...validResults.map((r) => r.percentage)) : 0;
  const voidedCount = results.filter((r) => r.voided).length;

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortBy(col); setSortDir("desc"); }
  };

  return (
    <div className="min-h-screen bg-[#080b14] text-white">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#080b14]/90 backdrop-blur border-b border-white/[0.07] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Shield size={16} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Admin Dashboard</h1>
              <p className="text-xs text-slate-500">Technology Assessment Results</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchResults(adminPw)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all disabled:opacity-40"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={() => setAdminPw(null)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 border border-white/10 rounded-xl transition-all"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">

        {/* ── Stats ──────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: <Users size={18} className="text-indigo-400" />, label: "Total Takers", value: results.length, sub: `${voidedCount} voided` },
            { icon: <BarChart3 size={18} className="text-cyan-400" />, label: "Average Score", value: `${avgScore}%`, sub: "valid exams" },
            { icon: <Trophy size={18} className="text-amber-400" />, label: "Highest Score", value: `${highest}%`, sub: "valid exams" },
            { icon: <AlertTriangle size={18} className="text-rose-400" />, label: "Voided Exams", value: voidedCount, sub: `of ${results.length} total` },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 flex flex-col gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">{s.icon}</div>
              <p className="text-2xl font-black text-white">{s.value}</p>
              <div>
                <p className="text-xs font-semibold text-slate-400">{s.label}</p>
                <p className="text-xs text-slate-600">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Controls ───────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-slate-400 mr-auto">{sorted.length} result{sorted.length !== 1 ? "s" : ""} shown</p>

          {/* Filter */}
          <div className="flex rounded-xl border border-white/10 overflow-hidden text-sm">
            {(["all", "valid", "voided"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterVoided(f)}
                className={`px-4 py-2 transition-colors capitalize ${filterVoided === f ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400 hover:text-white"}`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex rounded-xl border border-white/10 overflow-hidden text-sm">
            {(["date", "score", "name"] as const).map((col) => (
              <button
                key={col}
                onClick={() => toggleSort(col)}
                className={`px-4 py-2 transition-colors capitalize flex items-center gap-1 ${sortBy === col ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400 hover:text-white"}`}
              >
                {col}
                {sortBy === col && (sortDir === "desc" ? <ChevronDown size={12} /> : <ChevronUp size={12} />)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Results list ───────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-slate-500">
            <RefreshCw size={18} className="animate-spin" />
            Loading results…
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-slate-600">
            <Award size={40} />
            <p className="text-lg font-medium">No results yet</p>
            <p className="text-sm">Results will appear here once takers complete the exam.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sorted.map((result, i) => (
              <ResultRow
                key={result.id}
                result={result}
                rank={i + 1}
                adminPw={adminPw}
                onDelete={(id) => setResults((prev) => prev.filter((r) => r.id !== id))}
              />
            ))}
          </div>
        )}

        {/* ── Legend ─────────────────────────────────────────────────────────── */}
        {sorted.length > 0 && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Grade Scale</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Outstanding", range: "≥ 90%", color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30" },
                { label: "Excellent", range: "≥ 75%", color: "text-indigo-300 bg-indigo-500/10 border-indigo-500/30" },
                { label: "Satisfactory", range: "≥ 60%", color: "text-blue-300 bg-blue-500/10 border-blue-500/30" },
                { label: "Average", range: "≥ 50%", color: "text-slate-300 bg-white/5 border-white/15" },
                { label: "Needs Improvement", range: "< 50%", color: "text-rose-300 bg-rose-500/10 border-rose-500/30" },
                { label: "Voided", range: "tab-switch", color: "text-rose-400 bg-rose-500/10 border-rose-500/30" },
              ].map((g) => (
                <span key={g.label} className={`text-xs px-3 py-1 rounded-full border font-medium ${g.color}`}>
                  {g.label} <span className="opacity-60">({g.range})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-slate-700 text-xs pb-4">
          Admin view — Technology Assessment © {new Date().getFullYear()}
        </p>
      </main>
    </div>
  );
}
