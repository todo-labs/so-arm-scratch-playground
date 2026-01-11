import * as React from "react";
import { X, Plus } from "lucide-react";
import { BlockParameterEditor } from "./BlockParameterEditor";
import type { BlockDefinition, BlockInstance } from "@/lib/types";
import { BLOCK_IDS } from "@/lib/blockIds";
import { SCRATCH_THEME } from "@/lib/theme/scratch";
import { cn } from "@/lib/utils";
import { 
  BLOCK_CONSTANTS, 
  getHatBlockPath, 
  getCommandBlockPath, 
  getReporterPath, 
  getBooleanPath 
} from "@/lib/blockShapes";

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
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
  const contentRef = React.useRef<HTMLDivElement>(null);
  
  const isControlBlock = definition.category === "control" && 
    (definition.shape === "hat" || 
     definition.id === BLOCK_IDS.IF_CONDITION || 
     definition.id === BLOCK_IDS.REPEAT ||
     definition.id === BLOCK_IDS.WHILE_LOOP);

  // Check if it's a C-block (has children / loop)
  const isCBlock = isControlBlock && (
    definition.id === BLOCK_IDS.IF_CONDITION || 
    definition.id === BLOCK_IDS.REPEAT ||
    definition.id === BLOCK_IDS.WHILE_LOOP
  );

  // Get theme colors
  const categoryTheme = (SCRATCH_THEME.colors as any)[definition.category] || SCRATCH_THEME.colors.motion;
    
  // Measure content size
  React.useEffect(() => {
    if (contentRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
           const rect = entry.target.getBoundingClientRect();
           setDimensions({ 
             width: Math.ceil(rect.width) + 2, 
             height: Math.ceil(rect.height) 
           });
        }
      });
      
      resizeObserver.observe(contentRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [instance, definition, isCBlock]);

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
  const categoryIcon = SCRATCH_THEME.icons[definition.category as keyof typeof SCRATCH_THEME.icons];

  const renderParameters = () => {
    if (!definition.parameters.length) return null;

    return (
      <div className="flex items-center gap-2 flex-wrap ml-2">
        {definition.parameters.map((param) => (
          <div key={param.name} className="flex items-center gap-1.5 align-middle">
            {!isInPalette && instance ? (
              <BlockParameterEditor
                parameter={param}
                value={instance.parameters[param.name]}
                onChange={(value) => onParameterChange?.(param.name, value)}
              />
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
    <div 
      className={cn(
        "relative select-none text-white font-bold text-sm flex flex-col items-start group",
        isInPalette && "cursor-pointer hover:scale-105 transition-transform duration-200",
        isDragging && "z-50 scale-105 drop-shadow-2xl opacity-90",
        className
      )}
      style={{
        filter: isDragging ? "drop-shadow(0 12px 24px rgba(0,0,0,0.25))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
      }}
    >
        {/* SVG Background Layer */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
           <svg 
             width={dimensions.width || "100%"} 
             height={dimensions.height || "100%"} 
             className="overflow-visible"
           >
              <defs>
                <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={categoryTheme.base} />
                  <stop offset="100%" stopColor={categoryTheme.secondary || categoryTheme.base} />
                </linearGradient>
              </defs>
              <path 
                d={path} 
                fill={`url(#${gradId})`}
                stroke="rgba(0,0,0,0.15)"
                strokeWidth={1}
              />
              <path 
                d={path} 
                fill="none" 
                stroke="rgba(0,0,0,0.2)" 
                strokeWidth={2} 
                transform="translate(0, 1)"
              />
           </svg>
        </div>

        {/* Content Layer */}
        <div 
           ref={contentRef}
           className={cn(
             "relative z-10 flex items-center pr-8 whitespace-nowrap min-h-[48px]", 
             definition.shape === "hat" ? "pt-5 pb-3 pl-4" : "py-3 pl-4", 
             definition.shape === "reporter" || definition.shape === "boolean" ? "py-2 px-6 min-h-[32px]" : ""
           )}
        >
            {/* Block Name & Icon */}
            <span className="mr-2 opacity-100 drop-shadow-sm text-lg select-none filter group-hover:scale-110 transition-transform">{categoryIcon}</span>
            <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)] tracking-wide mr-1 font-bold text-[13px]">{definition.name}</span>
            {renderParameters()}
            
             {/* Delete Button (Contextual) */}
             {!isInPalette && onRemove && (
               <div 
                 className="ml-4 p-1 rounded-full hover:bg-black/10 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                 onClick={(e) => {
                   e.stopPropagation();
                   onRemove();
                 }}
               >
                 <X size={14} className="text-white/80" />
               </div>
             )}
        </div>
        
        {/* C-Block Children Container */}
        {isCBlock && !isInPalette && (
           <div className="flex flex-col w-full relative">
              {/* Indent line/border? For now we just use padding. 
                  In real scratch, the SVG stretches down around this. 
                  Since we are treating C-blocks as Stack blocks for V1, 
                  we render children *underneath* for now, or inside if we change shape. 
                  
                  Wait, if we treat it as stack block, children appear visually BELOW.
                  That's wrong for "If" blocks.
                  
                  Correction: For "If", children must be nested.
                  Since we didn't implement getCBlockPath fully, we'll mimic it 
                  by adding a left border/margin container. 
              */}
              <div className="pl-4 border-l-4 border-l-black/10 ml-4 py-1 min-h-[40px] bg-black/5 rounded-r-lg mt-[-4px] mb-[4px] relative z-0">
                  {renderChildBlocks ? renderChildBlocks() : (
                     instance && onAddChildBlock && (
                        <div 
                           className="h-8 flex items-center text-white/50 text-xs px-2 cursor-pointer hover:bg-white/10 rounded"
                           onClick={(e) => {
                             e.stopPropagation();
                             onAddChildBlock(instance.id);
                           }}
                        >
                           <Plus size={14} className="mr-1"/> Add Code
                        </div>
                     )
                  )}
              </div>
              
              {/* Bottom "End" cap of the C-Block - purely visual closing piece? 
                  In Scratch, "If" has a bottom piece "end". 
                  We can render a small SVG footer here. */}
              <div className="h-4 bg-inherit rounded-b-lg w-[min(100%,_160px)] ml-0 border-t-0 opacity-90 relative z-0 flex items-center justify-center">
                  {/* Footer content if needed */}
                  <svg width="100%" height="16" className="absolute top-0 left-0 overflow-visible">
                     <path d={`M 4 0 L 16 0 L 18 4 L 26 4 L 28 0 L 100 0 ...`} fill={categoryTheme.base} />
                     {/* Simplified footer */}
                     <path 
                       d={`M 14 0 L 18 4 L 26 4 L 30 0 L 100 0 a 4 4 0 0 1 4 4 L 4 4 a 4 4 0 0 1 0 -4 Z`} 
                       fill={categoryTheme.base} 
                       stroke={categoryTheme.shadow}
                     />
                  </svg>
              </div>
           </div>
        )}
    </div>
  );
}
