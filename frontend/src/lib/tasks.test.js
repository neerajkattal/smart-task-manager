import { columnOf, dateToDeadline, deadlineToDate, dueLabel, matchesSearch, orderTasks } from "./tasks";

const now = new Date(2026, 9, 13, 10, 0); // Tue 13 Oct 2026, 10:00

test("completed tasks go to done, open tasks to their priority", () => {
  expect(columnOf({ completed: true, priority: "high" })).toBe("done");
  expect(columnOf({ completed: false, priority: "low" })).toBe("low");
  expect(columnOf({ completed: false, priority: "weird" })).toBe("medium");
});

test("orders by column, then soonest deadline", () => {
  const tasks = [
    { id: 1, priority: "low", completed: false },
    { id: 2, priority: "high", completed: true },
    { id: 3, priority: "high", completed: false, deadline: "2026-10-20T23:59:00" },
    { id: 4, priority: "high", completed: false, deadline: "2026-10-14T23:59:00" },
  ];
  expect(orderTasks(tasks).map((t) => t.id)).toEqual([4, 3, 1, 2]);
});

test("due labels are relative to today", () => {
  expect(dueLabel("2026-10-13T23:59:00", now)).toMatchObject({ text: "Today", overdue: false, soon: true });
  expect(dueLabel("2026-10-14T23:59:00", now)).toMatchObject({ text: "Tomorrow", soon: true });
  expect(dueLabel("2026-10-10T23:59:00", now)).toMatchObject({ overdue: true });
  expect(dueLabel(null, now)).toBeNull();
});

test("date input round-trips through the API format", () => {
  expect(dateToDeadline("2026-10-14")).toBe("2026-10-14T23:59:00");
  expect(deadlineToDate("2026-10-14T23:59:00")).toBe("2026-10-14");
  expect(dateToDeadline("")).toBeNull();
});

test("search matches title or description, case-insensitively", () => {
  const task = { title: "Tailor CV", description: "graduate role" };
  expect(matchesSearch(task, "cv")).toBe(true);
  expect(matchesSearch(task, "GRADUATE")).toBe(true);
  expect(matchesSearch(task, "nope")).toBe(false);
});
