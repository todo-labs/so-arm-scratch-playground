import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  const [isExpanded, setIsExpanded] = useState(true);

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

  if (!isExpanded) {
    return (
      <div className="bg-white border-b border-slate-200 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {categories.map((category) => {
              const isActive = category.id === selectedCategory;
              const color = getCategoryColor(category.id);

              return (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm",
                    "transition-all duration-200",
                    isActive
                      ? "text-white shadow-md"
                      : "text-slate-600 bg-slate-100 hover:bg-slate-200"
                  )}
                  style={{
                    background: isActive ? color : undefined,
                  }}
                >
                  <span className="text-lg inline-block">{renderCategoryIcon(category.id)}</span>
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              playSound("click");
              setIsExpanded(true);
            }}
            className="flex items-center gap-1 text-slate-500"
          >
            <span className="text-xs">Show Blocks</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-slate-200">
      {/* Category Tabs */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
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
                    : "text-slate-600 bg-slate-100 hover:bg-slate-200"
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            playSound("click");
            setIsExpanded(false);
          }}
          className="flex items-center gap-1 text-slate-500 flex-shrink-0"
        >
          <span className="text-xs">Hide Blocks</span>
          <ChevronUp className="h-4 w-4" />
        </Button>
      </div>

      {/* Horizontal Scrolling Blocks */}
      <div className="p-4 bg-slate-50/50">
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-2">
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
                className="cursor-pointer hover:scale-105 active:scale-95 transition-transform flex-shrink-0 w-full text-left"
                aria-label={`Add ${block.name} block`}
              >
                <Block definition={block} isInPalette={true} />
              </button>
            ))}
            {selectedCategoryBlocks.length === 0 && (
              <div className="text-slate-400 text-sm py-4 flex items-center gap-2">
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
