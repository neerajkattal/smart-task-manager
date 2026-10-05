import { useState } from "react";
import { COLUMNS, columnOf, PRIORITY_STYLE } from "../lib/tasks";
import { TaskCard } from "./TaskCard";

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-line bg-card p-3">
      <div className="h-3 w-3/4 rounded bg-line" />
      <div className="mt-2 h-2.5 w-1/2 rounded bg-line/70" />
      <div className="mt-4 h-2 w-1/4 rounded bg-line/70" />
    </div>
  );
}

// Kanban view. Dropping a card on a priority column sets that priority (and
// reopens it if it was done); dropping on Done completes it.
export function Board({ tasks, loading, selectedId, onMove, cardProps }) {
  const [over, setOver] = useState(null);

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {COLUMNS.map((col) => {
        const items = tasks.filter((t) => columnOf(t) === col.id);
        return (
          <section
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(col.id);
            }}
            onDragLeave={() => setOver((o) => (o === col.id ? null : o))}
            onDrop={(e) => {
              e.preventDefault();
              setOver(null);
              const id = Number(e.dataTransfer.getData("text/plain"));
              if (id) onMove(id, col.id);
            }}
            className={`flex min-h-[10rem] flex-col rounded-xl border p-2 transition ${
              over === col.id ? "border-accent bg-accent-soft/5" : "border-transparent"
            }`}
          >
            <h2 className="mb-2 flex items-center gap-2 px-1 text-xs font-medium text-muted">
              <span className={`h-2 w-2 rounded-full ${PRIORITY_STYLE[col.id].dot}`} />
              {col.label}
              <span className="font-mono text-[10px] text-faint">{loading ? "" : items.length}</span>
            </h2>
            <div className="flex flex-1 flex-col gap-2">
              {loading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : items.length ? (
                items.map((task) => (
                  <TaskCard key={task.id} task={task} selected={task.id === selectedId} {...cardProps} />
                ))
              ) : (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-line p-4 text-center text-xs text-faint">
                  {col.id === "done" ? "Finished tasks land here" : "Drop a task here"}
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
