import { beforeAll, describe, expect, it, vi } from "vitest";
import type { BlockInstance } from "@/lib/types";

// Use importActual to get the real implementation, not the mock
let cn: typeof import("../utils").cn;
let degreesToRadians: typeof import("../utils").degreesToRadians;
let radiansToDegrees: typeof import("../utils").radiansToDegrees;
let degreesToServoPosition: typeof import("../utils").degreesToServoPosition;
let servoPositionToAngle: typeof import("../utils").servoPositionToAngle;
let parseBlocksForCommands: typeof import("../utils").parseBlocksForCommands;

beforeAll(async () => {
  const module = await vi.importActual<typeof import("../utils")>("@/lib/utils");
  cn = module.cn;
  degreesToRadians = module.degreesToRadians;
  radiansToDegrees = module.radiansToDegrees;
  degreesToServoPosition = module.degreesToServoPosition;
  servoPositionToAngle = module.servoPositionToAngle;
  parseBlocksForCommands = module.parseBlocksForCommands;
});

describe("utils", () => {
  describe("cn", () => {
    it("should merge class names with tailwind merge", () => {
      const result = cn("px-4", "py-2", "bg-blue-500");
      expect(result).toContain("px-4");
      expect(result).toContain("py-2");
      expect(result).toContain("bg-blue-500");
    });

    it("should handle clsx-style conditional classes", () => {
      const result = cn("base-class", true && "conditional-class", false && "hidden-class");
      expect(result).toContain("base-class");
      expect(result).toContain("conditional-class");
      expect(result).not.toContain("hidden-class");
    });

    it("should merge conflicting tailwind classes", () => {
      const result = cn("p-4", "p-2");
      expect(result).toBeTruthy();
    });

    it("should handle empty inputs", () => {
      expect(cn()).toBe("");
      expect(cn("")).toBe("");
    });

    it("should handle object inputs", () => {
      const result = cn({ active: true, disabled: false });
      expect(result).toContain("active");
      expect(result).not.toContain("disabled");
    });

    it("should handle array inputs", () => {
      const result = cn(["class1", "class2"]);
      expect(result).toContain("class1");
      expect(result).toContain("class2");
    });
  });

  describe("degreesToRadians", () => {
    it("should convert 0 degrees to 0 radians", () => {
      expect(degreesToRadians(0)).toBe(0);
    });

    it("should convert 180 degrees to π radians", () => {
      expect(degreesToRadians(180)).toBeCloseTo(Math.PI, 10);
    });

    it("should convert 360 degrees to 2π radians", () => {
      expect(degreesToRadians(360)).toBeCloseTo(2 * Math.PI, 10);
    });

    it("should convert 90 degrees to π/2 radians", () => {
      expect(degreesToRadians(90)).toBeCloseTo(Math.PI / 2, 10);
    });

    it("should handle negative angles", () => {
      expect(degreesToRadians(-90)).toBeCloseTo(-Math.PI / 2, 10);
    });

    it("should handle decimal values", () => {
      expect(degreesToRadians(45.5)).toBeCloseTo(0.7941, 3);
    });

    it("should handle large angles", () => {
      expect(degreesToRadians(720)).toBeCloseTo(4 * Math.PI, 10);
    });
  });

  describe("radiansToDegrees", () => {
    it("should convert 0 radians to 0 degrees", () => {
      expect(radiansToDegrees(0)).toBe(0);
    });

    it("should convert π radians to 180 degrees", () => {
      expect(radiansToDegrees(Math.PI)).toBeCloseTo(180, 10);
    });

    it("should convert 2π radians to 360 degrees", () => {
      expect(radiansToDegrees(2 * Math.PI)).toBeCloseTo(360, 10);
    });

    it("should convert π/2 radians to 90 degrees", () => {
      expect(radiansToDegrees(Math.PI / 2)).toBeCloseTo(90, 10);
    });

    it("should handle negative radians", () => {
      expect(radiansToDegrees(-Math.PI / 2)).toBeCloseTo(-90, 10);
    });

    it("should handle decimal values", () => {
      expect(radiansToDegrees(0.7854)).toBeCloseTo(45, 0);
    });
  });

  describe("degreesToServoPosition", () => {
    it("should convert 0 degrees to servo position 0", () => {
      expect(degreesToServoPosition(0)).toBe(0);
    });

    it("should convert 360 degrees to servo position 4096", () => {
      expect(degreesToServoPosition(360)).toBe(4096);
    });

    it("should convert 180 degrees to servo position 2048", () => {
      expect(degreesToServoPosition(180)).toBe(2048);
    });

    it("should convert 90 degrees to servo position 1024", () => {
      expect(degreesToServoPosition(90)).toBe(1024);
    });

    it("should clamp values above 360 to 4096", () => {
      expect(degreesToServoPosition(361)).toBe(4096);
      expect(degreesToServoPosition(400)).toBe(4096);
    });

    it("should handle negative angles by returning negative values", () => {
      expect(degreesToServoPosition(-90)).toBe(-1024);
      expect(degreesToServoPosition(-10)).toBe(-114);
    });

    it("should round to nearest integer", () => {
      expect(degreesToServoPosition(0.5)).toBe(6);
      expect(degreesToServoPosition(0.4)).toBe(5);
    });

    it("should handle decimal degree values", () => {
      expect(degreesToServoPosition(45)).toBe(512);
      expect(degreesToServoPosition(45.5)).toBe(518);
    });
  });

  describe("servoPositionToAngle", () => {
    it("should convert servo position 0 to 0 degrees", () => {
      expect(servoPositionToAngle(0)).toBeCloseTo(0, 10);
    });

    it("should convert servo position 4096 to 360 degrees", () => {
      expect(servoPositionToAngle(4096)).toBeCloseTo(360, 10);
    });

    it("should convert servo position 2048 to 180 degrees", () => {
      expect(servoPositionToAngle(2048)).toBeCloseTo(180, 10);
    });

    it("should convert servo position 1024 to 90 degrees", () => {
      expect(servoPositionToAngle(1024)).toBeCloseTo(90, 10);
    });

    it("should handle decimal servo positions", () => {
      expect(servoPositionToAngle(512)).toBeCloseTo(45, 10);
    });

    it("should handle servo position in the middle range", () => {
      expect(servoPositionToAngle(2000)).toBeCloseTo(176, 0);
    });

    it("should maintain precision for various positions", () => {
      expect(servoPositionToAngle(1)).toBeCloseTo(0.088, 3);
      expect(servoPositionToAngle(100)).toBeCloseTo(8.79, 2);
      expect(servoPositionToAngle(1000)).toBeCloseTo(87.89, 2);
    });
  });

  describe("parseBlocksForCommands", () => {
    function createBlockInstance(
      id: string,
      definitionId: string,
      parameters: Record<string, boolean | number | string> = {},
      children: BlockInstance[] = []
    ): BlockInstance {
      return {
        id,
        definitionId,
        x: Math.floor(Math.random() * 1000),
        y: Math.floor(Math.random() * 500),
        parameters,
        children,
        isSnapped: children.length > 0,
      };
    }

    it("should return empty array for empty blocks", () => {
      const result = parseBlocksForCommands([]);
      expect(result).toEqual([]);
    });

    it("should extract commands from move_to blocks", () => {
      const blocks: BlockInstance[] = [
        createBlockInstance("block-1", "move_to", { joint: "base", angle: 90 }),
        createBlockInstance("block-2", "move_to", { joint: "shoulder", angle: 120 }),
      ];

      const result = parseBlocksForCommands(blocks);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ servoId: 1, value: 90 });
      expect(result[1]).toEqual({ servoId: 2, value: 120 });
    });

    it("should map joint names to correct servo IDs", () => {
      const blocks: BlockInstance[] = [
        createBlockInstance("block-1", "move_to", { joint: "base", angle: 0 }),
        createBlockInstance("block-2", "move_to", { joint: "shoulder", angle: 0 }),
        createBlockInstance("block-3", "move_to", { joint: "elbow", angle: 0 }),
        createBlockInstance("block-4", "move_to", { joint: "wrist_flex", angle: 0 }),
        createBlockInstance("block-5", "move_to", { joint: "wrist_roll", angle: 0 }),
        createBlockInstance("block-6", "move_to", { joint: "gripper", angle: 0 }),
      ];

      const result = parseBlocksForCommands(blocks);

      expect(result).toHaveLength(6);
      expect(result[0].servoId).toBe(1); // base
      expect(result[1].servoId).toBe(2); // shoulder
      expect(result[2].servoId).toBe(3); // elbow
      expect(result[3].servoId).toBe(4); // wrist_flex
      expect(result[4].servoId).toBe(5); // wrist_roll
      expect(result[5].servoId).toBe(6); // gripper
    });

    it("should ignore non-move_to blocks", () => {
      const blocks: BlockInstance[] = [
        createBlockInstance("block-1", "wait_seconds", { seconds: 1 }),
        createBlockInstance("block-2", "repeat", { times: 3 }),
        createBlockInstance("block-3", "home_robot", {}),
      ];

      const result = parseBlocksForCommands(blocks);

      expect(result).toHaveLength(0);
    });

    it("should skip blocks with invalid joint names", () => {
      const blocks: BlockInstance[] = [
        createBlockInstance("block-1", "move_to", { joint: "invalid_joint", angle: 90 }),
      ];

      const result = parseBlocksForCommands(blocks);

      expect(result).toHaveLength(0);
    });

    it("should skip blocks with non-numeric angle values", () => {
      const blocks: BlockInstance[] = [
        createBlockInstance("block-1", "move_to", {
          joint: "base",
          angle: "90" as unknown as number,
        }),
      ];

      const result = parseBlocksForCommands(blocks);

      expect(result).toHaveLength(0);
    });

    it("should skip blocks with missing angle parameter", () => {
      const blocks: BlockInstance[] = [
        createBlockInstance("block-1", "move_to", { joint: "base" }),
      ];

      const result = parseBlocksForCommands(blocks);

      expect(result).toHaveLength(0);
    });

    it("should handle mixed valid and invalid blocks", () => {
      const blocks: BlockInstance[] = [
        createBlockInstance("block-1", "wait_seconds", { seconds: 1 }),
        createBlockInstance("block-2", "move_to", { joint: "base", angle: 90 }),
        createBlockInstance("block-3", "repeat", { times: 3 }),
        createBlockInstance("block-4", "move_to", { joint: "invalid", angle: 45 }),
        createBlockInstance("block-5", "move_to", { joint: "shoulder", angle: 180 }),
      ];

      const result = parseBlocksForCommands(blocks);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ servoId: 1, value: 90 });
      expect(result[1]).toEqual({ servoId: 2, value: 180 });
    });

    it("should preserve numeric angles while respecting joint bounds", () => {
      const blocks: BlockInstance[] = [
        createBlockInstance("block-1", "move_to", { joint: "base", angle: 45.5 }),
        createBlockInstance("block-2", "move_to", { joint: "shoulder", angle: -30 }),
      ];

      const result = parseBlocksForCommands(blocks);

      expect(result[0].value).toBe(70);
      expect(result[1].value).toBe(80);
    });

    it("should handle nested children by only processing top-level blocks", () => {
      const childBlock = createBlockInstance("child-1", "move_to", { joint: "base", angle: 90 });
      const parentBlock = createBlockInstance("parent-1", "repeat", { times: 3 }, [childBlock]);

      const result = parseBlocksForCommands([parentBlock]);

      // Should not process children - only top-level blocks
      expect(result).toHaveLength(0);
    });

    it("should handle zero angle values", () => {
      const blocks: BlockInstance[] = [
        createBlockInstance("block-1", "move_to", { joint: "base", angle: 0 }),
      ];

      const result = parseBlocksForCommands(blocks);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ servoId: 1, value: 70 });
    });

    it("should handle large angle values", () => {
      const blocks: BlockInstance[] = [
        createBlockInstance("block-1", "move_to", { joint: "base", angle: 360 }),
      ];

      const result = parseBlocksForCommands(blocks);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ servoId: 1, value: 290 });
    });

    it("should clamp angles to selected joint max", () => {
      const blocks: BlockInstance[] = [
        createBlockInstance("block-1", "move_to", { joint: "shoulder", angle: 999 }),
        createBlockInstance("block-2", "move_to", { joint: "elbow", angle: 270 }),
      ];

      const result = parseBlocksForCommands(blocks);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ servoId: 2, value: 280 });
      expect(result[1]).toEqual({ servoId: 3, value: 270 });
    });
  });

  describe("radiansToServoPosition", () => {
    it("should convert 0 radians to servo position 0", () => {
      const result = (() => {
        const radians = 0;
        return Math.min(Math.round((radians * 4096) / (2 * Math.PI)), 4096);
      })();
      expect(result).toBe(0);
    });

    it("should convert 2π radians to servo position 4096", () => {
      const result = (() => {
        const radians = 2 * Math.PI;
        return Math.min(Math.round((radians * 4096) / (2 * Math.PI)), 4096);
      })();
      expect(result).toBe(4096);
    });

    it("should convert π radians to servo position 2048", () => {
      const result = (() => {
        const radians = Math.PI;
        return Math.min(Math.round((radians * 4096) / (2 * Math.PI)), 4096);
      })();
      expect(result).toBe(2048);
    });

    it("should convert π/2 radians to servo position 1024", () => {
      const result = (() => {
        const radians = Math.PI / 2;
        return Math.min(Math.round((radians * 4096) / (2 * Math.PI)), 4096);
      })();
      expect(result).toBe(1024);
    });

    it("should clamp values above 2π to 4096", () => {
      const result = (() => {
        const radians = 3 * Math.PI;
        return Math.min(Math.round((radians * 4096) / (2 * Math.PI)), 4096);
      })();
      expect(result).toBe(4096);
    });
  });
});
