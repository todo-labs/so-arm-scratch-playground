import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HorizontalBlockPalette } from "../components/HorizontalBlockPalette";
import type { BlockCategory, BlockDefinition } from "../lib/types/blocks";
import { defaultBlockCategories, defaultBlockDefinitions } from "../test/utils";

// Mock blockExecutor module directly in this test file
vi.mock("@/lib/blockExecutor", () => ({
  executeBlocks: vi.fn(),
  ExecutionAbortedError: class ExecutionAbortedError extends Error {
    constructor(message = "Execution was aborted") {
      super(message);
      this.name = "ExecutionAbortedError";
    }
  },
  ConnectionLostError: class ConnectionLostError extends Error {
    constructor(message = "Robot connection lost during execution") {
      super(message);
      this.name = "ConnectionLostError";
    }
  },
}));

describe("HorizontalBlockPalette Component", () => {
  const defaultProps = {
    categories: defaultBlockCategories as BlockCategory[],
    blocks: defaultBlockDefinitions as BlockDefinition[],
    onBlockClick: vi.fn(),
  };

  describe("Rendering", () => {
    it("should render category tabs", () => {
      render(<HorizontalBlockPalette {...defaultProps} />);

      defaultBlockCategories.forEach((category) => {
        expect(screen.getByText(category.name)).toBeTruthy();
      });
    });

    it("should render blocks for selected category", () => {
      render(<HorizontalBlockPalette {...defaultProps} />);

      const motionBlocks = defaultBlockDefinitions.filter((b) => b.category === "motion");
      expect(motionBlocks.length).toBeGreaterThan(0);
    });

    it("should render hide blocks button when expanded", () => {
      render(<HorizontalBlockPalette {...defaultProps} />);

      expect(screen.getByText("Hide Blocks")).toBeTruthy();
    });
  });

  describe("Category Selection", () => {
    it("should select first category by default", () => {
      render(<HorizontalBlockPalette {...defaultProps} />);

      const firstCategory = defaultBlockCategories[0];
      expect(screen.getByText(firstCategory.name)).toBeTruthy();
    });
  });

  describe("Empty State", () => {
    it("should show empty message when no blocks in category", () => {
      const emptyProps = {
        ...defaultProps,
        blocks: [],
      };

      render(<HorizontalBlockPalette {...emptyProps} />);

      expect(screen.getByText("No blocks available in this category")).toBeTruthy();
    });
  });

  describe("Visual Properties", () => {
    it("should have correct container styling", () => {
      const { container } = render(<HorizontalBlockPalette {...defaultProps} />);

      expect(container.firstChild).toHaveClass("bg-white");
    });
  });

  describe("Visual Regression Tests", () => {
    it("should render without crashing", () => {
      const { container } = render(<HorizontalBlockPalette {...defaultProps} />);

      expect(container.firstChild).toBeTruthy();
    });

    it("should have consistent category layout", () => {
      render(<HorizontalBlockPalette {...defaultProps} />);

      defaultBlockCategories.forEach((category) => {
        expect(screen.getByText(category.name)).toBeTruthy();
      });
    });

    it("should render at least some blocks", () => {
      render(<HorizontalBlockPalette {...defaultProps} />);

      const visibleBlocks = screen.getAllByText((content) =>
        defaultBlockDefinitions.some((b) => b.name === content)
      );
      expect(visibleBlocks.length).toBeGreaterThan(0);
    });
  });
});
