import { useState } from "react";
import { projectColour } from "../lib/tasks";
import { Avatar } from "./Avatar";
import { GearIcon, LogoutIcon, MoonIcon, PlusIcon, SunIcon, TrashIcon } from "./Icons";

// Workspace sidebar: projects, the command menu shortcut, theme and logout.
// On small screens it collapses into a top bar with horizontally scrolling projects.
export function Sidebar({
  user,
  projects,
  selectedProject,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  openCount,
  theme,
  onToggleTheme,
  onOpenPalette,
  onOpenSettings,
  onLogout,
}) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onCreateProject(title.trim());
    setTitle("");
    setAdding(false);
  };

  return (
    <aside className="flex flex-col gap-1 border-b border-line bg-panel p-3 md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
      <button
        onClick={onOpenSettings}
        title="Profile and settings"
        className="group mb-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition hover:bg-card"
      >
        <Avatar user={user} size={28} />
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm font-semibold">{user ? `${user.username}’s space` : "Smart Tasks"}</span>
          <span className="block truncate font-mono text-[10px] text-faint">{user?.email || "loading…"}</span>
        </span>
        <GearIcon className="shrink-0 text-faint opacity-0 transition group-hover:opacity-100" />
      </button>

      <button
        onClick={onOpenPalette}
        className="mb-2 flex items-center justify-between rounded-md border border-line px-2.5 py-1.5 text-left text-xs text-muted transition hover:bg-card hover:text-ink"
      >
        <span>Search or run a command</span>
        <span className="flex gap-0.5"><span className="kbd">⌘</span><span className="kbd">K</span></span>
      </button>

      <div className="flex items-center justify-between px-2 pb-1 pt-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-faint">Projects</span>
        <button
          onClick={() => setAdding((a) => !a)}
          className="rounded p-1 text-muted transition hover:bg-card hover:text-ink"
          aria-label="New project"
          title="New project"
        >
          <PlusIcon />
        </button>
      </div>

      {adding && (
        <form onSubmit={submit} className="px-1 pb-2">
          <input
            autoFocus
            value={title}
            maxLength={50}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setAdding(false)}
            placeholder="Project name, then Enter"
            className="field py-1.5 text-xs"
          />
        </form>
      )}

      <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {projects.length === 0 && !adding && (
          <p className="px-2 py-1 text-xs text-faint">No projects yet.</p>
        )}
        {projects.map((project) => {
          const active = project.id === selectedProject;
          return (
            <div
              key={project.id}
              className={`group flex shrink-0 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition ${
                active ? "bg-card text-ink" : "text-muted hover:bg-card/60 hover:text-ink"
              }`}
            >
              <button
                onClick={() => onSelectProject(project.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: projectColour(project.id) }} />
                <span className="truncate">{project.title}</span>
              </button>
              {active && openCount > 0 && <span className="font-mono text-[10px] text-faint">{openCount}</span>}
              <button
                onClick={() => {
                  if (window.confirm(`Delete “${project.title}” and all its tasks?`)) onDeleteProject(project.id);
                }}
                className="hidden rounded p-0.5 text-faint transition hover:text-high group-hover:block"
                aria-label={`Delete ${project.title}`}
              >
                <TrashIcon />
              </button>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto hidden flex-col gap-1 pt-4 md:flex">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted transition hover:bg-card hover:text-ink"
        >
          <GearIcon /> Settings
        </button>
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted transition hover:bg-card hover:text-ink"
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted transition hover:bg-card hover:text-ink"
        >
          <LogoutIcon /> Log out
        </button>
      </div>
    </aside>
  );
}
