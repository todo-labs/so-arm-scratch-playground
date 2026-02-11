import { type RenderOptions, type RenderResult, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { ScratchProvider } from "../context/ScratchContext";
import type { BlockDefinition, BlockInstance } from "../lib/types/blocks";

// Default block definitions for testing
export const defaultBlockDefinitions: BlockDefinition[] = [
  {
    id: "move_to",
    category: "motion",
    name: "move to",
    color: "hsl(217, 91%, 60%)",
    shape: "command",
    parameters: [
      {
        name: "joint",
        type: "dropdown",
        defaultValue: "base",
        options: ["base", "shoulder", "elbow", "wrist_flex", "wrist_roll", "gripper"],
      },
      {
        name: "angle",
        type: "angle",
        defaultValue: 0,
        min: 0,
        max: 360,
      },
    ],
    codeTemplate: "moveTo('{{joint}}', {{angle}});",
  },
  {
    id: "wait_seconds",
    category: "control",
    name: "wait seconds",
    color: "hsl(38, 92%, 50%)",
    shape: "command",
    parameters: [
      {
        name: "seconds",
        type: "number",
        defaultValue: 1,
        min: 0,
        max: 60,
        step: 1,
      },
    ],
    codeTemplate: "wait({{seconds}});",
  },
  {
    id: "repeat",
    category: "control",
    name: "repeat",
    color: "hsl(38, 92%, 50%)",
    shape: "command",
    parameters: [
      {
        name: "times",
        type: "number",
        defaultValue: 3,
        min: 1,
        max: 999,
      },
    ],
    codeTemplate: "for (let i = 0; i < {{times}}; i++) {\n  {{children}}\n}",
  },
  {
    id: "open_gripper",
    category: "gripper",
    name: "open gripper",
    color: "hsl(120, 60%, 60%)",
    shape: "command",
    parameters: [],
    codeTemplate: "openGripper();",
  },
  {
    id: "close_gripper",
    category: "gripper",
    name: "close gripper",
    color: "hsl(120, 60%, 60%)",
    shape: "command",
    parameters: [],
    codeTemplate: "closeGripper();",
  },
  {
    id: "home_robot",
    category: "motion",
    name: "home robot",
    color: "hsl(217, 91%, 60%)",
    shape: "command",
    parameters: [],
    codeTemplate: "homeRobot();",
  },
];

// Default block categories for testing
export const defaultBlockCategories = [
  { id: "motion", name: "Motion", color: "#4C97FF", icon: "🤖" },
  { id: "control", name: "Control", color: "#FFAB19", icon: "🔄" },
  { id: "gripper", name: "Gripper", color: "#9966FF", icon: "✋" },
  { id: "sensing", name: "Sensing", color: "#5CB1D6", icon: "👁️" },
  { id: "operators", name: "Operators", color: "#59C059", icon: "🔢" },
];

export function createMockBlockInstance(
  definitionId: string,
  parameters: Record<string, boolean | number | string> = {},
  instanceId?: string
): BlockInstance {
  return {
    id: instanceId || `test_block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    definitionId,
    x: 0,
    y: 0,
    parameters,
    children: [],
    isSnapped: false,
  };
}

// Custom render function that wraps components with ScratchProvider
export function renderWithContext(
  ui: ReactNode,
  options?: RenderOptions & { mockIsConnected?: boolean }
): RenderResult {
  const { mockIsConnected = true, ...renderOptions } = options || {};

  return render(
    <ScratchProvider isConnected={mockIsConnected}>{ui}</ScratchProvider>,
    renderOptions
  );
}

/**
 * Helper to get computed style values for testing visual properties
 */
export function getComputedStyleValue(element: Element, property: string): string {
  const computed = window.getComputedStyle(element);
  return computed.getPropertyValue(property);
}

// Wait for a specified duration (useful for testing animations)
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Mock user event for interaction testing
export async function simulateClick(element: HTMLElement): Promise<void> {
  element.click();
}

// Mock hover interaction
export function simulateHover(element: HTMLElement): void {
  element.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
  element.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
}

export function simulateHoverEnd(element: HTMLElement): void {
  element.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
  element.dispatchEvent(new MouseEvent("mouseout", { bubbles: true }));
}

// Check if element has specific class
export function hasClass(element: Element, className: string): boolean {
  return element.classList.contains(className);
}

// Check if element is visible in viewport
export function isElementVisible(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  );
}
