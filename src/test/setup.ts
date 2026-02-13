import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import "@testing-library/jest-dom";

vi.mock("@/lib/blockIds", () => ({
  BLOCK_IDS: {
    MOVE_TO: "move_to",
    HOME_ROBOT: "home_robot",
    OPEN_GRIPPER: "open_gripper",
    CLOSE_GRIPPER: "close_gripper",
    WAIT_SECONDS: "wait_seconds",
    REPEAT: "repeat",
    IF_CONDITION: "if_condition",
    IF_ELSE: "if_else",
    WHILE_LOOP: "while_loop",
  },
}));

vi.mock("@/lib/blockShapes", () => ({
  BLOCK_CONSTANTS: {
    BLOCK_HEIGHT: 48,
    BLOCK_CORNER_RADIUS: 8,
    PARAM_INSET: 40,
  },
  getCommandBlockPath: () => "M0,0 L100,0 L100,48 L0,48 Z",
  getHatBlockPath: () =>
    "M0,24 L8,0 L16,24 L24,0 L32,24 L40,0 L48,24 L56,0 L64,24 L72,0 L80,24 L88,0 L96,24 L104,0 L112,24 L120,0 L120,48 L0,48 Z",
  getReporterPath: () => "M0,0 L40,0 A8,8 0 0,1 48,8 L48,40 A8,8 0 0,1 40,48 L0,48 Z",
  getBooleanPath: () => "M0,0 L30,0 A8,8 0 0,1 38,8 L38,40 A8,8 0 0,1 30,48 L0,48 Z",
}));

vi.mock("@/lib/theme/iconRenderer", () => ({
  renderCategoryIcon: () => null,
}));

vi.mock("@/lib/theme/scratch", () => ({
  SCRATCH_THEME: {
    colors: {
      motion: {
        base: "#1E40AF",
        gradient: "linear-gradient(180deg, #2563EB 0%, #1E40AF 100%)",
        shadow: "0 2px 0 #1E3A8A",
        text: "#FFFFFF",
        secondary: "#1D4ED8",
        darkBase: "#1D4ED8",
        darkSecondary: "#1E40AF",
      },
      control: {
        base: "#B45309",
        gradient: "linear-gradient(180deg, #D97706 0%, #B45309 100%)",
        shadow: "0 2px 0 #92400E",
        text: "#FFFFFF",
        secondary: "#92400E",
        darkBase: "#92400E",
        darkSecondary: "#B45309",
      },
      sensing: {
        base: "#0E7490",
        gradient: "linear-gradient(180deg, #0891B2 0%, #0E7490 100%)",
        shadow: "0 2px 0 #155E75",
        text: "#FFFFFF",
        secondary: "#155E75",
        darkBase: "#155E75",
        darkSecondary: "#0E7490",
      },
      operators: {
        base: "#047857",
        gradient: "linear-gradient(180deg, #059669 0%, #047857 100%)",
        shadow: "0 2px 0 #065F46",
        text: "#FFFFFF",
        secondary: "#065F46",
        darkBase: "#065F46",
        darkSecondary: "#047857",
      },
      variables: {
        base: "#C2410C",
        gradient: "linear-gradient(180deg, #EA580C 0%, #C2410C 100%)",
        shadow: "0 2px 0 #9A3412",
        text: "#FFFFFF",
        secondary: "#9A3412",
        darkBase: "#9A3412",
        darkSecondary: "#C2410C",
      },
      custom: {
        base: "#B91C1C",
        gradient: "linear-gradient(180deg, #DC2626 0%, #B91C1C 100%)",
        shadow: "0 2px 0 #991B1B",
        text: "#FFFFFF",
        secondary: "#991B1B",
        darkBase: "#991B1B",
        darkSecondary: "#B91C1C",
      },
      gripper: {
        base: "#6D28D9",
        gradient: "linear-gradient(180deg, #7C3AED 0%, #6D28D9 100%)",
        shadow: "0 2px 0 #5B21B6",
        text: "#FFFFFF",
        secondary: "#5B21B6",
        darkBase: "#5B21B6",
        darkSecondary: "#6D28D9",
      },
    },
    icons: {
      motion: "Bot",
      control: "RefreshCcw",
      gripper: "Hand",
      sensing: "Eye",
      operators: "Calculator",
      custom: "Star",
    },
    animation: {
      ease: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      easeIn: "cubic-bezier(0.42, 0, 1, 1)",
      easeOut: "cubic-bezier(0, 0, 0.58, 1)",
      easeInOut: "cubic-bezier(0.42, 0, 0.58, 1)",
      bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      elastic: "cubic-bezier(0.68, -0.6, 0.32, 1.6)",
      spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      instant: "50ms",
      fast: "150ms",
      normal: "250ms",
      slow: "400ms",
      slower: "600ms",
      none: "0ms",
      short: "100ms",
      medium: "200ms",
      long: "300ms",
    },
    spacing: {
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "20px",
      xxl: "24px",
      xxxl: "32px",
    },
    shadow: {
      sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
      md: "0 2px 4px rgba(0, 0, 0, 0.1)",
      lg: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      xl: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      block: "0 2px 0 rgba(0, 0, 0, 0.2)",
      blockHover: "0 4px 0 rgba(0, 0, 0, 0.2)",
      blockActive: "0 1px 0 rgba(0, 0, 0, 0.2)",
    },
    block: {
      notchWidth: 20,
      notchHeight: 6,
      notchOffset: 24,
      borderRadius: 12,
      minHeight: 48,
      padding: 12,
    },
    workspace: {
      gridSize: 20,
      backgroundColor: "#f8fafc",
      gridColor: "rgba(148, 163, 184, 0.3)",
    },
  },
  playSound: vi.fn(),
}));

vi.mock("@/lib/types", () => ({
  BlockDefinition: Object,
  BlockInstance: Object,
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: string[]) => args.join(" "),
}));

// Mock ProjectShareDialog component
vi.mock("@/components/ProjectShareDialog", () => ({
  ProjectShareDialog: () => null,
}));

// Polyfill for ResizeObserver which is used by the Block component
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = vi.fn(() => ({
  width: 120,
  height: 48,
  top: 0,
  left: 0,
  right: 120,
  bottom: 48,
  x: 0,
  y: 0,
  toJSON() {
    return this;
  },
}));

afterEach(() => {
  cleanup();
});
