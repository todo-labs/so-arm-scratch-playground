import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { renderCategoryIcon } from "@/lib/theme/iconRenderer";
import { playSound, SCRATCH_THEME } from "@/lib/theme/scratch";
import type { BlockCategory, BlockDefinition } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Block } from "./Block";

interface BlockPaletteProps {
  categories: BlockCategory[];
  blocks: BlockDefinition[];
  onBlockClick: (definition: BlockDefinition) => void;
}

export function BlockPalette({ categories, blocks, onBlockClick }: BlockPaletteProps) {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || "");

  const getBlocksByCategory = (categoryId: string) => {
    return blocks.filter((block) => block.category === categoryId);
  };

  const getCategoryColor = (categoryId: string) => {
    const theme = SCRATCH_THEME.colors[categoryId as keyof typeof SCRATCH_THEME.colors];
    return theme?.base || "#666";
  };

  const handleBlockClick = (definition: BlockDefinition) => {
    playSound("click");
    onBlockClick(definition);
  };

  const handleCategoryClick = (categoryId: string) => {
    playSound("click");
    setActiveCategory(categoryId);
  };

  const categoryBlocks = getBlocksByCategory(activeCategory);

  return (
    <div className="flex flex-col h-full bg-slate-100 rounded-2xl overflow-hidden shadow-inner">
      {/* Category tabs - large, touchable buttons */}
      <div className="flex gap-2 p-3 bg-white border-b border-slate-200 overflow-x-auto">
        {categories.map((category) => {
          const isActive = category.id === activeCategory;
          const color = getCategoryColor(category.id);
          return (
            <button
              type="button"
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm whitespace-nowrap",
                "transition-all duration-200",
                isActive
                  ? "text-white shadow-lg scale-105"
                  : "text-slate-600 bg-slate-100 hover:bg-slate-200"
              )}
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${color} 0%, ${color} 100%)`
                  : undefined,
                boxShadow: isActive ? `0 4px 0 ${color}88, 0 6px 20px ${color}44` : undefined,
              }}
            >
              <span className="text-xl inline-block">{renderCategoryIcon(category.id)}</span>
              <span className="hidden sm:inline">{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* Blocks grid */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="grid gap-3">
            {categoryBlocks.map((block) => (
              <button
                type="button"
                key={block.id}
                onClick={() => handleBlockClick(block)}
                onKeyUp={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleBlockClick(block);
                  }
                }}
                className="cursor-pointer transform transition-transform hover:scale-[1.02] active:scale-95 w-full text-left"
                aria-label={`Add ${block.name} block`}
              >
                <Block definition={block} isInPalette={true} />
              </button>
            ))}

            {categoryBlocks.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <div className="text-4xl mb-2">🔍</div>
                <p>No blocks in this category</p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Hint */}
      <div className="p-3 bg-white border-t border-slate-200 text-center">
        <p className="text-xs text-slate-500">👆 Click a block to add it to your program</p>
      </div>
    </div>
  );
}
