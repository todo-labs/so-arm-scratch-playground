import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check system preference or localStorage
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as Theme | null;
      if (savedTheme) return savedTheme;

      // Check system preference
      if (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches) {
        return "dark";
      }
    }
    return "light";
  });

  useEffect(() => {
    // Apply theme class to html element
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
