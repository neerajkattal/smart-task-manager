import { useEffect, useMemo, useRef, useState } from "react";

// ⌘K menu. `commands` is a flat list of { id, group, label, keys?, run };
// typing filters by every word, arrows move, Enter runs, Esc closes.
export function CommandPalette({ commands, context, onClose }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef(null);

  const results = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return commands.filter((c) => {
      const hay = `${c.group} ${c.label}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [commands, query]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const run = (cmd) => {
    if (!cmd) return;
    onClose();
    cmd.run();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(results[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  let lastGroup = null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[14vh]" onMouseDown={onClose}>
      <div
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command menu"
        className="w-full max-w-xl overflow-hidden rounded-xl border border-line bg-panel shadow-2xl"
      >
        {context && (
          <div className="px-4 pt-3 font-mono text-[10px] text-faint">
            Acting on <span className="rounded bg-card px-1.5 py-0.5 text-muted">{context}</span>
          </div>
        )}
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a command or search tasks…"
          aria-label="Command"
          role="combobox"
          aria-expanded="true"
          aria-controls="command-results"
          className="w-full border-b border-line bg-transparent px-4 py-3 text-[15px] text-ink outline-none placeholder:text-faint"
        />
        <ul id="command-results" ref={listRef} role="listbox" className="max-h-[50vh] overflow-y-auto py-1">
          {results.length === 0 && <li className="px-4 py-6 text-center text-sm text-faint">No matches</li>}
          {results.map((cmd, i) => {
            const header = cmd.group !== lastGroup;
            lastGroup = cmd.group;
            return (
              <li key={cmd.id}>
                {header && (
                  <div className="px-4 pb-1 pt-2.5 font-mono text-[10px] uppercase tracking-wider text-faint">{cmd.group}</div>
                )}
                <button
                  data-index={i}
                  role="option"
                  aria-selected={i === active}
                  onMouseMove={() => setActive(i)}
                  onClick={() => run(cmd)}
                  className={`flex w-full items-center gap-3 px-4 py-2 text-left text-[13px] transition ${
                    i === active ? "bg-card text-ink shadow-[inset_2px_0_0_rgb(var(--accent))]" : "text-muted"
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">{cmd.label}</span>
                  {cmd.keys && (
                    <span className="flex gap-0.5">
                      {cmd.keys.map((k) => (
                        <span key={k} className="kbd">
                          {k}
                        </span>
                      ))}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex gap-4 border-t border-line px-4 py-2 font-mono text-[10px] text-faint">
          <span>↑↓ navigate</span>
          <span>↵ run</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
