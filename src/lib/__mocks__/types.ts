// Mock types module
export interface BlockDefinition {
  id: string;
  category: string;
  name: string;
  color: string;
  shape: string;
  parameters: unknown[];
  codeTemplate: string;
}

export interface BlockInstance {
  id: string;
  definitionId: string;
  x: number;
  y: number;
  parameters: Record<string, unknown>;
  children: string[];
  isSnapped: boolean;
}
