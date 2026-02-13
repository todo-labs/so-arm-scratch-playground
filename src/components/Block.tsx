import { Plus, X } from "lucide-react";
import * as React from "react";
import { BLOCK_IDS } from "@/lib/blockIds";
import {
  BLOCK_CONSTANTS,
  getBooleanPath,
  getCommandBlockPath,
  getHatBlockPath,
  getReporterPath,
} from "@/lib/blockShapes";
import { clampMoveJointAngle, getMoveJointLimits } from "@/lib/jointLimits";
import { renderCategoryIcon } from "@/lib/theme/iconRenderer";
import { SCRATCH_THEME } from "@/lib/theme/scratch";
import type { BlockDefinition, BlockInstance } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BlockParameterEditor } from "./BlockParameterEditor";

type CategoryTheme = {
  base: string;
  gradient: string;
  shadow: string;
  text: string;
  secondary: string;
};

function hasChildrenSlot(definition: BlockDefinition): boolean {
  return definition.codeTemplate.includes("{{children}}");
}

function getCategoryTheme(category: string): CategoryTheme {
  const theme = SCRATCH_THEME.colors[category as keyof typeof SCRATCH_THEME.colors];
  return theme || SCRATCH_THEME.colors.motion;
}

interface BlockProps {
  definition: BlockDefinition;
  instance?: BlockInstance;
  isInPalette?: boolean;
  onParameterChange?: (parameterId: string, value: boolean | number | string) => void;
  onRemove?: () => void;
  onAddChildBlock?: (parentId: string) => void;
  renderChildBlocks?: () => React.ReactNode;
  className?: string;
  isDragging?: boolean;
  animationDelay?: string;
  indexInStack?: number;
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
  animationDelay,
  indexInStack = 0,
}: BlockProps) {
  const calculatedDelay = animationDelay
    ? animationDelay
    : !isInPalette && indexInStack > 0
      ? `${parseInt(SCRATCH_THEME.animation.short, 10) * Math.min(indexInStack, 4)}ms`
      : SCRATCH_THEME.animation.none;
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
  const contentRef = React.useRef<HTMLDivElement>(null);

  const isControlBlock =
    definition.category === "control" &&
    (definition.shape === "hat" ||
      definition.id === BLOCK_IDS.IF_CONDITION ||
      definition.id === BLOCK_IDS.IF_ELSE ||
      definition.id === BLOCK_IDS.REPEAT ||
      definition.id === BLOCK_IDS.WHILE_LOOP ||
      definition.id === BLOCK_IDS.FOREVER);

  // Check if it's a C-block (has children / loop)
  const isCBlock = isControlBlock && hasChildrenSlot(definition);

  const categoryTheme = getCategoryTheme(definition.category);

  React.useEffect(() => {
    if (!instance || !onParameterChange || definition.id !== BLOCK_IDS.MOVE_TO) {
      return;
    }

    const joint =
      typeof instance.parameters.joint === "string"
        ? instance.parameters.joint
        : String(instance.parameters.joint ?? "base");
    const angle = Number(instance.parameters.angle);
    if (Number.isNaN(angle)) return;

    const boundedAngle = clampMoveJointAngle(joint, angle);
    if (boundedAngle !== angle) {
      onParameterChange("angle", boundedAngle);
    }
  }, [definition.id, instance, onParameterChange]);

  // Measure content size
  React.useEffect(() => {
    if (contentRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const rect = entry.target.getBoundingClientRect();
          setDimensions({
            width: Math.ceil(rect.width) + 2,
            height: Math.ceil(rect.height),
          });
        }
      });

      resizeObserver.observe(contentRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  // Generate SVG Path
  const path = React.useMemo(() => {
    // Default dimensions if measuring not done yet
    const width = Math.max(dimensions.width || 120, BLOCK_CONSTANTS.MIN_WIDTH);
    const height = Math.max(dimensions.height || 48, BLOCK_CONSTANTS.MIN_HEIGHT);

    if (definition.shape === "hat") {
      return getHatBlockPath(width, height, true);
    } else if (definition.shape === "cap") {
      return getCommandBlockPath(width, height, true, false);
    } else if (definition.shape === "reporter") {
      return getReporterPath(width, height);
    } else if (definition.shape === "boolean") {
      return getBooleanPath(width, height);
    } else if (isCBlock && !isInPalette) {
      return getCommandBlockPath(width, height, true, true);
    } else {
      // Standard Command Stack Block
      return getCommandBlockPath(width, height, true, true);
    }
  }, [definition.shape, dimensions, isCBlock, isInPalette]);

  // Icon
  const categoryIcon = renderCategoryIcon(definition.category);

  const renderParameters = () => {
    if (!definition.parameters.length) return null;

    return (
      <div className="flex items-center gap-2 flex-wrap ml-2">
        {definition.parameters.map((param) => (
          <div key={param.name} className="flex items-center gap-1.5 align-middle">
            {!isInPalette && instance ? (
              (() => {
                const isMoveAngleParam =
                  definition.id === BLOCK_IDS.MOVE_TO && param.name === "angle";
                const selectedJoint =
                  typeof instance.parameters.joint === "string"
                    ? instance.parameters.joint
                    : String(instance.parameters.joint ?? "base");
                const limits = isMoveAngleParam ? getMoveJointLimits(selectedJoint) : undefined;

                return (
                  <BlockParameterEditor
                    parameter={param}
                    value={instance.parameters[param.name]}
                    min={limits?.min}
                    max={limits?.max}
                    onChange={(value) => {
                      if (isMoveAngleParam && typeof value === "number") {
                        onParameterChange?.(param.name, clampMoveJointAngle(selectedJoint, value));
                        return;
                      }
                      onParameterChange?.(param.name, value);
                    }}
                  />
                );
              })()
            ) : (
              <span className="bg-white text-slate-900 px-3 py-1 rounded-full text-[11px] font-bold shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] border border-black/10 opacity-100 min-w-[32px] text-center h-6 flex items-center justify-center">
                {param.defaultValue?.toString() || param.name}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Unique ID for SVG definitions
  const blockId = React.useId().replace(/:/g, "-");
  const gradId = `grad-${blockId}-${definition.category}`;

  return (
    <fieldset
      aria-label={definition.name}
      className={cn(
        "relative select-none text-white font-bold text-sm flex flex-col items-start group",
        isInPalette && "cursor-pointer",
        isDragging && "z-50 scale-105 drop-shadow-2xl opacity-90",
        className
      )}
      style={{
        transform: isDragging ? "scale(1.05)" : "",
        filter: isDragging ? `drop-shadow(${SCRATCH_THEME.shadow.xl})` : "",
        boxShadow: isInPalette && !isDragging ? SCRATCH_THEME.shadow.md : "",
        animationDelay: calculatedDelay,
        transition: isDragging
          ? ""
          : `transform ${SCRATCH_THEME.animation.fast} ${SCRATCH_THEME.animation.easeOut}, box-shadow ${SCRATCH_THEME.animation.fast} ${SCRATCH_THEME.animation.easeOut}, filter ${SCRATCH_THEME.animation.fast} ${SCRATCH_THEME.animation.easeOut}`,
        animation: `fadeIn ${SCRATCH_THEME.animation.normal} ${SCRATCH_THEME.animation.easeOut} ${calculatedDelay} both`,
      }}
    >
      {/* SVG Background Layer */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <svg
          role="img"
          aria-label={`${definition.name} block background`}
          width={dimensions.width || "100%"}
          height={dimensions.height || "100%"}
          className="overflow-visible"
        >
          <title>{`${definition.name} block background`}</title>
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={categoryTheme.base} stopOpacity="1" />
              <stop
                offset="50%"
                stopColor={categoryTheme.secondary || categoryTheme.base}
                stopOpacity="0.95"
              />
              <stop
                offset="100%"
                stopColor={categoryTheme.secondary || categoryTheme.base}
                stopOpacity="1"
              />
            </linearGradient>
            <filter id={`glow-${blockId}`}>
              <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d={path}
            fill={`url(#${gradId})`}
            stroke="rgba(0,0,0,0.12)"
            strokeWidth={1.2}
            style={{
              filter: isInPalette ? `url(#glow-${blockId})` : undefined,
            }}
          />
          <path
            d={path}
            fill="none"
            stroke="rgba(0,0,0,0.18)"
            strokeWidth={1}
            strokeLinejoin="round"
            strokeMiterlimit="2"
            transform="translate(0, 0.5)"
          />
        </svg>
      </div>

      {/* Content Layer */}
      <div
        ref={contentRef}
        className={cn(
          "relative z-10 flex items-center pr-8 whitespace-nowrap min-h-[48px]",
          definition.shape === "hat" ? "pt-5 pb-3 pl-4" : "py-3 pl-4",
          definition.shape === "reporter" || definition.shape === "boolean"
            ? "py-2 px-6 min-h-[32px]"
            : ""
        )}
      >
        {/* Block Name & Icon */}
        <span
          className="mr-2 opacity-100 drop-shadow-sm text-lg select-none inline-flex items-center justify-center transition-transform duration-150"
          style={{
            transformOrigin: "center",
          }}
        >
          <span
            className="group-hover:scale-125 group-hover:rotate-6 transition-transform duration-200"
            style={{
              transitionTimingFunction: SCRATCH_THEME.animation.easeOut,
            }}
          >
            {categoryIcon}
          </span>
        </span>
        <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)] tracking-wide mr-1 font-bold text-[13px]">
          {definition.name}
        </span>
        {renderParameters()}

        {/* Delete Button (Contextual) */}
        {!isInPalette && onRemove && (
          <button
            type="button"
            aria-label="Delete block"
            className="ml-4 p-1.5 rounded-full hover:bg-black/10 cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            onKeyUp={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                onRemove();
              }
            }}
            style={{
              transitionTimingFunction: SCRATCH_THEME.animation.ease,
            }}
          >
            <X
              size={14}
              className="text-white/80 transition-transform hover:rotate-90 duration-200"
              style={{
                transitionTimingFunction: SCRATCH_THEME.animation.easeOut,
              }}
            />
          </button>
        )}
      </div>

      {/* C-Block Children Container */}
      {isCBlock && !isInPalette && (
        <div className="flex flex-col w-full relative">
          <div
            className="pl-4 border-l-4 ml-4 py-1.5 min-h-[40px] rounded-r-lg mt-[-4px] mb-[4px] relative z-0 transition-all duration-200"
            style={{
              borderLeftColor: categoryTheme.base,
              backgroundColor: `rgba(0, 0, 0, 0.04)`,
              transitionTimingFunction: SCRATCH_THEME.animation.ease,
            }}
          >
            {renderChildBlocks
              ? renderChildBlocks()
              : instance &&
                onAddChildBlock && (
                  <button
                    type="button"
                    aria-label={`Add code to ${instance.id}`}
                    className="h-8 flex items-center text-white/50 text-xs px-2 cursor-pointer hover:bg-white/10 rounded transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddChildBlock(instance.id);
                    }}
                    onKeyUp={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        onAddChildBlock(instance.id);
                      }
                    }}
                    style={{
                      transitionTimingFunction: SCRATCH_THEME.animation.ease,
                    }}
                  >
                    <Plus
                      size={14}
                      className="mr-1.5 transition-transform hover:scale-110 duration-200"
                      style={{
                        transitionTimingFunction: SCRATCH_THEME.animation.easeOut,
                      }}
                    />
                    <span className="font-medium">Add Code</span>
                  </button>
                )}
          </div>

          <div
            className="h-4 rounded-b-lg w-[min(100%,_160px)] ml-0 opacity-90 relative z-0 flex items-center justify-center transition-all duration-200"
            style={{
              backgroundColor: categoryTheme.base,
              transitionTimingFunction: SCRATCH_THEME.animation.ease,
            }}
          >
            <svg
              role="img"
              aria-label="Block decorative element"
              width="100%"
              height="16"
              className="absolute top-0 left-0 overflow-visible"
            >
              <title>Block decorative element</title>
              <path
                d={`M 14 0 L 18 4 L 26 4 L 30 0 L 100 0 a 4 4 0 0 1 4 4 L 4 4 a 4 4 0 0 1 0 -4 Z`}
                fill={categoryTheme.secondary || categoryTheme.base}
                stroke={categoryTheme.base}
                strokeWidth={1}
              />
            </svg>
          </div>
        </div>
      )}
    </fieldset>
  );
}
