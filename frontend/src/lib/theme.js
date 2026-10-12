import { useEffect, useState } from "react";

// Appearance preferences, stored per browser. The inline script in
// public/index.html applies them before first paint; this hook keeps them in sync.
export const ACCENTS = [
  { id: "lime", label: "Lime", swatch: "#D7FF3A" },
  { id: "sky", label: "Sky", swatch: "#5CB8FF" },
  { id: "rose", label: "Rose", swatch: "#FF7AA2" },
  { id: "violet", label: "Violet", swatch: "#B496FF" },
  { id: "mint", label: "Mint", swatch: "#4ADEA8" },
];

export const BACKGROUNDS = [
  { id: "neutral", label: "Neutral", dark: "#0D0E10", light: "#F6F6F3" },
  { id: "cool", label: "Cool", dark: "#0B0E14", light: "#F1F5FA" },
  { id: "warm", label: "Warm", dark: "#12100E", light: "#F7F3EC" },
];

export const MODES = ["dark", "light", "system"];

const read = (key, fallback, allowed) => {
  try {
    const value = localStorage.getItem(key);
    return allowed.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {}
};

const systemTheme = () => (window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark");

export function usePreferences() {
  const [prefs, setPrefs] = useState(() => ({
    mode: read("theme", "system", MODES),
    accent: read("accent", "lime", ACCENTS.map((a) => a.id)),
    background: read("bg", "neutral", BACKGROUNDS.map((b) => b.id)),
  }));
  const [system, setSystem] = useState(systemTheme);

  // Follow the OS setting live while in "system" mode.
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: light)");
    if (!mq) return;
    const onChange = () => setSystem(systemTheme());
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const theme = prefs.mode === "system" ? system : prefs.mode;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.accent = prefs.accent;
    root.dataset.bg = prefs.background;
    write("theme", prefs.mode);
    write("accent", prefs.accent);
    write("bg", prefs.background);
  }, [theme, prefs]);

  const update = (changes) => setPrefs((p) => ({ ...p, ...changes }));
  const toggleTheme = () => update({ mode: theme === "dark" ? "light" : "dark" });

  return { prefs, update, theme, toggleTheme };
}

// Just the light/dark switch, for pages that don't need the full settings.
export function useTheme() {
  const { theme, toggleTheme } = usePreferences();
  return [theme, toggleTheme];
}
