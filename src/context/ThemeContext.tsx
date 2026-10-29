"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type ThemePalette = "slate" | "zinc" | "emerald" | "amber" | "indigo";

interface ThemeContextType {
  themeMode: ThemeMode;
  palette: ThemePalette;
  setThemeMode: (mode: ThemeMode) => void;
  setPalette: (palette: ThemePalette) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("light");
  const [palette, setPaletteState] = useState<ThemePalette>("slate");

  useEffect(() => {
    try {
      const storedMode = localStorage.getItem("autogest_theme_mode") as ThemeMode | null;
      const storedPalette = localStorage.getItem("autogest_theme_palette") as ThemePalette | null;

      if (storedMode && ["light", "dark", "system"].includes(storedMode)) {
        setThemeModeState(storedMode);
        applyTheme(storedMode);
      } else {
        applyTheme("light");
      }

      if (storedPalette && ["slate", "zinc", "emerald", "amber", "indigo"].includes(storedPalette)) {
        setPaletteState(storedPalette);
        applyPalette(storedPalette);
      } else {
        applyPalette("slate");
      }
    } catch {
      // Entorno sin acceso a localStorage
    }
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;
    const isDark =
      mode === "dark" ||
      (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }
  };

  const applyPalette = (pal: ThemePalette) => {
    const root = document.documentElement;
    root.setAttribute("data-palette", pal);
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    applyTheme(mode);
    try {
      localStorage.setItem("autogest_theme_mode", mode);
    } catch {}
  };

  const setPalette = (pal: ThemePalette) => {
    setPaletteState(pal);
    applyPalette(pal);
    try {
      localStorage.setItem("autogest_theme_palette", pal);
    } catch {}
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        palette,
        setThemeMode,
        setPalette,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe utilizarse dentro de un ThemeProvider");
  }
  return context;
}

