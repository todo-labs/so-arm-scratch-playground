/**
 * Control virtual degree with this hook, the real degree is auto managed
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { ScsServoSDK } from "feetech.js";
import { servoPositionToAngle, degreesToServoPosition } from "../lib/utils";

type JointDetails = {
  name: string;
  servoId: number;
  jointType: "revolute" | "continuous";
  limit?: {
    lower?: number;
    upper?: number;
  };
};

export type JointState = {
  name: string;
  servoId: number;
  degrees: number;
  speed?: number;
  targetDegrees?: number;
  isMoving?: boolean;
  jointType: "revolute" | "continuous";
  limit?: { lower?: number; upper?: number };
};

/* prettier-ignore */
export type UpdateJointDegrees = (servoId: number, value: number) => Promise<void>;
/* prettier-ignore */
export type UpdateJointSpeed = (servoId: number, speed: number) => Promise<void>;
/* prettier-ignore */
export type UpdateJointsDegrees = (updates: { servoId: number; value: number }[]) => Promise<void>;
/* prettier-ignore */
export type UpdateJointsSpeed = (updates: { servoId: number; speed: number }[]) => Promise<void>;

export function useRobotControl(
  initialJointDetails: JointDetails[],
  urdfInitJointAngles?: { [key: string]: number }
) {
  const scsServoSDK = useRef(new ScsServoSDK()).current;
  const [isConnected, setIsConnected] = useState(false);
  const [jointDetails, setJointDetails] = useState(initialJointDetails);
  const animationRef = useRef<number | undefined>(undefined);

  // Joint states
  const [jointStates, setJointStates] = useState<JointState[]>(
    jointDetails.map((j) => ({
      jointType: j.jointType,
      degrees:
        j.jointType === "revolute" ? urdfInitJointAngles?.[j.name] ?? 0 : 0,
      speed: j.jointType === "continuous" ? 0 : undefined,
      servoId: j.servoId,
      name: j.name,
      limit: j.limit,
      targetDegrees:
        j.jointType === "revolute" ? urdfInitJointAngles?.[j.name] ?? 0 : 0,
      isMoving: false,
    }))
  );

  // Store initial positions of servos
  const [initialPositions, setInitialPositions] = useState<number[]>([]);

  useEffect(() => {
    setJointStates(
      jointDetails.map((j) => ({
        jointType: j.jointType,
        degrees:
          j.jointType === "revolute" ? urdfInitJointAngles?.[j.name] ?? 0 : 0,
        speed: j.jointType === "continuous" ? 0 : undefined,
        servoId: j.servoId,
        name: j.name,
        limit: j.limit,
        targetDegrees:
          j.jointType === "revolute" ? urdfInitJointAngles?.[j.name] ?? 0 : 0,
        isMoving: false,
      }))
    );
  }, [jointDetails, urdfInitJointAngles]);

  // Smooth animation loop for virtual robot
  useEffect(() => {
    const animate = () => {
      setJointStates((prevStates) => {
        let hasMovement = false;
        const newStates = prevStates.map((state) => {
          if (
            state.isMoving &&
            state.targetDegrees !== undefined &&
            state.jointType === "revolute"
          ) {
            const diff = state.targetDegrees - state.degrees;
            const maxStep = 2; // degrees per frame

            if (Math.abs(diff) > 0.1) {
              hasMovement = true;
              const step = Math.sign(diff) * Math.min(Math.abs(diff), maxStep);
              return {
                ...state,
                degrees: state.degrees + step,
              };
            } else {
              // Reached target
              return {
                ...state,
                degrees: state.targetDegrees,
                isMoving: false,
              };
            }
          }
          return state;
        });

        if (hasMovement) {
          animationRef.current = requestAnimationFrame(animate);
        }

        return newStates;
      });
    };

    // Start animation if any joint is moving
    const hasMovingJoints = jointStates.some((state) => state.isMoving);
    if (hasMovingJoints && !animationRef.current) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    };
  }, [jointStates]);

  // Connect to the robot
  const connectRobot = useCallback(async () => {
    try {
      await scsServoSDK.connect();
      const newStates = [...jointStates];
      const initialPos: number[] = [];
      for (let i = 0; i < jointDetails.length; i++) {
        try {
          if (jointDetails[i].jointType === "continuous") {
            await scsServoSDK.setWheelMode(jointDetails[i].servoId);
            newStates[i].speed = 0;
          } else {
            await scsServoSDK.setPositionMode(jointDetails[i].servoId);
            const servoPosition = await scsServoSDK.readPosition(
              jointDetails[i].servoId
            );
            const positionInDegrees = servoPositionToAngle(servoPosition);
            initialPos.push(positionInDegrees);
            newStates[i].degrees = positionInDegrees;

            // Enable torque for revolute servos
            await scsServoSDK.writeTorqueEnable(jointDetails[i].servoId, true);
          }
        } catch (error) {
          console.error(
            `Failed to initialize joint ${jointDetails[i].servoId}:`,
            error
          );
          initialPos.push(0);
          if (jointDetails[i].jointType === "revolute") {
            newStates[i].degrees = 0;
            newStates[i].isMoving = false;
          } else if (jointDetails[i].jointType === "continuous") {
            newStates[i].speed = 0;
          }
        }
      }
      setInitialPositions(initialPos);
      setJointStates(newStates);
      setIsConnected(true);
      console.log("Robot connected successfully.");
    } catch (error) {
      setIsConnected(false);
      alert(error);
      console.error("Failed to connect to the robot:", error);
    }
  }, [scsServoSDK, jointStates, jointDetails]);

  // Disconnect from the robot
  const disconnectRobot = useCallback(async () => {
    try {
      // Disable torque for revolute servos and set wheel speed to 0 for continuous servos
      for (let i = 0; i < jointDetails.length; i++) {
        try {
          if (jointDetails[i].jointType === "continuous") {
            await scsServoSDK.writeWheelSpeed(jointDetails[i].servoId, 0);
          }
          await scsServoSDK.writeTorqueEnable(jointDetails[i].servoId, false);
        } catch (error) {
          console.error(
            `Failed to reset joint ${jointDetails[i].servoId} during disconnect:`,
            error
          );
        }
      }

      await scsServoSDK.disconnect();
      setIsConnected(false);
      console.log("Robot disconnected successfully.");
    } catch (error) {
      console.error("Failed to disconnect from the robot:", error);
    }
  }, [jointDetails, scsServoSDK]);

  // Update revolute joint degrees
  const updateJointDegrees = useCallback(
    async (servoId: number, value: number) => {
      setJointStates((prevStates) => {
        const newStates = [...prevStates];
        const jointIndex = newStates.findIndex(
          (state) => state.servoId === servoId
        );
        if (jointIndex !== -1) {
          newStates[jointIndex].targetDegrees = value;
          newStates[jointIndex].isMoving = true;
        }
        return newStates;
      });

      if (isConnected) {
        try {
          if (value >= 0 && value <= 360) {
            const servoPosition = degreesToServoPosition(value);
            await scsServoSDK.writePosition(servoId, Math.round(servoPosition));
            // Read back the actual position and update the virtual state
            const actualPosition = await scsServoSDK.readPosition(servoId);
            const actualDegrees = servoPositionToAngle(actualPosition);
            setJointStates((prevStates) => {
              const newStates = [...prevStates];
              const jointIndex = newStates.findIndex(
                (state) => state.servoId === servoId
              );
              if (jointIndex !== -1) {
                newStates[jointIndex].degrees = actualDegrees;
                newStates[jointIndex].targetDegrees = actualDegrees;
                newStates[jointIndex].isMoving = false;
              }
              return newStates;
            });
          } else {
            console.warn(
              `Value ${value} for servo ${servoId} is out of range (0-360). Skipping update.`
            );
          }
        } catch (error) {
          console.error(
            `Failed to update servo degrees for joint with servoId ${servoId}:`,
            error
          );
        }
      }
    },
    [isConnected, scsServoSDK]
  );

  // Update continuous joint speed
  const updateJointSpeed = useCallback(
    async (servoId: number, speed: number) => {
      const newStates = [...jointStates];
      const jointIndex = newStates.findIndex(
        (state) => state.servoId === servoId
      );

      if (jointIndex !== -1) {
        newStates[jointIndex].speed = speed;

        if (isConnected) {
          try {
            await scsServoSDK.writeWheelSpeed(servoId, speed);
          } catch (error) {
            console.error(
              `Failed to update speed for joint with servoId ${servoId}:`,
              error
            );
            newStates[jointIndex].speed = 0;
          }
        }

        setJointStates(newStates);
      }
    },
    [jointStates, isConnected, scsServoSDK]
  );

  // Update multiple joints' degrees simultaneously
  const updateJointsDegrees: UpdateJointsDegrees = useCallback(
    async (updates) => {
      setJointStates((prevStates) => {
        const newStates = [...prevStates];
        updates.forEach(({ servoId, value }) => {
          const jointIndex = newStates.findIndex(
            (state) => state.servoId === servoId
          );
          if (
            jointIndex !== -1 &&
            newStates[jointIndex].jointType === "revolute"
          ) {
            newStates[jointIndex].targetDegrees = value;
            newStates[jointIndex].isMoving = true;
          }
        });
        return newStates;
      });

      if (isConnected) {
        const servoPositions: Record<number, number> = {};
        updates.forEach(({ servoId, value }) => {
          if (value >= 0 && value <= 360) {
            const servoPosition = degreesToServoPosition(value);
            servoPositions[servoId] = Math.round(servoPosition);
          } else {
            console.warn(
              `Value ${value} for servo ${servoId} is out of range (0-360). Skipping update in sync write.`
            );
          }
        });
        if (Object.keys(servoPositions).length > 0) {
          try {
            await scsServoSDK.syncWritePositions(servoPositions);
          } catch (error) {
            console.error("Failed to update multiple servo degrees:", error);
          }
        }
      }
    },
    [isConnected, scsServoSDK]
  );

  // Update multiple joints' speed simultaneously
  const updateJointsSpeed: UpdateJointsSpeed = useCallback(
    async (updates) => {
      const newStates = [...jointStates];
      const servoSpeeds: Record<number, number> = {};

      updates.forEach(({ servoId, speed }) => {
        const jointIndex = newStates.findIndex(
          (state) => state.servoId === servoId
        );

        if (jointIndex !== -1) {
          newStates[jointIndex].speed = speed;

          if (isConnected) {
            servoSpeeds[servoId] = speed;
          }
        }
      });

      if (isConnected && Object.keys(servoSpeeds).length > 0) {
        try {
          await scsServoSDK.syncWriteWheelSpeed(servoSpeeds);
        } catch (error) {
          console.error("Failed to update multiple servo speeds:", error);
          updates.forEach(({ servoId }) => {
            const jointIndex = newStates.findIndex(
              (state) => state.servoId === servoId
            );
            if (jointIndex !== -1) {
              newStates[jointIndex].speed = 0;
            }
          });
        }
      }

      setJointStates(newStates);
    },
    [jointStates, isConnected, scsServoSDK]
  );

  // Home the robot - move all joints to their initial positions from URDF
  const homeRobot = useCallback(async () => {
    if (!isConnected) {
      alert("Robot is not connected. Cannot home robot.");
      console.warn("Robot is not connected. Cannot home robot.");
      return;
    }
    const homeUpdates = jointDetails.map((joint) => {
      const homeAngle = urdfInitJointAngles?.[joint.name] ?? 0;
      return {
        servoId: joint.servoId,
        value: homeAngle,
      };
    });
    console.log("Homing robot to URDF initial positions:", homeUpdates);
    // Move each joint individually for better reliability
    for (const { servoId, value } of homeUpdates) {
      try {
        await updateJointDegrees(servoId, value);
        console.log(`Homed joint servoId ${servoId} to ${value} degrees`);
      } catch (error) {
        console.error(`Failed to home joint servoId ${servoId}:`, error);
      }
    }
  }, [isConnected, jointDetails, urdfInitJointAngles, updateJointDegrees]);

  const emergencyStop = useCallback(async () => {
    if (isConnected) {
      try {
        // Disable torque for all servos
        for (const joint of jointDetails) {
          try {
            await scsServoSDK.writeTorqueEnable(joint.servoId, false);
          } catch (error) {
            console.error(
              `Failed to disable torque for joint ${joint.servoId}:`,
              error
            );
          }
        }
        // Reset all joint states to "N/A"
        const newStates = jointStates.map((state, idx) => ({
          ...state,
          degrees:
            state.jointType === "revolute" ? initialPositions[idx] ?? 0 : 0,
          speed: state.jointType === "continuous" ? 0 : undefined,
          targetDegrees:
            state.jointType === "revolute" ? initialPositions[idx] ?? 0 : 0,
          isMoving: false,
        }));
        setJointStates(newStates);
        console.log("Emergency stop executed successfully.");
      } catch (error) {
        console.error("Failed to execute emergency stop:", error);
      }
    } else {
      console.warn("Cannot execute emergency stop, robot is not connected.");
    }
  }, [isConnected, jointDetails, jointStates, initialPositions, scsServoSDK]);

  // Gripper control (Jaw = servoId 6)
  const GRIPPER_SERVO_ID = 6;
  const GRIPPER_OPEN_ANGLE = 270;
  const GRIPPER_CLOSE_ANGLE = 180;

  const openGripper = useCallback(async () => {
    await updateJointDegrees(GRIPPER_SERVO_ID, GRIPPER_OPEN_ANGLE);
  }, [updateJointDegrees]);

  const closeGripper = useCallback(async () => {
    await updateJointDegrees(GRIPPER_SERVO_ID, GRIPPER_CLOSE_ANGLE);
  }, [updateJointDegrees]);

  return {
    isConnected,
    connectRobot,
    disconnectRobot,
    initialPositions,
    jointStates,
    updateJointDegrees,
    updateJointsDegrees,
    updateJointSpeed,
    updateJointsSpeed,
    setJointDetails,
    homeRobot,
    openGripper,
    closeGripper,
    emergencyStop,
  };
}
