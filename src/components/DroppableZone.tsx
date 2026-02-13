import { useDroppable } from "@dnd-kit/core";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DroppableZoneProps {
  id: string;
  children?: ReactNode;
  className?: string;
  placeholder?: string;
}

export function DroppableZone({
  id,
  children,
  className,
  placeholder = "Drop blocks here",
}: DroppableZoneProps) {
  const { isOver, setNodeRef, active } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative min-h-[80px] rounded-xl border-2 border-dashed transition-all duration-200",
        isOver
          ? "border-blue-400 bg-blue-50 dark:bg-blue-950/30 scale-[1.02] shadow-lg"
          : "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50",
        active &&
          !isOver &&
          "border-slate-400 dark:border-slate-500 bg-slate-100 dark:bg-slate-700/50",
        className
      )}
    >
      {/* Glow effect when hovering */}
      {isOver && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-blue-200/30 dark:from-blue-700/20 to-transparent pointer-events-none" />
      )}

      {children || (
        <div className="flex items-center justify-center h-full min-h-[80px] text-slate-400 dark:text-slate-500">
          <div className="text-center">
            <div className="text-3xl mb-2">📦</div>
            <p className="text-sm font-medium">{placeholder}</p>
          </div>
        </div>
      )}
    </div>
  );
}
