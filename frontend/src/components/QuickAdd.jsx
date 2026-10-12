import { useState } from "react";
import { dateToDeadline, PRIORITY_STYLE } from "../lib/tasks";
import { CalendarIcon, PlusIcon } from "./Icons";

const OPTIONS = [
  { id: "high", short: "H" },
  { id: "medium", short: "M" },
  { id: "low", short: "L" },
];

// Inline "add a task" row: type, optionally pick priority and a date, press Enter.
// Priority is owned by the dashboard so "+ Add task" on a column can preset it.
export function QuickAdd({ onAdd, inputRef, disabled, priority, onPriorityChange: setPriority }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), priority, deadline: dateToDeadline(date) });
    setTitle("");
    setDate("");
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-card px-3 py-2 transition focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25"
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-accent-soft/15 text-accent">
        <PlusIcon />
      </span>
      <input
        ref={inputRef}
        value={title}
        maxLength={50}
        disabled={disabled}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && e.currentTarget.blur()}
        placeholder={disabled ? "Pick a project to add tasks" : "Add a task, e.g. Email the recruiter"}
        aria-label="New task title"
        className="min-w-[10rem] flex-1 bg-transparent py-1 text-sm text-ink outline-none placeholder:text-faint"
      />
      <div className="flex rounded-md border border-line p-0.5" role="radiogroup" aria-label="Priority">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={priority === o.id}
            title={`${o.id} priority`}
            onClick={() => setPriority(o.id)}
            className={`h-6 w-6 rounded font-mono text-[11px] transition ${
              priority === o.id ? PRIORITY_STYLE[o.id].chip : "text-faint hover:text-ink"
            }`}
          >
            {o.short}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-1.5 rounded-md border border-line px-2 py-1 text-xs text-muted transition focus-within:border-accent">
        <CalendarIcon />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Due date"
          className="bg-transparent font-mono text-[11px] text-ink outline-none [color-scheme:inherit]"
        />
      </label>
      <button type="submit" disabled={disabled || !title.trim()} className="btn-primary px-3 py-1 text-xs disabled:opacity-40">
        Add <span className="font-mono text-[10px] opacity-70">↵</span>
      </button>
    </form>
  );
}
