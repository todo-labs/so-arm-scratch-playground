import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { renderCategoryIcon } from "@/lib/theme/iconRenderer";
import { playSound, SCRATCH_THEME } from "@/lib/theme/scratch";

import type { BlockCategory, BlockDefinition } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Block } from "./Block";

interface HorizontalBlockPaletteProps {
  categories: BlockCategory[];
  blocks: BlockDefinition[];
  onBlockClick: (definition: BlockDefinition) => void;
}

export function HorizontalBlockPalette({
  categories,
  blocks,
  onBlockClick,
}: HorizontalBlockPaletteProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id || "");

  const getBlocksByCategory = (categoryId: string) => {
    return blocks.filter((block) => block.category === categoryId);
  };

  const getCategoryColor = (categoryId: string) => {
    const theme = SCRATCH_THEME.colors[categoryId as keyof typeof SCRATCH_THEME.colors];
    return theme?.base || "#666";
  };

  const handleCategoryClick = (categoryId: string) => {
    playSound("click");
    setSelectedCategory(categoryId);
  };

  const handleBlockClick = (definition: BlockDefinition) => {
    playSound("snap");
    onBlockClick(definition);
  };

  const selectedCategoryBlocks = getBlocksByCategory(selectedCategory);

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3 overflow-x-auto">
          {categories.map((category) => {
            const isActive = category.id === selectedCategory;
            const color = getCategoryColor(category.id);

            return (
              <button
                type="button"
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap",
                  "transition-all duration-200",
                  isActive
                    ? "text-white shadow-lg scale-105"
                    : "text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${color} 0%, ${color} 100%)`
                    : undefined,
                  boxShadow: isActive ? `0 4px 0 ${color}88, 0 6px 16px ${color}33` : undefined,
                }}
              >
                <span className="text-xl inline-block">{renderCategoryIcon(category.id)}</span>
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3 bg-slate-50/50 dark:bg-slate-800/50">
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {selectedCategoryBlocks.map((block) => (
              <button
                type="button"
                key={block.id}
                onClick={() => handleBlockClick(block)}
                onKeyUp={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleBlockClick(block);
                  }
                }}
                className="cursor-pointer active:scale-95 flex-shrink-0 text-left"
                aria-label={`Add ${block.name} block`}
              >
                <Block definition={block} isInPalette={true} />
              </button>
            ))}
            {selectedCategoryBlocks.length === 0 && (
              <div className="text-slate-400 dark:text-slate-500 text-sm py-4 flex items-center gap-2">
                <span className="text-2xl">🔍</span>
                No blocks available in this category
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
