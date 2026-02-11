import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Google Fonts Configuration", () => {
  const cssPath = join(process.cwd(), "src/index.css");
  const cssContent = readFileSync(cssPath, "utf-8");

  describe("Font Imports", () => {
    it("should import Poppins font from Google Fonts", () => {
      expect(cssContent).toContain("fonts.googleapis.com");
      expect(cssContent).toContain("Poppins");
    });

    it("should import Inter font from Google Fonts", () => {
      expect(cssContent).toContain("Inter");
    });

    it("should include font-display: swap for performance", () => {
      expect(cssContent).toContain("display=swap");
    });

    it("should include font-weight variants for Inter", () => {
      expect(cssContent).toMatch(/Inter.*wght@(?:400|500|600|700)/);
    });

    it("should include font-weight variants for Poppins", () => {
      expect(cssContent).toMatch(/Poppins.*wght@(?:500|600|700|800)/);
    });
  });

  describe("Font Variables", () => {
    it("should set --font-sans with Poppins as primary", () => {
      expect(cssContent).toContain("--font-sans:");
      expect(cssContent).toContain("'Poppins'");
    });

    it("should include Inter in font stack", () => {
      expect(cssContent).toContain("'Inter'");
    });

    it("should maintain fallback fonts for safety", () => {
      expect(cssContent).toContain("system-ui");
      expect(cssContent).toContain("-apple-system");
      expect(cssContent).toContain("BlinkMacSystemFont");
    });
  });
});
