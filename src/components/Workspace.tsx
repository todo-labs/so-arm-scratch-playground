import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Bot, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BLOCK_IDS } from "@/lib/blockIds";
import { registry } from "@/lib/blockRegistry";
import { playSound, SCRATCH_THEME } from "@/lib/theme/scratch";
import type { BlockDefinition, BlockInstance } from "@/lib/types";
import { Block } from "./Block";
import { ChildBlockSelector } from "./ChildBlockSelector";
import { DraggableBlock } from "./DraggableBlock";
import { DroppableZone } from "./DroppableZone";

interface WorkspaceProps {
  blocks: BlockInstance[];
  onBlockUpdate: (blockId: string, parameterId: string, value: boolean | number | string) => void;
  onBlockRemove: (blockId: string) => void;
  onAddChildBlock: (parentId: string, definition: BlockDefinition) => void;
  onBlockAdd?: (definition: BlockDefinition) => void;
  onBlockReorder?: (activeId: string, overId: string) => void;
}

export function Workspace({
  blocks,
  onBlockUpdate,
  onBlockRemove,
  onAddChildBlock,
  onBlockReorder,
}: WorkspaceProps) {
  const [showChildBlockSelector, setShowChildBlockSelector] = useState<{
    parentId: string;
    parentName: string;
  } | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    playSound("click");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id && onBlockReorder) {
      playSound("snap");
      onBlockReorder(active.id as string, over.id as string);
    } else {
      playSound("drop");
    }
  };

  const handleAddChildBlockClick = (parentId: string) => {
    const parentBlock = blocks.find((b) => b.id === parentId);
    const parentDefinition = parentBlock ? registry.getBlock(parentBlock.definitionId) : null;
    const parentName = parentDefinition?.name || "Block";

    playSound("click");
    setShowChildBlockSelector({ parentId, parentName });
  };

  const handleChildBlockSelect = (definition: BlockDefinition) => {
    if (showChildBlockSelector) {
      playSound("snap");
      onAddChildBlock(showChildBlockSelector.parentId, definition);
      setShowChildBlockSelector(null);
    }
  };

  const renderChildBlocks = (parentId: string, parentIndex = 0) => {
    const childBlocks = blocks.filter((block) => block.parentId === parentId);

    if (childBlocks.length === 0) {
      return (
        <div
          className="flex items-center justify-center"
          style={{ padding: SCRATCH_THEME.spacing.lg }}
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleAddChildBlockClick(parentId)}
            className="text-white/70 hover:text-white hover:bg-white/10 text-sm font-medium"
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
              <DraggableBlock key={childBlock.id} id={childBlock.id}>
                <Block
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
                    definition.category === "control"
                      ? () => renderChildBlocks(childBlock.id, parentIndex + index + 1)
                      : undefined
                  }
                />
              </DraggableBlock>
            );
          })}

          <div className="flex justify-center" style={{ paddingTop: SCRATCH_THEME.spacing.sm }}>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleAddChildBlockClick(parentId)}
              className="text-white/50 hover:text-white/70 hover:bg-white/5 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add more
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Get only top-level blocks (no parent)
  const topLevelBlocks = blocks.filter((block) => !block.parentId);

  // Get the active block for drag overlay
  const activeBlock = activeId ? blocks.find((b) => b.id === activeId) : null;
  const activeDefinition = activeBlock ? registry.getBlock(activeBlock.definitionId) : null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
        <div
          className="relative min-h-full w-full"
          style={{
            backgroundColor: SCRATCH_THEME.workspace.backgroundColor,
          }}
        >
          {/* Grid background - subtle dot pattern with grid lines */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at center, ${SCRATCH_THEME.workspace.gridColor} 1px, transparent 1px),
                linear-gradient(${SCRATCH_THEME.workspace.gridColor} 1px, transparent 1px),
                linear-gradient(90deg, ${SCRATCH_THEME.workspace.gridColor} 1px, transparent 1px)
              `,
              backgroundSize: `${SCRATCH_THEME.workspace.gridSize}px ${SCRATCH_THEME.workspace.gridSize}px`,
              backgroundPosition: "center center",
            }}
          />

          {/* Empty state */}
          {topLevelBlocks.length === 0 && (
            <DroppableZone id="workspace-drop" className="absolute inset-4 border-4" placeholder="">
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <div className="text-center text-slate-400">
                  <div className="mb-4 animate-bounce text-slate-500">
                    <Bot size={64} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-slate-600">Start Programming!</h3>
                  <p className="text-lg">Click blocks on the left to add them here</p>
                </div>
              </div>
            </DroppableZone>
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

                  const isControlBlock =
                    definition.category === "control" &&
                    (definition.id === BLOCK_IDS.REPEAT ||
                      definition.id === BLOCK_IDS.IF_CONDITION ||
                      definition.id === BLOCK_IDS.WHILE_LOOP);

                  return (
                    <DraggableBlock key={blockInstance.id} id={blockInstance.id}>
                      <Block
                        definition={definition}
                        instance={blockInstance}
                        isDragging={activeId === blockInstance.id}
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
                            ? () => renderChildBlocks(blockInstance.id, index)
                            : undefined
                        }
                      />
                    </DraggableBlock>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeBlock && activeDefinition && (
            <Block definition={activeDefinition} instance={activeBlock} isDragging={true} />
          )}
        </DragOverlay>

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
    </DndContext>
  );
}
