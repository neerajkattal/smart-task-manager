import { useEffect, useRef, useState } from "react";
import API from "../services/api";
import { ACCENTS, BACKGROUNDS, MODES } from "../lib/theme";
import { resizeImage } from "../lib/image";
import { Avatar } from "./Avatar";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "password", label: "Password" },
  { id: "appearance", label: "Appearance" },
];

const errorText = (err, fallback) => {
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail[0]?.msg || fallback;
  return err.response ? fallback : "Can’t reach the server. Try again in a moment.";
};

function Message({ kind, children }) {
  if (!children) return null;
  const tone = kind === "error" ? "border-high/40 bg-high/10 text-high" : "border-done/40 bg-done/10 text-done";
  return (
    <p role={kind === "error" ? "alert" : "status"} className={`rounded-md border px-3 py-2 text-sm ${tone}`}>
      {children}
    </p>
  );
}

function ProfileTab({ user, onUserChange }) {
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const fileRef = useRef(null);

  const changes = {};
  if (username.trim() && username.trim() !== user?.username) changes.username = username.trim();
  if (email.trim() && email.trim().toLowerCase() !== user?.email) changes.email = email.trim();
  if ((avatar || null) !== (user?.avatar || null)) changes.avatar = avatar || "";
  const dirty = Object.keys(changes).length > 0;

  const pickFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setAvatar(await resizeImage(file));
      setMessage(null);
    } catch (err) {
      setMessage({ kind: "error", text: err.message });
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!dirty) return;
    setSaving(true);
    setMessage(null);
    try {
      const { data } = await API.patch("/me", changes);
      const { access_token, ...updated } = data;
      if (access_token) localStorage.setItem("token", access_token);
      onUserChange(updated);
      setMessage({ kind: "ok", text: "Profile saved." });
    } catch (err) {
      setMessage({ kind: "error", text: errorText(err, "Couldn’t save your profile.") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar user={{ ...user, username }} src={avatar} size={56} className="rounded-xl" />
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost py-1.5 text-xs">
            Upload photo
          </button>
          {avatar && (
            <button type="button" onClick={() => setAvatar(null)} className="btn-ghost py-1.5 text-xs">
              Remove
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={pickFile} className="hidden" />
        </div>
      </div>
      <label className="block text-xs text-muted">
        Username
        <input value={username} maxLength={100} onChange={(e) => setUsername(e.target.value)} className="field mt-1" />
      </label>
      <label className="block text-xs text-muted">
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field mt-1" />
        <span className="mt-1 block text-[11px] text-faint">You’ll log in with this email from now on.</span>
      </label>
      <Message kind={message?.kind}>{message?.text}</Message>
      <div className="flex justify-end">
        <button type="submit" disabled={!dirty || saving} className="btn-primary py-1.5">
          {saving ? "Saving…" : "Save profile"}
        </button>
      </div>
    </form>
  );
}

function PasswordTab() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const save = async (e) => {
    e.preventDefault();
    if (next.length < 8) return setMessage({ kind: "error", text: "Use at least 8 characters." });
    if (next !== confirm) return setMessage({ kind: "error", text: "New passwords don’t match." });
    setSaving(true);
    setMessage(null);
    try {
      await API.post("/me/password", { current_password: current, new_password: next });
      setCurrent("");
      setNext("");
      setConfirm("");
      setMessage({ kind: "ok", text: "Password changed." });
    } catch (err) {
      setMessage({ kind: "error", text: errorText(err, "Couldn’t change your password.") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-4">
      <label className="block text-xs text-muted">
        Current password
        <input type="password" required autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className="field mt-1" />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs text-muted">
          New password
          <input type="password" required maxLength={72} autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className="field mt-1" />
        </label>
        <label className="block text-xs text-muted">
          Confirm new password
          <input type="password" required maxLength={72} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="field mt-1" />
        </label>
      </div>
      <Message kind={message?.kind}>{message?.text}</Message>
      <div className="flex justify-end">
        <button type="submit" disabled={saving || !current || !next} className="btn-primary py-1.5">
          {saving ? "Saving…" : "Change password"}
        </button>
      </div>
    </form>
  );
}

function AppearanceTab({ prefs, theme, onChange }) {
  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="mb-2 text-xs text-muted">Mode</legend>
        <div className="inline-flex rounded-md border border-line p-0.5" role="radiogroup">
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={prefs.mode === m}
              onClick={() => onChange({ mode: m })}
              className={`rounded px-3 py-1 text-xs capitalize transition ${prefs.mode === m ? "bg-card text-ink" : "text-muted hover:text-ink"}`}
            >
              {m}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-xs text-muted">Accent colour</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup">
          {ACCENTS.map((a) => (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={prefs.accent === a.id}
              aria-label={a.label}
              title={a.label}
              onClick={() => onChange({ accent: a.id })}
              className={`h-8 w-8 rounded-full border-2 transition ${prefs.accent === a.id ? "border-ink" : "border-transparent hover:border-line"}`}
            >
              <span className="block h-full w-full rounded-full border-2 border-panel" style={{ background: a.swatch }} />
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-xs text-muted">Background</legend>
        <div className="grid grid-cols-3 gap-2" role="radiogroup">
          {BACKGROUNDS.map((b) => (
            <button
              key={b.id}
              type="button"
              role="radio"
              aria-checked={prefs.background === b.id}
              onClick={() => onChange({ background: b.id })}
              className={`rounded-lg border p-1.5 text-left transition ${prefs.background === b.id ? "border-accent ring-1 ring-accent" : "border-line hover:border-faint"}`}
            >
              <span className="block h-10 rounded-md border border-line" style={{ background: b[theme] }} />
              <span className="mt-1.5 block px-0.5 text-xs">{b.label}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <p className="text-[11px] text-faint">Appearance is saved on this device.</p>
    </div>
  );
}

// Account and appearance settings. Opens from the sidebar or the ⌘K menu.
export function SettingsDialog({ user, onUserChange, prefs, theme, onPrefsChange, onClose }) {
  const [tab, setTab] = useState("profile");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-[8vh]" onMouseDown={onClose}>
      <div
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        className="w-full max-w-lg rounded-xl border border-line bg-panel shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <span className="text-sm font-semibold">Settings</span>
          <button onClick={onClose} className="kbd" aria-label="Close settings">
            esc
          </button>
        </div>
        <div className="flex gap-1 border-b border-line px-3" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 px-2.5 py-2 text-xs transition ${
                tab === t.id ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="p-4">
          {tab === "profile" && <ProfileTab user={user} onUserChange={onUserChange} />}
          {tab === "password" && <PasswordTab />}
          {tab === "appearance" && <AppearanceTab prefs={prefs} theme={theme} onChange={onPrefsChange} />}
        </div>
      </div>
    </div>
  );
}
