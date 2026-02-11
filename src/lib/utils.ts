import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { BLOCK_IDS } from "./blockIds";
import type { BlockInstance } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a servo position to an angle.
 * @param position - The servo position (0 to 4096).
 * @returns The corresponding angle (0 to 360 degrees).
 */
export function servoPositionToAngle(position: number): number {
  return (position / 4096) * 360;
}

/**
 * Converts radians to degrees.
 * @param radians - The value in radians.
 * @returns The value in degrees.
 */
export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Converts degrees to radians.
 * @param degrees - The value in degrees.
 * @returns The value in radians.
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Converts radians to a servo position.
 * @param radians - The value in radians.
 * @returns The corresponding servo position (0 to 4096).
 */
export function radiansToServoPosition(radians: number): number {
  return Math.min(Math.round((radians * 4096) / (2 * Math.PI)), 4096);
}

/**
 * Converts degrees to a servo position.
 * @param degrees - The value in degrees.
 * @returns The corresponding servo position (0 to 4096).
 */
export function degreesToServoPosition(degrees: number): number {
  return Math.min(Math.round((degrees * 4096) / 360), 4096);
}

// Joint name to servo ID mapping - updated to match robot config
const JOINT_TO_SERVO_ID: Record<string, number> = {
  base: 1, // maps to Rotation
  shoulder: 2, // maps to Pitch
  elbow: 3, // maps to Elbow
  wrist_flex: 4, // maps to Wrist_Pitch
  wrist_roll: 5, // maps to Wrist_Roll
  gripper: 6, // maps to Jaw
};

export function parseBlocksForCommands(
  blocks: BlockInstance[]
): { servoId: number; value: number }[] {
  const commands: { servoId: number; value: number }[] = [];

  blocks.forEach((block) => {
    if (block.definitionId === BLOCK_IDS.MOVE_TO) {
      const joint = block.parameters.joint as string;
      const angle = block.parameters.angle as number;
      const servoId = JOINT_TO_SERVO_ID[joint];
      if (servoId && typeof angle === "number") {
        commands.push({
          servoId,
          value: angle,
        });
      }
    }
    // home_robot is handled separately in ScratchContext
  });

  return commands;
}
