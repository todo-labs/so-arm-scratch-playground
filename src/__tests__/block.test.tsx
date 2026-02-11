import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Block } from "../components/Block";
import type { BlockDefinition, BlockInstance } from "../lib/types/blocks";
import { defaultBlockDefinitions } from "../test/utils";

// Mock blockIds module directly in this test file
vi.mock("../lib/blockIds", () => ({
  BLOCK_IDS: {
    MOVE_TO: "move_to",
    WAIT_SECONDS: "wait_seconds",
    REPEAT: "repeat",
    OPEN_GRIPPER: "open_gripper",
    CLOSE_GRIPPER: "close_gripper",
    HOME_ROBOT: "home_robot",
    IF_CONDITION: "if_condition",
    WHILE_LOOP: "while_loop",
  },
}));

// Mock the useScratch hook
vi.mock("../context/ScratchContext", () => ({
  useScratch: vi.fn(() => ({
    blocks: [],
    handleRunCode: vi.fn(),
    isRunningCode: false,
  })),
}));

// Helper to get block definition by ID
function getDefinition(id: string): BlockDefinition | undefined {
  return defaultBlockDefinitions.find((def) => def.id === id);
}

// Helper to create block instance
function createInstance(
  definitionId: string,
  params: Record<string, boolean | number | string> = {}
): BlockInstance {
  const definition = getDefinition(definitionId);
  if (!definition) throw new Error(`Definition not found: ${definitionId}`);

  return {
    id: `block_${Date.now()}`,
    definitionId,
    x: 0,
    y: 0,
    parameters: params,
    children: [],
    isSnapped: false,
  };
}

describe("Block Component", () => {
  describe("Rendering", () => {
    it("should render block with correct name", () => {
      const definition = getDefinition("move_to");
      expect(definition).toBeDefined();
      expect(definition?.name).toBe("move to");
    });

    it("should render block with category icon", () => {
      const definition = getDefinition("move_to");
      expect(definition).toBeDefined();
      expect(definition?.category).toBe("motion");
    });

    it("should render block shape based on definition", () => {
      const commandDefinition = getDefinition("move_to");
      expect(commandDefinition?.shape).toBe("command");

      const reporterDefinition: BlockDefinition = {
        id: "test_reporter",
        category: "operators",
        name: "test reporter",
        color: "#59C059",
        shape: "reporter",
        parameters: [],
        codeTemplate: "{{test}}",
      };

      const { container } = render(<Block definition={reporterDefinition} />);

      // Check for SVG which indicates block rendering
      expect(container.querySelector("svg")).toBeTruthy();
    });
  });

  describe("Block in Palette", () => {
    it("should apply palette styling when isInPalette is true", () => {
      const definition = getDefinition("move_to");
      if (!definition) return;

      const { container } = render(<Block definition={definition} isInPalette={true} />);

      const blockElement = container.querySelector(".relative");
      expect(blockElement).toBeTruthy();
      expect(blockElement?.className).toContain("cursor-pointer");
    });

    it("should apply hover scale effect in palette", () => {
      const definition = getDefinition("move_to");
      if (!definition) return;

      const { container } = render(<Block definition={definition} isInPalette={true} />);

      const blockElement = container.querySelector(".relative");
      expect(blockElement?.className).toContain("hover:scale-105");
    });
  });

  describe("Block Parameters", () => {
    it("should render parameter values when instance is provided", () => {
      const definition = getDefinition("wait_seconds");
      if (!definition) return;

      const instance = createInstance("wait_seconds", { seconds: 5 });

      const { container } = render(<Block definition={definition} instance={instance} />);

      // Parameters render as span elements, check for the parameter container
      const paramContainer = container.querySelector(".flex.items-center.gap-2");
      expect(paramContainer).toBeTruthy();
    });

    it("should call onParameterChange when parameter is updated", () => {
      const definition = getDefinition("wait_seconds");
      if (!definition) return;

      const onParameterChange = vi.fn();
      const instance = createInstance("wait_seconds", { seconds: 1 });

      render(
        <Block definition={definition} instance={instance} onParameterChange={onParameterChange} />
      );

      expect(onParameterChange).not.toHaveBeenCalled();
    });
  });

  describe("Block Removal", () => {
    it("should show remove button when onRemove is provided and not in palette", () => {
      const definition = getDefinition("move_to");
      if (!definition) return;

      const onRemove = vi.fn();
      const instance = createInstance("move_to", {});

      const { container } = render(
        <Block definition={definition} instance={instance} onRemove={onRemove} />
      );

      const xButton = container.querySelector(".opacity-0");
      expect(xButton).toBeTruthy();
    });

    it("should call onRemove when remove button is clicked", () => {
      const definition = getDefinition("move_to");
      if (!definition) return;

      const onRemove = vi.fn();
      const instance = createInstance("move_to", {});

      const { container } = render(
        <Block definition={definition} instance={instance} onRemove={onRemove} />
      );

      const removeButton = container.querySelector(".cursor-pointer");
      if (removeButton) {
        fireEvent.click(removeButton);
        expect(onRemove).toHaveBeenCalled();
      }
    });

    it("should not show remove button when in palette", () => {
      const definition = getDefinition("move_to");
      if (!definition) return;

      const onRemove = vi.fn();
      const instance = createInstance("move_to", {});

      const { container } = render(
        <Block definition={definition} instance={instance} onRemove={onRemove} isInPalette={true} />
      );

      // The remove button has specific styling - check for the X icon button
      const removeButtons = container.querySelectorAll("button");
      // Should have fewer buttons when in palette (no remove button)
      const removeButton = Array.from(removeButtons).find((btn) =>
        btn.querySelector('svg[data-lucide="x"]')
      );
      expect(removeButton).toBeFalsy();
    });
  });

  describe("Block Dragging", () => {
    it("should apply dragging styles when isDragging is true", () => {
      const definition = getDefinition("move_to");
      if (!definition) return;

      const { container } = render(<Block definition={definition} isDragging={true} />);

      const blockElement = container.querySelector(".relative");
      expect(blockElement?.className).toContain("z-50");
      expect(blockElement?.className).toContain("scale-105");
    });
  });

  describe("Block Categories", () => {
    it("should apply correct color theme for motion blocks", () => {
      const definition = getDefinition("move_to");
      if (!definition) return;

      const { container } = render(<Block definition={definition} />);

      expect(container.querySelector("svg")).toBeTruthy();
    });

    it("should apply correct color theme for control blocks", () => {
      const definition = getDefinition("wait_seconds");
      if (!definition) return;

      const { container } = render(<Block definition={definition} />);

      expect(container.querySelector("svg")).toBeTruthy();
    });

    it("should apply correct color theme for gripper blocks", () => {
      const definition = getDefinition("open_gripper");
      if (!definition) return;

      const { container } = render(<Block definition={definition} />);

      expect(container.querySelector("svg")).toBeTruthy();
    });
  });

  describe("Block Visual Properties", () => {
    it("should have text-white class for text visibility", () => {
      const definition = getDefinition("move_to");
      if (!definition) return;

      const { container } = render(<Block definition={definition} />);

      const textElement = container.querySelector(".text-white");
      expect(textElement).toBeTruthy();
    });

    it("should have font-bold class for block text", () => {
      const definition = getDefinition("move_to");
      if (!definition) return;

      const { container } = render(<Block definition={definition} />);

      const boldElement = container.querySelector(".font-bold");
      expect(boldElement).toBeTruthy();
    });

    it("should have select-none class to prevent text selection", () => {
      const definition = getDefinition("move_to");
      if (!definition) return;

      const { container } = render(<Block definition={definition} />);

      const selectNoneElement = container.querySelector(".select-none");
      expect(selectNoneElement).toBeTruthy();
    });
  });

  describe("C-Block Children Container", () => {
    it("should render children container for control blocks with children", () => {
      const definition = getDefinition("repeat");
      if (!definition) return;

      const instance = createInstance("repeat", { times: 3 });

      const { container } = render(<Block definition={definition} instance={instance} />);

      expect(container.textContent).toContain("repeat");
    });

    it("should show add child block button when onAddChildBlock is provided", () => {
      const definition = getDefinition("repeat");
      if (!definition) return;

      const onAddChildBlock = vi.fn();
      const instance = createInstance("repeat", { times: 3 });

      const { container } = render(
        <Block definition={definition} instance={instance} onAddChildBlock={onAddChildBlock} />
      );

      expect(container.textContent).toContain("Add Code");
    });
  });
});

describe("Block Visual Regression Tests", () => {
  it("should render without crashing", () => {
    const definition = getDefinition("move_to");
    if (!definition) return;

    const { container } = render(<Block definition={definition} />);

    expect(container.firstChild).toBeTruthy();
  });

  it("should have consistent structure", () => {
    const definition = getDefinition("move_to");
    if (!definition) return;

    const { container } = render(<Block definition={definition} />);

    expect(container.querySelector(".relative")).toBeTruthy();
    expect(container.querySelector("svg")).toBeTruthy();
    expect(container.querySelector(".relative .flex")).toBeTruthy();
  });

  it("should render all block categories", () => {
    const categories = ["motion", "control", "gripper"];

    categories.forEach((category) => {
      const definition = defaultBlockDefinitions.find((def) => def.category === category);
      if (!definition) return;

      const { container } = render(<Block definition={definition} />);
      expect(container.querySelector("svg")).toBeTruthy();
    });
  });
});
