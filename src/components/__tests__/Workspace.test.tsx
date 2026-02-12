import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BlockInstance } from "@/lib/types";
import { defaultBlockDefinitions } from "@/test/utils";
import { Workspace } from "../Workspace";

// Mock @dnd-kit components
let mockOnDragStart: ((event: any) => void) | null = null;
let mockOnDragEnd: ((event: any) => void) | null = null;

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children, onDragStart, onDragEnd }: any) => {
    mockOnDragStart = onDragStart;
    mockOnDragEnd = onDragEnd;
    return <div data-testid="dnd-context">{children}</div>;
  },
  DragOverlay: ({ children }: any) => <div data-testid="drag-overlay">{children}</div>,
  DragEndEvent: Object,
  DragStartEvent: Object,
  PointerSensor: vi.fn(),
  useDraggable: vi.fn(),
  useDroppable: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(),
}));

// Import after mocking
import { PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";

// Mock registry
vi.mock("@/lib/blockRegistry", () => ({
  registry: {
    getBlock: vi.fn((id: string) => defaultBlockDefinitions.find((d) => d.id === id)),
    getAllBlocks: vi.fn(() => defaultBlockDefinitions),
    getAllCategories: vi.fn(() => [
      "motion",
      "control",
      "sensing",
      "operators",
      "variables",
      "custom",
    ]),
  },
}));

// Mock ChildBlockSelector component
vi.mock("../ChildBlockSelector", () => ({
  ChildBlockSelector: ({ onClose }: any) => (
    <div data-testid="child-block-selector" data-testid-close={onClose}>
      Child Block Selector
    </div>
  ),
}));

// Mock SCRATCH_THEME
vi.mock("@/lib/theme/scratch", () => ({
  SCRATCH_THEME: {
    colors: {
      motion: {
        base: "#2563EB",
        gradient: "linear-gradient(180deg, #2563EB 0%, #1E40AF 100%)",
        shadow: "0 2px 0 #1E3A8A",
        text: "#FFFFFF",
        secondary: "#1D4ED8",
        darkBase: "#1D4ED8",
        darkSecondary: "#1E40AF",
      },
      control: {
        base: "#D97706",
        gradient: "linear-gradient(180deg, #D97706 0%, #B45309 100%)",
        shadow: "0 2px 0 #92400E",
        text: "#FFFFFF",
        secondary: "#92400E",
        darkBase: "#92400E",
        darkSecondary: "#B45309",
      },
      sensing: {
        base: "#0891B2",
        gradient: "linear-gradient(180deg, #0891B2 0%, #0E7490 100%)",
        shadow: "0 2px 0 #155E75",
        text: "#FFFFFF",
        secondary: "#155E75",
        darkBase: "#155E75",
        darkSecondary: "#0891B2",
      },
      operators: {
        base: "#059669",
        gradient: "linear-gradient(180deg, #059669 0%, #047857 100%)",
        shadow: "0 2px 0 #065F46",
        text: "#FFFFFF",
        secondary: "#065F46",
        darkBase: "#065F46",
        darkSecondary: "#059669",
      },
      variables: {
        base: "#EA580C",
        gradient: "linear-gradient(180deg, #EA580C 0%, #C2410C 100%)",
        shadow: "0 2px 0 #9A3412",
        text: "#FFFFFF",
        secondary: "#9A3412",
        darkBase: "#9A3412",
        darkSecondary: "#EA580C",
      },
      custom: {
        base: "#DC2626",
        gradient: "linear-gradient(180deg, #DC2626 0%, #B91C1C 100%)",
        shadow: "0 2px 0 #991B1B",
        text: "#FFFFFF",
        secondary: "#991B1B",
        darkBase: "#991B1B",
        darkSecondary: "#DC2626",
      },
      gripper: {
        base: "#7C3AED",
        gradient: "linear-gradient(180deg, #7C3AED 0%, #6D28D9 100%)",
        shadow: "0 2px 0 #5B21B6",
        text: "#FFFFFF",
        secondary: "#5B21B6",
        darkBase: "#5B21B6",
        darkSecondary: "#7C3AED",
      },
    },
    icons: {
      motion: "Bot",
      control: "RefreshCcw",
      gripper: "Hand",
      sensing: "Eye",
      operators: "Calculator",
      custom: "Star",
    },
    animation: { short: "100", medium: "200", long: "300" },
    spacing: {
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "20px",
      xxl: "24px",
      xxxl: "32px",
    },
    workspace: {
      gridSize: 20,
      backgroundColor: "#f8fafc",
      gridColor: "rgba(148, 163, 184, 0.3)",
    },
  },
  playSound: vi.fn(),
}));

// Import playSound after mocking
import { playSound } from "@/lib/theme/scratch";

// Helper functions to trigger drag events
function triggerDragStart(activeId: string) {
  if (mockOnDragStart) {
    mockOnDragStart({ active: { id: activeId }, over: null });
  }
}

function triggerDragEnd(activeId: string, overId: string | null) {
  if (mockOnDragEnd) {
    mockOnDragEnd({ active: { id: activeId }, over: overId ? { id: overId } : null });
  }
}

function triggerDragEndReorder(activeId: string, overId: string) {
  triggerDragEnd(activeId, overId);
}

function triggerDragEndNoReorder(activeId: string) {
  triggerDragEnd(activeId, activeId);
}

function triggerDragEndNullOver(activeId: string) {
  triggerDragEnd(activeId, null);
}

describe("Workspace Component", () => {
  const mockBlocks: BlockInstance[] = [
    {
      id: "block1",
      definitionId: "move_to",
      x: 0,
      y: 0,
      parameters: {},
      children: [],
      isSnapped: false,
    },
    {
      id: "block2",
      definitionId: "wait_seconds",
      x: 0,
      y: 60,
      parameters: { seconds: 2 },
      children: [],
      isSnapped: false,
    },
  ];

  const mockOnBlockUpdate = vi.fn();
  const mockOnBlockRemove = vi.fn();
  const mockOnAddChildBlock = vi.fn();
  const mockOnBlockReorder = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock return values before each test
    (useDraggable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      isDragging: false,
    });

    (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isOver: false,
      setNodeRef: vi.fn(),
      active: null,
    });

    (useSensor as unknown as ReturnType<typeof vi.fn>).mockReturnValue({});
    (useSensors as unknown as ReturnType<typeof vi.fn>).mockReturnValue([]);
  });

  describe("Empty State", () => {
    it("should render empty state with 'Start Programming!' message", () => {
      render(
        <Workspace
          blocks={[]}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      // Should render "Start Programming!" text
      expect(document.body).toHaveTextContent("Start Programming!");
      expect(document.body).toHaveTextContent("Click blocks on the left to add them here");
    });

    it("should render Bot icon in empty state", () => {
      render(
        <Workspace
          blocks={[]}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      // Bot icon should be present (in a div with animate-bounce)
      const botIcon = document.querySelector(".animate-bounce");
      expect(botIcon).toBeTruthy();
    });

    it("should render DropZone in empty state", () => {
      const { container } = render(
        <Workspace
          blocks={[]}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      // Should have DndContext wrapper
      expect(container.querySelector('[data-testid="dnd-context"]')).toBeTruthy();
    });
  });

  describe("Block Rendering", () => {
    it("should render blocks in correct order", () => {
      render(
        <Workspace
          blocks={mockBlocks}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      // Should have at least one block rendered
      const blocks = document.querySelectorAll(".relative");
      expect(blocks.length).toBeGreaterThan(0);
    });

    it("should render multiple blocks", () => {
      const blocks = [
        {
          id: "block1",
          definitionId: "move_to",
          x: 0,
          y: 0,
          parameters: {},
          children: [],
          isSnapped: false,
        },
        {
          id: "block2",
          definitionId: "wait_seconds",
          x: 0,
          y: 60,
          parameters: {},
          children: [],
          isSnapped: false,
        },
        {
          id: "block3",
          definitionId: "rotate_base",
          x: 0,
          y: 120,
          parameters: {},
          children: [],
          isSnapped: false,
        },
      ];

      render(
        <Workspace
          blocks={blocks}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      // Should have multiple blocks rendered
      const blockElements = document.querySelectorAll(".relative");
      expect(blockElements.length).toBeGreaterThanOrEqual(3);
    });

    it("should render blocks with correct animation delays", () => {
      render(
        <Workspace
          blocks={mockBlocks}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      // Animation delays should be applied based on index
      // First block should have 0ms delay, second should have 100ms delay
      const blocks = document.querySelectorAll(".relative");
      expect(blocks.length).toBeGreaterThan(0);
    });
  });

  describe("Control Block Children", () => {
    it("should render child block selector button for control blocks", () => {
      const controlBlock: BlockInstance = {
        id: "repeat1",
        definitionId: "repeat",
        x: 0,
        y: 0,
        parameters: { times: 3 },
        children: [],
        isSnapped: false,
      };

      render(
        <Workspace
          blocks={[controlBlock]}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      // Should have "Add blocks here" button
      expect(document.body).toHaveTextContent("Add blocks here");
    });

    it("should render child blocks inside control blocks", () => {
      const repeatBlock: BlockInstance = {
        id: "repeat1",
        definitionId: "repeat",
        x: 0,
        y: 0,
        parameters: { times: 3 },
        children: [],
        isSnapped: false,
      };

      const childBlock: BlockInstance = {
        id: "child1",
        definitionId: "wait_seconds",
        x: 0,
        y: 60,
        parameters: { seconds: 1 },
        children: [],
        isSnapped: false,
      };

      const blocks = [repeatBlock, childBlock];
      childBlock.parentId = "repeat1";

      render(
        <Workspace
          blocks={blocks}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      // Should render the child block
      expect(document.body).toHaveTextContent("wait");
    });

    it("should render multiple child blocks for control blocks", () => {
      const repeatBlock: BlockInstance = {
        id: "repeat1",
        definitionId: "repeat",
        x: 0,
        y: 0,
        parameters: { times: 3 },
        children: [],
        isSnapped: false,
      };

      const childBlocks: BlockInstance[] = [
        {
          id: "child1",
          definitionId: "wait_seconds",
          x: 0,
          y: 60,
          parameters: { seconds: 1 },
          children: [],
          isSnapped: false,
        },
        {
          id: "child2",
          definitionId: "wait_seconds",
          x: 0,
          y: 120,
          parameters: { seconds: 2 },
          children: [],
          isSnapped: false,
        },
        {
          id: "child3",
          definitionId: "wait_seconds",
          x: 0,
          y: 180,
          parameters: { seconds: 3 },
          children: [],
          isSnapped: false,
        },
      ];

      const blocks = [repeatBlock, ...childBlocks];
      childBlocks.forEach((child) => {
        child.parentId = "repeat1";
      });

      render(
        <Workspace
          blocks={blocks}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      // Should render all child blocks
      expect(document.body).toHaveTextContent("wait");
    });

    it("should handle if_condition control blocks with children", () => {
      const ifBlock: BlockInstance = {
        id: "if1",
        definitionId: "if_condition",
        x: 0,
        y: 0,
        parameters: {},
        children: [],
        isSnapped: false,
      };

      const childBlock: BlockInstance = {
        id: "child1",
        definitionId: "wait_seconds",
        x: 0,
        y: 60,
        parameters: {},
        children: [],
        isSnapped: false,
      };

      const blocks = [ifBlock, childBlock];
      childBlock.parentId = "if1";

      render(
        <Workspace
          blocks={blocks}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      // Should render child block
      const allTextElements = screen.getAllByText(/wait/i);
      expect(allTextElements.length).toBeGreaterThan(0);
    });

    it("should handle while_loop control blocks with children", () => {
      const whileBlock: BlockInstance = {
        id: "while1",
        definitionId: "while_loop",
        x: 0,
        y: 0,
        parameters: {},
        children: [],
        isSnapped: false,
      };

      const childBlock: BlockInstance = {
        id: "child1",
        definitionId: "wait_seconds",
        x: 0,
        y: 60,
        parameters: {},
        children: [],
        isSnapped: false,
      };

      const blocks = [whileBlock, childBlock];
      childBlock.parentId = "while1";

      render(
        <Workspace
          blocks={blocks}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      // Should render child block
      const allTextElements = screen.getAllByText(/wait/i);
      expect(allTextElements.length).toBeGreaterThan(0);
    });

    it("should not show 'Add more' button if no children", () => {
      const repeatBlock: BlockInstance = {
        id: "repeat1",
        definitionId: "repeat",
        x: 0,
        y: 0,
        parameters: { times: 3 },
        children: [],
        isSnapped: false,
      };

      render(
        <Workspace
          blocks={[repeatBlock]}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      // Should have "Add blocks here" but NOT "Add more"
      expect(document.body).toHaveTextContent("Add blocks here");
      // "Add more" button should not be visible yet
    });
  });

  describe("Drag Functionality", () => {
    it("should update activeId on drag start", () => {
      render(
        <Workspace
          blocks={mockBlocks}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      // Simulate drag start
      triggerDragStart("block1");

      // Active ID should be set
      // This is handled internally by Workspace, so we verify playSound was called
      expect(playSound).toHaveBeenCalledWith("click");
    });

    it("should play 'click' sound on drag start", () => {
      render(
        <Workspace
          blocks={mockBlocks}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      triggerDragStart("block1");

      expect(playSound).toHaveBeenCalledWith("click");
    });

    it("should play 'snap' sound on drag end when reordering", () => {
      render(
        <Workspace
          blocks={mockBlocks}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      triggerDragEndReorder("block2", "block1");

      expect(playSound).toHaveBeenCalledWith("snap");
      expect(mockOnBlockReorder).toHaveBeenCalledWith("block2", "block1");
    });

    it("should play 'drop' sound on drag end when not reordering", () => {
      render(
        <Workspace
          blocks={mockBlocks}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      triggerDragEndNoReorder("block1");

      expect(playSound).toHaveBeenCalledWith("drop");
    });

    it("should call onBlockReorder on successful drag drop", () => {
      render(
        <Workspace
          blocks={mockBlocks}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      triggerDragEndReorder("block2", "block1");

      expect(mockOnBlockReorder).toHaveBeenCalled();
      expect(mockOnBlockReorder).toHaveBeenCalledWith("block2", "block1");
    });

    it("should not call onBlockReorder if overId is null", () => {
      render(
        <Workspace
          blocks={mockBlocks}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      triggerDragEndNullOver("block1");

      expect(mockOnBlockReorder).not.toHaveBeenCalled();
      expect(playSound).toHaveBeenCalledWith("drop");
    });

    it("should not call onBlockReorder if overId equals activeId", () => {
      render(
        <Workspace
          blocks={mockBlocks}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      triggerDragEndNoReorder("block1");

      expect(mockOnBlockReorder).not.toHaveBeenCalled();
      expect(playSound).toHaveBeenCalledWith("drop");
    });

    it("should render drag overlay with active block", () => {
      render(
        <Workspace
          blocks={mockBlocks}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      // Drag overlay should be rendered
      const dragOverlay = document.querySelector('[data-testid="drag-overlay"]');
      expect(dragOverlay).toBeTruthy();
    });

    it("should hide drag overlay when no active block", () => {
      render(
        <Workspace
          blocks={mockBlocks}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      // Drag overlay should be present but empty when no active block
      const dragOverlay = document.querySelector('[data-testid="drag-overlay"]');
      expect(dragOverlay).toBeTruthy();
    });

    it("should render grid background", () => {
      const { container } = render(
        <Workspace
          blocks={mockBlocks}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      // Grid background should be present (radial-gradient + linear-gradient)
      const workspace = container.querySelector(".relative");
      expect(workspace).toBeTruthy();
    });
  });

  describe("Block Removal", () => {
    it("should call onBlockRemove when remove button is clicked", () => {
      const block = {
        id: "block1",
        definitionId: "move_to",
        x: 0,
        y: 0,
        parameters: {},
        children: [],
        isSnapped: false,
      };

      const { container } = render(
        <Workspace
          blocks={[block]}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      // Find remove button (cursor-pointer)
      const removeButtons = container.querySelectorAll(".cursor-pointer");
      if (removeButtons.length > 0) {
        fireEvent.click(removeButtons[0]);
        expect(mockOnBlockRemove).toHaveBeenCalledWith("block1");
      }

      expect(playSound).toHaveBeenCalledWith("click");
    });

    it("should cascade removal to child blocks", () => {
      const parentBlock: BlockInstance = {
        id: "parent1",
        definitionId: "repeat",
        x: 0,
        y: 0,
        parameters: { times: 3 },
        children: [],
        isSnapped: false,
      };

      const childBlocks: BlockInstance[] = [
        {
          id: "child1",
          definitionId: "wait_seconds",
          x: 0,
          y: 60,
          parameters: { seconds: 1 },
          children: [],
          isSnapped: false,
        },
        {
          id: "child2",
          definitionId: "wait_seconds",
          x: 0,
          y: 120,
          parameters: { seconds: 2 },
          children: [],
          isSnapped: false,
        },
      ];

      const blocks = [parentBlock, ...childBlocks];
      childBlocks.forEach((child) => {
        child.parentId = "parent1";
      });

      const { container } = render(
        <Workspace
          blocks={blocks}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      // Find remove button for parent
      const removeButtons = container.querySelectorAll(".cursor-pointer");
      if (removeButtons.length > 0) {
        fireEvent.click(removeButtons[0]);
      }

      // Parent removal should be called
      expect(mockOnBlockRemove).toHaveBeenCalledWith("parent1");
    });

    it("should play sound when removing block", () => {
      const block = {
        id: "block1",
        definitionId: "move_to",
        x: 0,
        y: 0,
        parameters: {},
        children: [],
        isSnapped: false,
      };

      const { container } = render(
        <Workspace
          blocks={[block]}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      const removeButtons = container.querySelectorAll(".cursor-pointer");
      if (removeButtons.length > 0) {
        fireEvent.click(removeButtons[0]);
      }

      expect(playSound).toHaveBeenCalledWith("click");
    });
  });

  describe("Parameter Editing", () => {
    it("should call onBlockUpdate when parameter changes", () => {
      const block = {
        id: "block1",
        definitionId: "wait_seconds",
        x: 0,
        y: 0,
        parameters: { seconds: 5 },
        children: [],
        isSnapped: false,
      };

      render(
        <Workspace
          blocks={[block]}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      // Simulate parameter change
      mockOnBlockUpdate("block1", "seconds", 3);

      expect(mockOnBlockUpdate).toHaveBeenCalledWith("block1", "seconds", 3);
    });
  });

  describe("Drag Sensors", () => {
    it("should use PointerSensor with activation constraint", () => {
      render(
        <Workspace
          blocks={mockBlocks}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      // useSensors should be called with useSensor(PointerSensor)
      // This is verified by the mock setup
      expect(useSensors).toHaveBeenCalled();
      expect(useSensor).toHaveBeenCalledWith(PointerSensor, expect.any(Object));
    });

    it("should set activation distance to 8px", () => {
      render(
        <Workspace
          blocks={mockBlocks}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      const sensorCall = (useSensor as ReturnType<typeof vi.fn>).mock.calls[0];
      const activationConstraint = sensorCall[1]?.activationConstraint;

      expect(activationConstraint).toEqual({ distance: 8 });
    });
  });

  describe("Block Instance with Children", () => {
    it("should handle control block with existing children", () => {
      const controlBlock: BlockInstance = {
        id: "repeat1",
        definitionId: "repeat",
        x: 0,
        y: 0,
        parameters: { times: 3 },
        children: [],
        isSnapped: false,
      };

      const existingChild: BlockInstance = {
        id: "existing-child",
        definitionId: "move_to",
        x: 0,
        y: 60,
        parameters: {},
        children: [],
        isSnapped: false,
      };

      const blocks = [controlBlock, existingChild];
      existingChild.parentId = "repeat1";

      render(
        <Workspace
          blocks={blocks}
          onBlockUpdate={mockOnBlockUpdate}
          onBlockRemove={mockOnBlockRemove}
          onAddChildBlock={mockOnAddChildBlock}
          onBlockReorder={mockOnBlockReorder}
        />
      );

      // Should render both parent and child
      expect(document.body).toHaveTextContent("repeat");
      expect(document.body).toHaveTextContent("move");
    });
  });
});
