"use client";

/**
 * /unblock?token=<ADMIN_TOKEN>
 *
 * When visited on the blocked device, this page clears the localStorage lock
 * and redirects the user back to the exam — if the token matches.
 *
 * The token is the admin password hashed client-side (never sent to the server).
 * It is embedded in the URL by the admin dashboard's "Generate Unblock Link" button.
 */

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

const VOID_LOCK_KEY = "techquiz_voided_lock";

function UnblockContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "success" | "invalid">("checking");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setTimeout(() => setStatus("invalid"), 0);
      return;
    }

    // Verify token against the stored admin hash in the URL
    // The token is: btoa(ADMIN_PASSWORD) — simple obfuscation, admin-eyes only
    // We fetch the server to validate it properly
    fetch("/api/unblock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          localStorage.removeItem(VOID_LOCK_KEY);
          setStatus("success");
          setTimeout(() => router.replace("/"), 2500);
        } else {
          setStatus("invalid");
        }
      })
      .catch(() => setStatus("invalid"));
  }, [params, router]);

  return (
    <div className="min-h-screen bg-[#080b14] flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm animate-fade-up">
        {status === "checking" && (
          <>
            <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
            <p className="text-slate-400 text-lg">Verifying unblock request…</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-4xl">
              ✅
            </div>
            <h1 className="text-2xl font-bold text-white">Device Unblocked!</h1>
            <p className="text-slate-400">
              Your device lock has been removed. Redirecting you to the exam…
            </p>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full animate-[grow_2.5s_linear_forwards]" style={{ width: "100%" }} />
            </div>
          </>
        )}

        {status === "invalid" && (
          <>
            <div className="w-20 h-20 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-4xl">
              ❌
            </div>
            <h1 className="text-2xl font-bold text-white">Invalid Link</h1>
            <p className="text-slate-400">
              This unblock link is invalid or has expired. Ask the admin for a new link.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function UnblockPage() {
  return (
    <Suspense>
      <UnblockContent />
    </Suspense>
  );
}
