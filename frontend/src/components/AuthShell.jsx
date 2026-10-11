import { useEffect, useState } from "react";
import { useTheme } from "../lib/theme";
import { MoonIcon, SunIcon } from "./Icons";

// Shared frame for the login and signup pages.
export function AuthShell({ title, subtitle, children, footer }) {
  const [theme, toggleTheme] = useTheme();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <button
        onClick={toggleTheme}
        className="fixed right-4 top-4 rounded-md border border-line p-2 text-muted transition hover:text-ink"
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-btn font-mono text-[10px] font-medium text-btn-ink">
            ST
          </span>
          <span className="text-sm font-semibold">Smart Tasks</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mb-6 mt-1 text-sm text-muted">{subtitle}</p>
        <div className="rounded-xl border border-line bg-panel p-5">{children}</div>
        <p className="mt-4 text-center text-sm text-muted">{footer}</p>
      </div>
    </div>
  );
}

// The API runs on Render's free tier, which sleeps when idle. If a request
// takes a while, say so instead of leaving the button spinning silently.
export function useSlowNotice(active, delay = 4000) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!active) return setSlow(false);
    const id = setTimeout(() => setSlow(true), delay);
    return () => clearTimeout(id);
  }, [active, delay]);
  return slow;
}

export function SlowNotice() {
  return (
    <p className="mt-3 text-xs leading-relaxed text-muted">
      The free server is waking up. The first request can take up to 30 seconds.
    </p>
  );
}

export function ErrorNote({ children }) {
  return (
    <p role="alert" className="mb-4 rounded-md border border-high/40 bg-high/10 px-3 py-2 text-sm text-high">
      {children}
    </p>
  );
}
