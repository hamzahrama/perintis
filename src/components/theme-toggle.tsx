"use client";

import { useEffect, useState } from "react";

import { saveThemeAction } from "@/app/theme/actions";
import { Button } from "@/components/ui";

export type Theme = "dark" | "light";

type ThemeToggleProps = {
  initialTheme: Theme;
};

export function ThemeToggle({ initialTheme }: ThemeToggleProps) {
  const [theme, setTheme] = useState(initialTheme);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  async function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    setTheme(nextTheme);
    setError(null);
    setIsSaving(true);

    try {
      await saveThemeAction(nextTheme);
    } catch {
      document.documentElement.dataset.theme = theme;
      setTheme(theme);
      setError("Preferensi tema belum tersimpan. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="theme-toggle">
      <Button
        aria-label={`Ganti ke tema ${theme === "dark" ? "terang" : "gelap"}`}
        disabled={isSaving}
        onClick={toggleTheme}
        type="button"
        variant="secondary"
      >
        {isSaving
          ? "Menyimpan..."
          : theme === "dark"
            ? "Mode terang"
            : "Mode gelap"}
      </Button>
      {error && <p className="theme-error" role="alert">{error}</p>}
    </div>
  );
}
