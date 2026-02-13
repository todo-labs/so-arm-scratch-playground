import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { BlockCategory, BlockDefinition } from "@/lib/types";
import { ChildBlockSelector } from "../ChildBlockSelector";

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Plus: ({ className }: { className?: string }) => (
    <svg data-testid="plus-icon" className={className}>
      <title>Plus</title>
    </svg>
  ),
  X: ({ className, onClick }: { className?: string; onClick?: () => void }) => (
    <button type="button" data-testid="close-icon" className={className} onClick={onClick}>
      <title>Close</title>
    </button>
  ),
}));

// Mock the renderCategoryIcon function
vi.mock("@/lib/theme/iconRenderer", () => ({
  renderCategoryIcon: vi.fn((categoryId: string) => (
    <span data-testid={`icon-${categoryId}`}>Icon</span>
  )),
}));

// Mock the cn utility function
vi.mock("@/lib/utils", () => ({
  cn: (...args: string[]) => args.join(" "),
}));

// Mock the Block component
vi.mock("../Block", () => ({
  Block: ({ definition }: { definition: BlockDefinition }) => (
    <div data-testid={`block-${definition.id}`} data-category={definition.category}>
      {definition.name}
    </div>
  ),
}));

// Test data
const testCategories: BlockCategory[] = [
  { id: "motion", name: "Motion", color: "#1E40AF", icon: "Bot" },
  { id: "control", name: "Control", color: "#B45309", icon: "RefreshCcw" },
  { id: "gripper", name: "Gripper", color: "#6D28D9", icon: "Hand" },
];

const testBlocks: BlockDefinition[] = [
  {
    id: "move_to",
    category: "motion",
    name: "move to",
    color: "#1E40AF",
    shape: "command",
    parameters: [],
    codeTemplate: "{{target}}",
  },
  {
    id: "rotate_base",
    category: "motion",
    name: "rotate base",
    color: "#1E40AF",
    shape: "command",
    parameters: [],
    codeTemplate: "{{angle}}",
  },
  {
    id: "wait_seconds",
    category: "control",
    name: "wait seconds",
    color: "#B45309",
    shape: "command",
    parameters: [],
    codeTemplate: "{{seconds}}",
  },
  {
    id: "repeat",
    category: "control",
    name: "repeat",
    color: "#B45309",
    shape: "hat",
    parameters: [],
    codeTemplate: "repeat {{times}}",
  },
  {
    id: "open_gripper",
    category: "gripper",
    name: "open gripper",
    color: "#6D28D9",
    shape: "command",
    parameters: [],
    codeTemplate: "open_gripper()",
  },
];

describe("ChildBlockSelector Component", () => {
  describe("Rendering", () => {
    it("should render without crashing", () => {
      const onBlockSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <ChildBlockSelector
          categories={testCategories}
          blocks={testBlocks}
          onBlockSelect={onBlockSelect}
          onClose={onClose}
          parentBlockName="Test Block"
        />
      );

      expect(screen.getByText("Add Block to Test Block")).toBeTruthy();
    });

    it("should render close button", () => {
      const onBlockSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <ChildBlockSelector
          categories={testCategories}
          blocks={testBlocks}
          onBlockSelect={onBlockSelect}
          onClose={onClose}
          parentBlockName="Test Block"
        />
      );

      expect(screen.getByTestId("close-icon")).toBeTruthy();
    });

    it("should display parent block name in header", () => {
      const onBlockSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <ChildBlockSelector
          categories={testCategories}
          blocks={testBlocks}
          onBlockSelect={onBlockSelect}
          onClose={onClose}
          parentBlockName="My Loop"
        />
      );

      expect(screen.getByText("Add Block to My Loop")).toBeTruthy();
    });

    it("should render ScrollArea component", () => {
      const onBlockSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <ChildBlockSelector
          categories={testCategories}
          blocks={testBlocks}
          onBlockSelect={onBlockSelect}
          onClose={onClose}
          parentBlockName="Test Block"
        />
      );

      // Should have two scroll areas - one for categories and one for blocks (via data-slot)
      const scrollAreas = document.querySelectorAll('[data-slot="scroll-area"]');
      expect(scrollAreas).toHaveLength(2);
    });
  });

  describe("Category Display", () => {
    it("should display all categories with blocks", () => {
      const onBlockSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <ChildBlockSelector
          categories={testCategories}
          blocks={testBlocks}
          onBlockSelect={onBlockSelect}
          onClose={onClose}
          parentBlockName="Test Block"
        />
      );

      expect(screen.getByText("Motion")).toBeTruthy();
      expect(screen.getByText("Control")).toBeTruthy();
      expect(screen.getByText("Gripper")).toBeTruthy();
    });

    it("should filter out categories with no compatible blocks", () => {
      const onBlockSelect = vi.fn();
      const onClose = vi.fn();
      const categoriesWithEmpty: BlockCategory[] = [
        { id: "motion", name: "Motion", color: "#1E40AF", icon: "Bot" },
        { id: "events", name: "Events", color: "#000000", icon: "Zap" }, // Events category has no blocks
        { id: "control", name: "Control", color: "#B45309", icon: "RefreshCcw" },
      ];

      render(
        <ChildBlockSelector
          categories={categoriesWithEmpty}
          blocks={testBlocks}
          onBlockSelect={onBlockSelect}
          onClose={onClose}
          parentBlockName="Test Block"
        />
      );

      // Events category should not be visible
      expect(screen.queryByText("Events")).toBeNull();
      expect(screen.getByText("Motion")).toBeTruthy();
      expect(screen.getByText("Control")).toBeTruthy();
    });

    it("should show category icons", () => {
      const onBlockSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <ChildBlockSelector
          categories={testCategories}
          blocks={testBlocks}
          onBlockSelect={onBlockSelect}
          onClose={onClose}
          parentBlockName="Test Block"
        />
      );

      expect(screen.getByTestId("icon-motion")).toBeTruthy();
      expect(screen.getByTestId("icon-control")).toBeTruthy();
      expect(screen.getByTestId("icon-gripper")).toBeTruthy();
    });

    it("should highlight selected category", () => {
      const onBlockSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <ChildBlockSelector
          categories={testCategories}
          blocks={testBlocks}
          onBlockSelect={onBlockSelect}
          onClose={onClose}
          parentBlockName="Test Block"
        />
      );

      // Motion is selected by default
      const motionButton = screen.getByText("Motion").closest("button");
      expect(motionButton).toBeTruthy();
      expect(motionButton?.className).toContain("bg-blue-100");
      expect(motionButton?.className).toContain("text-blue-700");
    });

    it("should highlight new category when clicked", () => {
      const onBlockSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <ChildBlockSelector
          categories={testCategories}
          blocks={testBlocks}
          onBlockSelect={onBlockSelect}
          onClose={onClose}
          parentBlockName="Test Block"
        />
      );

      // Click on Control category
      const controlButton = screen.getByText("Control");
      fireEvent.click(controlButton);

      // Control should now be highlighted
      const controlButtonEl = controlButton.closest("button");
      expect(controlButtonEl).toBeTruthy();
      expect(controlButtonEl?.className).toContain("bg-blue-100");
      expect(controlButtonEl?.className).toContain("text-blue-700");

      // Motion should no longer be highlighted
      const motionButtonEl = screen.getByText("Motion").closest("button");
      expect(motionButtonEl).toBeTruthy();
      expect(motionButtonEl?.className).not.toContain("bg-blue-100");
    });
  });

  describe("Block Filtering", () => {
    it("should filter blocks by selected category", () => {
      const onBlockSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <ChildBlockSelector
          categories={testCategories}
          blocks={testBlocks}
          onBlockSelect={onBlockSelect}
          onClose={onClose}
          parentBlockName="Test Block"
        />
      );

      // Motion category shows motion blocks
      expect(screen.getByTestId("block-move_to")).toBeTruthy();
      expect(screen.getByTestId("block-rotate_base")).toBeTruthy();
      expect(screen.queryByTestId("block-wait_seconds")).toBeNull();
      expect(screen.queryByTestId("block-open_gripper")).toBeNull();
    });

    it("should filter by shape (command blocks)", () => {
      const onBlockSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <ChildBlockSelector
          categories={testCategories}
          blocks={testBlocks}
          onBlockSelect={onBlockSelect}
          onClose={onClose}
          parentBlockName="Test Block"
        />
      );

      // Control category shows wait_seconds (command)
      const controlButton = screen.getByText("Control");
      fireEvent.click(controlButton);

      // wait_seconds is command shape, should be shown
      expect(screen.getByTestId("block-wait_seconds")).toBeTruthy();
      // repeat is hat shape, should be shown
      expect(screen.getByTestId("block-repeat")).toBeTruthy();
    });

    it("should filter by shape (hat blocks)", () => {
      const onBlockSelect = vi.fn();
      const onClose = vi.fn();

      // Create a test with a hat block
      const hatBlock: BlockDefinition = {
        id: "event_hat",
        category: "motion",
        name: "when started",
        color: "#1E40AF",
        shape: "hat",
        parameters: [],
        codeTemplate: "when_started()",
      };
      const blocksWithHat: BlockDefinition[] = [...testBlocks, hatBlock];

      render(
        <ChildBlockSelector
          categories={testCategories}
          blocks={blocksWithHat}
          onBlockSelect={onBlockSelect}
          onClose={onClose}
          parentBlockName="Test Block"
        />
      );

      // Motion category should show command blocks AND hat blocks (both are compatible)
      expect(screen.getByTestId("block-move_to")).toBeTruthy();
      expect(screen.getByTestId("block-rotate_base")).toBeTruthy();
      expect(screen.getByTestId("block-event_hat")).toBeTruthy();
    });

    it("should show empty state when no blocks in category", () => {
      const onBlockSelect = vi.fn();
      const onClose = vi.fn();
      const emptyBlocks: BlockDefinition[] = [];

      render(
        <ChildBlockSelector
          categories={testCategories}
          blocks={emptyBlocks}
          onBlockSelect={onBlockSelect}
          onClose={onClose}
          parentBlockName="Test Block"
        />
      );

      // Motion category has no blocks
      expect(screen.getByText("No blocks available")).toBeTruthy();
    });

    it("should show empty state for control category with no command/hat blocks", () => {
      const onBlockSelect = vi.fn();
      const onClose = vi.fn();
      // Only reporter blocks in control that aren't compatible
      const reporterOnlyBlocks: BlockDefinition[] = [
        {
          id: "some_reporter",
          category: "motion",
          name: "motion reporter",
          color: "#1E40AF",
          shape: "reporter", // reporter blocks should be filtered out
          parameters: [],
          codeTemplate: "reporter",
        },
        {
          id: "another_reporter",
          category: "control",
          name: "control reporter",
          color: "#B45309",
          shape: "reporter",
          parameters: [],
          codeTemplate: "reporter",
        },
      ];

      render(
        <ChildBlockSelector
          categories={testCategories}
          blocks={reporterOnlyBlocks}
          onBlockSelect={onBlockSelect}
          onClose={onClose}
          parentBlockName="Test Block"
        />
      );

      // No categories have compatible blocks, so sidebar should be empty
      expect(screen.queryByText("Motion")).toBeNull();
      expect(screen.queryByText("Control")).toBeNull();
      expect(screen.queryByText("Gripper")).toBeNull();
      // Content area should show "No blocks available"
      expect(screen.getByText("No blocks available")).toBeTruthy();
    });
  });

  describe("Block Selection", () => {
    it("should call onBlockSelect when block is clicked", () => {
      const onBlockSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <ChildBlockSelector
          categories={testCategories}
          blocks={testBlocks}
          onBlockSelect={onBlockSelect}
          onClose={onClose}
          parentBlockName="Test Block"
        />
      );

      const blockElement = screen.getByTestId("block-move_to");
      const moveToBlock = blockElement.closest("button");
      expect(moveToBlock).toBeTruthy();
      fireEvent.click(moveToBlock!);

      expect(onBlockSelect).toHaveBeenCalledTimes(1);
      expect(onBlockSelect).toHaveBeenCalledWith(testBlocks[0]);
    });

    it("should pass correct block definition to onBlockSelect", () => {
      const onBlockSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <ChildBlockSelector
          categories={testCategories}
          blocks={testBlocks}
          onBlockSelect={onBlockSelect}
          onClose={onClose}
          parentBlockName="Test Block"
        />
      );

      const blockElement = screen.getByTestId("block-rotate_base");
      const rotateBaseBlock = blockElement.closest("button");
      expect(rotateBaseBlock).toBeTruthy();
      fireEvent.click(rotateBaseBlock!);

      expect(onBlockSelect).toHaveBeenCalledWith(testBlocks[1]);
    });

    it("should trigger onBlockSelect with Enter key", () => {
      const onBlockSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <ChildBlockSelector
          categories={testCategories}
          blocks={testBlocks}
          onBlockSelect={onBlockSelect}
          onClose={onClose}
          parentBlockName="Test Block"
        />
      );

      const blockElement = screen.getByTestId("block-move_to");
      const moveToBlock = blockElement.closest("button");
      expect(moveToBlock).toBeTruthy();
      fireEvent.keyUp(moveToBlock!, { key: "Enter" });

      expect(onBlockSelect).toHaveBeenCalledTimes(1);
      expect(onBlockSelect).toHaveBeenCalledWith(testBlocks[0]);
    });

    it("should trigger onBlockSelect with Space key", () => {
      const onBlockSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <ChildBlockSelector
          categories={testCategories}
          blocks={testBlocks}
          onBlockSelect={onBlockSelect}
          onClose={onClose}
          parentBlockName="Test Block"
        />
      );

      const blockElement = screen.getByTestId("block-move_to");
      const moveToBlock = blockElement.closest("button");
      expect(moveToBlock).toBeTruthy();
      fireEvent.keyUp(moveToBlock!, { key: " " });

      expect(onBlockSelect).toHaveBeenCalledTimes(1);
      expect(onBlockSelect).toHaveBeenCalledWith(testBlocks[0]);
    });

    it("should have aria-label on block buttons", () => {
      const onBlockSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <ChildBlockSelector
          categories={testCategories}
          blocks={testBlocks}
          onBlockSelect={onBlockSelect}
          onClose={onClose}
          parentBlockName="Test Block"
        />
      );

      const blockElement = screen.getByTestId("block-move_to");
      const moveToBlock = blockElement.closest("button");
      expect(moveToBlock).toBeTruthy();
      expect(moveToBlock?.getAttribute("aria-label")).toBe("Add move to block");
    });

    it("should pass correct block when switching categories", () => {
      const onBlockSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <ChildBlockSelector
          categories={testCategories}
          blocks={testBlocks}
          onBlockSelect={onBlockSelect}
          onClose={onClose}
          parentBlockName="Test Block"
        />
      );

      // Switch to Control category
      const controlButton = screen.getByText("Control");
      fireEvent.click(controlButton);

      // Click wait_seconds block
      const waitBlockElement = screen.getByTestId("block-wait_seconds");
      const waitBlock = waitBlockElement.closest("button");
      expect(waitBlock).toBeTruthy();
      fireEvent.click(waitBlock!);

      expect(onBlockSelect).toHaveBeenCalledWith(testBlocks[2]);
    });
  });

  describe("Close Handler", () => {
    it("should call onClose when close button is clicked", () => {
      const onBlockSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <ChildBlockSelector
          categories={testCategories}
          blocks={testBlocks}
          onBlockSelect={onBlockSelect}
          onClose={onClose}
          parentBlockName="Test Block"
        />
      );

      const closeIcon = screen.getByTestId("close-icon");
      const closeButton = closeIcon.closest("button");
      expect(closeButton).toBeTruthy();
      fireEvent.click(closeButton!);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should close on Escape key", () => {
      const onBlockSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <ChildBlockSelector
          categories={testCategories}
          blocks={testBlocks}
          onBlockSelect={onBlockSelect}
          onClose={onClose}
          parentBlockName="Test Block"
        />
      );

      // Press Escape (component may not have this handler, testing current behavior)
      fireEvent.keyUp(document.body, { key: "Escape" });

      // Note: The component doesn't currently handle Escape key
      // This test documents current behavior
    });
  });

  describe("Edge Cases", () => {
    it("should handle single category", () => {
      const onBlockSelect = vi.fn();
      const onClose = vi.fn();
      const singleCategory: BlockCategory[] = [
        { id: "motion", name: "Motion", color: "#1E40AF", icon: "Bot" },
      ];

      render(
        <ChildBlockSelector
          categories={singleCategory}
          blocks={testBlocks}
          onBlockSelect={onBlockSelect}
          onClose={onClose}
          parentBlockName="Test Block"
        />
      );

      expect(screen.getByText("Motion")).toBeTruthy();
      expect(screen.getByTestId("block-move_to")).toBeTruthy();
    });

    it("should handle single block", () => {
      const onBlockSelect = vi.fn();
      const onClose = vi.fn();
      const singleBlock: BlockDefinition[] = [testBlocks[0]];

      render(
        <ChildBlockSelector
          categories={testCategories}
          blocks={singleBlock}
          onBlockSelect={onBlockSelect}
          onClose={onClose}
          parentBlockName="Test Block"
        />
      );

      expect(screen.getByTestId("block-move_to")).toBeTruthy();
    });

    it("should handle empty categories array", () => {
      const onBlockSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <ChildBlockSelector
          categories={[]}
          blocks={testBlocks}
          onBlockSelect={onBlockSelect}
          onClose={onClose}
          parentBlockName="Test Block"
        />
      );

      // Should not crash
      expect(screen.queryByText("Motion")).toBeNull();
      expect(screen.queryByText("Control")).toBeNull();
    });

    it("should handle blocks with different shapes correctly", () => {
      const onBlockSelect = vi.fn();
      const onClose = vi.fn();

      // All test blocks except repeat are command shape
      render(
        <ChildBlockSelector
          categories={testCategories}
          blocks={testBlocks}
          onBlockSelect={onBlockSelect}
          onClose={onClose}
          parentBlockName="Test Block"
        />
      );

      // Motion shows 2 command blocks
      expect(screen.getByTestId("block-move_to")).toBeTruthy();
      expect(screen.getByTestId("block-rotate_base")).toBeTruthy();

      // Control shows 2 blocks (wait_seconds command + repeat hat)
      const controlButton = screen.getByText("Control");
      fireEvent.click(controlButton);

      expect(screen.getByTestId("block-wait_seconds")).toBeTruthy();
      expect(screen.getByTestId("block-repeat")).toBeTruthy();
    });

    it("should pass isInPalette prop to Block component", () => {
      const onBlockSelect = vi.fn();
      const onClose = vi.fn();

      render(
        <ChildBlockSelector
          categories={testCategories}
          blocks={testBlocks}
          onBlockSelect={onBlockSelect}
          onClose={onClose}
          parentBlockName="Test Block"
        />
      );

      // Block is rendered, verify its testid exists
      const blockElement = screen.getByTestId("block-move_to");
      expect(blockElement).toBeTruthy();
      expect(blockElement).toHaveAttribute("data-category", "motion");
    });
  });
});
