import type { BlockDefinition, BlockCategory } from "@/lib/types";

export class BlockRegistry {
  private static instance: BlockRegistry;
  private blocks: Map<string, BlockDefinition> = new Map();
  private categories: Map<string, BlockCategory> = new Map();

  static getInstance(): BlockRegistry {
    if (!BlockRegistry.instance) {
      BlockRegistry.instance = new BlockRegistry();
    }
    return BlockRegistry.instance;
  }

  registerBlock(block: BlockDefinition): void {
    this.blocks.set(block.id, block);
  }

  registerCategory(category: BlockCategory): void {
    this.categories.set(category.id, category);
  }

  getBlock(id: string): BlockDefinition | undefined {
    return this.blocks.get(id);
  }

  getBlocksByCategory(categoryId: string): BlockDefinition[] {
    return Array.from(this.blocks.values()).filter(
      (block) => block.category === categoryId
    );
  }

  getAllBlocks(): BlockDefinition[] {
    return Array.from(this.blocks.values());
  }

  getAllCategories(): BlockCategory[] {
    return Array.from(this.categories.values());
  }
}

const registry = BlockRegistry.getInstance();

registry.registerCategory({
  id: "motion",
  name: "Motion",
  color: "hsl(217, 91%, 60%)",
  icon: "🏃",
});

registry.registerCategory({
  id: "control",
  name: "Control",
  color: "hsl(38, 92%, 50%)",
  icon: "🔄",
});

registry.registerCategory({
  id: "gripper",
  name: "Gripper",
  color: "hsl(120, 60%, 60%)",
  icon: "🤏",
});

export { registry };
