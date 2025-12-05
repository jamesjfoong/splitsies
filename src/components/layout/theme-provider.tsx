"use client";

import { useEffect } from "react";
import { useUIStore } from "@/store/ui-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useUIStore((state) => state.darkMode);

  useEffect(() => {
    // Apply dark mode class to html element
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  // Also apply on initial mount from localStorage
  useEffect(() => {
    const root = document.documentElement;
    // Check if dark mode is stored in localStorage
    const stored = localStorage.getItem("splitsies-ui");
    if (stored) {
      try {
        const { state } = JSON.parse(stored);
        if (state?.darkMode) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  return <>{children}</>;
}
