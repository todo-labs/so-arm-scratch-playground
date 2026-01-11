import type React from "react";
import { X, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BlockParameterEditor } from "./BlockParameterEditor";
import type { BlockDefinition, BlockInstance } from "@/lib/types";
import { BLOCK_IDS } from "@/lib/blockIds";
import { SCRATCH_THEME, playSound } from "@/lib/theme/scratch";
import { cn } from "@/lib/utils";

interface BlockProps {
  definition: BlockDefinition;
  instance?: BlockInstance;
  isInPalette?: boolean;
  onParameterChange?: (
    parameterId: string,
    value: boolean | number | string
  ) => void;
  onRemove?: () => void;
  onAddChildBlock?: (parentId: string) => void;
  renderChildBlocks?: () => React.ReactNode;
  className?: string;
  isDragging?: boolean;
}

export function Block({
  definition,
  instance,
  isInPalette = false,
  onParameterChange,
  onRemove,
  onAddChildBlock,
  renderChildBlocks,
  className = "",
  isDragging = false,
}: BlockProps) {
  const isControlBlock =
    definition.category === "control" &&
    (definition.id === BLOCK_IDS.REPEAT || definition.id === BLOCK_IDS.IF_CONDITION);

  // Get theme colors for this category
  const categoryTheme =
    SCRATCH_THEME.colors[definition.category as keyof typeof SCRATCH_THEME.colors] ||
    SCRATCH_THEME.colors.motion;

  const categoryIcon =
    SCRATCH_THEME.icons[definition.category as keyof typeof SCRATCH_THEME.icons] || "⚡";

  const handleClick = () => {
    if (isInPalette) {
      playSound("click");
    }
  };

  // Scratch-style puzzle notch SVG path
  const renderTopNotch = () => (
    <svg
      className="absolute -top-[6px] left-6"
      width="20"
      height="6"
      viewBox="0 0 20 6"
      fill={categoryTheme.base}
    >
      <path d="M0 6 L4 6 L6 0 L14 0 L16 6 L20 6" />
    </svg>
  );

  const renderBottomNotch = () => (
    <svg
      className="absolute -bottom-[6px] left-6"
      width="20"
      height="6"
      viewBox="0 0 20 6"
      fill={categoryTheme.base}
    >
      <path d="M0 0 L4 0 L6 6 L14 6 L16 0 L20 0" />
    </svg>
  );

  const renderParameters = () => {
    if (!definition.parameters.length) return null;

    return (
      <div className="flex items-center gap-2 flex-wrap">
        {definition.parameters.map((param, index) => (
          <div key={param.name} className="flex items-center gap-1.5">
            {index > 0 && (
              <span className="text-white/90 text-xs font-bold uppercase tracking-wide">
                {param.name}
              </span>
            )}
            {!isInPalette && instance && (
              <BlockParameterEditor
                parameter={param}
                value={instance.parameters[param.name]}
                onChange={(value) => onParameterChange?.(param.name, value)}
              />
            )}
            {isInPalette && (
              <span className="bg-white/90 text-slate-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-white/50">
                {param.defaultValue?.toString() || param.name}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderBlockContent = () => (
    <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
      {/* Large category icon */}
      <span className="text-2xl flex-shrink-0 drop-shadow-sm">
        {categoryIcon}
      </span>

      {/* Block name */}
      <span className="font-bold text-sm text-white tracking-wide drop-shadow-sm">
        {definition.name}
      </span>

      {/* Parameters */}
      {renderParameters()}
    </div>
  );

  const renderControlBlockStructure = () => {
    if (!isControlBlock || isInPalette) {
      return (
        <div className="p-3 text-white relative">
          {/* Top notch */}
          {(definition.shape === "command" || definition.shape === "cap") &&
            renderTopNotch()}

          <div className="flex items-center justify-between gap-2">
            {renderBlockContent()}

            {!isInPalette && onRemove && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  playSound("click");
                  onRemove();
                }}
                className="h-7 w-7 p-0 text-white/80 hover:text-white hover:bg-white/20 rounded-full flex-shrink-0"
                title="Remove block"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Bottom notch */}
          {(definition.shape === "command" || definition.shape === "hat") &&
            !isControlBlock &&
            renderBottomNotch()}
        </div>
      );
    }

    // Control block with C-shape
    return (
      <div className="text-white relative">
        {renderTopNotch()}

        {/* Header */}
        <div className="p-3 pb-2">
          <div className="flex items-center justify-between gap-2">
            {renderBlockContent()}

            {onRemove && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  playSound("click");
                  onRemove();
                }}
                className="h-7 w-7 p-0 text-white/80 hover:text-white hover:bg-white/20 rounded-full flex-shrink-0"
                title="Remove block"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Child blocks area - C-shape indent */}
        <div className="ml-4 mr-3 mb-2">
          <div
            className="rounded-xl border-2 border-white/20 min-h-[60px] bg-black/10"
          >
            {renderChildBlocks && renderChildBlocks()}

            {!renderChildBlocks && instance && onAddChildBlock && (
              <div className="p-4 flex items-center justify-center">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    playSound("click");
                    onAddChildBlock(instance.id);
                  }}
                  className="text-white/70 hover:text-white hover:bg-white/10 text-sm font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add blocks here
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="h-3 mx-3 mb-3 rounded-b-lg"
          style={{ background: categoryTheme.base }}
        />

        {renderBottomNotch()}
      </div>
    );
  };

  return (
    <div className="flex items-start gap-2 w-full" onClick={handleClick}>
      <Card
        className={cn(
          "relative select-none border-0 w-fit max-w-full",
          "rounded-xl overflow-visible",
          isInPalette && "cursor-pointer",
          isInPalette && "hover:scale-105 hover:-translate-y-0.5",
          isDragging && "scale-105 rotate-2 shadow-2xl",
          isControlBlock && !isInPalette && "min-w-[280px]",
          className
        )}
        style={{
          background: categoryTheme.gradient,
          boxShadow: isDragging
            ? `${categoryTheme.shadow}, 0 20px 40px rgba(0,0,0,0.3)`
            : `${categoryTheme.shadow}, 0 2px 8px rgba(0,0,0,0.15)`,
          transition: "all 200ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        }}
      >
        {renderControlBlockStructure()}
      </Card>
    </div>
  );
}
