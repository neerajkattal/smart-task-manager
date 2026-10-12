import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { usePreferences } from "../lib/theme";
import { matchesSearch, orderTasks, PRIORITIES, taskKey } from "../lib/tasks";
import { Sidebar } from "../components/Sidebar";
import { QuickAdd } from "../components/QuickAdd";
import { Board } from "../components/Board";
import { ListView } from "../components/ListView";
import { TaskDialog } from "../components/TaskDialog";
import { CommandPalette } from "../components/CommandPalette";
import { SettingsDialog } from "../components/SettingsDialog";
import { Splash } from "../components/Splash";
import { BoardIcon, ListIcon, MoonIcon, SearchIcon, SunIcon } from "../components/Icons";

const readPref = (key, fallback) => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};
const writePref = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {}
};

// Typing in a field shouldn't trigger single-key shortcuts.
const isTyping = (el) => el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

function Dashboard() {
  const navigate = useNavigate();
  const { prefs, update: updatePrefs, theme, toggleTheme } = usePreferences();

  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const [view, setView] = useState(() => readPref("view", "board"));
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState("");

  const quickAddRef = useRef(null);
  const searchRef = useRef(null);

  const toastTimer = useRef(null);

  const notify = useCallback((message) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 3500);
  }, []);

  // Load the user and their projects; reopen the last project used.
  // loadAttempt changes when the user retries after a failed load.
  useEffect(() => {
    setLoadFailed(false);
    setProjectsLoaded(false);
    API.get("/me").then((r) => setUser(r.data)).catch(() => {});
    API.get("/projects")
      .then((r) => {
        setProjects(r.data);
        const last = Number(readPref("project", ""));
        const pick = r.data.find((p) => p.id === last) || r.data[0];
        if (pick) setSelectedProject(pick.id);
        setProjectsLoaded(true);
      })
      .catch(() => setLoadFailed(true));
  }, [loadAttempt]);

  useEffect(() => {
    if (selectedProject === null) return;
    writePref("project", selectedProject);
    let cancelled = false;
    setLoadingTasks(true);
    setTasks([]);
    setSelectedId(null);
    API.get(`/projects/${selectedProject}/tasks`, { params: { limit: 200 } })
      .then((r) => !cancelled && setTasks(r.data))
      .catch(() => !cancelled && notify("Couldn’t load tasks"))
      .finally(() => !cancelled && setLoadingTasks(false));
    return () => {
      cancelled = true;
    };
  }, [selectedProject, notify]);

  useEffect(() => writePref("view", view), [view]);

  const visible = useMemo(() => orderTasks(tasks.filter((t) => matchesSearch(t, search))), [tasks, search]);
  const selectedTask = tasks.find((t) => t.id === selectedId) || null;
  const project = projects.find((p) => p.id === selectedProject);
  const doneCount = tasks.filter((t) => t.completed).length;

  // --- Mutations: update the screen first, then the server; roll back on failure.

  const patchTask = useCallback(
    async (id, changes) => {
      let before;
      setTasks((prev) => {
        before = prev;
        return prev.map((t) => (t.id === id ? { ...t, ...changes } : t));
      });
      try {
        await API.patch(`/tasks/${id}`, changes);
      } catch {
        setTasks(before);
        notify("Couldn’t save that change");
      }
    },
    [notify]
  );

  const addTask = async ({ title, priority, deadline }) => {
    if (!selectedProject) return;
    try {
      const r = await API.post(`/projects/${selectedProject}/tasks`, { title, description: "", priority, deadline });
      setTasks((prev) => [...prev, { completed: false, ...r.data }]);
      setSelectedId(r.data.id);
    } catch {
      notify("Couldn’t add the task");
    }
  };

  const deleteTask = useCallback(
    async (task) => {
      let before;
      setTasks((prev) => {
        before = prev;
        return prev.filter((t) => t.id !== task.id);
      });
      setSelectedId((id) => (id === task.id ? null : id));
      try {
        await API.delete(`/tasks/${task.id}`);
        notify(`Deleted “${task.title}”`);
      } catch {
        setTasks(before);
        notify("Couldn’t delete the task");
      }
    },
    [notify]
  );

  const toggleTask = useCallback((task) => patchTask(task.id, { completed: !task.completed }), [patchTask]);

  const moveTask = useCallback(
    (id, column) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      if (column === "done") {
        if (!task.completed) patchTask(id, { completed: true });
      } else if (task.completed || task.priority !== column) {
        patchTask(id, { priority: column, completed: false });
      }
    },
    [tasks, patchTask]
  );

  const saveEdit = async (id, changes) => {
    setEditing(null);
    await patchTask(id, changes);
  };

  const createProject = async (title) => {
    try {
      const r = await API.post("/projects", { title, description: "" });
      setProjects((prev) => [...prev, r.data]);
      setSelectedProject(r.data.id);
    } catch {
      notify("Couldn’t create the project");
    }
  };

  const deleteProject = async (id) => {
    try {
      await API.delete(`/projects/${id}`);
      const rest = projects.filter((p) => p.id !== id);
      setProjects(rest);
      if (selectedProject === id) {
        setTasks([]);
        setSelectedProject(rest[0]?.id ?? null);
      }
    } catch {
      notify("Couldn’t delete the project");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // --- Keyboard: ⌘K anywhere; single keys only when not typing in a field.

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      if (paletteOpen || editing || settingsOpen || isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;

      const index = visible.findIndex((t) => t.id === selectedId);
      const key = e.key.toLowerCase();
      if (key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = visible[Math.min(index + 1, visible.length - 1)];
        if (next) setSelectedId(next.id);
      } else if (key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        const prev = visible[Math.max(index - 1, 0)];
        if (prev) setSelectedId(prev.id);
      } else if (key === "c") {
        e.preventDefault();
        quickAddRef.current?.focus();
      } else if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (key === "v") {
        e.preventDefault();
        setView((v) => (v === "board" ? "list" : "board"));
      } else if (e.key === "Escape") {
        setSelectedId(null);
      } else if (selectedTask) {
        // preventDefault stops the key itself landing in a field that opens
        // as a result (e.g. "e" typed into the edit dialog's title).
        if (key === "x") {
          e.preventDefault();
          toggleTask(selectedTask);
        } else if (key === "e" || e.key === "Enter") {
          e.preventDefault();
          setEditing(selectedTask);
        } else if (["1", "2", "3"].includes(e.key)) {
          e.preventDefault();
          moveTask(selectedTask.id, PRIORITIES[Number(e.key) - 1]);
        } else if (e.key === "Backspace" || e.key === "Delete") {
          e.preventDefault();
          if (window.confirm(`Delete “${selectedTask.title}”?`)) deleteTask(selectedTask);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteOpen, editing, settingsOpen, visible, selectedId, selectedTask, toggleTask, moveTask, deleteTask]);

  // Keep the keyboard-selected task in view.
  useEffect(() => {
    if (selectedId) document.querySelector(`[data-task-id="${selectedId}"]`)?.scrollIntoView({ block: "nearest" });
  }, [selectedId]);

  // --- Command menu entries, rebuilt from the current state.

  const commands = useMemo(() => {
    const list = [];
    if (selectedTask) {
      const t = selectedTask;
      list.push(
        { id: "done", group: "Selected task", label: t.completed ? "Reopen task" : "Mark as done", keys: ["X"], run: () => toggleTask(t) },
        { id: "edit", group: "Selected task", label: "Edit task…", keys: ["E"], run: () => setEditing(t) },
        ...PRIORITIES.map((p, i) => ({
          id: `pri-${p}`,
          group: "Selected task",
          label: `Set priority: ${p}`,
          keys: [String(i + 1)],
          run: () => moveTask(t.id, p),
        })),
        { id: "delete", group: "Selected task", label: "Delete task", keys: ["⌫"], run: () => deleteTask(t) }
      );
    }
    list.push(
      { id: "new", group: "Actions", label: "New task", keys: ["C"], run: () => setTimeout(() => quickAddRef.current?.focus(), 0) },
      { id: "view", group: "Actions", label: view === "board" ? "Switch to list view" : "Switch to board view", keys: ["V"], run: () => setView(view === "board" ? "list" : "board") },
      { id: "theme", group: "Actions", label: theme === "dark" ? "Switch to light mode" : "Switch to dark mode", run: toggleTheme },
      { id: "settings", group: "Actions", label: "Open settings (profile, password, appearance)", run: () => setSettingsOpen(true) },
      { id: "search", group: "Actions", label: "Search tasks", keys: ["/"], run: () => setTimeout(() => searchRef.current?.focus(), 0) },
      { id: "logout", group: "Actions", label: "Log out", run: logout }
    );
    projects
      .filter((p) => p.id !== selectedProject)
      .forEach((p) => list.push({ id: `p-${p.id}`, group: "Go to project", label: p.title, run: () => setSelectedProject(p.id) }));
    orderTasks(tasks).forEach((t) =>
      list.push({ id: `t-${t.id}`, group: "Tasks", label: `${taskKey(t)}  ${t.title}`, run: () => setSelectedId(t.id) })
    );
    return list;
    // logout only depends on navigate, which is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTask, view, theme, projects, selectedProject, tasks, toggleTask, moveTask, deleteTask, toggleTheme]);

  const cardProps = { onSelect: setSelectedId, onToggle: toggleTask, onEdit: setEditing, onDelete: deleteTask };

  if (loadFailed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center" role="alert">
        <h1 className="text-base font-semibold">Can’t reach the server</h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted">
          Your tasks are safe. The server may still be starting up, or your connection dropped.
        </p>
        <button onClick={() => setLoadAttempt((n) => n + 1)} className="btn-primary mt-2">
          Try again
        </button>
      </div>
    );
  }
  if (!projectsLoaded) return <Splash />;

  return (
    <div className="min-h-screen md:flex">
      <Sidebar
        user={user}
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        onCreateProject={createProject}
        onDeleteProject={deleteProject}
        openCount={tasks.length - doneCount}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenPalette={() => setPaletteOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onLogout={logout}
      />

      <main className="flex min-w-0 flex-1 flex-col px-4 py-4 md:px-6 md:py-5">
        <header className="mb-4 flex flex-wrap items-center gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm">
              <span className="text-faint">Projects / </span>
              <span className="font-semibold">{project?.title || "No project"}</span>
            </div>
            {project && !loadingTasks && (
              <div className="mt-0.5 font-mono text-[10px] text-faint">
                {doneCount}/{tasks.length} done
              </div>
            )}
          </div>

          <label className="ml-auto flex min-w-[12rem] items-center gap-2 rounded-md border border-line bg-card px-2.5 py-1.5 text-muted focus-within:border-accent">
            <SearchIcon />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && (setSearch(""), e.currentTarget.blur())}
              placeholder="Search tasks"
              aria-label="Search tasks"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
            />
            <span className="kbd">/</span>
          </label>

          <div className="flex rounded-md border border-line p-0.5 text-xs" role="tablist" aria-label="View">
            {[
              { id: "board", label: "Board", Icon: BoardIcon },
              { id: "list", label: "List", Icon: ListIcon },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                role="tab"
                aria-selected={view === id}
                onClick={() => setView(id)}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1 transition ${
                  view === id ? "bg-card text-ink" : "text-muted hover:text-ink"
                }`}
              >
                <Icon /> {label}
              </button>
            ))}
          </div>

          <button
            onClick={toggleTheme}
            className="btn-ghost px-2 py-1.5 md:hidden"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </header>

        {projects.length === 0 ? (
          <EmptyState title="Create your first project" body="Projects group your tasks. Use the + next to Projects in the sidebar." />
        ) : (
          <>
            <div className="mb-5">
              <QuickAdd onAdd={addTask} inputRef={quickAddRef} disabled={!selectedProject} />
            </div>

            {!loadingTasks && tasks.length === 0 && selectedProject ? (
              <EmptyState
                title="Nothing here yet"
                body={
                  <>
                    Type a task above and press <span className="kbd">↵</span>. Press <span className="kbd">C</span> from
                    anywhere to jump there.
                  </>
                }
              />
            ) : !loadingTasks && visible.length === 0 ? (
              <EmptyState title="No matches" body={`Nothing matches “${search}”.`} />
            ) : view === "board" ? (
              <Board tasks={visible} loading={loadingTasks} selectedId={selectedId} onMove={moveTask} cardProps={cardProps} />
            ) : (
              <ListView tasks={visible} loading={loadingTasks} selectedId={selectedId} cardProps={cardProps} />
            )}
          </>
        )}

        <footer className="mt-auto hidden flex-wrap gap-x-4 gap-y-1 pt-8 font-mono text-[10px] text-faint lg:flex">
          <span><span className="kbd">J</span> <span className="kbd">K</span> move</span>
          <span><span className="kbd">X</span> done</span>
          <span><span className="kbd">1</span>–<span className="kbd">3</span> priority</span>
          <span><span className="kbd">E</span> edit</span>
          <span><span className="kbd">V</span> board / list</span>
          <span><span className="kbd">⌘</span> <span className="kbd">K</span> everything else</span>
        </footer>
      </main>

      {settingsOpen && (
        <SettingsDialog
          user={user}
          onUserChange={setUser}
          prefs={prefs}
          theme={theme}
          onPrefsChange={updatePrefs}
          onClose={() => setSettingsOpen(false)}
        />
      )}
      {editing && <TaskDialog task={editing} onSave={saveEdit} onClose={() => setEditing(null)} />}
      {paletteOpen && (
        <CommandPalette
          commands={commands}
          context={selectedTask ? `${taskKey(selectedTask)} ${selectedTask.title}` : null}
          onClose={() => setPaletteOpen(false)}
        />
      )}
      {toast && (
        <div role="status" className="fixed bottom-4 right-4 z-50 rounded-lg border border-line bg-panel px-4 py-2.5 text-sm shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

function EmptyState({ title, body }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-line px-6 py-16 text-center">
      <h2 className="text-sm font-medium">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

export default Dashboard;
