import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type Theme, ThemeProvider, useTheme } from "@/context/ThemeContext";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock matchMedia
const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
  matches: query.includes("dark"),
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Reset to default (no system preference = light mode)
matchMediaMock.mockReturnValue({
  matches: false,
  media: "(prefers-color-scheme: light)",
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

window.matchMedia = matchMediaMock;

describe("ThemeContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    matchMediaMock.mockReturnValue({
      matches: false,
      media: "(prefers-color-scheme: light)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
  });

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );
  };

  describe("initialization", () => {
    it("should initialize with light theme when no localStorage or system preference", () => {
      vi.clearAllMocks();

      const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

      expect(result.current.theme).toBe("light");
    });

    it("should use saved theme from localStorage", () => {
      vi.clearAllMocks();
      localStorageMock.setItem("theme", "dark");

      const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

      expect(result.current.theme).toBe("dark");
    });

    it("should check system preference when no saved theme in localStorage", () => {
      vi.clearAllMocks();
      matchMediaMock.mockReturnValue({
        matches: true, // System prefers dark
        media: "(prefers-color-scheme: dark)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

      expect(result.current.theme).toBe("dark");
    });

    it("should default to light when system prefers light", () => {
      vi.clearAllMocks();
      matchMediaMock.mockReturnValue({
        matches: false,
        media: "(prefers-color-scheme: light)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

      expect(result.current.theme).toBe("light");
    });

    it("should apply theme class to document element", () => {
      renderHook(() => useTheme(), { wrapper: createWrapper() });

      const root = document.documentElement;
      expect(root.classList.contains("light")).toBe(true);
      expect(root.classList.contains("dark")).toBe(false);
    });
  });

  describe("theme toggling", () => {
    it("should toggle from light to dark", () => {
      const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

      expect(result.current.theme).toBe("light");

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe("dark");
    });

    it("should toggle from dark to light", () => {
      localStorageMock.setItem("theme", "dark");
      matchMediaMock.mockReturnValue({
        matches: true,
        media: "(prefers-color-scheme: dark)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

      expect(result.current.theme).toBe("dark");

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe("light");
    });

    it("should update document class when toggling theme", () => {
      vi.clearAllMocks();
      localStorageMock.clear();
      matchMediaMock.mockReturnValue({
        matches: false,
        media: "(prefers-color-scheme: light)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

      expect(document.documentElement.classList.contains("light")).toBe(true);

      act(() => {
        result.current.toggleTheme();
      });

      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(document.documentElement.classList.contains("light")).toBe(false);

      act(() => {
        result.current.toggleTheme();
      });

      expect(document.documentElement.classList.contains("light")).toBe(true);
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
  });

  describe("localStorage persistence", () => {
    it("should save theme to localStorage when toggling", () => {
      vi.clearAllMocks();
      localStorageMock.clear();
      matchMediaMock.mockReturnValue({
        matches: false,
        media: "(prefers-color-scheme: light)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

      expect(localStorageMock.getItem("theme")).toBe("light");

      act(() => {
        result.current.toggleTheme();
      });

      expect(localStorageMock.getItem("theme")).toBe("dark");

      act(() => {
        result.current.toggleTheme();
      });

      expect(localStorageMock.getItem("theme")).toBe("light");
    });

    it("should save theme immediately on change", () => {
      vi.clearAllMocks();
      localStorageMock.clear();
      matchMediaMock.mockReturnValue({
        matches: false,
        media: "(prefers-color-scheme: light)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

      // Initial state
      expect(localStorageMock.getItem("theme")).toBe("light");

      // Toggle to dark
      act(() => {
        result.current.toggleTheme();
      });

      expect(localStorageMock.getItem("theme")).toBe("dark");
    });
  });

  describe("useTheme hook", () => {
    it("should throw error when used outside ThemeProvider", () => {
      expect(() => {
        renderHook(() => useTheme());
      }).toThrow("useTheme must be used within ThemeProvider");
    });

    it("should return theme and toggleTheme when used inside ThemeProvider", () => {
      vi.clearAllMocks();
      localStorageMock.clear();
      matchMediaMock.mockReturnValue({
        matches: false,
        media: "(prefers-color-scheme: light)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

      expect(result.current).toMatchObject({
        theme: expect.any(String),
        toggleTheme: expect.any(Function),
      });

      expect(result.current.theme).toBe("light");
      expect(typeof result.current.toggleTheme).toBe("function");
    });

    it("should expose theme value correctly", () => {
      localStorageMock.setItem("theme", "dark");
      matchMediaMock.mockReturnValue({
        matches: true,
        media: "(prefers-color-scheme: dark)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

      expect(result.current.theme).toBe("dark");
      expect(typeof result.current.toggleTheme).toBe("function");
    });
  });

  describe("theme type", () => {
    it("should only allow 'light' or 'dark' theme values", () => {
      vi.clearAllMocks();
      localStorageMock.clear();
      matchMediaMock.mockReturnValue({
        matches: false,
        media: "(prefers-color-scheme: light)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

      expect(result.current.theme).toBe("light" as Theme);
      expect(result.current.theme).not.toBe("invalid" as Theme);
    });
  });

  describe("toggleTheme function", () => {
    it("should be callable multiple times", () => {
      vi.clearAllMocks();
      localStorageMock.clear();
      matchMediaMock.mockReturnValue({
        matches: false,
        media: "(prefers-color-scheme: light)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

      expect(result.current.theme).toBe("light");

      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.toggleTheme();
        });
      }

      // Should alternate: light → dark → light → dark → light → dark
      expect(result.current.theme).toBe("dark");
    });

    it("should not throw error when called multiple times", () => {
      const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

      expect(() => {
        act(() => {
          result.current.toggleTheme();
          result.current.toggleTheme();
          result.current.toggleTheme();
        });
      }).not.toThrow();
    });
  });

  describe("edge cases", () => {
    it("should handle localStorage.removeItem during tests", () => {
      localStorageMock.setItem("theme", "dark");

      const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

      expect(result.current.theme).toBe("dark");

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe("light");
    });

    it("should handle rapid theme changes", () => {
      const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.toggleTheme();
        });
      }

      // After even number of toggles (10), should return to original (light)
      expect(result.current.theme).toBe("light");
    });
  });
});
