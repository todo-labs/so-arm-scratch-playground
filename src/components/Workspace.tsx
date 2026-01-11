import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";

import { Block } from "./Block";
import { ChildBlockSelector } from "./ChildBlockSelector";
import { DroppableZone } from "./DroppableZone";
import { DraggableBlock } from "./DraggableBlock";
import { Button } from "@/components/ui/button";
import type { BlockInstance, BlockDefinition } from "@/lib/types";
import { registry } from "@/lib/blockRegistry";
import { playSound } from "@/lib/theme/scratch";
import { SCRATCH_THEME } from "@/lib/theme/scratch";
import { BLOCK_IDS } from "@/lib/blockIds";

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
    const parentDefinition = parentBlock
      ? registry.getBlock(parentBlock.definitionId)
      : null;
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

  const renderChildBlocks = (parentId: string) => {
    const childBlocks = blocks.filter((block) => block.parentId === parentId);

    if (childBlocks.length === 0) {
      return (
        <div className="p-4 flex items-center justify-center">
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
      <div className="p-2 space-y-1">
        {childBlocks.map((childBlock) => {
          const definition = registry.getBlock(childBlock.definitionId);
          if (!definition) return null;

          return (
            <DraggableBlock key={childBlock.id} id={childBlock.id}>
              <Block
                definition={definition}
                instance={childBlock}
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
                    ? () => renderChildBlocks(childBlock.id)
                    : undefined
                }
              />
            </DraggableBlock>
          );
        })}

        <div className="flex justify-center pt-2">
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
    );
  };

  // Get only top-level blocks (no parent)
  const topLevelBlocks = blocks.filter((block) => !block.parentId);

  // Get the active block for drag overlay
  const activeBlock = activeId
    ? blocks.find((b) => b.id === activeId)
    : null;
  const activeDefinition = activeBlock
    ? registry.getBlock(activeBlock.definitionId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className="relative min-h-full w-full"
        style={{
          backgroundColor: SCRATCH_THEME.workspace.backgroundColor,
        }}
      >
        {/* Grid background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(${SCRATCH_THEME.workspace.gridColor} 1px, transparent 1px),
              linear-gradient(90deg, ${SCRATCH_THEME.workspace.gridColor} 1px, transparent 1px)
            `,
            backgroundSize: `${SCRATCH_THEME.workspace.gridSize}px ${SCRATCH_THEME.workspace.gridSize}px`,
          }}
        />

        {/* Empty state */}
        {topLevelBlocks.length === 0 && (
          <DroppableZone
            id="workspace-drop"
            className="absolute inset-4 border-4"
            placeholder=""
          >
            <div className="flex items-center justify-center h-full min-h-[300px]">
              <div className="text-center text-slate-400">
                <div className="text-7xl mb-4 animate-bounce">🤖</div>
                <h3 className="text-2xl font-bold mb-2 text-slate-600">
                  Start Programming!
                </h3>
                <p className="text-lg">
                  Click blocks on the left to add them here
                </p>
              </div>
            </div>
          </DroppableZone>
        )}

        {/* Blocks */}
        {topLevelBlocks.length > 0 && (
          <div className="p-8 relative z-10">
            <div className="flex flex-col gap-2 w-full max-w-2xl">
              {topLevelBlocks.map((blockInstance) => {
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
                          ? () => renderChildBlocks(blockInstance.id)
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
          <Block
            definition={activeDefinition}
            instance={activeBlock}
            isDragging={true}
          />
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
    </DndContext>
  );
}
