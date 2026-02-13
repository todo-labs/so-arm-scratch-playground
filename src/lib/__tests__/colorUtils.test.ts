import { describe, expect, it } from "vitest";
import { clamp, parseHsl, shiftLightness } from "../colorUtils";

describe("colorUtils", () => {
  describe("parseHsl", () => {
    it("should parse valid HSL string with spaces", () => {
      const result = parseHsl("hsl(180, 50%, 50%)");

      expect(result).toEqual({ h: 180, s: 50, l: 50 });
    });

    it("should parse valid HSL string without spaces", () => {
      const result = parseHsl("hsl(180,50%,50%)");

      expect(result).toEqual({ h: 180, s: 50, l: 50 });
    });

    it("should parse HSL with varying whitespace", () => {
      const result1 = parseHsl("hsl( 180 , 50% , 50% )");
      const result2 = parseHsl("hsl(180,50%,50%)");
      const result3 = parseHsl("hsl(180,  50%,  50%)");

      expect(result1).toEqual({ h: 180, s: 50, l: 50 });
      expect(result2).toEqual({ h: 180, s: 50, l: 50 });
      expect(result3).toEqual({ h: 180, s: 50, l: 50 });
    });

    it("should parse HSL with zero values", () => {
      const result = parseHsl("hsl(0, 0%, 0%)");

      expect(result).toEqual({ h: 0, s: 0, l: 0 });
    });

    it("should parse HSL with maximum values", () => {
      const result = parseHsl("hsl(360, 100%, 100%)");

      expect(result).toEqual({ h: 360, s: 100, l: 100 });
    });

    it("should return null for invalid HSL format", () => {
      expect(parseHsl("rgb(255, 0, 0)")).toBeNull();
      expect(parseHsl("not-hsl")).toBeNull();
      expect(parseHsl("hsl()")).toBeNull();
      expect(parseHsl("hsl(180)")).toBeNull();
    });

    it("should return null for empty string", () => {
      expect(parseHsl("")).toBeNull();
    });

    it("should return null for malformed HSL", () => {
      expect(parseHsl("hsl(180, %)")).toBeNull();
      expect(parseHsl("hsl(%, 50%, 50%)")).toBeNull();
      expect(parseHsl("hsl(abc, 50%, 50%)")).toBeNull();
    });

    it("should parse HSL with different hue values", () => {
      expect(parseHsl("hsl(0, 100%, 50%)")).toEqual({ h: 0, s: 100, l: 50 });
      expect(parseHsl("hsl(120, 100%, 50%)")).toEqual({ h: 120, s: 100, l: 50 });
      expect(parseHsl("hsl(240, 100%, 50%)")).toEqual({ h: 240, s: 100, l: 50 });
    });

    it("should parse HSL with case-insensitive matching", () => {
      const result1 = parseHsl("HSL(180, 50%, 50%)");
      const result2 = parseHsl("Hsl(180, 50%, 50%)");

      expect(result1).toEqual({ h: 180, s: 50, l: 50 });
      expect(result2).toEqual({ h: 180, s: 50, l: 50 });
    });

    it("should extract numeric values correctly", () => {
      const result = parseHsl("hsl(217, 91%, 60%)");

      expect(result?.h).toBe(217);
      expect(result?.s).toBe(91);
      expect(result?.l).toBe(60);
    });
  });

  describe("clamp", () => {
    it("should return value within range", () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });

    it("should clamp value below minimum to minimum", () => {
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(-1, 0, 10)).toBe(0);
    });

    it("should clamp value above maximum to maximum", () => {
      expect(clamp(15, 0, 10)).toBe(10);
      expect(clamp(100, 0, 10)).toBe(10);
    });

    it("should handle decimal values", () => {
      expect(clamp(5.5, 0, 10)).toBe(5.5);
      expect(clamp(-0.5, 0, 10)).toBe(0);
      expect(clamp(10.5, 0, 10)).toBe(10);
    });

    it("should handle negative ranges", () => {
      expect(clamp(-5, -10, -1)).toBe(-5);
      expect(clamp(-15, -10, -1)).toBe(-10);
      expect(clamp(0, -10, -1)).toBe(-1);
    });

    it("should handle zero as value", () => {
      expect(clamp(0, -5, 5)).toBe(0);
      expect(clamp(0, 1, 10)).toBe(1);
      expect(clamp(0, -10, -1)).toBe(-1);
    });

    it("should handle equal min and max", () => {
      expect(clamp(5, 5, 5)).toBe(5);
      expect(clamp(10, 5, 5)).toBe(5);
      expect(clamp(0, 5, 5)).toBe(5);
    });

    it("should handle large numbers", () => {
      expect(clamp(500, 0, 1000)).toBe(500);
      expect(clamp(2000, 0, 1000)).toBe(1000);
      expect(clamp(-100, 0, 1000)).toBe(0);
    });
  });

  describe("shiftLightness", () => {
    it("should increase lightness for positive delta", () => {
      const result = shiftLightness("hsl(180, 50%, 50%)", 10);

      expect(result).toBe("hsl(180, 50%, 60%)");
    });

    it("should decrease lightness for negative delta", () => {
      const result = shiftLightness("hsl(180, 50%, 50%)", -10);

      expect(result).toBe("hsl(180, 50%, 40%)");
    });

    it("should clamp lightness to minimum of 10", () => {
      const result = shiftLightness("hsl(180, 50%, 15%)", -10);

      expect(result).toBe("hsl(180, 50%, 10%)");
    });

    it("should clamp lightness to maximum of 92", () => {
      const result = shiftLightness("hsl(180, 50%, 85%)", 10);

      expect(result).toBe("hsl(180, 50%, 92%)");
    });

    it("should return original string for invalid HSL", () => {
      const input = "not-hsl";
      const result = shiftLightness(input, 10);

      expect(result).toBe(input);
    });

    it("should return original string for empty string", () => {
      const input = "";
      const result = shiftLightness(input, 10);

      expect(result).toBe(input);
    });

    it("should handle HSL with zero lightness", () => {
      const result = shiftLightness("hsl(180, 50%, 0%)", 10);

      // Clamps to minimum 10
      expect(result).toBe("hsl(180, 50%, 10%)");
    });

    it("should handle HSL with low lightness", () => {
      const result = shiftLightness("hsl(180, 50%, 5%)", 10);

      // Should go from 5% to 15%
      expect(result).toBe("hsl(180, 50%, 15%)");
    });

    it("should handle HSL with high lightness", () => {
      const result = shiftLightness("hsl(180, 50%, 90%)", 10);

      // Should clamp to 92%
      expect(result).toBe("hsl(180, 50%, 92%)");
    });

    it("should preserve hue and saturation", () => {
      const result = shiftLightness("hsl(217, 91%, 60%)", 5);

      expect(result).toContain("217");
      expect(result).toContain("91%");
      expect(result).toContain("65%");
    });

    it("should handle zero delta", () => {
      const result = shiftLightness("hsl(180, 50%, 50%)", 0);

      expect(result).toBe("hsl(180, 50%, 50%)");
    });

    it("should handle large positive delta on low lightness", () => {
      const result = shiftLightness("hsl(180, 50%, 10%)", 100);

      // Should clamp to maximum 92
      expect(result).toBe("hsl(180, 50%, 92%)");
    });

    it("should handle large negative delta on high lightness", () => {
      const result = shiftLightness("hsl(180, 50%, 92%)", -100);

      // Should clamp to minimum 10
      expect(result).toBe("hsl(180, 50%, 10%)");
    });
  });
});
