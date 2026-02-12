import { renderHook, waitFor } from "@testing-library/react";
import { ScsServoSDK } from "feetech.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { JointDetails } from "@/lib/types/robot";

// Mock @/lib/utils BEFORE importing ScsServoSDK
vi.mock("@/lib/utils", () => ({
  servoPositionToAngle: vi.fn(),
  degreesToServoPosition: vi.fn(),
}));

// Mock feetech.js BEFORE importing ScsServoSDK
vi.mock("feetech.js", () => {
  const mockConnect = vi.fn().mockResolvedValue(undefined);
  const mockDisconnect = vi.fn().mockResolvedValue(undefined);
  const mockSetWheelMode = vi.fn().mockResolvedValue(undefined);
  const mockSetPositionMode = vi.fn().mockResolvedValue(undefined);
  const mockReadPosition = vi.fn().mockResolvedValue(2048);
  const mockWritePosition = vi.fn().mockResolvedValue(undefined);
  const mockWriteWheelSpeed = vi.fn().mockResolvedValue(undefined);
  const mockWriteTorqueEnable = vi.fn().mockResolvedValue(undefined);
  const mockSyncWritePositions = vi.fn().mockResolvedValue(undefined);
  const mockSyncWriteWheelSpeed = vi.fn().mockResolvedValue(undefined);

  // Create a class that will be instantiated
  class ScsServoSDK {
    async connect() {
      return mockConnect();
    }

    async disconnect() {
      return mockDisconnect();
    }

    async setWheelMode(servoId: number) {
      return mockSetWheelMode(servoId);
    }

    async setPositionMode(servoId: number) {
      return mockSetPositionMode(servoId);
    }

    async readPosition(servoId: number) {
      return mockReadPosition(servoId);
    }

    async writePosition(servoId: number, position: number) {
      return mockWritePosition(servoId, position);
    }

    async writeWheelSpeed(servoId: number, speed: number) {
      return mockWriteWheelSpeed(servoId, speed);
    }

    async writeTorqueEnable(servoId: number, enabled: boolean) {
      return mockWriteTorqueEnable(servoId, enabled);
    }

    async syncWritePositions(servoIds: number[], positions: number[]) {
      return mockSyncWritePositions(servoIds, positions);
    }

    async syncWriteWheelSpeed(servoIds: number[], speeds: number[]) {
      return mockSyncWriteWheelSpeed(servoIds, speeds);
    }
  }

  // Make sure spys work on instances
  ScsServoSDK.prototype.connect = mockConnect;
  ScsServoSDK.prototype.disconnect = mockDisconnect;
  ScsServoSDK.prototype.setWheelMode = mockSetWheelMode;
  ScsServoSDK.prototype.setPositionMode = mockSetPositionMode;
  ScsServoSDK.prototype.readPosition = mockReadPosition;
  ScsServoSDK.prototype.writePosition = mockWritePosition;
  ScsServoSDK.prototype.writeWheelSpeed = mockWriteWheelSpeed;
  ScsServoSDK.prototype.writeTorqueEnable = mockWriteTorqueEnable;
  ScsServoSDK.prototype.syncWritePositions = mockSyncWritePositions;
  ScsServoSDK.prototype.syncWriteWheelSpeed = mockSyncWriteWheelSpeed;

  return { ScsServoSDK };
});

// Mock SERVO_CONFIG
vi.mock("@/lib/executionConfig", () => ({
  SERVO_CONFIG: {
    GRIPPER_SERVO_ID: 6,
    GRIPPER_OPEN_ANGLE: 270,
    GRIPPER_CLOSE_ANGLE: 180,
  },
}));

// Test data

// Mock requestAnimationFrame
const mockRequestAnimationFrame = vi.fn((callback: () => void) => {
  const id = setTimeout(callback, 16);
  return id as unknown as number;
});

const mockCancelAnimationFrame = vi.fn((id: number) => {
  clearTimeout(id);
});

vi.stubGlobal("requestAnimationFrame", mockRequestAnimationFrame);
vi.stubGlobal("cancelAnimationFrame", mockCancelAnimationFrame);

import { useRobotControl } from "../useRobotControl";

describe("useRobotControl", () => {
  const testJointDetails: JointDetails[] = [
    { name: "base", servoId: 1, jointType: "revolute", limit: { lower: 0, upper: 360 } },
    { name: "shoulder", servoId: 2, jointType: "revolute", limit: { lower: 0, upper: 180 } },
    { name: "elbow", servoId: 3, jointType: "revolute", limit: { lower: 0, upper: 180 } },
    { name: "wrist_flex", servoId: 4, jointType: "revolute", limit: { lower: 0, upper: 360 } },
    { name: "wrist_roll", servoId: 5, jointType: "continuous" },
  ];

  const testUrdfAngles = {
    base: 90,
    shoulder: 45,
    elbow: 30,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequestAnimationFrame.mockClear();
    mockCancelAnimationFrame.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initial joint states setup", () => {
    it("should initialize joint states with correct defaults", () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails, testUrdfAngles));

      expect(result.current.isConnected).toBe(false);
      expect(result.current.jointStates).toHaveLength(5);
      expect(result.current.jointStates[0].servoId).toBe(1);
      expect(result.current.jointStates[0].degrees).toBe(90);
      expect(result.current.jointStates[0].isMoving).toBe(false);
      expect(result.current.jointStates[4].jointType).toBe("continuous");
      expect(result.current.jointStates[4].speed).toBe(0);
    });

    it("should initialize continuous joints with degrees 0", () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      expect(result.current.jointStates[4].degrees).toBe(0);
      expect(result.current.jointStates[4].jointType).toBe("continuous");
    });

    it("should initialize with urdfInitJointAngles when provided", () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails, testUrdfAngles));

      expect(result.current.jointStates[0].degrees).toBe(90);
      expect(result.current.jointStates[1].degrees).toBe(45);
      expect(result.current.jointStates[2].degrees).toBe(30);
    });

    it("should use 0 degrees for missing urdfInitJointAngles", () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      expect(result.current.jointStates[0].degrees).toBe(0);
      expect(result.current.jointStates[1].degrees).toBe(0);
    });

    it("should initialize initialPositions array as empty", () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      expect(result.current.initialPositions).toEqual([]);
    });
  });

  describe("connectRobot functionality", () => {
    const connectSpy = vi.spyOn(ScsServoSDK.prototype, "connect");
    const setWheelModeSpy = vi.spyOn(ScsServoSDK.prototype, "setWheelMode");
    const setPositionModeSpy = vi.spyOn(ScsServoSDK.prototype, "setPositionMode");
    const writeTorqueEnableSpy = vi.spyOn(ScsServoSDK.prototype, "writeTorqueEnable");
    const readPositionSpy = vi.spyOn(ScsServoSDK.prototype, "readPosition");
    const writePositionSpy = vi.spyOn(ScsServoSDK.prototype, "writePosition");

    it("should connect robot and initialize servos", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails, testUrdfAngles));

      await result.current.connectRobot();

      expect(result.current.isConnected).toBe(true);
      expect(connectSpy).toHaveBeenCalled();
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });

    it("should set wheel mode for continuous joints", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.connectRobot();

      expect(setWheelModeSpy).toHaveBeenCalledWith(5);
      expect(result.current.jointStates[4].speed).toBe(0);
    });

    it("should set position mode and enable torque for revolute joints", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.connectRobot();

      expect(setPositionModeSpy).toHaveBeenCalledWith(1);
      expect(writeTorqueEnableSpy).toHaveBeenCalledWith(1, true);
      expect(setPositionModeSpy).toHaveBeenCalledWith(2);
      expect(writeTorqueEnableSpy).toHaveBeenCalledWith(2, true);
    });

    it("should read initial servo positions", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.connectRobot();

      expect(readPositionSpy).toHaveBeenCalledWith(1);
      expect(readPositionSpy).toHaveBeenCalledWith(2);
      expect(readPositionSpy).toHaveBeenCalledWith(3);
    });

    it("should store initial positions for emergency stop", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.connectRobot();

      expect(result.current.initialPositions).toHaveLength(5);
      expect(result.current.initialPositions[0]).toBeCloseTo(180, 1);
    });

    it("should handle connection errors", async () => {
      // Access the connect method from a mocked instance
      const mockInstance = new ScsServoSDK();
      mockInstance.connect.mockRejectedValue(new Error("Connection failed"));

      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await expect(result.current.connectRobot()).rejects.toThrow();
      expect(result.current.isConnected).toBe(false);
    });
  });

  describe("disconnectRobot functionality", () => {
    const disconnectSpy = vi.spyOn(ScsServoSDK.prototype, "disconnect");
    const writeTorqueEnableSpy = vi.spyOn(ScsServoSDK.prototype, "writeTorqueEnable");
    const writeWheelSpeedSpy = vi.spyOn(ScsServoSDK.prototype, "writeWheelSpeed");

    it("should disconnect from robot", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.connectRobot();
      await result.current.disconnectRobot();

      expect(disconnectSpy).toHaveBeenCalled();
      expect(result.current.isConnected).toBe(false);
    });

    it("should set speed to 0 on write failure", async () => {
      const writeWheelSpeedSpy = vi
        .spyOn(ScsServoSDK.prototype, "writeWheelSpeed")
        .mockRejectedValue(new Error("Failed"));

      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.updateJointSpeed(5, 100);

      expect(result.current.jointStates[4].speed).toBe(0);
      expect(writeWheelSpeedSpy).toHaveBeenCalled();
    });
  });

  describe("updateJointsSpeed", () => {
    it("should update speeds for multiple joints simultaneously", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.updateJointsSpeed([
        { servoId: 5, speed: 50 },
        { servoId: 4, speed: 75 },
      ]);

      expect(result.current.jointStates[4].speed).toBe(50);
      expect(result.current.jointStates[3].speed).toBe(75);
    });
  });
});
