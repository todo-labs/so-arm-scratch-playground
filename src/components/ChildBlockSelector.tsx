import { Plus, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { renderCategoryIcon } from "@/lib/theme/iconRenderer";
import type { BlockCategory, BlockDefinition } from "@/lib/types";
import { Block } from "./Block";

interface ChildBlockSelectorProps {
  categories: BlockCategory[];
  blocks: BlockDefinition[];
  onBlockSelect: (definition: BlockDefinition) => void;
  onClose: () => void;
  parentBlockName: string;
}

export function ChildBlockSelector({
  categories,
  blocks,
  onBlockSelect,
  onClose,
  parentBlockName,
}: ChildBlockSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("motion");

  // Filter blocks that can be children (typically command blocks)
  const getChildCompatibleBlocks = (categoryId: string) => {
    return blocks.filter(
      (block) =>
        block.category === categoryId && (block.shape === "command" || block.shape === "hat")
    );
  };

  const selectedCategoryBlocks = getChildCompatibleBlocks(selectedCategory);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-[84vw] max-w-3xl h-[72vh] bg-white shadow-xl">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Add Block to {parentBlockName}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex h-[calc(72vh-64px)]">
          {/* Category Sidebar */}
          <div className="w-32 border-r bg-gray-50">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-2">
                {categories.map((category) => {
                  const categoryBlocks = getChildCompatibleBlocks(category.id);
                  if (categoryBlocks.length === 0) return null;

                  return (
                    <button
                      type="button"
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full p-2 rounded text-xs flex flex-col items-center gap-1 transition-colors ${
                        selectedCategory === category.id
                          ? "bg-blue-100 text-blue-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-sm inline-block">
                        {renderCategoryIcon(category.id)}
                      </span>
                      <span className="text-center leading-tight">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Block List */}
          <div className="flex-1">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-2">
                {selectedCategoryBlocks.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No blocks available</p>
                  </div>
                ) : (
                  selectedCategoryBlocks.map((block) => (
                    <button
                      type="button"
                      key={block.id}
                      onClick={() => onBlockSelect(block)}
                      onKeyUp={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          onBlockSelect(block);
                        }
                      }}
                      className="cursor-pointer hover:scale-105 transition-transform w-full text-left"
                      aria-label={`Add ${block.name} block`}
                    >
                      <Block definition={block} isInPalette={true} />
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </Card>
    </div>
  );
}
