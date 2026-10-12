// Animated preview for the login and signup pages: a task is typed, lands on
// the board, gets selected and is finished with a single key. Pure CSS, so it
// costs nothing to load; with reduced motion it shows a still frame.
function MiniCard({ title, tag, className = "", done = false }) {
  return (
    <div className={`rounded-md border border-line bg-card px-2.5 py-2 ${className}`}>
      <div className="flex items-start gap-2">
        <span className={`mt-0.5 h-3 w-3 shrink-0 rounded-full border ${done ? "border-done bg-done" : "border-faint"}`} />
        <span className={`text-[11px] leading-snug ${done ? "text-faint line-through" : "text-ink"}`}>{title}</span>
      </div>
      {tag && <div className="mt-1.5 pl-5 font-mono text-[9px] text-faint">{tag}</div>}
    </div>
  );
}

function Column({ label, dot, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 px-0.5 text-[10px] font-medium text-muted">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {label}
      </div>
      {children}
    </div>
  );
}

const FEATURES = [
  { keys: ["↵"], title: "Add a task in one line", body: "Type it, pick a priority, press Enter." },
  { keys: ["J", "K", "X"], title: "Keyboard first", body: "Move with J and K, finish with X, ⌘K for everything else." },
  { keys: ["V"], title: "Your workspace, your look", body: "Board or list, light or dark, your own accent colour." },
];

export function Showcase() {
  return (
    <div className="mx-auto w-full max-w-md">
      <p className="font-mono text-[10px] uppercase tracking-wider text-faint">What you can do</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight">Everything is one keystroke away.</h2>

      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-panel shadow-2xl" aria-hidden="true">
        <div className="flex items-center justify-between border-b border-line px-3 py-2 text-[11px]">
          <span>
            <span className="text-faint">Projects / </span>
            <span className="font-medium">Job hunt</span>
          </span>
          <span className="flex gap-0.5">
            <span className="kbd">⌘</span>
            <span className="kbd">K</span>
          </span>
        </div>
        <div className="space-y-3 p-3">
          <div className="flex items-center gap-2 rounded-md border border-line bg-card px-2.5 py-1.5 text-[11px]">
            <span className="h-3 w-3 rounded-full border border-faint" />
            <span className="inline-block overflow-hidden whitespace-nowrap font-sans text-ink motion-safe:animate-[sc-type_8s_infinite]" style={{ width: 0 }}>
              Prepare demo for Friday
            </span>
            <span className="-ml-1 h-3 w-px bg-accent motion-safe:animate-[sc-caret_1s_steps(1)_infinite]" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Column label="High" dot="bg-high">
              <MiniCard title="Prepare demo for Friday" tag="T-21 · Fri" className="opacity-100 motion-safe:animate-[sc-new_8s_infinite]" />
              <MiniCard title="Tailor CV" tag="T-14 · Today" />
            </Column>
            <Column label="Medium" dot="bg-medium">
              <MiniCard title="Mock interview" tag="T-11 · Tomorrow" />
            </Column>
            <Column label="Done" dot="bg-done">
              <MiniCard title="Prepare demo for Friday" done className="opacity-0 motion-safe:animate-[sc-done_8s_infinite]" />
              <MiniCard title="Fix outage" done />
            </Column>
          </div>
        </div>
        <div className="flex items-center gap-4 border-t border-line px-3 py-2 font-mono text-[10px] text-faint">
          <span className="flex items-center gap-1.5">
            <span className="kbd motion-safe:animate-[sc-key-enter_8s_infinite]">↵</span> add
          </span>
          <span className="flex items-center gap-1.5">
            <span className="kbd motion-safe:animate-[sc-key-x_8s_infinite]">X</span> finish
          </span>
        </div>
      </div>

      <ul className="mt-8 space-y-4">
        {FEATURES.map((f) => (
          <li key={f.title} className="flex gap-3">
            <span className="flex w-16 shrink-0 justify-end gap-0.5 pt-0.5">
              {f.keys.map((k) => (
                <span key={k} className="kbd">
                  {k}
                </span>
              ))}
            </span>
            <span>
              <span className="block text-sm font-medium">{f.title}</span>
              <span className="block text-xs leading-relaxed text-muted">{f.body}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
