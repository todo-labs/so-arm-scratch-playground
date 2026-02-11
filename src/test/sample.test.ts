import { describe, expect, it } from "vitest";

describe("Sample Test", () => {
  it("should pass a simple test", () => {
    expect(1 + 1).toBe(2);
  });

  it("should verify truthiness", () => {
    expect(true).toBe(true);
  });
});
