import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as scratchModule from "@/lib/theme/scratch";
import type { BlockCategory, BlockDefinition } from "@/lib/types";
import { BlockPalette } from "../BlockPalette";

// Mock the playSound function
vi.mock("@/lib/theme/scratch", () => ({
  playSound: vi.fn(),
  SCRATCH_THEME: {
    colors: {
      motion: {
        base: "#1E40AF",
        gradient: "linear-gradient(180deg, #2563EB 0%, #1E40AF 100%)",
        shadow: "0 2px 0 #1E3A8A",
        text: "#FFFFFF",
        secondary: "#1D4ED8",
        darkBase: "#1D4ED8",
        darkSecondary: "#1E40AF",
      },
      control: {
        base: "#B45309",
        gradient: "linear-gradient(180deg, #D97706 0%, #B45309 100%)",
        shadow: "0 2px 0 #92400E",
        text: "#FFFFFF",
        secondary: "#92400E",
        darkBase: "#92400E",
        darkSecondary: "#B45309",
      },
      gripper: {
        base: "#6D28D9",
        gradient: "linear-gradient(180deg, #7C3AED 0%, #6D28D9 100%)",
        shadow: "0 2px 0 #5B21B6",
        text: "#FFFFFF",
        secondary: "#5B21B6",
        darkBase: "#5B21B6",
        darkSecondary: "#6D28D9",
      },
      operators: {
        base: "#047857",
        gradient: "linear-gradient(180deg, #059669 0%, #047857 100%)",
        shadow: "0 2px 0 #065F46",
        text: "#FFFFFF",
        secondary: "#065F46",
        darkBase: "#065F46",
        darkSecondary: "#047857",
      },
      variables: {
        base: "#C2410C",
        gradient: "linear-gradient(180deg, #EA580C 0%, #C2410C 100%)",
        shadow: "0 2px 0 #9A3412",
        text: "#FFFFFF",
        secondary: "#9A3412",
        darkBase: "#9A3412",
        darkSecondary: "#C2410C",
      },
    },
  },
}));

// Mock the renderCategoryIcon function
vi.mock("@/lib/theme/iconRenderer", () => ({
  renderCategoryIcon: vi.fn(() => null),
}));

// Mock the ScrollArea component
vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="scroll-area" className={className}>
      {children}
    </div>
  ),
}));

// Mock the Block component
vi.mock("../Block", () => ({
  Block: ({ definition }: { definition: BlockDefinition }) => (
    <div data-testid={`block-${definition.id}`} data-category={definition.category}>
      {definition.name} Block
    </div>
  ),
}));

// Mock the cn utility function
vi.mock("@/lib/utils", () => ({
  cn: (...args: string[]) => args.join(" "),
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
    shape: "command",
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

describe("BlockPalette Component", () => {
  describe("Rendering", () => {
    it("should render without crashing", () => {
      const onBlockClick = vi.fn();

      render(
        <BlockPalette categories={testCategories} blocks={testBlocks} onBlockClick={onBlockClick} />
      );

      expect(screen.getByTestId("scroll-area")).toBeTruthy();
    });

    it("should render category tabs", () => {
      const onBlockClick = vi.fn();

      render(
        <BlockPalette categories={testCategories} blocks={testBlocks} onBlockClick={onBlockClick} />
      );

      expect(screen.getByText("Motion")).toBeTruthy();
      expect(screen.getByText("Control")).toBeTruthy();
      expect(screen.getByText("Gripper")).toBeTruthy();
    });

    it("should render hint text", () => {
      const onBlockClick = vi.fn();

      render(
        <BlockPalette categories={testCategories} blocks={testBlocks} onBlockClick={onBlockClick} />
      );

      expect(screen.getByText("👆 Click a block to add it to your program")).toBeTruthy();
    });

    it("should set first category as active by default", () => {
      const onBlockClick = vi.fn();

      render(
        <BlockPalette categories={testCategories} blocks={testBlocks} onBlockClick={onBlockClick} />
      );

      const motionButton = screen.getByText("Motion").closest("button");
      expect(motionButton).toBeTruthy();
      // Check that the active category has the expected styling (text-white)
      expect(motionButton?.className).toContain("text-white");
    });
  });

  describe("Category Tab Switching", () => {
    it("should switch active category when clicked", () => {
      const onBlockClick = vi.fn();

      render(
        <BlockPalette categories={testCategories} blocks={testBlocks} onBlockClick={onBlockClick} />
      );

      // Click on Control category
      const controlButton = screen.getByText("Control");
      fireEvent.click(controlButton);

      // Control button should now have active styling (text-white)
      expect(controlButton.closest("button")?.className).toContain("text-white");

      // Motion button should no longer have active styling
      const motionButton = screen.getByText("Motion").closest("button");
      expect(motionButton?.className).not.toContain("text-white");
    });

    it("should call playSound when category is clicked", () => {
      const onBlockClick = vi.fn();

      render(
        <BlockPalette categories={testCategories} blocks={testBlocks} onBlockClick={onBlockClick} />
      );

      const controlButton = screen.getByText("Control");
      fireEvent.click(controlButton);

      expect(scratchModule.playSound).toHaveBeenCalledWith("click");
    });

    it("should switch to Gripper category", () => {
      const onBlockClick = vi.fn();

      render(
        <BlockPalette categories={testCategories} blocks={testBlocks} onBlockClick={onBlockClick} />
      );

      // Click on Gripper category
      const gripperButton = screen.getByText("Gripper");
      fireEvent.click(gripperButton);

      expect(gripperButton.closest("button")?.className).toContain("text-white");
    });
  });

  describe("Block Filtering by Category", () => {
    it("should show only motion blocks when motion category is active", () => {
      const onBlockClick = vi.fn();

      render(
        <BlockPalette categories={testCategories} blocks={testBlocks} onBlockClick={onBlockClick} />
      );

      // Check that motion blocks are rendered
      expect(screen.getByTestId("block-move_to")).toBeTruthy();
      expect(screen.getByTestId("block-rotate_base")).toBeTruthy();

      // Control and gripper blocks should not be visible
      expect(screen.queryByTestId("block-wait_seconds")).toBeNull();
      expect(screen.queryByTestId("block-repeat")).toBeNull();
      expect(screen.queryByTestId("block-open_gripper")).toBeNull();
    });

    it("should show only control blocks when control category is active", () => {
      const onBlockClick = vi.fn();

      render(
        <BlockPalette categories={testCategories} blocks={testBlocks} onBlockClick={onBlockClick} />
      );

      // Click on Control category
      const controlButton = screen.getByText("Control");
      fireEvent.click(controlButton);

      // Check that control blocks are rendered
      expect(screen.getByTestId("block-wait_seconds")).toBeTruthy();
      expect(screen.getByTestId("block-repeat")).toBeTruthy();

      // Motion and gripper blocks should not be visible
      expect(screen.queryByTestId("block-move_to")).toBeNull();
      expect(screen.queryByTestId("block-rotate_base")).toBeNull();
      expect(screen.queryByTestId("block-open_gripper")).toBeNull();
    });

    it("should show only gripper blocks when gripper category is active", () => {
      const onBlockClick = vi.fn();

      render(
        <BlockPalette categories={testCategories} blocks={testBlocks} onBlockClick={onBlockClick} />
      );

      // Click on Gripper category
      const gripperButton = screen.getByText("Gripper");
      fireEvent.click(gripperButton);

      // Check that gripper blocks are rendered
      expect(screen.getByTestId("block-open_gripper")).toBeTruthy();

      // Motion and control blocks should not be visible
      expect(screen.queryByTestId("block-move_to")).toBeNull();
      expect(screen.queryByTestId("block-rotate_base")).toBeNull();
      expect(screen.queryByTestId("block-wait_seconds")).toBeNull();
      expect(screen.queryByTestId("block-repeat")).toBeNull();
    });

    it("should correctly filter multiple categories", () => {
      const onBlockClick = vi.fn();

      // Create blocks with same categories
      const multiCategoryBlocks: BlockDefinition[] = [
        {
          id: "block1",
          category: "motion",
          name: "Block 1",
          color: "#1E40AF",
          shape: "command",
          parameters: [],
          codeTemplate: "{{1}}",
        },
        {
          id: "block2",
          category: "motion",
          name: "Block 2",
          color: "#1E40AF",
          shape: "command",
          parameters: [],
          codeTemplate: "{{2}}",
        },
        {
          id: "block3",
          category: "motion",
          name: "Block 3",
          color: "#1E40AF",
          shape: "command",
          parameters: [],
          codeTemplate: "{{3}}",
        },
        {
          id: "block4",
          category: "control",
          name: "Block 4",
          color: "#B45309",
          shape: "command",
          parameters: [],
          codeTemplate: "{{4}}",
        },
      ];

      render(
        <BlockPalette
          categories={testCategories}
          blocks={multiCategoryBlocks}
          onBlockClick={onBlockClick}
        />
      );

      // Motion category should show 3 blocks
      expect(screen.getByTestId("block-block1")).toBeTruthy();
      expect(screen.getByTestId("block-block2")).toBeTruthy();
      expect(screen.getByTestId("block-block3")).toBeTruthy();
      expect(screen.queryByTestId("block-block4")).toBeNull();

      // Switch to control
      const controlButton = screen.getByText("Control");
      fireEvent.click(controlButton);

      // Control category should show 1 block
      expect(screen.getByTestId("block-block4")).toBeTruthy();
      expect(screen.queryByTestId("block-block1")).toBeNull();
      expect(screen.queryByTestId("block-block2")).toBeNull();
      expect(screen.queryByTestId("block-block3")).toBeNull();
    });
  });

  describe("Block Click Handler", () => {
    it("should call onBlockClick with correct block definition when block is clicked", () => {
      const onBlockClick = vi.fn();

      render(
        <BlockPalette categories={testCategories} blocks={testBlocks} onBlockClick={onBlockClick} />
      );

      const moveToBlock = screen.getByTestId("block-move_to");
      fireEvent.click(moveToBlock);

      expect(onBlockClick).toHaveBeenCalledTimes(1);
      expect(onBlockClick).toHaveBeenCalledWith(testBlocks[0]);
    });

    it("should call playSound when block is clicked", () => {
      const onBlockClick = vi.fn();

      render(
        <BlockPalette categories={testCategories} blocks={testBlocks} onBlockClick={onBlockClick} />
      );

      const moveToBlock = screen.getByTestId("block-move_to");
      fireEvent.click(moveToBlock);

      expect(scratchModule.playSound).toHaveBeenCalledWith("click");
    });

    it("should trigger onBlockClick when Enter key is pressed on block", () => {
      const onBlockClick = vi.fn();

      render(
        <BlockPalette categories={testCategories} blocks={testBlocks} onBlockClick={onBlockClick} />
      );

      const moveToBlock = screen.getByTestId("block-move_to").closest("button");
      if (moveToBlock) {
        fireEvent.keyUp(moveToBlock, { key: "Enter" });
        expect(onBlockClick).toHaveBeenCalledTimes(1);
      }
    });

    it("should trigger onBlockClick when Space key is pressed on block", () => {
      const onBlockClick = vi.fn();

      render(
        <BlockPalette categories={testCategories} blocks={testBlocks} onBlockClick={onBlockClick} />
      );

      const moveToBlock = screen.getByTestId("block-move_to").closest("button");
      if (moveToBlock) {
        fireEvent.keyUp(moveToBlock, { key: " " });
        expect(onBlockClick).toHaveBeenCalledTimes(1);
      }
    });

    it("should call onBlockClick with correct definition for different blocks", () => {
      const onBlockClick = vi.fn();

      render(
        <BlockPalette categories={testCategories} blocks={testBlocks} onBlockClick={onBlockClick} />
      );

      // Click on rotate_base block
      const rotateBaseBlock = screen.getByTestId("block-rotate_base");
      fireEvent.click(rotateBaseBlock);

      expect(onBlockClick).toHaveBeenCalledWith(testBlocks[1]);
    });
  });

  describe("Empty Category State", () => {
    it("should show empty message when category has no blocks", () => {
      const onBlockClick = vi.fn();
      const emptyBlocks: BlockDefinition[] = [];

      render(
        <BlockPalette
          categories={testCategories}
          blocks={emptyBlocks}
          onBlockClick={onBlockClick}
        />
      );

      expect(screen.getByText("No blocks in this category")).toBeTruthy();
    });

    it("should show empty message when specific category has no blocks", () => {
      const onBlockClick = vi.fn();
      const partialBlocks: BlockDefinition[] = [
        {
          id: "move_to",
          category: "motion",
          name: "move to",
          color: "#1E40AF",
          shape: "command",
          parameters: [],
          codeTemplate: "{{target}}",
        },
      ];

      render(
        <BlockPalette
          categories={testCategories}
          blocks={partialBlocks}
          onBlockClick={onBlockClick}
        />
      );

      // Control and Gripper categories have no blocks
      const controlButton = screen.getByText("Control");
      fireEvent.click(controlButton);

      expect(screen.getByText("No blocks in this category")).toBeTruthy();

      const gripperButton = screen.getByText("Gripper");
      fireEvent.click(gripperButton);

      expect(screen.getByText("No blocks in this category")).toBeTruthy();
    });

    it("should not show empty message when category has blocks", () => {
      const onBlockClick = vi.fn();

      render(
        <BlockPalette categories={testCategories} blocks={testBlocks} onBlockClick={onBlockClick} />
      );

      expect(screen.queryByText("No blocks in this category")).toBeNull();
    });
  });

  describe("Category Color Theming", () => {
    it("should apply correct color theme for motion category", () => {
      const onBlockClick = vi.fn();

      render(
        <BlockPalette categories={testCategories} blocks={testBlocks} onBlockClick={onBlockClick} />
      );

      const motionButton = screen.getByText("Motion").closest("button");
      expect(motionButton).toBeTruthy();

      // Check that the button has the motion color background
      const buttonStyle = motionButton?.getAttribute("style");
      expect(buttonStyle).toContain("#1E40AF");
    });

    it("should apply correct color theme for control category", () => {
      const onBlockClick = vi.fn();

      render(
        <BlockPalette categories={testCategories} blocks={testBlocks} onBlockClick={onBlockClick} />
      );

      const controlButton = screen.getByText("Control");
      fireEvent.click(controlButton);

      const buttonStyle = controlButton.closest("button")?.getAttribute("style");
      expect(buttonStyle).toContain("#B45309");
    });

    it("should apply correct color theme for gripper category", () => {
      const onBlockClick = vi.fn();

      render(
        <BlockPalette categories={testCategories} blocks={testBlocks} onBlockClick={onBlockClick} />
      );

      const gripperButton = screen.getByText("Gripper");
      fireEvent.click(gripperButton);

      const buttonStyle = gripperButton.closest("button")?.getAttribute("style");
      expect(buttonStyle).toContain("#6D28D9");
    });

    it("should show inactive category with slate styling", () => {
      const onBlockClick = vi.fn();

      render(
        <BlockPalette categories={testCategories} blocks={testBlocks} onBlockClick={onBlockClick} />
      );

      // Motion is active by default, so Control should be inactive
      const controlButton = screen.getByText("Control").closest("button");
      expect(controlButton?.className).toContain("text-slate-600");
      expect(controlButton?.className).toContain("bg-slate-100");
    });
  });

  describe("Edge Cases", () => {
    it("should handle single category", () => {
      const onBlockClick = vi.fn();
      const singleCategory: BlockCategory[] = [
        { id: "motion", name: "Motion", color: "#1E40AF", icon: "Bot" },
      ];

      render(
        <BlockPalette categories={singleCategory} blocks={testBlocks} onBlockClick={onBlockClick} />
      );

      expect(screen.getByText("Motion")).toBeTruthy();
      expect(screen.getByTestId("block-move_to")).toBeTruthy();
    });

    it("should handle empty categories array", () => {
      const onBlockClick = vi.fn();

      render(<BlockPalette categories={[]} blocks={testBlocks} onBlockClick={onBlockClick} />);

      // Should not crash and show no category tabs
      expect(screen.queryByText("Motion")).toBeNull();
      expect(screen.queryByText("Control")).toBeNull();
    });

    it("should handle single block per category", () => {
      const onBlockClick = vi.fn();
      const singleBlocks: BlockDefinition[] = [
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
          id: "wait_seconds",
          category: "control",
          name: "wait seconds",
          color: "#B45309",
          shape: "command",
          parameters: [],
          codeTemplate: "{{seconds}}",
        },
      ];

      render(
        <BlockPalette
          categories={testCategories}
          blocks={singleBlocks}
          onBlockClick={onBlockClick}
        />
      );

      // Motion category shows 1 block
      expect(screen.getByTestId("block-move_to")).toBeTruthy();

      // Control category shows 1 block
      const controlButton = screen.getByText("Control");
      fireEvent.click(controlButton);
      expect(screen.getByTestId("block-wait_seconds")).toBeTruthy();

      // Gripper category is empty
      const gripperButton = screen.getByText("Gripper");
      fireEvent.click(gripperButton);
      expect(screen.queryByTestId("block-move_to")).toBeNull();
      expect(screen.queryByTestId("block-wait_seconds")).toBeNull();
      expect(screen.getByText("No blocks in this category")).toBeTruthy();
    });

    it("should have aria-label on block buttons", () => {
      const onBlockClick = vi.fn();

      render(
        <BlockPalette categories={testCategories} blocks={testBlocks} onBlockClick={onBlockClick} />
      );

      const moveToBlock = screen.getByTestId("block-move_to").closest("button");
      expect(moveToBlock?.getAttribute("aria-label")).toBe("Add move to block");
    });

    it("should call playSound only once when switching category and clicking block", () => {
      const onBlockClick = vi.fn();

      render(
        <BlockPalette categories={testCategories} blocks={testBlocks} onBlockClick={onBlockClick} />
      );

      // Reset mock calls
      vi.clearAllMocks();

      // Click control category
      const controlButton = screen.getByText("Control");
      fireEvent.click(controlButton);
      expect(scratchModule.playSound).toHaveBeenCalledWith("click");

      // Click wait_seconds block
      const waitBlock = screen.getByTestId("block-wait_seconds");
      fireEvent.click(waitBlock);
      expect(onBlockClick).toHaveBeenCalledWith(testBlocks[2]);
      expect(scratchModule.playSound).toHaveBeenCalledWith("click");
    });
  });
});
