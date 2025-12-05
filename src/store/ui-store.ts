import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  darkMode: boolean;
  isParsing: boolean;
  error: string | null;

  toggleDarkMode: () => void;
  setIsParsing: (isParsing: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      darkMode: false,
      isParsing: false,
      error: null,

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setIsParsing: (isParsing) => set({ isParsing }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "splitsies-ui",
    }
  )
);
