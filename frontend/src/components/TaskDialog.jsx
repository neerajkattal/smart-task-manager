import { useEffect, useState } from "react";
import { dateToDeadline, deadlineToDate, PRIORITIES, PRIORITY_STYLE, taskKey } from "../lib/tasks";

// Edit a task's title, notes, priority and due date. ⌘/Ctrl+Enter saves, Esc cancels.
export function TaskDialog({ task, onSave, onClose }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(PRIORITIES.includes(task.priority) ? task.priority : "medium");
  const [date, setDate] = useState(deadlineToDate(task.deadline));

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = (e) => {
    e?.preventDefault();
    if (!title.trim()) return;
    onSave(task.id, { title: title.trim(), description, priority, deadline: dateToDeadline(date) });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/50 px-4 pt-[12vh]" onMouseDown={onClose}>
      <form
        onSubmit={save}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => (e.metaKey || e.ctrlKey) && e.key === "Enter" && save(e)}
        role="dialog"
        aria-modal="true"
        aria-label="Edit task"
        className="w-full max-w-lg rounded-xl border border-line bg-panel shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5 font-mono text-[11px] text-faint">
          <span>Edit {taskKey(task)}</span>
          <span className="kbd">esc</span>
        </div>
        <div className="space-y-3 p-4">
          <input
            autoFocus
            value={title}
            maxLength={50}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Title"
            className="w-full bg-transparent text-lg font-medium text-ink outline-none placeholder:text-faint"
            placeholder="Task title"
          />
          <textarea
            value={description}
            maxLength={255}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            aria-label="Notes"
            placeholder="Notes (optional)"
            className="field resize-none"
          />
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-md border border-line p-0.5" role="radiogroup" aria-label="Priority">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={priority === p}
                  onClick={() => setPriority(p)}
                  className={`rounded px-2.5 py-1 text-xs capitalize transition ${
                    priority === p ? PRIORITY_STYLE[p].chip : "text-muted hover:text-ink"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-label="Due date"
              className="field w-auto py-1.5 font-mono text-xs"
            />
            {date && (
              <button type="button" onClick={() => setDate("")} className="text-xs text-faint hover:text-ink">
                Clear date
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-line px-4 py-3">
          <button type="button" onClick={onClose} className="btn-ghost py-1.5">
            Cancel
          </button>
          <button type="submit" disabled={!title.trim()} className="btn-primary py-1.5">
            Save <span className="font-mono text-[10px] opacity-70">⌘↵</span>
          </button>
        </div>
      </form>
    </div>
  );
}
