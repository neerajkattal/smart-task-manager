import { columnOf, PRIORITY_STYLE, taskKey } from "../lib/tasks";
import { Checkbox, DueChip } from "./TaskCard";
import { PencilIcon, TrashIcon } from "./Icons";

function Row({ task, selected, onSelect, onToggle, onEdit, onDelete }) {
  const col = columnOf(task);
  const done = col === "done";
  return (
    <li
      onClick={() => onSelect(task.id)}
      onDoubleClick={() => onEdit(task)}
      data-task-id={task.id}
      className={`group flex cursor-pointer items-center gap-3 border-b border-line px-3 py-2.5 transition last:border-b-0 ${
        selected ? "bg-accent-soft/10 shadow-[inset_2px_0_0_rgb(var(--accent))]" : "hover:bg-card"
      }`}
    >
      <Checkbox checked={done} onChange={() => onToggle(task)} label={`Mark ${task.title} ${done ? "not done" : "done"}`} />
      <span className="w-12 shrink-0 font-mono text-[10px] text-faint">{taskKey(task)}</span>
      <div className="min-w-0 flex-1">
        <div className={`truncate text-[13px] ${done ? "text-faint line-through" : "text-ink"}`}>{task.title}</div>
        {task.description && <div className="truncate text-xs text-muted">{task.description}</div>}
      </div>
      {!done && (
        <span className={`hidden rounded px-1.5 py-px font-mono text-[10px] capitalize sm:inline ${PRIORITY_STYLE[col].chip}`}>
          {col}
        </span>
      )}
      <DueChip deadline={task.deadline} completed={done} />
      <div className="flex gap-0.5 opacity-0 transition group-hover:opacity-100">
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
    </li>
  );
}

// Compact list view: open tasks first (already ordered by priority), then done.
export function ListView({ tasks, loading, selectedId, cardProps }) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-2 rounded-xl border border-line bg-panel p-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-8 rounded bg-line/60" />
        ))}
      </div>
    );
  }
  const open = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);
  const section = (label, items) =>
    items.length > 0 && (
      <div>
        <h2 className="mb-1.5 px-1 font-mono text-[10px] uppercase tracking-wider text-faint">
          {label} · {items.length}
        </h2>
        <ul className="overflow-hidden rounded-xl border border-line bg-panel">
          {items.map((task) => (
            <Row key={task.id} task={task} selected={task.id === selectedId} {...cardProps} />
          ))}
        </ul>
      </div>
    );
  return (
    <div className="space-y-5">
      {section("Open", open)}
      {section("Done", done)}
    </div>
  );
}
