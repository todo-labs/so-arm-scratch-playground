import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Header } from "../components/Header";

// Mock ProjectShareDialog directly in this test file
vi.mock("../components/ProjectShareDialog", () => ({
  ProjectShareDialog: () => null,
}));

// Mock ThemeContext to avoid provider requirement
vi.mock("../context/ThemeContext", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: vi.fn(() => ({
    theme: "light",
    toggleTheme: vi.fn(),
  })),
}));

// Mock ScratchProvider to avoid context issues in tests
vi.mock("../context/ScratchContext", async () => {
  const actual = await vi.importActual("../context/ScratchContext");
  return {
    ...actual,
    useScratch: vi.fn(() => ({
      blocks: [],
      handleRunCode: vi.fn(),
      isRunningCode: false,
    })),
  };
});

describe("Header Component", () => {
  const mockConnect = vi.fn();
  const mockDisconnect = vi.fn();
  const mockEmergencyStop = vi.fn();
  const mockHomeRobot = vi.fn();

  const defaultProps = {
    isConnected: false,
    connectRobot: mockConnect,
    disconnectRobot: mockDisconnect,
    emergencyStop: mockEmergencyStop,
    homeRobot: mockHomeRobot,
  };

  describe("Rendering", () => {
    it("should render header with correct title", () => {
      render(<Header {...defaultProps} />);

      expect(screen.getByText("SO-ARM101")).toBeTruthy();
    });

    it("should render robot control interface subtitle", () => {
      render(<Header {...defaultProps} />);

      expect(screen.getByText("Robot Control Interface")).toBeTruthy();
    });

    it("should render home robot button", () => {
      render(<Header {...defaultProps} />);

      expect(screen.getByText("Home Robot")).toBeTruthy();
    });

    it("should render connect robot button when not connected", () => {
      render(<Header {...defaultProps} />);

      expect(screen.getByText("Connect Robot")).toBeTruthy();
    });

    it("should render execute program button", () => {
      render(<Header {...defaultProps} />);

      expect(screen.getByText("Execute Program")).toBeTruthy();
    });

    it("should render emergency stop button", () => {
      render(<Header {...defaultProps} />);

      expect(screen.getByTitle("Emergency Stop")).toBeTruthy();
    });
  });

  describe("Connection State", () => {
    it("should show connected status when isConnected is true", () => {
      render(<Header {...defaultProps} isConnected={true} />);

      expect(screen.getByText("Robot Connected")).toBeTruthy();
    });

    it("should show not connected status when isConnected is false", () => {
      render(<Header {...defaultProps} isConnected={false} />);

      expect(screen.getByText("Not Connected")).toBeTruthy();
    });

    it("should render disconnect button when connected", () => {
      render(<Header {...defaultProps} isConnected={true} />);

      expect(screen.getByText("Disconnect")).toBeTruthy();
    });
  });

  describe("Button Interactions", () => {
    it("should call connectRobot when connect button is clicked", () => {
      render(<Header {...defaultProps} isConnected={false} />);

      const connectButton = screen.getByText("Connect Robot");
      fireEvent.click(connectButton);

      expect(mockConnect).toHaveBeenCalled();
    });

    it("should call disconnectRobot when disconnect button is clicked", () => {
      render(<Header {...defaultProps} isConnected={true} />);

      const disconnectButton = screen.getByText("Disconnect");
      fireEvent.click(disconnectButton);

      expect(mockDisconnect).toHaveBeenCalled();
    });

    it("should call homeRobot when home button is clicked", () => {
      render(<Header {...defaultProps} isConnected={true} />);

      const homeButton = screen.getByText("Home Robot");
      fireEvent.click(homeButton);

      expect(mockHomeRobot).toHaveBeenCalled();
    });

    it("should call emergencyStop when stop button is clicked", () => {
      render(<Header {...defaultProps} isConnected={true} />);

      const stopButton = screen.getByTitle("Emergency Stop");
      fireEvent.click(stopButton);

      expect(mockEmergencyStop).toHaveBeenCalled();
    });
  });

  describe("Button States", () => {
    it("should disable home button when not connected", () => {
      render(<Header {...defaultProps} isConnected={false} />);

      const homeButton = screen.getByText("Home Robot");
      expect(homeButton.closest("button")).toBeDisabled();
    });

    it("should disable emergency stop when not connected", () => {
      render(<Header {...defaultProps} isConnected={false} />);

      const stopButton = screen.getByTitle("Emergency Stop");
      expect(stopButton.closest("button")).toBeDisabled();
    });

    it("should enable home button when connected", () => {
      render(<Header {...defaultProps} isConnected={true} />);

      const homeButton = screen.getByText("Home Robot");
      expect(homeButton.closest("button")).not.toBeDisabled();
    });
  });

  describe("Visual Properties", () => {
    it("should have header element", () => {
      render(<Header {...defaultProps} />);

      expect(screen.getByRole("banner")).toBeTruthy();
    });

    it("should have sticky positioning", () => {
      render(<Header {...defaultProps} />);

      const header = screen.getByRole("banner");
      expect(header.className).toContain("sticky");
      expect(header.className).toContain("top-0");
    });

    it("should have backdrop blur effect", () => {
      render(<Header {...defaultProps} />);

      const header = screen.getByRole("banner");
      expect(header.className).toContain("backdrop-blur-md");
    });
  });

  describe("Visual Regression Tests", () => {
    it("should render without crashing", () => {
      const { container } = render(<Header {...defaultProps} />);

      expect(container.firstChild).toBeTruthy();
    });

    it("should have consistent button layout", () => {
      render(<Header {...defaultProps} />);

      expect(screen.getByText("Home Robot")).toBeTruthy();
      expect(screen.getByText("Execute Program")).toBeTruthy();
      expect(screen.getByTitle("Emergency Stop")).toBeTruthy();
    });
  });
});
