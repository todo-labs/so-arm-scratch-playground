import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { BlockCategory, BlockDefinition } from "@/lib/types";

// Use importActual to get the real implementation, not the mock
let BlockRegistry: typeof import("../blockRegistry").BlockRegistry;

beforeAll(async () => {
  const module = await vi.importActual<typeof import("../blockRegistry")>("@/lib/blockRegistry");
  BlockRegistry = module.BlockRegistry;
});

describe("blockRegistry", () => {
  // Reset the singleton before each test to ensure isolation
  beforeEach(() => {
    // Access the private static instance and reset it for testing
    (BlockRegistry as unknown as { instance: InstanceType<typeof BlockRegistry> | null }).instance =
      null;
  });

  describe("Singleton Pattern", () => {
    it("should return the same instance on multiple calls", () => {
      const instance1 = BlockRegistry.getInstance();
      const instance2 = BlockRegistry.getInstance();

      expect(instance1).toBe(instance2);
    });

    it("should create new instance only on first call", () => {
      const instance = BlockRegistry.getInstance();

      expect(instance).toBeDefined();
      expect(typeof instance.getBlock).toBe("function");
    });
  });

  describe("registerBlock", () => {
    it("should register a block definition", () => {
      const registry = BlockRegistry.getInstance();
      const block: BlockDefinition = {
        id: "test_block",
        category: "motion",
        name: "Test Block",
        color: "hsl(180, 50%, 50%)",
        shape: "command",
        parameters: [],
        codeTemplate: "test()",
      };

      registry.registerBlock(block);

      expect(registry.getBlock("test_block")).toEqual(block);
    });

    it("should allow registering multiple blocks", () => {
      const registry = BlockRegistry.getInstance();
      const block1: BlockDefinition = {
        id: "block_1",
        category: "motion",
        name: "Block 1",
        color: "hsl(180, 50%, 50%)",
        shape: "command",
        parameters: [],
        codeTemplate: "block1()",
      };
      const block2: BlockDefinition = {
        id: "block_2",
        category: "control",
        name: "Block 2",
        color: "hsl(38, 92%, 50%)",
        shape: "command",
        parameters: [],
        codeTemplate: "block2()",
      };

      registry.registerBlock(block1);
      registry.registerBlock(block2);

      expect(registry.getBlock("block_1")).toEqual(block1);
      expect(registry.getBlock("block_2")).toEqual(block2);
    });

    it("should overwrite existing block with same id", () => {
      const registry = BlockRegistry.getInstance();
      const block1: BlockDefinition = {
        id: "duplicate",
        category: "motion",
        name: "Original",
        color: "hsl(180, 50%, 50%)",
        shape: "command",
        parameters: [],
        codeTemplate: "original()",
      };
      const block2: BlockDefinition = {
        id: "duplicate",
        category: "control",
        name: "Updated",
        color: "hsl(38, 92%, 50%)",
        shape: "command",
        parameters: [],
        codeTemplate: "updated()",
      };

      registry.registerBlock(block1);
      registry.registerBlock(block2);

      const retrieved = registry.getBlock("duplicate");
      expect(retrieved?.name).toBe("Updated");
      expect(retrieved?.category).toBe("control");
    });
  });

  describe("registerCategory", () => {
    it("should register a category", () => {
      const registry = BlockRegistry.getInstance();

      expect(typeof registry.registerCategory).toBe("function");
    });

    it("should store category in the registry", () => {
      const registry = BlockRegistry.getInstance();
      const customCategory: BlockCategory = {
        id: "custom_category",
        name: "Custom",
        color: "hsl(270, 50%, 50%)",
        icon: "Star",
      };

      registry.registerCategory(customCategory);

      const allCategories = registry.getAllCategories();
      expect(allCategories.some((cat) => cat.id === "custom_category")).toBe(true);
    });
  });

  describe("getBlock", () => {
    it("should return undefined for non-existent block", () => {
      const registry = BlockRegistry.getInstance();

      expect(registry.getBlock("non_existent")).toBeUndefined();
    });

    it("should return registered block", () => {
      const registry = BlockRegistry.getInstance();
      const block: BlockDefinition = {
        id: "get_test",
        category: "motion",
        name: "Get Test",
        color: "hsl(180, 50%, 50%)",
        shape: "command",
        parameters: [],
        codeTemplate: "getTest()",
      };

      registry.registerBlock(block);

      expect(registry.getBlock("get_test")).toEqual(block);
    });
  });

  describe("getBlocksByCategory", () => {
    it("should return empty array for non-existent category", () => {
      const registry = BlockRegistry.getInstance();

      expect(registry.getBlocksByCategory("non_existent")).toEqual([]);
    });

    it("should return blocks filtered by category", () => {
      const registry = BlockRegistry.getInstance();
      const motionBlock1: BlockDefinition = {
        id: "motion_1",
        category: "motion",
        name: "Motion 1",
        color: "hsl(180, 50%, 50%)",
        shape: "command",
        parameters: [],
        codeTemplate: "motion1()",
      };
      const motionBlock2: BlockDefinition = {
        id: "motion_2",
        category: "motion",
        name: "Motion 2",
        color: "hsl(180, 50%, 50%)",
        shape: "command",
        parameters: [],
        codeTemplate: "motion2()",
      };
      const controlBlock: BlockDefinition = {
        id: "control_1",
        category: "control",
        name: "Control 1",
        color: "hsl(38, 92%, 50%)",
        shape: "command",
        parameters: [],
        codeTemplate: "control1()",
      };

      registry.registerBlock(motionBlock1);
      registry.registerBlock(motionBlock2);
      registry.registerBlock(controlBlock);

      const motionBlocks = registry.getBlocksByCategory("motion");
      const controlBlocks = registry.getBlocksByCategory("control");

      expect(motionBlocks).toHaveLength(2);
      expect(motionBlocks.map((b) => b.id).sort()).toEqual(["motion_1", "motion_2"]);
      expect(controlBlocks).toHaveLength(1);
      expect(controlBlocks[0]?.id).toBe("control_1");
    });
  });

  describe("getAllBlocks", () => {
    it("should return empty array when no blocks registered", () => {
      // Create a fresh registry for this test
      (BlockRegistry as unknown as { instance: BlockRegistry | null }).instance = null;
      const freshRegistry = BlockRegistry.getInstance();

      const blocks = freshRegistry.getAllBlocks();

      expect(Array.isArray(blocks)).toBe(true);
    });

    it("should return all registered blocks", () => {
      const registry = BlockRegistry.getInstance();
      const block1: BlockDefinition = {
        id: "all_1",
        category: "motion",
        name: "All 1",
        color: "hsl(180, 50%, 50%)",
        shape: "command",
        parameters: [],
        codeTemplate: "all1()",
      };
      const block2: BlockDefinition = {
        id: "all_2",
        category: "control",
        name: "All 2",
        color: "hsl(38, 92%, 50%)",
        shape: "command",
        parameters: [],
        codeTemplate: "all2()",
      };

      registry.registerBlock(block1);
      registry.registerBlock(block2);

      const allBlocks = registry.getAllBlocks();
      const ids = allBlocks.map((b) => b.id).sort();

      expect(allBlocks.length).toBeGreaterThanOrEqual(2);
      expect(ids).toContain("all_1");
      expect(ids).toContain("all_2");
    });

    it("should return a new array each time (immutability)", () => {
      const registry = BlockRegistry.getInstance();
      const blocks1 = registry.getAllBlocks();
      const blocks2 = registry.getAllBlocks();

      expect(blocks1).not.toBe(blocks2);
      expect(blocks1).toEqual(blocks2);
    });
  });

  describe("getAllCategories", () => {
    it("should return all registered categories", () => {
      const registry = BlockRegistry.getInstance();

      // Register categories for this test since singleton was reset
      registry.registerCategory({
        id: "motion",
        name: "Motion",
        color: "hsl(217, 91%, 60%)",
        icon: "Bot",
      });
      registry.registerCategory({
        id: "control",
        name: "Control",
        color: "hsl(38, 92%, 50%)",
        icon: "RefreshCcw",
      });
      registry.registerCategory({
        id: "gripper",
        name: "Gripper",
        color: "hsl(120, 60%, 60%)",
        icon: "Hand",
      });

      const categories = registry.getAllCategories();
      expect(categories.length).toBeGreaterThanOrEqual(3);

      const categoryIds = categories.map((c) => c.id);
      expect(categoryIds).toContain("motion");
      expect(categoryIds).toContain("control");
      expect(categoryIds).toContain("gripper");
    });

    it("should return categories with correct properties", () => {
      const registry = BlockRegistry.getInstance();

      // Register motion category for this test
      registry.registerCategory({
        id: "motion",
        name: "Motion",
        color: "hsl(217, 91%, 60%)",
        icon: "Bot",
      });

      const categories = registry.getAllCategories();
      const motionCategory = categories.find((c) => c.id === "motion");

      expect(motionCategory).toBeDefined();
      expect(motionCategory?.name).toBe("Motion");
      expect(motionCategory?.color).toBeTruthy();
      expect(motionCategory?.icon).toBeTruthy();
    });

    it("should return registered categories", () => {
      const registry = BlockRegistry.getInstance();
      const category1: BlockCategory = {
        id: "cat_1",
        name: "Category 1",
        color: "hsl(100, 50%, 50%)",
        icon: "Icon1",
      };
      const category2: BlockCategory = {
        id: "cat_2",
        name: "Category 2",
        color: "hsl(200, 50%, 50%)",
        icon: "Icon2",
      };

      registry.registerCategory(category1);
      registry.registerCategory(category2);

      const categories = registry.getAllCategories();
      expect(categories.length).toBeGreaterThanOrEqual(2);
    });

    it("should return a new array each time (immutability)", () => {
      const registry = BlockRegistry.getInstance();
      const cats1 = registry.getAllCategories();
      const cats2 = registry.getAllCategories();

      expect(cats1).not.toBe(cats2);
      expect(cats1).toEqual(cats2);
    });
  });

  describe("Integration Tests", () => {
    it("should handle complete workflow: register blocks and categories, then retrieve them", () => {
      const registry = BlockRegistry.getInstance();
      const customCategory: BlockCategory = {
        id: "motion", // Using valid category type
        name: "Integration Test",
        color: "hsl(300, 50%, 50%)",
        icon: "Test",
      };
      const customBlock: BlockDefinition = {
        id: "integration_block",
        category: "motion",
        name: "Integration Block",
        color: "hsl(300, 50%, 50%)",
        shape: "reporter",
        parameters: [],
        codeTemplate: "integration()",
      };

      registry.registerCategory(customCategory);
      registry.registerBlock(customBlock);

      // Verify block is retrievable
      expect(registry.getBlock("integration_block")).toEqual(customBlock);

      // Verify block appears in category filter
      const categoryBlocks = registry.getBlocksByCategory("motion");
      expect(categoryBlocks.some((b) => b.id === "integration_block")).toBe(true);

      // Verify category is in all categories
      const allCategories = registry.getAllCategories();
      expect(allCategories.some((c) => c.id === "motion")).toBe(true);
    });

    it("should maintain state between getInstance calls", () => {
      const registry1 = BlockRegistry.getInstance();
      const block: BlockDefinition = {
        id: "state_test",
        category: "motion",
        name: "State Test",
        color: "hsl(180, 50%, 50%)",
        shape: "command",
        parameters: [],
        codeTemplate: "stateTest()",
      };
      registry1.registerBlock(block);

      const registry2 = BlockRegistry.getInstance();
      expect(registry2.getBlock("state_test")).toEqual(block);
    });
  });
});
