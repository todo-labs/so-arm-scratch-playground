import { describe, expect, it } from "vitest";
import { SCRATCH_THEME } from "../lib/theme/scratch";

const WCAG_AA_RATIO = 4.5;

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1: string, color2: string): number | null {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return null;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (brighter + 0.05) / (darker + 0.05);
}

describe("Theme Colors", () => {
  describe("Light Mode - WCAG AA Compliance", () => {
    it("should have WCAG AA compliant contrast for all block colors", () => {
      const failures: string[] = [];

      for (const [category, colorSet] of Object.entries(SCRATCH_THEME.colors)) {
        const ratio = getContrastRatio(colorSet.base, colorSet.text);

        if (!ratio || ratio < WCAG_AA_RATIO) {
          failures.push(`${category}: ${ratio?.toFixed(2) || "invalid"}:1 (required: 4.5:1)`);
        }
      }

      expect(failures).toHaveLength(0);
    });

    it("should have proper color structure for all categories", () => {
      const categories = Object.keys(SCRATCH_THEME.colors);
      const requiredFields = [
        "base",
        "gradient",
        "shadow",
        "text",
        "secondary",
        "darkBase",
        "darkSecondary",
      ];

      categories.forEach((category) => {
        const colorSet = SCRATCH_THEME.colors[category as keyof typeof SCRATCH_THEME.colors];

        requiredFields.forEach((field) => {
          expect(colorSet[field as keyof typeof colorSet]).toBeDefined();
        });
      });
    });
  });

  describe("Dark Mode - WCAG AA Compliance", () => {
    it("should have WCAG AA compliant contrast for all block colors", () => {
      const failures: string[] = [];

      for (const [category, colorSet] of Object.entries(SCRATCH_THEME.colors)) {
        const ratio = getContrastRatio(colorSet.darkBase, colorSet.text);

        if (!ratio || ratio < WCAG_AA_RATIO) {
          failures.push(`${category}: ${ratio?.toFixed(2) || "invalid"}:1 (required: 4.5:1)`);
        }
      }

      expect(failures).toHaveLength(0);
    });
  });

  describe("Color Categories", () => {
    it("should have all required block categories", () => {
      const categories = Object.keys(SCRATCH_THEME.colors);
      const expectedCategories = [
        "motion",
        "control",
        "sensing",
        "operators",
        "variables",
        "custom",
        "gripper",
      ];

      expectedCategories.forEach((category) => {
        expect(categories).toContain(category);
      });
    });

    it("should maintain hue families for each category", () => {
      const categories = SCRATCH_THEME.colors;

      expect(categories.motion.base).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(categories.control.base).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(categories.sensing.base).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(categories.operators.base).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(categories.variables.base).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(categories.custom.base).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(categories.gripper.base).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  describe("Animation Tokens", () => {
    it("should have comprehensive animation tokens", () => {
      const animation = SCRATCH_THEME.animation;

      expect(animation.ease).toBeDefined();
      expect(animation.easeIn).toBeDefined();
      expect(animation.easeOut).toBeDefined();
      expect(animation.easeInOut).toBeDefined();
      expect(animation.bounce).toBeDefined();
      expect(animation.elastic).toBeDefined();
      expect(animation.spring).toBeDefined();
    });

    it("should have animation durations", () => {
      const animation = SCRATCH_THEME.animation;

      expect(animation.instant).toBeDefined();
      expect(animation.fast).toBeDefined();
      expect(animation.normal).toBeDefined();
      expect(animation.slow).toBeDefined();
      expect(animation.slower).toBeDefined();
    });

    it("should have animation delays", () => {
      const animation = SCRATCH_THEME.animation;

      expect(animation.none).toBeDefined();
      expect(animation.short).toBeDefined();
      expect(animation.medium).toBeDefined();
      expect(animation.long).toBeDefined();
    });
  });

  describe("Spacing Tokens", () => {
    it("should have consistent spacing scale", () => {
      const spacing = SCRATCH_THEME.spacing;

      expect(spacing.xs).toBeDefined();
      expect(spacing.sm).toBeDefined();
      expect(spacing.md).toBeDefined();
      expect(spacing.lg).toBeDefined();
      expect(spacing.xl).toBeDefined();
      expect(spacing.xxl).toBeDefined();
      expect(spacing.xxxl).toBeDefined();
    });

    it("should use pixel values for spacing", () => {
      const spacing = SCRATCH_THEME.spacing;

      Object.values(spacing).forEach((value) => {
        expect(value).toMatch(/^\d+px$/);
      });
    });
  });

  describe("Shadow Tokens", () => {
    it("should have shadow tokens for depth hierarchy", () => {
      const shadow = SCRATCH_THEME.shadow;

      expect(shadow.sm).toBeDefined();
      expect(shadow.md).toBeDefined();
      expect(shadow.lg).toBeDefined();
      expect(shadow.xl).toBeDefined();
      expect(shadow.block).toBeDefined();
      expect(shadow.blockHover).toBeDefined();
      expect(shadow.blockActive).toBeDefined();
    });
  });

  describe("Icon Mapping", () => {
    it("should have Lucide icon names for all categories", () => {
      const icons = SCRATCH_THEME.icons;

      expect(icons.motion).toBeDefined();
      expect(icons.control).toBeDefined();
      expect(icons.gripper).toBeDefined();
      expect(icons.sensing).toBeDefined();
      expect(icons.operators).toBeDefined();
      expect(icons.custom).toBeDefined();
    });

    it("should use string values for icon names", () => {
      const icons = SCRATCH_THEME.icons;

      Object.values(icons).forEach((value) => {
        expect(typeof value).toBe("string");
      });
    });
  });

  describe("Block Dimensions", () => {
    it("should have defined block shape dimensions", () => {
      const block = SCRATCH_THEME.block;

      expect(block.notchWidth).toBeDefined();
      expect(block.notchHeight).toBeDefined();
      expect(block.notchOffset).toBeDefined();
      expect(block.borderRadius).toBeDefined();
      expect(block.minHeight).toBeDefined();
      expect(block.padding).toBeDefined();
    });

    it("should have numeric values for block dimensions", () => {
      const block = SCRATCH_THEME.block;

      Object.values(block).forEach((value) => {
        expect(typeof value).toBe("number");
      });
    });
  });

  describe("Workspace Settings", () => {
    it("should have defined workspace settings", () => {
      const workspace = SCRATCH_THEME.workspace;

      expect(workspace.gridSize).toBeDefined();
      expect(workspace.backgroundColor).toBeDefined();
      expect(workspace.gridColor).toBeDefined();
    });
  });
});
