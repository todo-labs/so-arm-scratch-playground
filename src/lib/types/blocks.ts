export interface BlockParameter {
  name: string;
  type: "number" | "string" | "dropdown" | "boolean" | "angle";
  defaultValue: boolean | number | string;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export interface BlockDefinition {
  id: string;
  category:
    | "motion"
    | "control"
    | "sensing"
    | "operators"
    | "variables"
    | "custom"
    | "gripper";
  name: string;
  description?: string;
  color: string;
  shape: "command" | "reporter" | "boolean" | "hat" | "cap";
  parameters: BlockParameter[];
  codeTemplate: string;
  icon?: string;
}

export interface BlockInstance {
  id: string;
  definitionId: string;
  x: number;
  y: number;
  parameters: Record<string, boolean | number | string>;
  children: BlockInstance[];
  parentId?: string;
  nextId?: string;
  previousId?: string;
  isSnapped: boolean;
}

export interface ConnectionPoint {
  type: "top" | "bottom" | "input" | "output";
  x: number;
  y: number;
  blockId: string;
}

export interface SnapResult {
  canSnap: boolean;
  targetBlockId?: string;
  connectionType?: "sequence" | "input";
  snapX?: number;
  snapY?: number;
  position?: "above" | "below";
}

export interface BlockCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface BlockType {
  id: string;
  type: string;
  name: string;
  color: string;
  icon: string;
  shape: string;
  parameters: BlockParameter[];
}

export type Block = BlockInstance;
