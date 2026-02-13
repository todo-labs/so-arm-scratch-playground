import { Bot, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BLOCK_IDS } from "@/lib/blockIds";
import { registry } from "@/lib/blockRegistry";
import { playSound, SCRATCH_THEME } from "@/lib/theme/scratch";
import type { BlockDefinition, BlockInstance } from "@/lib/types";
import { Block } from "./Block";
import { ChildBlockSelector } from "./ChildBlockSelector";

interface WorkspaceProps {
  blocks: BlockInstance[];
  onBlockUpdate: (blockId: string, parameterId: string, value: boolean | number | string) => void;
  onBlockRemove: (blockId: string) => void;
  onAddChildBlock: (
    parentId: string,
    definition: BlockDefinition,
    childSlot?: "then" | "else"
  ) => void;
}

export function Workspace({
  blocks,
  onBlockUpdate,
  onBlockRemove,
  onAddChildBlock,
}: WorkspaceProps) {
  const [showChildBlockSelector, setShowChildBlockSelector] = useState<{
    parentId: string;
    parentName: string;
    childSlot: "then" | "else";
  } | null>(null);

  const hasChildrenSlot = (definition: BlockDefinition) =>
    definition.category === "control" && definition.codeTemplate.includes("{{children}}");

  const handleAddChildBlockClick = (parentId: string, childSlot: "then" | "else" = "then") => {
    const parentBlock = blocks.find((b) => b.id === parentId);
    const parentDefinition = parentBlock ? registry.getBlock(parentBlock.definitionId) : null;
    const parentName = `${parentDefinition?.name || "Block"} (${childSlot})`;

    playSound("click");
    setShowChildBlockSelector({ parentId, parentName, childSlot });
  };

  const handleChildBlockSelect = (definition: BlockDefinition) => {
    if (showChildBlockSelector) {
      playSound("snap");
      onAddChildBlock(
        showChildBlockSelector.parentId,
        definition,
        showChildBlockSelector.childSlot
      );
      setShowChildBlockSelector(null);
    }
  };

  const renderChildBlocks = (
    parentId: string,
    parentIndex = 0,
    childSlot: "then" | "else" = "then"
  ) => {
    const childBlocks = blocks.filter((block) => {
      if (block.parentId !== parentId) return false;
      if (childSlot === "else") return block.childSlot === "else";
      return block.childSlot !== "else";
    });

    if (childBlocks.length === 0) {
      return (
        <div
          className="flex items-center justify-center"
          style={{ padding: SCRATCH_THEME.spacing.lg }}
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleAddChildBlockClick(parentId, childSlot)}
            className="text-white/70 hover:text-white hover:bg-white/10 dark:hover:bg-white/15 text-sm font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add blocks here
          </Button>
        </div>
      );
    }

    return (
      <div style={{ padding: SCRATCH_THEME.spacing.sm }}>
        <div style={{ display: "flex", flexDirection: "column", gap: SCRATCH_THEME.spacing.xs }}>
          {childBlocks.map((childBlock, index) => {
            const definition = registry.getBlock(childBlock.definitionId);
            if (!definition) return null;

            return (
              <Block
                key={childBlock.id}
                definition={definition}
                instance={childBlock}
                animationDelay={`${parseInt(SCRATCH_THEME.animation.short, 10) * (index + 1)}ms`}
                indexInStack={parentIndex + index + 1}
                onParameterChange={(parameterId, value) =>
                  onBlockUpdate(childBlock.id, parameterId, value)
                }
                onRemove={() => {
                  playSound("click");
                  onBlockRemove(childBlock.id);
                }}
                onAddChildBlock={handleAddChildBlockClick}
                renderChildBlocks={
                  definition.category === "control" && hasChildrenSlot(definition)
                    ? definition.id === BLOCK_IDS.IF_ELSE
                      ? () => renderIfElseChildren(childBlock.id, parentIndex + index + 1)
                      : () => renderChildBlocks(childBlock.id, parentIndex + index + 1, "then")
                    : undefined
                }
              />
            );
          })}

          <div className="flex justify-center" style={{ paddingTop: SCRATCH_THEME.spacing.sm }}>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleAddChildBlockClick(parentId, childSlot)}
              className="text-white/60 hover:text-white/80 hover:bg-white/10 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add more
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderIfElseChildren = (parentId: string, parentIndex = 0) => {
    return (
      <div className="space-y-2">
        <div className="rounded-md bg-black/10 p-1.5">
          <p className="text-[10px] uppercase tracking-wide text-white/70 px-1">Then</p>
          {renderChildBlocks(parentId, parentIndex, "then")}
        </div>
        <div className="rounded-md bg-black/10 p-1.5">
          <p className="text-[10px] uppercase tracking-wide text-white/70 px-1">Else</p>
          {renderChildBlocks(parentId, parentIndex, "else")}
        </div>
      </div>
    );
  };

  const topLevelBlocks = blocks.filter((block) => !block.parentId);

  return (
    <div style={{ position: "relative", minHeight: "100%", width: "100%" }}>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(${SCRATCH_THEME.spacing.md});
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div className="relative min-h-full w-full bg-slate-50 dark:bg-slate-900">
        {/* Empty state */}
        {topLevelBlocks.length === 0 && (
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <div className="text-center text-slate-400">
              <div className="mb-4 animate-bounce text-slate-500 dark:text-slate-300 flex justify-center">
                <Bot size={64} />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-slate-700 dark:text-slate-100">
                Start Programming!
              </h3>
              <p className="text-lg text-slate-500 dark:text-slate-300">
                Click blocks on the left to add them here
              </p>
            </div>
          </div>
        )}

        {/* Blocks */}
        {topLevelBlocks.length > 0 && (
          <div className="relative z-10" style={{ padding: SCRATCH_THEME.spacing.xxxl }}>
            <div
              className="flex flex-col w-full max-w-2xl"
              style={{ gap: SCRATCH_THEME.spacing.xs }}
            >
              {topLevelBlocks.map((blockInstance, index) => {
                const definition = registry.getBlock(blockInstance.definitionId);
                if (!definition) return null;

                const isControlBlock = hasChildrenSlot(definition);

                return (
                  <Block
                    key={blockInstance.id}
                    definition={definition}
                    instance={blockInstance}
                    animationDelay={`${parseInt(SCRATCH_THEME.animation.short, 10) * index}ms`}
                    indexInStack={index}
                    onParameterChange={(parameterId, value) =>
                      onBlockUpdate(blockInstance.id, parameterId, value)
                    }
                    onRemove={() => {
                      playSound("click");
                      onBlockRemove(blockInstance.id);
                    }}
                    onAddChildBlock={handleAddChildBlockClick}
                    renderChildBlocks={
                      isControlBlock
                        ? definition.id === BLOCK_IDS.IF_ELSE
                          ? () => renderIfElseChildren(blockInstance.id, index)
                          : () => renderChildBlocks(blockInstance.id, index, "then")
                        : undefined
                    }
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Child Block Selector Modal */}
      {showChildBlockSelector && (
        <ChildBlockSelector
          categories={registry.getAllCategories()}
          blocks={registry.getAllBlocks()}
          onBlockSelect={handleChildBlockSelect}
          onClose={() => setShowChildBlockSelector(null)}
          parentBlockName={showChildBlockSelector.parentName}
        />
      )}
    </div>
  );
}
