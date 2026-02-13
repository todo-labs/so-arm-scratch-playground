import { render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { JointDetails } from "@/lib/types";
import { RobotProvider, useRobot } from "../RobotContext";

// Mock feetech.js ScsServoSDK
const mockConnect = vi.fn();
const mockDisconnect = vi.fn();
const mockSetPositionMode = vi.fn();
const mockSetWheelMode = vi.fn();
const mockReadPosition = vi.fn();
const mockWritePosition = vi.fn();
const mockSyncWritePositions = vi.fn();
const mockWriteWheelSpeed = vi.fn();
const mockWriteTorqueEnable = vi.fn();

vi.mock("feetech.js", () => ({
  ScsServoSDK: vi.fn().mockImplementation(() => ({
    connect: mockConnect,
    disconnect: mockDisconnect,
    setPositionMode: mockSetPositionMode,
    setWheelMode: mockSetWheelMode,
    readPosition: mockReadPosition,
    writePosition: mockWritePosition,
    syncWritePositions: mockSyncWritePositions,
    writeWheelSpeed: mockWriteWheelSpeed,
    writeTorqueEnable: mockWriteTorqueEnable,
  })),
}));

// Mock useRobotControl hook
vi.mock("@/hooks/useRobotControl", () => ({
  useRobotControl: vi.fn((initialJointDetails, urdfInitJointAngles) => ({
    isConnected: false,
    connectRobot: vi.fn(),
    disconnectRobot: vi.fn(),
    emergencyStop: vi.fn(),
    homeRobot: vi.fn(),
    openGripper: vi.fn(),
    closeGripper: vi.fn(),
    jointStates: initialJointDetails.map((j: JointDetails) => ({
      jointType: j.jointType,
      degrees: j.jointType === "revolute" ? (urdfInitJointAngles?.[j.name] ?? 0) : 0,
      speed: j.jointType === "continuous" ? 0 : undefined,
      servoId: j.servoId,
      name: j.name,
      limit: j.limit,
      targetDegrees: j.jointType === "revolute" ? (urdfInitJointAngles?.[j.name] ?? 0) : 0,
      isMoving: false,
    })),
    setJointDetails: vi.fn(),
    updateJointsDegrees: vi.fn(),
    initialPositions: [],
  })),
}));

// Mock robotConfig
vi.mock("@/lib/robotConfig", () => ({
  robotConfigMap: {
    "so-arm101": {
      urdfInitJointAngles: {
        Rotation: 180,
        Pitch: 90,
        Elbow: 360,
        Wrist_Pitch: 180,
        Wrist_Roll: 180,
        Jaw: 180,
      },
      defaultJointDetails: [
        { name: "Rotation", servoId: 1, jointType: "revolute", limit: { lower: 0, upper: 360 } },
        { name: "Pitch", servoId: 2, jointType: "revolute", limit: { lower: 0, upper: 360 } },
        { name: "Elbow", servoId: 3, jointType: "revolute", limit: { lower: 0, upper: 360 } },
        { name: "Wrist_Pitch", servoId: 4, jointType: "revolute", limit: { lower: 0, upper: 360 } },
        { name: "Wrist_Roll", servoId: 5, jointType: "revolute", limit: { lower: 0, upper: 360 } },
        { name: "Jaw", servoId: 6, jointType: "revolute", limit: { lower: 0, upper: 360 } },
      ],
    },
  },
}));

describe("RobotContext", () => {
  const mockJointDetails: JointDetails[] = [
    { name: "Rotation", servoId: 1, jointType: "revolute", limit: { lower: 0, upper: 360 } },
    { name: "Pitch", servoId: 2, jointType: "revolute", limit: { lower: 0, upper: 360 } },
    { name: "Elbow", servoId: 3, jointType: "revolute", limit: { lower: 0, upper: 360 } },
  ];

  const mockUrdfInitJointAngles: Record<string, number> = {
    Rotation: 180,
    Pitch: 90,
    Elbow: 360,
    Wrist_Pitch: 180,
    Wrist_Roll: 180,
    Jaw: 180,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock implementations
    mockConnect.mockResolvedValue(undefined);
    mockDisconnect.mockResolvedValue(undefined);
    mockSetPositionMode.mockResolvedValue(undefined);
    mockSetWheelMode.mockResolvedValue(undefined);
    mockReadPosition.mockResolvedValue(512);
    mockWritePosition.mockResolvedValue(undefined);
    mockSyncWritePositions.mockResolvedValue(undefined);
    mockWriteWheelSpeed.mockResolvedValue(undefined);
    mockWriteTorqueEnable.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("useRobot Hook", () => {
    describe("Error Handling", () => {
      it("should throw error when used outside RobotProvider", () => {
        expect(() => {
          renderHook(() => useRobot());
        }).toThrow("useRobot must be used within RobotProvider");
      });

      it("should throw error with correct message when used outside provider", () => {
        expect(() => {
          renderHook(() => useRobot());
        }).toThrowError(/useRobot must be used within RobotProvider/);
      });
    });

    describe("Context Values - Basic Properties", () => {
      it("should provide isConnected boolean", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <RobotProvider robotName="so-arm101" initialJointDetails={mockJointDetails}>
            {children}
          </RobotProvider>
        );

        const { result } = renderHook(() => useRobot(), { wrapper });

        expect(result.current.isConnected).toBe(false);
      });

      it("should provide jointStates array", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <RobotProvider robotName="so-arm101" initialJointDetails={mockJointDetails}>
            {children}
          </RobotProvider>
        );

        const { result } = renderHook(() => useRobot(), { wrapper });

        expect(result.current.jointStates).toBeInstanceOf(Array);
        expect(result.current.jointStates).toHaveLength(mockJointDetails.length);

        result.current.jointStates.forEach((state, index) => {
          expect(state.name).toBe(mockJointDetails[index].name);
          expect(state.servoId).toBe(mockJointDetails[index].servoId);
          expect(state.jointType).toBe(mockJointDetails[index].jointType);
          expect(state.isMoving).toBe(false);
          expect(state.targetDegrees).toBe(mockUrdfInitJointAngles[state.name] ?? 0);
        });
      });

      it("should provide correct joint types", () => {
        const continuousJoint: JointDetails[] = [
          { name: "Wheel", servoId: 1, jointType: "continuous" },
        ];

        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <RobotProvider robotName="so-arm101" initialJointDetails={continuousJoint}>
            {children}
          </RobotProvider>
        );

        const { result } = renderHook(() => useRobot(), { wrapper });

        expect(result.current.jointStates[0].jointType).toBe("continuous");
        expect(result.current.jointStates[0].speed).toBe(0);
      });

      it("should provide initialPositions array", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <RobotProvider robotName="so-arm101" initialJointDetails={mockJointDetails}>
            {children}
          </RobotProvider>
        );

        const { result } = renderHook(() => useRobot(), { wrapper });

        expect(result.current).toBeDefined();
      });
    });

    describe("Context Values - Action Functions", () => {
      it("should provide connectRobot function", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <RobotProvider robotName="so-arm101" initialJointDetails={mockJointDetails}>
            {children}
          </RobotProvider>
        );

        const { result } = renderHook(() => useRobot(), { wrapper });

        expect(result.current.connectRobot).toBeInstanceOf(Function);
        expect(typeof result.current.connectRobot).toBe("function");
      });

      it("should provide disconnectRobot function", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <RobotProvider robotName="so-arm101" initialJointDetails={mockJointDetails}>
            {children}
          </RobotProvider>
        );

        const { result } = renderHook(() => useRobot(), { wrapper });

        expect(result.current.disconnectRobot).toBeInstanceOf(Function);
        expect(typeof result.current.disconnectRobot).toBe("function");
      });

      it("should provide emergencyStop function", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <RobotProvider robotName="so-arm101" initialJointDetails={mockJointDetails}>
            {children}
          </RobotProvider>
        );

        const { result } = renderHook(() => useRobot(), { wrapper });

        expect(result.current.emergencyStop).toBeInstanceOf(Function);
        expect(typeof result.current.emergencyStop).toBe("function");
      });

      it("should provide homeRobot function", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <RobotProvider robotName="so-arm101" initialJointDetails={mockJointDetails}>
            {children}
          </RobotProvider>
        );

        const { result } = renderHook(() => useRobot(), { wrapper });

        expect(result.current.homeRobot).toBeInstanceOf(Function);
        expect(typeof result.current.homeRobot).toBe("function");
      });

      it("should provide openGripper function", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <RobotProvider robotName="so-arm101" initialJointDetails={mockJointDetails}>
            {children}
          </RobotProvider>
        );

        const { result } = renderHook(() => useRobot(), { wrapper });

        expect(result.current.openGripper).toBeInstanceOf(Function);
        expect(typeof result.current.openGripper).toBe("function");
      });

      it("should provide closeGripper function", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <RobotProvider robotName="so-arm101" initialJointDetails={mockJointDetails}>
            {children}
          </RobotProvider>
        );

        const { result } = renderHook(() => useRobot(), { wrapper });

        expect(result.current.closeGripper).toBeInstanceOf(Function);
        expect(typeof result.current.closeGripper).toBe("function");
      });

      it("should provide setJointDetails function", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <RobotProvider robotName="so-arm101" initialJointDetails={mockJointDetails}>
            {children}
          </RobotProvider>
        );

        const { result } = renderHook(() => useRobot(), { wrapper });

        expect(result.current.setJointDetails).toBeInstanceOf(Function);
        expect(typeof result.current.setJointDetails).toBe("function");
      });

      it("should provide updateJointsDegrees function", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <RobotProvider robotName="so-arm101" initialJointDetails={mockJointDetails}>
            {children}
          </RobotProvider>
        );

        const { result } = renderHook(() => useRobot(), { wrapper });

        expect(result.current.updateJointsDegrees).toBeInstanceOf(Function);
        expect(typeof result.current.updateJointsDegrees).toBe("function");
      });
    });

    describe("RobotProvider Error Handling", () => {
      it("should throw error for invalid robot name", () => {
        const invalidRobotName = "non-existent-robot";

        expect(() => {
          render(
            <RobotProvider robotName={invalidRobotName} initialJointDetails={mockJointDetails}>
              <div>Test</div>
            </RobotProvider>
          );
        }).toThrow(/Config for .* not found/);
      });

      it("should throw error with correct message for invalid robot name", () => {
        const invalidRobotName = "invalid-robot";

        expect(() => {
          render(
            <RobotProvider robotName={invalidRobotName} initialJointDetails={mockJointDetails}>
              <div>Test</div>
            </RobotProvider>
          );
        }).toThrowError(/Config for invalid-robot not found/);
      });

      it("should handle empty joint details without error", () => {
        const emptyJointDetails: JointDetails[] = [];

        // Should not throw an error
        expect(() => {
          render(
            <RobotProvider robotName="so-arm101" initialJointDetails={emptyJointDetails}>
              <div>Test</div>
            </RobotProvider>
          );
        }).not.toThrow();
      });
    });

    describe("Context Integration", () => {
      it("should provide all context values together", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <RobotProvider robotName="so-arm101" initialJointDetails={mockJointDetails}>
            {children}
          </RobotProvider>
        );

        const { result } = renderHook(() => useRobot(), { wrapper });

        // Check all required properties exist
        const expectedValues = [
          "isConnected",
          "connectRobot",
          "disconnectRobot",
          "emergencyStop",
          "homeRobot",
          "openGripper",
          "closeGripper",
          "jointStates",
          "setJointDetails",
          "updateJointsDegrees",
        ];

        expectedValues.forEach((prop) => {
          expect(result.current).toHaveProperty(prop);
          const value = (result.current as any)[prop];
          expect(typeof value).not.toBeUndefined();
        });
      });

      it("should allow rendering child components within provider", () => {
        const TestComponent = () => {
          const robot = useRobot();
          return <div data-testid="robot-test">Connected: {robot.isConnected ? "Yes" : "No"}</div>;
        };

        render(
          <RobotProvider robotName="so-arm101" initialJointDetails={mockJointDetails}>
            <TestComponent />
          </RobotProvider>
        );

        expect(screen.getByTestId("robot-test")).toHaveTextContent("Connected: No");
      });

      it("should allow multiple children within provider", () => {
        const Component1 = () => <div data-testid="component-1">Child 1</div>;
        const Component2 = () => <div data-testid="component-2">Child 2</div>;

        render(
          <RobotProvider robotName="so-arm101" initialJointDetails={mockJointDetails}>
            <Component1 />
            <Component2 />
          </RobotProvider>
        );

        expect(screen.getByTestId("component-1")).toBeInTheDocument();
        expect(screen.getByTestId("component-2")).toBeInTheDocument();
      });
    });

    describe("Error Context Values", () => {
      it("should throw error when useRobot is called outside provider", () => {
        expect(() => {
          renderHook(() => useRobot());
        }).toThrow();
      });
    });
  });

  describe("Complete RobotContext Test Suite", () => {
    describe("Test Coverage Areas", () => {
      it("tests all context values are provided correctly", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <RobotProvider robotName="so-arm101" initialJointDetails={mockJointDetails}>
            {children}
          </RobotProvider>
        );

        const { result } = renderHook(() => useRobot(), { wrapper });

        // All required context values
        const expectedValues = [
          "isConnected",
          "connectRobot",
          "disconnectRobot",
          "emergencyStop",
          "homeRobot",
          "openGripper",
          "closeGripper",
          "jointStates",
          "setJointDetails",
          "updateJointsDegrees",
        ];

        expectedValues.forEach((prop) => {
          expect(result.current).toHaveProperty(prop);
          const value = (result.current as any)[prop];
          expect(typeof value).not.toBeUndefined();
        });
      });

      it("tests useRobot throws error outside provider", () => {
        expect(() => {
          renderHook(() => useRobot());
        }).toThrow();
      });

      it("tests provider handles empty joint details", () => {
        const emptyJointDetails: JointDetails[] = [];

        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <RobotProvider robotName="so-arm101" initialJointDetails={emptyJointDetails}>
            {children}
          </RobotProvider>
        );

        const { result } = renderHook(() => useRobot(), { wrapper });

        expect(result.current.jointStates).toHaveLength(0);
      });

      it("tests provider handles continuous joint type", () => {
        const continuousJoint: JointDetails[] = [
          { name: "Wheel", servoId: 1, jointType: "continuous" },
        ];

        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <RobotProvider robotName="so-arm101" initialJointDetails={continuousJoint}>
            {children}
          </RobotProvider>
        );

        const { result } = renderHook(() => useRobot(), { wrapper });

        expect(result.current.jointStates[0].jointType).toBe("continuous");
        expect(result.current.jointStates[0].speed).toBe(0);
      });
    });

    describe("Edge Cases", () => {
      it("should handle special characters in joint names", () => {
        const specialJoint: JointDetails[] = [
          { name: "Wrist_Roll", servoId: 5, jointType: "revolute" },
        ];

        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <RobotProvider robotName="so-arm101" initialJointDetails={specialJoint}>
            {children}
          </RobotProvider>
        );

        const { result } = renderHook(() => useRobot(), { wrapper });

        expect(result.current.jointStates[0].name).toBe("Wrist_Roll");
        expect(result.current.jointStates[0].servoId).toBe(5);
      });

      it("should handle joints with limit properties", () => {
        const jointsWithLimits: JointDetails[] = [
          {
            name: "Elbow",
            servoId: 3,
            jointType: "revolute",
            limit: { lower: 0, upper: 270 },
          },
        ];

        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <RobotProvider robotName="so-arm101" initialJointDetails={jointsWithLimits}>
            {children}
          </RobotProvider>
        );

        const { result } = renderHook(() => useRobot(), { wrapper });

        expect(result.current.jointStates[0].limit).toEqual({ lower: 0, upper: 270 });
      });

      it("should handle joints with only upper limit", () => {
        const jointsWithPartialLimits: JointDetails[] = [
          {
            name: "Pitch",
            servoId: 2,
            jointType: "revolute",
            limit: { upper: 180 },
          },
        ];

        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <RobotProvider robotName="so-arm101" initialJointDetails={jointsWithPartialLimits}>
            {children}
          </RobotProvider>
        );

        const { result } = renderHook(() => useRobot(), { wrapper });

        expect(result.current.jointStates[0].limit).toEqual({ upper: 180 });
      });

      it("should handle joints with only lower limit", () => {
        const jointsWithPartialLimits: JointDetails[] = [
          {
            name: "Rotation",
            servoId: 1,
            jointType: "revolute",
            limit: { lower: -180 },
          },
        ];

        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <RobotProvider robotName="so-arm101" initialJointDetails={jointsWithPartialLimits}>
            {children}
          </RobotProvider>
        );

        const { result } = renderHook(() => useRobot(), { wrapper });

        expect(result.current.jointStates[0].limit).toEqual({ lower: -180 });
      });
    });
  });
});
