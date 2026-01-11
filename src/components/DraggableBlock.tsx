import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";

interface DraggableBlockProps {
  id: string;
  children: ReactNode;
  data?: Record<string, unknown>;
  disabled?: boolean;
}

export function DraggableBlock({
  id,
  children,
  data,
  disabled = false,
}: DraggableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data,
      disabled,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.8 : 1,
    cursor: isDragging ? "grabbing" : "grab",
    zIndex: isDragging ? 1000 : "auto",
    transition: isDragging ? "none" : "transform 200ms ease",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
}
