"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const TAB_SWITCH_GRACE = 5; // seconds before exam is voided

export interface AntiCheatState {
  tabWarning: boolean;       // overlay visible?
  countdown: number;         // seconds remaining before void
  voidTriggered: boolean;    // countdown hit 0 — caller should void exam
}

/**
 * Anti-cheat hook.
 *
 * Always active (DevTools blocking, resize detection).
 * When `strict` = true (exam in progress):
 *   - Clipboard / context-menu / select blocked
 *   - Tab-switch detection: 5-second countdown + alarm sound → void signal
 *
 * Returns { tabWarning, countdown, voidTriggered, clearVoid }
 */
export default function useAntiCheat(strict: boolean) {
  const [antiCheat, setAntiCheat] = useState<AntiCheatState>({
    tabWarning: false,
    countdown: TAB_SWITCH_GRACE,
    voidTriggered: false,
  });

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef  = useRef<AudioContext | null>(null);
  const alarmRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Audio alarm (Web Audio API – no file needed) ─────────────────────────
  const startAlarm = useCallback(() => {
    try {
      if (audioCtxRef.current) audioCtxRef.current.close();
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const beep = (startTime: number) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "square";
        osc.frequency.setValueAtTime(880, startTime);
        gain.gain.setValueAtTime(0.4, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
        osc.start(startTime);
        osc.stop(startTime + 0.3);
      };

      // Repeated beeps every 400 ms
      let t = ctx.currentTime;
      const scheduleBeeps = () => {
        beep(t);
        t += 0.4;
      };
      scheduleBeeps();
      alarmRef.current = setInterval(scheduleBeeps, 400);
    } catch {
      // Web Audio not available — silent fail
    }
  }, []);

  const stopAlarm = useCallback(() => {
    if (alarmRef.current) { clearInterval(alarmRef.current); alarmRef.current = null; }
    if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
  }, []);

  // ── Clear void flag (called by page after voiding) ────────────────────────
  const clearVoid = useCallback(() => {
    setAntiCheat({ tabWarning: false, countdown: TAB_SWITCH_GRACE, voidTriggered: false });
  }, []);

  // ── Stop countdown + alarm (user returned in time) ────────────────────────
  const dismissWarning = useCallback(() => {
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    stopAlarm();
    setAntiCheat({ tabWarning: false, countdown: TAB_SWITCH_GRACE, voidTriggered: false });
  }, [stopAlarm]);

  // ── Core effects ──────────────────────────────────────────────────────────
  useEffect(() => {
    // ── Always: block DevTools shortcuts + right-click on every page ──────
    const blockDevTools = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const cm  = e.ctrlKey || e.metaKey;
      if (
        e.key === "F12"  ||
        e.key === "PrintScreen" ||
        (cm && e.shiftKey && ["i","j","c","k"].includes(key)) ||
        (cm && key === "u") ||
        (e.altKey && e.shiftKey && key === "i") ||
        // Block refresh (F5, Ctrl+R) — prevents wiping exam state mid-exam
        e.key === "F5" ||
        (cm && key === "r") ||
        // Block address-bar focus (Ctrl+L / Cmd+L, F6)
        (cm && key === "l") ||
        e.key === "F6" ||
        // Block new tab / new window
        (cm && key === "t") ||
        (cm && key === "n") ||
        // Block close tab
        (cm && key === "w") ||
        // Block print (could screenshot via print preview)
        (cm && key === "p")
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Block right-click (Inspect / View Page Source) everywhere
    const blockContextMenu = (e: MouseEvent) => e.preventDefault();

    const devToolsDetect = () => {
      const gap = 160;
      document.body.style.filter =
        window.outerWidth  - window.innerWidth  > gap ||
        window.outerHeight - window.innerHeight > gap
          ? "blur(8px)" : "";
    };

    document.addEventListener("keydown",     blockDevTools,   true);
    document.addEventListener("contextmenu", blockContextMenu, true);
    window.addEventListener("resize",        devToolsDetect);

    // ── Strict: clipboard + tab-switch ────────────────────────────────────
    const blockClipboard  = (e: ClipboardEvent) => e.preventDefault();
    const blockStrictKeys = (e: KeyboardEvent)  => {
      const cm = e.ctrlKey || e.metaKey;
      if (cm && ["c","x","v","a","p","s"].includes(e.key.toLowerCase())) {
        e.preventDefault(); e.stopPropagation();
      }
    };

    // Warn on page unload (refresh / close / navigate away during exam)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Your exam is in progress. Are you sure you want to leave?";
    };

    // Window blur = user clicked address bar, OS taskbar, another app, etc.
    // Treat the same as a tab switch — start the void countdown
    const handleWindowBlur = () => {
      if (!strict) return;
      if (document.hidden) return; // visibilitychange will handle this case
      startAlarm();
      setAntiCheat({ tabWarning: true, countdown: TAB_SWITCH_GRACE, voidTriggered: false });
      let remaining = TAB_SWITCH_GRACE;
      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
          stopAlarm();
          setAntiCheat({ tabWarning: true, countdown: 0, voidTriggered: true });
        } else {
          setAntiCheat({ tabWarning: true, countdown: remaining, voidTriggered: false });
        }
      }, 1000);
    };

    // Window focus = user came back
    const handleWindowFocus = () => {
      if (!strict) return;
      setAntiCheat((prev) => {
        if (prev.voidTriggered) return prev;
        return { tabWarning: false, countdown: TAB_SWITCH_GRACE, voidTriggered: false };
      });
      if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
      stopAlarm();
    };

    const handleVisibility = () => {
      if (!strict) return;

      if (document.hidden) {
        // ── Tab left ──────────────────────────────────────────────────────
        startAlarm();
        setAntiCheat({ tabWarning: true, countdown: TAB_SWITCH_GRACE, voidTriggered: false });

        let remaining = TAB_SWITCH_GRACE;
        if (countdownRef.current) clearInterval(countdownRef.current);

        countdownRef.current = setInterval(() => {
          remaining -= 1;
          if (remaining <= 0) {
            // ── Time's up — void ─────────────────────────────────────────
            if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
            stopAlarm();
            setAntiCheat({ tabWarning: true, countdown: 0, voidTriggered: true });
          } else {
            setAntiCheat({ tabWarning: true, countdown: remaining, voidTriggered: false });
          }
        }, 1000);
      } else {
        // ── Tab returned ─────────────────────────────────────────────────
        // Only dismiss if not already voided
        setAntiCheat((prev) => {
          if (prev.voidTriggered) return prev; // keep void state
          dismissWarning();
          return prev; // dismissWarning sets state separately
        });
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
        stopAlarm();
        setAntiCheat((prev) => {
          if (prev.voidTriggered) return prev;
          return { tabWarning: false, countdown: TAB_SWITCH_GRACE, voidTriggered: false };
        });
      }
    };

    if (strict) {
      document.body.style.userSelect       = "none";
      document.body.style.webkitUserSelect = "none";
      document.addEventListener("copy",             blockClipboard);
      document.addEventListener("cut",              blockClipboard);
      document.addEventListener("paste",            blockClipboard);
      document.addEventListener("keydown",          blockStrictKeys);
      document.addEventListener("visibilitychange", handleVisibility);
      // Warn before page refresh / close / navigate away
      window.addEventListener("beforeunload", handleBeforeUnload);
      // Catch focus leaving the window (clicking URL bar, OS taskbar, etc.)
      window.addEventListener("blur", handleWindowBlur);
      window.addEventListener("focus", handleWindowFocus);
    }

    return () => {
      document.removeEventListener("keydown",     blockDevTools,    true);
      document.removeEventListener("contextmenu", blockContextMenu, true);
      window.removeEventListener("resize",        devToolsDetect);
      document.body.style.filter = "";

      if (strict) {
        document.body.style.userSelect       = "";
        document.body.style.webkitUserSelect = "";
        document.removeEventListener("copy",             blockClipboard);
        document.removeEventListener("cut",              blockClipboard);
        document.removeEventListener("paste",            blockClipboard);
        document.removeEventListener("keydown",          blockStrictKeys);
        document.removeEventListener("visibilitychange", handleVisibility);
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("blur",  handleWindowBlur);
        window.removeEventListener("focus", handleWindowFocus);
        if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
        stopAlarm();
      }
    };
  }, [strict, startAlarm, stopAlarm, dismissWarning]);

  return { ...antiCheat, dismissWarning, clearVoid };
}

