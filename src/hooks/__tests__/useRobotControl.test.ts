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
  return {
    ScsServoSDK: class {
      connect = vi.fn().mockResolvedValue(undefined);
      disconnect = vi.fn().mockResolvedValue(undefined);
      setWheelMode = vi.fn().mockResolvedValue(undefined);
      setPositionMode = vi.fn().mockResolvedValue(undefined);
      readPosition = vi.fn().mockResolvedValue(2048);
      writePosition = vi.fn().mockResolvedValue(undefined);
      writeWheelSpeed = vi.fn().mockResolvedValue(undefined);
      writeTorqueEnable = vi.fn().mockResolvedValue(undefined);
      syncWritePositions = vi.fn().mockResolvedValue(undefined);
      syncWriteWheelSpeed = vi.fn().mockResolvedValue(undefined);
    } as any,
  };
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
    it("should connect robot and initialize servos", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails, testUrdfAngles));

      await result.current.connectRobot();

      expect(result.current.isConnected).toBe(true);
      expect(ScsServoSDK.prototype.connect).toHaveBeenCalled();
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });

    it("should set wheel mode for continuous joints", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.connectRobot();

      expect(ScsServoSDK.prototype.setWheelMode).toHaveBeenCalledWith(5);
      expect(result.current.jointStates[4].speed).toBe(0);
    });

    it("should set position mode and enable torque for revolute joints", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.connectRobot();

      expect(ScsServoSDK.prototype.setPositionMode).toHaveBeenCalledWith(1);
      expect(ScsServoSDK.prototype.writeTorqueEnable).toHaveBeenCalledWith(1, true);
      expect(ScsServoSDK.prototype.setPositionMode).toHaveBeenCalledWith(2);
      expect(ScsServoSDK.prototype.writeTorqueEnable).toHaveBeenCalledWith(2, true);
    });

    it("should read initial servo positions", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.connectRobot();

      expect(ScsServoSDK.prototype.readPosition).toHaveBeenCalledWith(1);
      expect(ScsServoSDK.prototype.readPosition).toHaveBeenCalledWith(2);
      expect(ScsServoSDK.prototype.readPosition).toHaveBeenCalledWith(3);
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
    it("should disconnect from robot", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.connectRobot();
      await result.current.disconnectRobot();

      expect(ScsServoSDK.prototype.disconnect).toHaveBeenCalled();
      expect(result.current.isConnected).toBe(false);
    });

    it("should disable torque for all revolute servos", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.connectRobot();
      await result.current.disconnectRobot();

      expect(ScsServoSDK.prototype.writeTorqueEnable).toHaveBeenCalledWith(1, false);
      expect(ScsServoSDK.prototype.writeTorqueEnable).toHaveBeenCalledWith(2, false);
      expect(ScsServoSDK.prototype.writeTorqueEnable).toHaveBeenCalledWith(3, false);
      expect(ScsServoSDK.prototype.writeTorqueEnable).toHaveBeenCalledWith(4, false);
    });

    it("should set wheel speed to 0 for continuous servos", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.connectRobot();
      await result.current.disconnectRobot();

      expect(ScsServoSDK.prototype.writeWheelSpeed).toHaveBeenCalledWith(5, 0);
    });
  });

  describe("updateJointDegrees (single joint)", () => {
    it("should update targetDegrees for single joint when not connected", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.updateJointDegrees(1, 180);

      expect(result.current.jointStates[0].targetDegrees).toBe(180);
      expect(result.current.jointStates[0].isMoving).toBe(true);
    });

    it("should update degrees for valid range when connected", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.connectRobot();
      await result.current.updateJointDegrees(1, 180);

      expect(ScsServoSDK.prototype.writePosition).toHaveBeenCalledWith(1, 2048);
      expect(ScsServoSDK.prototype.readPosition).toHaveBeenCalledWith(1);
      expect(result.current.jointStates[0].degrees).toBeCloseTo(180, 1);
      expect(result.current.jointStates[0].targetDegrees).toBeCloseTo(180, 1);
      expect(result.current.jointStates[0].isMoving).toBe(false);
    });

    it("should reject values outside 0-360 range", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.updateJointDegrees(1, -10);
      await result.current.updateJointDegrees(1, 370);

      expect(ScsServoSDK.prototype.writePosition).not.toHaveBeenCalled();
      expect(result.current.jointStates[0].targetDegrees).toBeUndefined();
    });

    it("should update degrees and read back actual position", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.connectRobot();
      await result.current.updateJointDegrees(1, 90);

      expect(result.current.jointStates[0].degrees).toBeCloseTo(90, 1);
    });
  });

  describe("updateJointsDegrees (batch update)", () => {
    it("should update multiple joints simultaneously when not connected", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.updateJointsDegrees([
        { servoId: 1, value: 90 },
        { servoId: 2, value: 45 },
      ]);

      expect(result.current.jointStates[0].targetDegrees).toBe(90);
      expect(result.current.jointStates[1].targetDegrees).toBe(45);
      expect(result.current.jointStates[0].isMoving).toBe(true);
      expect(result.current.jointStates[1].isMoving).toBe(true);
    });

    it("should sync write positions for multiple joints when connected", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.connectRobot();
      await result.current.updateJointsDegrees([
        { servoId: 1, value: 90 },
        { servoId: 2, value: 45 },
      ]);

      expect(ScsServoSDK.prototype.syncWritePositions).toHaveBeenCalled();
    });

    it("should skip invalid values in batch update", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.updateJointsDegrees([
        { servoId: 1, value: 90 },
        { servoId: 2, value: 400 },
        { servoId: 3, value: -10 },
        { servoId: 4, value: 180 },
      ]);

      expect(ScsServoSDK.prototype.syncWritePositions).toHaveBeenCalled();
      expect(result.current.jointStates[1].targetDegrees).toBeUndefined();
    });

    it("should skip non-revolute joints in batch update", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.updateJointsDegrees([
        { servoId: 4, value: 180 },
        { servoId: 5, value: 100 },
      ]);

      expect(result.current.jointStates[3].targetDegrees).toBe(180);
      expect(result.current.jointStates[4].targetDegrees).toBeUndefined();
    });
  });

  describe("smooth animation loop", () => {
    it("should animate joints moving towards target degrees", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.updateJointDegrees(1, 180);

      await waitFor(() => {
        expect(result.current.jointStates[0].degrees).toBeGreaterThan(90);
      });
    });

    it("should stop animation when reaching target", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.updateJointDegrees(1, 90);

      await waitFor(() => {
        expect(result.current.jointStates[0].degrees).toBeCloseTo(90, 1);
        expect(result.current.jointStates[0].isMoving).toBe(false);
      });

      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });

    it("should respect max step of 2 degrees per frame", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.updateJointDegrees(1, 90);

      await waitFor(() => {
        expect(result.current.jointStates[0].degrees).toBeGreaterThan(90);
        expect(result.current.jointStates[0].degrees - 90).toBeLessThanOrEqual(2);
      });
    });

    it("should handle continuous joints (no animation)", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.updateJointDegrees(5, 50);

      expect(result.current.jointStates[4].degrees).toBe(0);
      expect(result.current.jointStates[4].targetDegrees).toBeUndefined();
    });

    it("should cancel animation on disconnect", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.updateJointDegrees(1, 180);
      await result.current.connectRobot();
      await result.current.disconnectRobot();

      expect(mockCancelAnimationFrame).toHaveBeenCalled();
    });
  });

  describe("joint limit enforcement", () => {
    it("should enforce upper joint limits", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.updateJointDegrees(1, 360);

      expect(result.current.jointStates[0].degrees).toBeCloseTo(360, 1);
    });

    it("should enforce lower joint limits", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.updateJointDegrees(2, 0);

      expect(result.current.jointStates[1].degrees).toBeCloseTo(0, 1);
    });

    it("should handle joints without limits", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.updateJointDegrees(5, 100);

      expect(result.current.jointStates[4].degrees).toBe(0);
    });
  });

  describe("emergency stop", () => {
    it("should disable torque for all servos", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.connectRobot();
      await result.current.emergencyStop();

      expect(ScsServoSDK.prototype.writeTorqueEnable).toHaveBeenCalledWith(1, false);
      expect(ScsServoSDK.prototype.writeTorqueEnable).toHaveBeenCalledWith(2, false);
      expect(ScsServoSDK.prototype.writeTorqueEnable).toHaveBeenCalledWith(3, false);
      expect(ScsServoSDK.prototype.writeTorqueEnable).toHaveBeenCalledWith(4, false);
      expect(ScsServoSDK.prototype.writeTorqueEnable).toHaveBeenCalledWith(5, false);
    });

    it("should reset joint states to initial positions", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.connectRobot();
      await result.current.updateJointDegrees(1, 180);
      await result.current.emergencyStop();

      expect(result.current.jointStates[0].degrees).toBeCloseTo(180, 1);
      expect(result.current.jointStates[0].isMoving).toBe(false);
    });

    it("should reset continuous joints to speed 0", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.connectRobot();
      await result.current.updateJointSpeed(5, 100);
      await result.current.emergencyStop();

      expect(result.current.jointStates[4].speed).toBe(0);
    });

    it("should not execute when robot is not connected", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.emergencyStop();

      expect(ScsServoSDK.prototype.writeTorqueEnable).not.toHaveBeenCalled();
    });
  });

  describe("servo position to angle conversion", () => {
    it("should convert degrees to servo position correctly", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.updateJointDegrees(1, 90);

      expect(ScsServoSDK.prototype.writePosition).toHaveBeenCalledWith(1, 1024);
    });

    it("should convert servo position back to degrees", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.connectRobot();
      await result.current.updateJointDegrees(1, 180);

      expect(result.current.jointStates[0].degrees).toBeCloseTo(180, 1);
    });
  });

  describe("homeRobot", () => {
    it("should not execute when robot is not connected", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails, testUrdfAngles));

      await result.current.homeRobot();

      expect(ScsServoSDK.prototype.writePosition).not.toHaveBeenCalled();
    });

    it("should move all joints to their initial positions", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails, testUrdfAngles));

      await result.current.connectRobot();
      await result.current.homeRobot();

      expect(ScsServoSDK.prototype.writePosition).toHaveBeenCalledTimes(3);
      expect(result.current.jointStates[0].degrees).toBeCloseTo(90, 1);
      expect(result.current.jointStates[1].degrees).toBeCloseTo(45, 1);
      expect(result.current.jointStates[2].degrees).toBeCloseTo(30, 1);
    });
  });

  describe("gripper control", () => {
    it("should open gripper", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.openGripper();

      expect(ScsServoSDK.prototype.writePosition).toHaveBeenCalledWith(6, (270 * 4096) / 360);
    });

    it("should close gripper", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.closeGripper();

      expect(ScsServoSDK.prototype.writePosition).toHaveBeenCalledWith(6, (180 * 4096) / 360);
    });
  });

  describe("updateJointSpeed", () => {
    it("should update speed for continuous joints", async () => {
      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.updateJointSpeed(5, 100);

      expect(result.current.jointStates[4].speed).toBe(100);
      expect(ScsServoSDK.prototype.writeWheelSpeed).toHaveBeenCalledWith(5, 100);
    });

    it("should set speed to 0 on write failure", async () => {
      vi.spyOn(ScsServoSDK.prototype, "writeWheelSpeed").mockRejectedValue(new Error("Failed"));

      const { result } = renderHook(() => useRobotControl(testJointDetails));

      await result.current.updateJointSpeed(5, 100);

      expect(result.current.jointStates[4].speed).toBe(0);
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
      expect(ScsServoSDK.prototype.syncWriteWheelSpeed).toHaveBeenCalled();
    });
  });
});
