// Board columns, in display order. Open tasks sit in their priority column;
// completed tasks all go to "done".
export const COLUMNS = [
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
  { id: "done", label: "Done" },
];

export const PRIORITIES = ["high", "medium", "low"];

export function columnOf(task) {
  if (task.completed) return "done";
  return PRIORITIES.includes(task.priority) ? task.priority : "medium";
}

// Tasks in the same order the board shows them: by column, then soonest deadline.
export function orderTasks(tasks) {
  const rank = Object.fromEntries(COLUMNS.map((c, i) => [c.id, i]));
  const due = (t) => (t.deadline ? new Date(t.deadline).getTime() : Infinity);
  return [...tasks].sort(
    (a, b) => rank[columnOf(a)] - rank[columnOf(b)] || due(a) - due(b) || b.id - a.id
  );
}

export function matchesSearch(task, term) {
  const q = term.trim().toLowerCase();
  if (!q) return true;
  return `${task.title} ${task.description || ""}`.toLowerCase().includes(q);
}

const DAY = 24 * 60 * 60 * 1000;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// Human label for a deadline: "Today", "Tomorrow", "Fri", or "14 Oct",
// plus whether it is overdue (only meaningful for open tasks).
export function dueLabel(deadline, now = new Date()) {
  if (!deadline) return null;
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return null;
  const days = Math.round((startOfDay(date) - startOfDay(now)) / DAY);
  let text;
  if (days === 0) text = "Today";
  else if (days === 1) text = "Tomorrow";
  else if (days === -1) text = "Yesterday";
  else if (days > 1 && days < 7) text = date.toLocaleDateString("en-NZ", { weekday: "short" });
  else text = date.toLocaleDateString("en-NZ", { day: "numeric", month: "short" });
  return { text, overdue: days < 0, soon: days >= 0 && days <= 1 };
}

// <input type="date"> value (YYYY-MM-DD) <-> API deadline (end of that day).
export const dateToDeadline = (value) => (value ? `${value}T23:59:00` : null);
export const deadlineToDate = (deadline) => (deadline ? String(deadline).slice(0, 10) : "");

export const taskKey = (task) => `T-${task.id}`;

// Stable colour per project, from a small palette that works in both themes.
const PROJECT_COLOURS = ["#9BCB3C", "#5BA8FF", "#FF8B5E", "#C792EA", "#E8B931", "#4FD1C5"];
export const projectColour = (id) => PROJECT_COLOURS[id % PROJECT_COLOURS.length];

// Full class names (not built at runtime) so Tailwind can see them.
export const PRIORITY_STYLE = {
  high: { chip: "bg-high/15 text-high", text: "text-high", dot: "bg-high" },
  medium: { chip: "bg-medium/15 text-medium", text: "text-medium", dot: "bg-medium" },
  low: { chip: "bg-low/15 text-low", text: "text-low", dot: "bg-low" },
  done: { chip: "bg-done/15 text-done", text: "text-done", dot: "bg-done" },
};
