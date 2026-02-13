import { beforeAll, describe, expect, it, vi } from "vitest";

// Use importActual to get the real implementation, not the mock
let BLOCK_CONSTANTS: typeof import("../blockShapes").BLOCK_CONSTANTS;
let getCommandBlockPath: typeof import("../blockShapes").getCommandBlockPath;
let getHatBlockPath: typeof import("../blockShapes").getHatBlockPath;
let getCBlockPath: typeof import("../blockShapes").getCBlockPath;
let getReporterPath: typeof import("../blockShapes").getReporterPath;
let getBooleanPath: typeof import("../blockShapes").getBooleanPath;
let getCBlockFooterPath: typeof import("../blockShapes").getCBlockFooterPath;

beforeAll(async () => {
  const module = await vi.importActual<typeof import("../blockShapes")>("@/lib/blockShapes");
  BLOCK_CONSTANTS = module.BLOCK_CONSTANTS;
  getCommandBlockPath = module.getCommandBlockPath;
  getHatBlockPath = module.getHatBlockPath;
  getCBlockPath = module.getCBlockPath;
  getReporterPath = module.getReporterPath;
  getBooleanPath = module.getBooleanPath;
  getCBlockFooterPath = module.getCBlockFooterPath;
});

describe("blockShapes", () => {
  describe("BLOCK_CONSTANTS", () => {
    it("should have correct NOTCH_WIDTH", () => {
      expect(BLOCK_CONSTANTS.NOTCH_WIDTH).toBe(15);
    });

    it("should have correct NOTCH_HEIGHT", () => {
      expect(BLOCK_CONSTANTS.NOTCH_HEIGHT).toBe(4);
    });

    it("should have correct NOTCH_OFFSET_LEFT", () => {
      expect(BLOCK_CONSTANTS.NOTCH_OFFSET_LEFT).toBe(12);
    });

    it("should have correct CORNER_RADIUS", () => {
      expect(BLOCK_CONSTANTS.CORNER_RADIUS).toBe(4);
    });

    it("should have correct MIN_WIDTH", () => {
      expect(BLOCK_CONSTANTS.MIN_WIDTH).toBe(80);
    });

    it("should have correct MIN_HEIGHT", () => {
      expect(BLOCK_CONSTANTS.MIN_HEIGHT).toBe(48);
    });

    it("should have correct HAT_HEIGHT", () => {
      expect(BLOCK_CONSTANTS.HAT_HEIGHT).toBe(12);
    });

    it("should have correct CAP_HEIGHT", () => {
      expect(BLOCK_CONSTANTS.CAP_HEIGHT).toBe(0);
    });

    it("should have correct STROKE_WIDTH", () => {
      expect(BLOCK_CONSTANTS.STROKE_WIDTH).toBe(1);
    });
  });

  describe("getCommandBlockPath", () => {
    it("should generate valid SVG path string", () => {
      const path = getCommandBlockPath(100, 48);

      expect(typeof path).toBe("string");
      expect(path.length).toBeGreaterThan(0);
      expect(path.startsWith("M")).toBe(true);
    });

    it("should include path commands", () => {
      const path = getCommandBlockPath(100, 48);

      expect(path).toContain("M"); // Move to
      expect(path).toContain("L"); // Line to
      expect(path).toContain("a"); // Arc
      expect(path).toContain("c"); // Cubic bezier (notch)
    });

    it("should generate different paths for different widths", () => {
      const path1 = getCommandBlockPath(100, 48);
      const path2 = getCommandBlockPath(200, 48);

      expect(path1).not.toBe(path2);
    });

    it("should generate different paths for different heights", () => {
      const path1 = getCommandBlockPath(100, 48);
      const path2 = getCommandBlockPath(100, 72);

      expect(path1).not.toBe(path2);
    });

    it("should handle hasNotchTop = false", () => {
      const pathWithNotch = getCommandBlockPath(100, 48, true, true);
      const pathWithoutNotch = getCommandBlockPath(100, 48, false, true);

      expect(pathWithNotch).not.toBe(pathWithoutNotch);
    });

    it("should handle hasNotchBottom = false", () => {
      const pathWithNotch = getCommandBlockPath(100, 48, true, true);
      const pathWithoutNotch = getCommandBlockPath(100, 48, true, false);

      expect(pathWithNotch).not.toBe(pathWithoutNotch);
    });

    it("should handle minimum dimensions", () => {
      const path = getCommandBlockPath(80, 48);

      expect(path).toBeTruthy();
      expect(path.length).toBeGreaterThan(0);
    });

    it("should handle large dimensions", () => {
      const path = getCommandBlockPath(500, 200);

      expect(path).toBeTruthy();
      expect(path.length).toBeGreaterThan(0);
    });

    it("should close the path with Z", () => {
      const path = getCommandBlockPath(100, 48);

      expect(path.endsWith("Z")).toBe(true);
    });

    it("should include notch path when hasNotchTop is true", () => {
      const path = getCommandBlockPath(100, 48, true, false);

      // The notch should be present
      expect(path).toContain("c"); // Cubic bezier for notch
    });
  });

  describe("getHatBlockPath", () => {
    it("should generate valid SVG path string", () => {
      const path = getHatBlockPath(100, 48);

      expect(typeof path).toBe("string");
      expect(path.length).toBeGreaterThan(0);
    });

    it("should have curved top (hat shape)", () => {
      const path = getHatBlockPath(100, 48);

      // Should contain the curved top characteristic of hat blocks
      expect(path).toContain("c");
      expect(path).toContain("-12"); // Curved top has negative y
    });

    it("should generate different paths for different widths", () => {
      const path1 = getHatBlockPath(100, 48);
      const path2 = getHatBlockPath(200, 48);

      expect(path1).not.toBe(path2);
    });

    it("should handle hasNotchBottom = false", () => {
      const pathWithNotch = getHatBlockPath(100, 48, true);
      const pathWithoutNotch = getHatBlockPath(100, 48, false);

      expect(pathWithNotch).not.toBe(pathWithoutNotch);
    });

    it("should close the path with Z", () => {
      const path = getHatBlockPath(100, 48);

      expect(path.endsWith("Z")).toBe(true);
    });

    it("should handle minimum dimensions", () => {
      const path = getHatBlockPath(80, 48);

      expect(path).toBeTruthy();
    });

    it("should be different from command block path", () => {
      const commandPath = getCommandBlockPath(100, 48);
      const hatPath = getHatBlockPath(100, 48);

      expect(hatPath).not.toBe(commandPath);
    });
  });

  describe("getCBlockPath", () => {
    it("should alias to getCommandBlockPath", () => {
      const cBlockPath = getCBlockPath(100, 48);
      const commandPath = getCommandBlockPath(100, 48, true, true);

      // For V1 implementation, it should be the same
      expect(cBlockPath).toBe(commandPath);
    });

    it("should accept additional parameters (even if unused)", () => {
      const path = getCBlockPath(100, 48, 30, 32, 32, true, true);

      expect(path).toBeTruthy();
    });

    it("should generate valid SVG path", () => {
      const path = getCBlockPath(100, 48);

      expect(typeof path).toBe("string");
      expect(path.length).toBeGreaterThan(0);
      expect(path.startsWith("M")).toBe(true);
    });
  });

  describe("getReporterPath", () => {
    it("should generate valid SVG path string", () => {
      const path = getReporterPath(100, 24);

      expect(typeof path).toBe("string");
      expect(path.length).toBeGreaterThan(0);
    });

    it("should generate pill-shaped path", () => {
      const path = getReporterPath(100, 24);

      expect(path).toContain("a"); // Arcs for rounded ends
    });

    it("should be symmetric for equal width and height", () => {
      const path = getReporterPath(40, 24);

      // Height is 24, so radius is 12
      expect(path).toContain("a 12 12");
    });

    it("should generate different paths for different widths", () => {
      const path1 = getReporterPath(100, 24);
      const path2 = getReporterPath(200, 24);

      expect(path1).not.toBe(path2);
    });

    it("should handle small dimensions", () => {
      const path = getReporterPath(40, 20);

      expect(path).toBeTruthy();
    });

    it("should close the path with Z", () => {
      const path = getReporterPath(100, 24);

      expect(path.endsWith("Z")).toBe(true);
    });

    it("should start at radius (horizontal center of left edge)", () => {
      const path = getReporterPath(100, 24);

      expect(path.startsWith("M 12")).toBe(true);
    });
  });

  describe("getBooleanPath", () => {
    it("should generate valid SVG path string", () => {
      const path = getBooleanPath(100, 24);

      expect(typeof path).toBe("string");
      expect(path.length).toBeGreaterThan(0);
    });

    it("should generate hexagon-shaped path", () => {
      const path = getBooleanPath(100, 24);

      expect(path).toContain("L"); // Straight lines for hexagon sides
    });

    it("should have pointy ends", () => {
      const path = getBooleanPath(100, 24);

      // Height is 24, so r is 12. Should have points at (0, 12) and (100, 12)
      expect(path).toContain("L 0 12");
      expect(path).toContain("L 100 12");
    });

    it("should generate different paths for different widths", () => {
      const path1 = getBooleanPath(100, 24);
      const path2 = getBooleanPath(200, 24);

      expect(path1).not.toBe(path2);
    });

    it("should close the path with Z", () => {
      const path = getBooleanPath(100, 24);

      expect(path.endsWith("Z")).toBe(true);
    });

    it("should handle minimum height", () => {
      const path = getBooleanPath(80, 20);

      expect(path).toBeTruthy();
    });

    it("should have correct number of points", () => {
      const path = getBooleanPath(100, 24);

      // Hexagon has 6 points
      const points = path.split("L").length - 1;
      expect(points).toBe(5); // 6 points total, first one is M, rest are L
    });
  });

  describe("getCBlockFooterPath", () => {
    it("should generate valid SVG path string", () => {
      const path = getCBlockFooterPath(100);

      expect(typeof path).toBe("string");
      expect(path.length).toBeGreaterThan(0);
    });

    it("should generate different paths for different widths", () => {
      const path1 = getCBlockFooterPath(100);
      const path2 = getCBlockFooterPath(200);

      expect(path1).not.toBe(path2);
    });

    it("should handle default footerHeight", () => {
      const path = getCBlockFooterPath(100);

      expect(path).toBeTruthy();
    });

    it("should handle custom footerHeight", () => {
      const path1 = getCBlockFooterPath(100, 16);
      const path2 = getCBlockFooterPath(100, 24);

      expect(path1).not.toBe(path2);
    });

    it("should close the path with Z", () => {
      const path = getCBlockFooterPath(100);

      expect(path.endsWith("Z")).toBe(true);
    });

    it("should start at corner radius offset", () => {
      const path = getCBlockFooterPath(100);

      // Should start at (cornerRadius, 0) = (4, 0)
      expect(path.startsWith("M 4")).toBe(true);
    });

    it("should contain arc commands for rounded corners", () => {
      const path = getCBlockFooterPath(100);

      expect(path).toContain("a"); // Arc commands
    });
  });

  describe("Path Structure Tests", () => {
    it("all paths should start with M command", () => {
      const paths = [
        getCommandBlockPath(100, 48),
        getHatBlockPath(100, 48),
        getCBlockPath(100, 48),
        getReporterPath(100, 24),
        getBooleanPath(100, 24),
        getCBlockFooterPath(100),
      ];

      paths.forEach((path) => {
        expect(path.startsWith("M")).toBe(true);
      });
    });

    it("all paths should end with Z (close path)", () => {
      const paths = [
        getCommandBlockPath(100, 48),
        getHatBlockPath(100, 48),
        getCBlockPath(100, 48),
        getReporterPath(100, 24),
        getBooleanPath(100, 24),
        getCBlockFooterPath(100),
      ];

      paths.forEach((path) => {
        expect(path.endsWith("Z")).toBe(true);
      });
    });

    it("paths should contain valid SVG path commands", () => {
      const path = getCommandBlockPath(100, 48);

      // Valid SVG path commands
      expect(path).toMatch(/[MLczahv]/); // At least one valid command
    });

    it("paths should handle numeric values correctly", () => {
      const path = getCommandBlockPath(100, 48);

      // Should not contain NaN or invalid numbers
      expect(path).not.toContain("NaN");
      expect(path).not.toContain("undefined");
      expect(path).not.toContain("null");
    });
  });

  describe("Geometric Consistency", () => {
    it("command block path should have consistent corner radius", () => {
      const path = getCommandBlockPath(100, 48);

      // All corners should use the same radius
      expect(path).toContain("a 4 4");
    });

    it("reporter path should use half-height as radius", () => {
      const path = getReporterPath(100, 24);

      // Height is 24, so radius should be 12
      expect(path).toContain("a 12 12");
    });

    it("boolean path should use half-height for pointy ends", () => {
      const path = getBooleanPath(100, 24);

      // Height is 24, so points at y=12
      expect(path).toContain("L 0 12");
      expect(path).toContain("L 100 12");
    });
  });
});
