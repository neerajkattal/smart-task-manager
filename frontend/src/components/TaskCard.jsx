import { columnOf, dueLabel, taskKey } from "../lib/tasks";
import { CheckIcon, PencilIcon, TrashIcon } from "./Icons";

// Three-bar priority glyph: more filled bars = higher priority.
export function PriorityBars({ priority }) {
  const filled = { high: 3, medium: 2, low: 1 }[priority] ?? 2;
  return (
    <span className="inline-flex h-2.5 items-end gap-[2px]" title={`${priority} priority`}>
      {[4, 7, 10].map((h, i) => (
        <i key={h} className={`block w-[3px] rounded-[1px] ${i < filled ? "bg-ink" : "bg-faint/50"}`} style={{ height: h }} />
      ))}
    </span>
  );
}

export function DueChip({ deadline, completed }) {
  const due = dueLabel(deadline);
  if (!due) return null;
  const tone = completed
    ? "text-faint border-line"
    : due.overdue
    ? "text-high border-high/40"
    : due.soon
    ? "text-medium border-medium/40"
    : "text-muted border-line";
  return <span className={`rounded border px-1.5 py-px font-mono text-[10px] ${tone}`}>{due.text}</span>;
}

export function Checkbox({ checked, onChange, label }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[10px] transition ${
        checked ? "border-done bg-done text-canvas" : "border-faint hover:border-ink"
      }`}
    >
      {checked && <CheckIcon />}
    </button>
  );
}

// One task on the board. Click selects it (for keyboard shortcuts); drag moves it.
export function TaskCard({ task, selected, onSelect, onToggle, onEdit, onDelete }) {
  const done = columnOf(task) === "done";
  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", String(task.id));
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={() => onSelect(task.id)}
      onDoubleClick={() => onEdit(task)}
      data-task-id={task.id}
      className={`group relative cursor-pointer rounded-lg border bg-card p-3 transition ${
        selected ? "border-accent ring-1 ring-accent" : "border-line hover:border-faint"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className="pt-0.5">
          <Checkbox checked={done} onChange={() => onToggle(task)} label={`Mark ${task.title} ${done ? "not done" : "done"}`} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={`break-words text-[13px] leading-snug ${done ? "text-faint line-through" : "text-ink"}`}>{task.title}</h3>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{task.description}</p>
          )}
          <div className="mt-2.5 flex items-center gap-2 font-mono text-[10px] text-faint">
            <span>{taskKey(task)}</span>
            {!done && <PriorityBars priority={task.priority} />}
            <span className="ml-auto">
              <DueChip deadline={task.deadline} completed={done} />
            </span>
          </div>
        </div>
      </div>
      <div className="absolute right-2 top-2 hidden gap-0.5 rounded-md border border-line bg-panel p-0.5 group-hover:flex">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
          className="rounded p-1 text-xs text-muted hover:text-ink"
          aria-label="Edit task"
        >
          <PencilIcon />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task);
          }}
          className="rounded p-1 text-xs text-muted hover:text-high"
          aria-label="Delete task"
        >
          <TrashIcon />
        </button>
      </div>
    </article>
  );
}
