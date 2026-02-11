import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SCRATCH_THEME } from "../lib/theme/scratch";

describe("Animation System", () => {
  const cssPath = join(process.cwd(), "src/index.css");
  const cssContent = readFileSync(cssPath, "utf-8");

  describe("CSS Keyframes", () => {
    it("should define fadeIn keyframes", () => {
      expect(cssContent).toContain("@keyframes fadeIn");
      expect(cssContent).toContain("opacity: 0");
      expect(cssContent).toContain("opacity: 1");
      expect(cssContent).toContain("transform: translateY(10px)");
      expect(cssContent).toContain("transform: translateY(0)");
    });

    it("should define fadeInScale keyframes", () => {
      expect(cssContent).toContain("@keyframes fadeInScale");
      expect(cssContent).toContain("opacity: 0");
      expect(cssContent).toContain("opacity: 1");
      expect(cssContent).toContain("transform: scale(0.95)");
      expect(cssContent).toContain("transform: scale(1)");
    });
  });

  describe("Hover Scale Utilities", () => {
    it("should define hover-scale utility class", () => {
      expect(cssContent).toContain(".hover-scale");
      expect(cssContent).toContain("transition: transform");
      expect(cssContent).toContain("transform: scale(1.02)");
    });

    it("should define hover-scale-sm utility class", () => {
      expect(cssContent).toContain(".hover-scale-sm:hover");
      expect(cssContent).toContain("transform: scale(1.015)");
    });

    it("should define hover-scale-md utility class", () => {
      expect(cssContent).toContain(".hover-scale-md:hover");
      expect(cssContent).toContain("transform: scale(1.025)");
    });

    it("should define hover-scale-lg utility class", () => {
      expect(cssContent).toContain(".hover-scale-lg:hover");
      expect(cssContent).toContain("transform: scale(1.03)");
    });

    it("should use theme easing for hover-scale", () => {
      expect(cssContent).toContain("cubic-bezier(0.25, 0.1, 0.25, 1)");
    });

    it("should use fast duration (150ms) for hover-scale", () => {
      expect(cssContent).toMatch(/transition:.*150ms/);
    });
  });

  describe("Shadow Lift Utility", () => {
    it("should define shadow-lift utility class", () => {
      expect(cssContent).toContain(".shadow-lift");
      expect(cssContent).toContain("transition: box-shadow");
      expect(cssContent).toContain("transition: transform");
      expect(cssContent).toContain("box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.1)");
      expect(cssContent).toContain("transform: translateY(-1px)");
    });
  });

  describe("Icon Hover Utility", () => {
    it("should define icon-hover utility class", () => {
      expect(cssContent).toContain(".icon-hover");
      expect(cssContent).toContain("transform: scale(1.1) rotate(5deg)");
    });
  });

  describe("Entrance Animation", () => {
    it("should define entrance-animation utility class", () => {
      expect(cssContent).toContain(".entrance-animation");
      expect(cssContent).toContain("animation: fadeInScale");
    });

    it("should use normal duration (200ms) for entrance animation", () => {
      expect(cssContent).toMatch(/animation:.*fadeInScale.*200ms/);
    });
  });

  describe("Interactive Element Utility", () => {
    it("should define interactive-element utility class", () => {
      expect(cssContent).toContain(".interactive-element");
    });

    it("should combine transform, box-shadow, and opacity transitions", () => {
      expect(cssContent).toContain(".interactive-element");
      expect(cssContent).toContain("transform 150ms");
      expect(cssContent).toContain("box-shadow 150ms");
      expect(cssContent).toContain("opacity 150ms");
    });

    it("should have hover state with scale and shadow", () => {
      expect(cssContent).toContain(".interactive-element:hover");
      expect(cssContent).toContain("transform: scale(1.02) translateY(-1px)");
      expect(cssContent).toContain("box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)");
    });

    it("should have active state with scale down", () => {
      expect(cssContent).toContain(".interactive-element:active");
      expect(cssContent).toContain("transform: scale(0.98)");
    });
  });

  describe("Prefers Reduced Motion", () => {
    it("should define prefers-reduced-motion media query", () => {
      expect(cssContent).toContain("@media (prefers-reduced-motion: reduce)");
    });

    it("should disable animations for reduced motion", () => {
      expect(cssContent).toContain("animation-duration: 0.01ms !important");
      expect(cssContent).toContain("animation-iteration-count: 1 !important");
    });

    it("should disable transitions for reduced motion", () => {
      expect(cssContent).toContain("transition-duration: 0.01ms !important");
    });

    it("should disable scroll behavior for reduced motion", () => {
      expect(cssContent).toContain("scroll-behavior: auto !important");
    });

    it("should disable hover transform effects for reduced motion", () => {
      expect(cssContent).toContain(".hover-scale:hover,");
      expect(cssContent).toContain(".hover-scale-sm:hover,");
      expect(cssContent).toContain(".hover-scale-md:hover,");
      expect(cssContent).toContain(".hover-scale-lg:hover,");
      expect(cssContent).toContain(".interactive-element:hover,");
      expect(cssContent).toContain("transform: none !important");
    });

    it("should disable entrance animations for reduced motion", () => {
      expect(cssContent).toContain(".entrance-animation");
      expect(cssContent).toContain("animation: none !important");
    });
  });

  describe("Animation Timing from Theme", () => {
    it("should use theme easing functions", () => {
      const animation = SCRATCH_THEME.animation;
      expect(animation.ease).toBe("cubic-bezier(0.25, 0.1, 0.25, 1)");
      expect(animation.easeIn).toBe("cubic-bezier(0.42, 0, 1, 1)");
      expect(animation.easeOut).toBe("cubic-bezier(0, 0, 0.58, 1)");
      expect(animation.easeInOut).toBe("cubic-bezier(0.42, 0, 0.58, 1)");
    });

    it("should use theme duration tokens", () => {
      const animation = SCRATCH_THEME.animation;
      expect(animation.fast).toBe("150ms");
      expect(animation.normal).toBe("250ms");
      expect(animation.slow).toBe("400ms");
    });

    it("should have consistent fast duration for micro-interactions", () => {
      expect(SCRATCH_THEME.animation.fast).toBe("150ms");
    });

    it("should define elastic and spring easing for playful effects", () => {
      const animation = SCRATCH_THEME.animation;
      expect(animation.bounce).toBeDefined();
      expect(animation.elastic).toBeDefined();
      expect(animation.spring).toBeDefined();
    });
  });

  describe("Animation Accessibility", () => {
    it("should respect system-level motion preferences", () => {
      expect(cssContent).toContain("prefers-reduced-motion");
    });

    it("should use short durations for micro-interactions (accessibility best practice)", () => {
      expect(SCRATCH_THEME.animation.fast).toBe("150ms");
      expect(SCRATCH_THEME.animation.instant).toBe("50ms");
    });

    it("should have animation disable overrides with !important", () => {
      expect(cssContent).toContain("!important");
    });
  });
});
