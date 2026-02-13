import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as scratchModule from "@/lib/theme/scratch";
import { ExecutionControls } from "../ExecutionControls";

// Mock the playSound function
vi.mock("@/lib/theme/scratch", () => ({
  playSound: vi.fn(),
}));

// Mock the cn utility function
vi.mock("@/lib/utils", () => ({
  cn: (...args: string[]) => args.join(" "),
}));

// Mock the Button component from shadcn/ui
vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    disabled,
    onClick,
    className,
    style,
    "data-testid": dataTestId,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
    "data-testid"?: string;
  }) => (
    <button
      type="button"
      data-testid={dataTestId || "button"}
      disabled={disabled}
      onClick={onClick}
      className={className}
      style={style}
    >
      {children}
    </button>
  ),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Loader2: ({ className, ...props }: { className?: string }) => (
    <svg
      role="img"
      aria-label="loading"
      data-testid="loader-icon"
      className={className}
      {...props}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Loading</title>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
    </svg>
  ),
  Play: ({ className, ...props }: { className?: string }) => (
    <svg
      role="img"
      aria-label="play"
      data-testid="play-icon"
      className={className}
      {...props}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Play</title>
      <polygon points="5,3 19,12 5,21" fill="currentColor" />
    </svg>
  ),
  Square: ({ className, ...props }: { className?: string }) => (
    <svg
      role="img"
      aria-label="stop"
      data-testid="square-icon"
      className={className}
      {...props}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Stop</title>
      <rect x="3" y="3" width="18" height="18" fill="currentColor" />
    </svg>
  ),
}));

describe("ExecutionControls Component", () => {
  describe("Rendering", () => {
    it("should render without crashing", () => {
      const onRun = vi.fn();
      const onStop = vi.fn();

      render(
        <ExecutionControls isRunning={false} isConnected={true} onRun={onRun} onStop={onStop} />
      );

      expect(screen.getByTestId("button")).toBeTruthy();
    });

    it("should render run button with correct text when not running", () => {
      const onRun = vi.fn();
      const onStop = vi.fn();

      render(
        <ExecutionControls isRunning={false} isConnected={true} onRun={onRun} onStop={onStop} />
      );

      expect(screen.getByText("Run Program")).toBeTruthy();
    });

    it("should render loading state when running", () => {
      const onRun = vi.fn();
      const onStop = vi.fn();

      render(
        <ExecutionControls isRunning={true} isConnected={true} onRun={onRun} onStop={onStop} />
      );

      expect(screen.getByText("Running...")).toBeTruthy();
    });

    it("should not render stop button when not running", () => {
      const onRun = vi.fn();
      const onStop = vi.fn();

      render(
        <ExecutionControls isRunning={false} isConnected={true} onRun={onRun} onStop={onStop} />
      );

      // Check that stop button is not rendered
      const buttons = screen.getAllByTestId("button");
      expect(buttons).toHaveLength(1);
      expect(buttons[0]).toHaveTextContent("Run Program");
    });
  });

  describe("Button States", () => {
    it("should enable run button when not running and connected", () => {
      const onRun = vi.fn();
      const onStop = vi.fn();

      render(
        <ExecutionControls isRunning={false} isConnected={true} onRun={onRun} onStop={onStop} />
      );

      const runButton = screen.getByText("Run Program").closest("button");
      expect(runButton).not.toBeDisabled();
    });

    it("should disable run button when running", () => {
      const onRun = vi.fn();
      const onStop = vi.fn();

      render(
        <ExecutionControls isRunning={true} isConnected={true} onRun={onRun} onStop={onStop} />
      );

      const runningButton = screen.getByText("Running...").closest("button");
      expect(runningButton).toBeDisabled();
    });

    it("should enable simulate button when disconnected", () => {
      const onRun = vi.fn();
      const onStop = vi.fn();

      render(
        <ExecutionControls isRunning={false} isConnected={false} onRun={onRun} onStop={onStop} />
      );

      const runButton = screen.getByText("Simulate Program").closest("button");
      expect(runButton).not.toBeDisabled();
    });

    it("should show stop button when running", () => {
      const onRun = vi.fn();
      const onStop = vi.fn();

      render(
        <ExecutionControls isRunning={true} isConnected={true} onRun={onRun} onStop={onStop} />
      );

      const buttons = screen.getAllByTestId("button");
      expect(buttons).toHaveLength(2);
      const stopButton = buttons[1]; // Second button should be the stop button
      expect(stopButton.textContent).toContain("Stop");
    });
  });

  describe("Connection Status Indicators", () => {
    it("should show connected status when connected and not running", () => {
      const onRun = vi.fn();
      const onStop = vi.fn();

      render(
        <ExecutionControls isRunning={false} isConnected={true} onRun={onRun} onStop={onStop} />
      );

      expect(screen.getByText("Ready")).toBeTruthy();
    });

    it("should not show a disconnected badge when not connected", () => {
      const onRun = vi.fn();
      const onStop = vi.fn();

      render(
        <ExecutionControls isRunning={false} isConnected={false} onRun={onRun} onStop={onStop} />
      );

      expect(screen.queryByText("Robot not connected - simulation mode")).toBeNull();
    });

    it("should not show status indicator when running and connected", () => {
      const onRun = vi.fn();
      const onStop = vi.fn();

      render(
        <ExecutionControls isRunning={true} isConnected={true} onRun={onRun} onStop={onStop} />
      );

      expect(screen.queryByText("Ready")).toBeNull();
      expect(screen.queryByText("Robot not connected - simulation mode")).toBeNull();
    });
  });

  describe("Click Handlers", () => {
    it("should call onRun when run button is clicked", () => {
      const onRun = vi.fn();
      const onStop = vi.fn();

      render(
        <ExecutionControls isRunning={false} isConnected={true} onRun={onRun} onStop={onStop} />
      );

      const runButton = screen.getByText("Run Program");
      fireEvent.click(runButton);

      expect(onRun).toHaveBeenCalledTimes(1);
      expect(onRun).toHaveBeenCalledWith({ simulate: false });
    });

    it("should call onStop when stop button is clicked", () => {
      const onRun = vi.fn();
      const onStop = vi.fn();

      render(
        <ExecutionControls isRunning={true} isConnected={true} onRun={onRun} onStop={onStop} />
      );

      const buttons = screen.getAllByTestId("button");
      const stopButton = buttons[1]; // Second button should be the stop button
      fireEvent.click(stopButton);

      expect(onStop).toHaveBeenCalledTimes(1);
    });

    it("should call playSound('success') when run button is clicked", () => {
      const onRun = vi.fn();
      const onStop = vi.fn();

      render(
        <ExecutionControls isRunning={false} isConnected={true} onRun={onRun} onStop={onStop} />
      );

      const runButton = screen.getByText("Run Program");
      fireEvent.click(runButton);

      expect(scratchModule.playSound).toHaveBeenCalledWith("success");
    });

    it("should call playSound('click') when stop button is clicked", () => {
      const onRun = vi.fn();
      const onStop = vi.fn();

      render(
        <ExecutionControls isRunning={true} isConnected={true} onRun={onRun} onStop={onStop} />
      );

      const buttons = screen.getAllByTestId("button");
      const stopButton = buttons[1]; // Second button should be the stop button
      fireEvent.click(stopButton);

      expect(scratchModule.playSound).toHaveBeenCalledWith("click");
    });

    it("should call onRun in simulate mode when disconnected", () => {
      const onRun = vi.fn();
      const onStop = vi.fn();

      render(
        <ExecutionControls isRunning={false} isConnected={false} onRun={onRun} onStop={onStop} />
      );

      const runButton = screen.getByText("Simulate Program");
      fireEvent.click(runButton);

      expect(onRun).toHaveBeenCalledTimes(1);
      expect(onRun).toHaveBeenCalledWith({ simulate: true });
    });
  });

  describe("Edge Cases", () => {
    it("should handle running with disconnected state", () => {
      const onRun = vi.fn();
      const onStop = vi.fn();

      render(
        <ExecutionControls isRunning={true} isConnected={false} onRun={onRun} onStop={onStop} />
      );

      // Should show running state with disabled run button and stop button
      const runningButton = screen.getByText("Running...").closest("button");
      expect(runningButton).toBeDisabled();
      // When running, both buttons should be present (run button becomes running state, stop button visible)
      const buttons = screen.getAllByTestId("button");
      expect(buttons).toHaveLength(2);
      // Disconnected mode should still not show a status badge
      expect(screen.queryByText("Robot not connected - simulation mode")).toBeNull();
    });

    it("should apply custom className", () => {
      const onRun = vi.fn();
      const onStop = vi.fn();

      render(
        <ExecutionControls
          isRunning={false}
          isConnected={true}
          onRun={onRun}
          onStop={onStop}
          className="custom-class"
        />
      );

      const container = screen.getByText("Run Program").closest("div");
      expect(container?.className).toContain("custom-class");
    });

    it("should render loading spinner when running", () => {
      const onRun = vi.fn();
      const onStop = vi.fn();

      render(
        <ExecutionControls isRunning={true} isConnected={true} onRun={onRun} onStop={onStop} />
      );

      const loader = screen.getByTestId("loader-icon");
      expect(loader).toBeTruthy();
    });

    it("should render play icon when not running", () => {
      const onRun = vi.fn();
      const onStop = vi.fn();

      render(
        <ExecutionControls isRunning={false} isConnected={true} onRun={onRun} onStop={onStop} />
      );

      const playIcon = screen.getByTestId("play-icon");
      expect(playIcon).toBeTruthy();
    });

    it("should render square icon for stop button", () => {
      const onRun = vi.fn();
      const onStop = vi.fn();

      render(
        <ExecutionControls isRunning={true} isConnected={true} onRun={onRun} onStop={onStop} />
      );

      const squareIcon = screen.getByTestId("square-icon");
      expect(squareIcon).toBeTruthy();
    });
  });
});
