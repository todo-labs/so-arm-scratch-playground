import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as scratchModule from "@/lib/theme/scratch";
import type { BlockInstance } from "@/lib/types";
import { WorkspaceSheet } from "../WorkspaceSheet";

// Mock the playSound function and SCRATCH_THEME
vi.mock("@/lib/theme/scratch", () => ({
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
      sensing: {
        base: "#0E7490",
        gradient: "linear-gradient(180deg, #0891B2 0%, #0E7490 100%)",
        shadow: "0 2px 0 #155E75",
        text: "#FFFFFF",
        secondary: "#155E75",
        darkBase: "#155E75",
        darkSecondary: "#0E7490",
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
      custom: {
        base: "#B91C1C",
        gradient: "linear-gradient(180deg, #DC2626 0%, #B91C1C 100%)",
        shadow: "0 2px 0 #991B1B",
        text: "#FFFFFF",
        secondary: "#991B1B",
        darkBase: "#991B1B",
        darkSecondary: "#B91C1C",
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
    },
    icons: {
      motion: "Bot",
      control: "RefreshCcw",
      gripper: "Hand",
      sensing: "Eye",
      operators: "Calculator",
      custom: "Star",
    },
    spacing: {
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "20px",
      xxl: "24px",
      xxxl: "32px",
    },
    animation: {
      ease: "cubic-bezier(0.25, 0.1, 0.25, 1)",
    },
    shadow: {
      sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
      md: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    block: {
      notchWidth: 20,
      notchHeight: 6,
      notchOffset: 24,
      borderRadius: 12,
      minHeight: 48,
      padding: 12,
    },
    workspace: {
      gridSize: 20,
      backgroundColor: "#f8fafc",
      gridColor: "rgba(148, 163, 184, 0.3)",
    },
  },
  playSound: vi.fn(),
}));

// Mock the cn utility function
vi.mock("@/lib/utils", () => ({
  cn: (...args: string[]) => args.join(" "),
}));

// Mock the block registry
vi.mock("@/lib/blockRegistry", () => ({
  registry: {
    getAllCategories: () => [
      { id: "motion", name: "Motion", color: "hsl(217, 91%, 60%)", icon: "Bot" },
      { id: "control", name: "Control", color: "hsl(38, 92%, 50%)", icon: "RefreshCcw" },
      { id: "gripper", name: "Gripper", color: "hsl(120, 60%, 60%)", icon: "Hand" },
    ],
    getAllBlocks: () => [
      {
        id: "move_joint_1",
        definitionId: "move_joint_1",
        category: "motion",
        name: "Move Joint 1",
        description: "Move joint 1 to a specific angle",
        parameters: {
          angle: { type: "number", defaultValue: 90, min: 0, max: 180, label: "Angle (°)" },
        },
      },
      {
        id: "move_joint_2",
        definitionId: "move_joint_2",
        category: "motion",
        name: "Move Joint 2",
        description: "Move joint 2 to a specific angle",
        parameters: {
          angle: { type: "number", defaultValue: 90, min: 0, max: 180, label: "Angle (°)" },
        },
      },
    ],
    getBlock: (definitionId: string) => {
      const blocks = [
        {
          id: "move_joint_1",
          definitionId: "move_joint_1",
          category: "motion",
          name: "Move Joint 1",
          description: "Move joint 1 to a specific angle",
          parameters: {
            angle: { type: "number", defaultValue: 90, min: 0, max: 180, label: "Angle (°)" },
          },
        },
        {
          id: "move_joint_2",
          definitionId: "move_joint_2",
          category: "motion",
          name: "Move Joint 2",
          description: "Move joint 2 to a specific angle",
          parameters: {
            angle: { type: "number", defaultValue: 90, min: 0, max: 180, label: "Angle (°)" },
          },
        },
      ];
      return blocks.find((block) => block.definitionId === definitionId) || null;
    },
  },
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    disabled,
    onClick,
    className,
    "data-testid": dataTestId,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
    "data-testid"?: string;
  }) => (
    <button
      type="button"
      data-testid={dataTestId || "button"}
      disabled={disabled}
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="scroll-area" className={className}>
      {children}
    </div>
  ),
}));

vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({
    open,
    children,
    modal,
  }: {
    open?: boolean;
    children: React.ReactNode;
    modal?: boolean;
  }) => (
    <div data-testid="sheet" data-open={open} data-modal={modal}>
      {children}
    </div>
  ),
  SheetTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-trigger">{children}</div>
  ),
  SheetContent: ({
    children,
    side,
    className,
    showOverlay,
  }: {
    children?: React.ReactNode;
    side?: string;
    className?: string;
    showOverlay?: boolean;
  }) => (
    <div
      data-testid="sheet-content"
      data-side={side}
      data-show-overlay={showOverlay}
      className={className}
    >
      {children}
    </div>
  ),
  SheetHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-header">{children}</div>
  ),
  SheetTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-title">{children}</div>
  ),
  SheetDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-description">{children}</div>
  ),
}));

vi.mock("@/components/ExecutionControls", () => ({
  ExecutionControls: ({
    isRunning,
    isConnected,
    onRun,
    onStop,
  }: {
    isRunning: boolean;
    isConnected: boolean;
    onRun: (options?: { simulate?: boolean }) => void;
    onStop: () => void;
  }) => (
    <div data-testid="execution-controls">
      <button
        type="button"
        data-testid="run-btn"
        onClick={() => onRun({ simulate: !isConnected })}
        disabled={isRunning}
      >
        {isRunning ? "Running..." : isConnected ? "Run Program" : "Simulate Program"}
      </button>
      {isRunning && (
        <button type="button" data-testid="stop-btn" onClick={onStop}>
          Stop
        </button>
      )}
    </div>
  ),
}));

// Mock Workspace component to avoid registry dependency
vi.mock("@/components/Workspace", () => ({
  Workspace: ({ blocks }: { blocks: BlockInstance[] }) => (
    <div data-testid="workspace">
      {blocks.length === 0 ? (
        <div data-testid="empty-workspace">No blocks</div>
      ) : (
        blocks.map((block) => (
          <div key={block.id} data-testid={`block-${block.id}`}>
            {block.definitionId}
          </div>
        ))
      )}
    </div>
  ),
}));

// Mock HorizontalBlockPalette to avoid registry dependency
vi.mock("@/components/HorizontalBlockPalette", () => ({
  HorizontalBlockPalette: () => <div data-testid="block-palette">Block Palette</div>,
}));

describe("WorkspaceSheet Component", () => {
  const defaultProps = {
    isConnected: true,
    blocks: [] as BlockInstance[],
    handleBlockClick: vi.fn(),
    handleBlockUpdate: vi.fn(),
    handleBlockRemove: vi.fn(),
    handleAddChildBlock: vi.fn(),
    handleClear: vi.fn(),
    handleRunCode: vi.fn(),
    handleStopCode: vi.fn(),
    isRunningCode: false,
  };

  const mockBlocks: BlockInstance[] = [
    {
      id: "block-1",
      definitionId: "move_joint_1",
      x: 0,
      y: 0,
      parameters: { angle: 90 },
      children: [],
      isSnapped: false,
    },
    {
      id: "block-2",
      definitionId: "move_joint_2",
      x: 0,
      y: 60,
      parameters: { angle: 45 },
      children: [],
      isSnapped: false,
    },
  ];

  describe("Rendering", () => {
    it("should render without crashing", () => {
      render(<WorkspaceSheet {...defaultProps} />);
      expect(screen.getByTestId("sheet")).toBeTruthy();
    });

    it("should render trigger button", () => {
      render(<WorkspaceSheet {...defaultProps} />);
      expect(screen.getByTestId("sheet-trigger")).toBeTruthy();
    });
  });

  describe("Sheet Open/Close State", () => {
    it("should render sheet trigger", () => {
      render(<WorkspaceSheet {...defaultProps} />);
      expect(screen.getByTestId("sheet")).toBeTruthy();
    });

    it("should render sheet content", () => {
      render(<WorkspaceSheet {...defaultProps} />);
      expect(screen.getByTestId("sheet-content")).toBeTruthy();
    });
  });

  describe("Clear All Button", () => {
    it("should call handleClear when Clear All is clicked", () => {
      const handleClear = vi.fn();
      render(<WorkspaceSheet {...defaultProps} handleClear={handleClear} />);
      const clearButton = screen.getByText("Clear All");
      if (clearButton) {
        fireEvent.click(clearButton);
        expect(handleClear).toHaveBeenCalledTimes(1);
      }
    });

    it("should call playSound('click') when Clear All is clicked", () => {
      render(<WorkspaceSheet {...defaultProps} />);
      const clearButton = screen.getByText("Clear All");
      if (clearButton) {
        fireEvent.click(clearButton);
        expect(scratchModule.playSound).toHaveBeenCalledWith("click");
      }
    });
  });

  describe("Block Display", () => {
    it("should display root command count", () => {
      render(<WorkspaceSheet {...defaultProps} blocks={mockBlocks} />);
      expect(screen.getByText(/2 root commands/i)).toBeTruthy();
    });

    it("should display 0 root commands when no blocks", () => {
      render(<WorkspaceSheet {...defaultProps} blocks={[]} />);
      expect(screen.getByText(/0 root commands/i)).toBeTruthy();
    });
  });

  describe("Callback Functions", () => {
    it("should call handleClear", () => {
      const handleClear = vi.fn();
      render(<WorkspaceSheet {...defaultProps} handleClear={handleClear} />);
      const clearButton = screen.getByText("Clear All");
      if (clearButton) {
        fireEvent.click(clearButton);
        expect(handleClear).toHaveBeenCalledTimes(1);
      }
    });

    it("should call handleRunCode", () => {
      const handleRunCode = vi.fn();
      render(<WorkspaceSheet {...defaultProps} handleRunCode={handleRunCode} />);
      const runBtn = screen.getByTestId("run-btn");
      if (runBtn) {
        fireEvent.click(runBtn);
        expect(handleRunCode).toHaveBeenCalledTimes(1);
      }
    });

    it("should call handleStopCode", () => {
      const handleStopCode = vi.fn();
      render(
        <WorkspaceSheet {...defaultProps} handleStopCode={handleStopCode} isRunningCode={true} />
      );
      const stopBtn = screen.getByTestId("stop-btn");
      if (stopBtn) {
        fireEvent.click(stopBtn);
        expect(handleStopCode).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe("Connection States", () => {
    it("should render when isConnected is true", () => {
      render(<WorkspaceSheet {...defaultProps} isConnected={true} />);
      expect(screen.getByTestId("sheet")).toBeTruthy();
    });

    it("should render when isConnected is false", () => {
      render(<WorkspaceSheet {...defaultProps} isConnected={false} />);
      expect(screen.getByTestId("sheet")).toBeTruthy();
    });
  });

  describe("Running Code States", () => {
    it("should render when isRunningCode is true", () => {
      render(<WorkspaceSheet {...defaultProps} isRunningCode={true} />);
      expect(screen.getByTestId("sheet")).toBeTruthy();
    });

    it("should render when isRunningCode is false", () => {
      render(<WorkspaceSheet {...defaultProps} isRunningCode={false} />);
      expect(screen.getByTestId("sheet")).toBeTruthy();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty blocks array", () => {
      render(<WorkspaceSheet {...defaultProps} blocks={[]} />);
      expect(screen.getByText(/0 root commands/i)).toBeTruthy();
    });

    it("should handle single block", () => {
      const singleBlock: BlockInstance[] = [
        {
          id: "block-1",
          definitionId: "move_joint_1",
          x: 0,
          y: 0,
          parameters: { angle: 90 },
          children: [],
          isSnapped: false,
        },
      ];
      render(<WorkspaceSheet {...defaultProps} blocks={singleBlock} />);
      expect(screen.getByText(/1 root command/i)).toBeTruthy();
    });

    it("should handle many blocks", () => {
      const manyBlocks: BlockInstance[] = Array.from({ length: 10 }, (_, i) => ({
        id: `block-${i}`,
        definitionId: "move_joint_1",
        x: 0,
        y: i * 60,
        parameters: { angle: i * 10 },
        children: [],
        isSnapped: false,
      }));
      render(<WorkspaceSheet {...defaultProps} blocks={manyBlocks} />);
      expect(screen.getByText(/10 root commands/i)).toBeTruthy();
    });
  });

  describe("Multiple Interactions", () => {
    it("should handle multiple button clicks correctly", () => {
      const handleClear = vi.fn();
      const handleRunCode = vi.fn();
      render(
        <WorkspaceSheet {...defaultProps} handleClear={handleClear} handleRunCode={handleRunCode} />
      );

      const clearButton = screen.getByText("Clear All");
      if (clearButton) {
        fireEvent.click(clearButton);
        fireEvent.click(clearButton);
      }

      const runButton = screen.getByTestId("run-btn");
      if (runButton) {
        fireEvent.click(runButton);
        fireEvent.click(runButton);
      }

      expect(handleClear).toHaveBeenCalledTimes(2);
      expect(handleRunCode).toHaveBeenCalledTimes(2);
    });
  });
});
