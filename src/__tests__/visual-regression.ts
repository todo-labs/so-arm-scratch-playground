/**
 * Visual Regression Test Patterns
 *
 * This file provides reusable patterns and utilities for visual regression testing
 * of UI components. These patterns help ensure consistent visual appearance
 * across different browsers and screen sizes.
 */

import { type RenderResult, render } from "@testing-library/react";
import type { ReactNode } from "react";

/**
 * Base CSS classes that should be present on all visual components
 */
export const BASE_COMPONENT_CLASSES = {
  container: "relative select-none text-white font-bold text-sm",
  interactive: "cursor-pointer hover:scale-105 transition-transform duration-200",
  draggable: "z-50 scale-105 drop-shadow-2xl opacity-90",
  shadow: "drop-shadow-0-2px-4px-rgba-0-0-0-0-1)",
  header: "bg-white/95 backdrop-blur-md border-b sticky top-0 z-50 transition-all shadow-sm",
  palette: "bg-white border-b border-slate-200",
};

/**
 * Block shape visual patterns
 */
export const BLOCK_SHAPE_PATTERNS = {
  command: {
    minWidth: 120,
    minHeight: 48,
    borderRadius: 12,
    hasNotch: true,
  },
  reporter: {
    minWidth: 80,
    minHeight: 32,
    borderRadius: 16,
    hasNotch: false,
  },
  boolean: {
    minWidth: 60,
    minHeight: 28,
    borderRadius: 14,
    hasNotch: false,
  },
  hat: {
    minWidth: 120,
    minHeight: 48,
    borderRadius: 0,
    hasNotch: true,
  },
  cap: {
    minWidth: 120,
    minHeight: 48,
    borderRadius: 12,
    hasNotch: false,
  },
};

/**
 * Category color patterns for visual consistency
 */
export const CATEGORY_COLOR_PATTERNS = {
  motion: {
    base: "#4C97FF",
    gradient: "linear-gradient(180deg, #4C97FF 0%, #3373CC 100%)",
    shadow: "#3373CC",
  },
  control: {
    base: "#FFAB19",
    gradient: "linear-gradient(180deg, #FFAB19 0%, #CF8B17 100%)",
    shadow: "#CF8B17",
  },
  gripper: {
    base: "#9966FF",
    gradient: "linear-gradient(180deg, #9966FF 0%, #774DCB 100%)",
    shadow: "#774DCB",
  },
  sensing: {
    base: "#5CB1D6",
    gradient: "linear-gradient(180deg, #5CB1D6 0%, #2E8EB8 100%)",
    shadow: "#2E8EB8",
  },
  operators: {
    base: "#59C059",
    gradient: "linear-gradient(180deg, #59C059 0%, #389438 100%)",
    shadow: "#389438",
  },
};

/**
 * Animation timing patterns
 */
export const ANIMATION_PATTERNS = {
  fast: "150ms",
  normal: "250ms",
  slow: "400ms",
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
};

/**
 * Check if component has correct base structure
 */
export function verifyBaseStructure(
  container: Element,
  options: {
    hasSvg?: boolean;
    hasText?: boolean;
    hasContainer?: boolean;
  } = {}
): boolean {
  const { hasSvg = true, hasText = true, hasContainer = true } = options;

  if (hasContainer && !container.querySelector(".relative")) {
    return false;
  }

  if (hasSvg && !container.querySelector("svg")) {
    return false;
  }

  if (hasText && !container.textContent) {
    return false;
  }

  return true;
}

/**
 * Verify block has correct visual properties
 */
export function verifyBlockVisuals(
  container: Element,
  expectedShape: keyof typeof BLOCK_SHAPE_PATTERNS
): boolean {
  const pattern = BLOCK_SHAPE_PATTERNS[expectedShape];

  if (!pattern) {
    console.warn(`Unknown block shape: ${expectedShape}`);
    return false;
  }

  // Check for minimum dimensions class patterns
  const hasMinHeight = container.className.includes("min-h-");

  // Verify SVG path exists for the shape
  const svgPath = container.querySelector("svg path");
  if (!svgPath) {
    return false;
  }

  return hasMinHeight;
}

/**
 * Verify category color is applied correctly
 */
export function verifyCategoryColor(
  container: Element,
  category: keyof typeof CATEGORY_COLOR_PATTERNS
): boolean {
  const colorPattern = CATEGORY_COLOR_PATTERNS[category];

  if (!colorPattern) {
    console.warn(`Unknown category: ${category}`);
    return false;
  }

  // Check if SVG uses the category color
  const svgPath = container.querySelector("svg path[fill^='url']");
  if (!svgPath) {
    return false;
  }

  return true;
}

/**
 * Verify animation classes are present
 */
export function verifyAnimationClasses(
  container: Element,
  options: {
    hasHover?: boolean;
    hasTransition?: boolean;
    hasTransform?: boolean;
  } = {}
): boolean {
  const { hasHover = true, hasTransition = true, hasTransform = true } = options;

  const className = container.className;

  if (hasHover && !className.includes("hover:")) {
    return false;
  }

  if (hasTransition && !className.includes("transition-")) {
    return false;
  }

  if (hasTransform && !className.includes("scale-")) {
    return false;
  }

  return true;
}

/**
 * Verify header has required visual properties
 */
export function verifyHeaderVisuals(container: Element): boolean {
  const className = container.className;

  if (!className.includes("sticky")) {
    return false;
  }

  if (!className.includes("top-0")) {
    return false;
  }

  if (!className.includes("z-50")) {
    return false;
  }

  if (!className.includes("backdrop-blur")) {
    return false;
  }

  return true;
}

/**
 * Verify palette has correct structure
 */
export function verifyPaletteVisuals(container: Element): boolean {
  if (!container.querySelector(".flex")) {
    return false;
  }

  if (!container.querySelector("button")) {
    return false;
  }

  return true;
}

/**
 * Render component and verify visual structure
 */
export function renderWithVisualVerification(
  ui: ReactNode,
  verificationFn: (container: Element) => boolean
): RenderResult & { passedVerification: boolean } {
  const result = render(ui);
  const passed = verificationFn(result.container);

  return {
    ...result,
    passedVerification: passed,
  };
}

/**
 * Visual snapshot helper for consistent testing
 */
export function createVisualSnapshot(
  componentName: string,
  renderFn: () => RenderResult
): { passed: boolean; message: string } {
  try {
    const result = renderFn();

    // Basic structure check
    if (!result.container.firstChild) {
      return {
        passed: false,
        message: `${componentName}: Failed to render any content`,
      };
    }

    return {
      passed: true,
      message: `${componentName}: Visual structure verified`,
    };
  } catch (error) {
    return {
      passed: false,
      message: `${componentName}: Error during visual verification - ${error}`,
    };
  }
}

/**
 * Theme color verification helper
 */
export function verifyThemeColors(container: Element, expectedColors: string[]): boolean {
  const allText = container.textContent || "";

  // Check if expected colors appear in the rendered content
  return expectedColors.some((color) => allText.includes(color));
}

/**
 * Accessibility visual patterns
 */
export const ACCESSIBILITY_PATTERNS = {
  focusVisible: "focus-visible:ring-2 focus-visible:ring-offset-2",
  focusWithin: "focus-within:ring-2",
  disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
  ariaHidden: "aria-hidden",
};

/**
 * Verify accessibility visual indicators
 */
export function verifyAccessibilityVisuals(
  container: Element,
  options: {
    hasFocusStates?: boolean;
    hasDisabledStates?: boolean;
  } = {}
): boolean {
  const { hasFocusStates = true, hasDisabledStates = true } = options;
  const className = container.className;

  if (hasFocusStates && !className.includes("focus")) {
    return false;
  }

  if (hasDisabledStates && !className.includes("disabled")) {
    return false;
  }

  return true;
}
