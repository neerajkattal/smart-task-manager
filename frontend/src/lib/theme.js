import { useEffect, useState } from "react";

// The inline script in public/index.html sets data-theme before first paint;
// this hook reads it, keeps it in sync, and remembers the choice.
export function useTheme() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme === "light" ? "light" : "dark"
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return [theme, toggleTheme];
}
