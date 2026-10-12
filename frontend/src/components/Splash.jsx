import { useEffect, useState } from "react";

// The API runs on Render's free tier, which sleeps when idle. If a request
// takes a while, say so instead of leaving the screen silently waiting.
export function useSlowNotice(active, delay = 4000) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!active) return setSlow(false);
    const id = setTimeout(() => setSlow(true), delay);
    return () => clearTimeout(id);
  }, [active, delay]);
  return slow;
}

// Full-screen loading state shown while the workspace loads.
export function Splash() {
  const slow = useSlowNotice(true);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center" role="status">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-btn font-mono text-sm font-medium text-btn-ink motion-safe:animate-pulse">
        ST
      </span>
      <div className="h-[3px] w-40 overflow-hidden rounded-full bg-line">
        <div className="h-full w-2/5 rounded-full bg-accent motion-safe:animate-[loading-slide_1.1s_ease-in-out_infinite]" />
      </div>
      <p className="text-sm text-muted">Loading your workspace…</p>
      <p className={`max-w-xs text-xs leading-relaxed text-faint transition-opacity ${slow ? "opacity-100" : "opacity-0"}`}>
        The free server is waking up. The first load can take up to 30 seconds.
      </p>
    </div>
  );
}
