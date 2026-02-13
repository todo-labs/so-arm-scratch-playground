export type MoveJoint = "base" | "shoulder" | "elbow" | "wrist_flex" | "wrist_roll" | "gripper";

export const JOINT_TO_SERVO_ID: Record<MoveJoint, number> = {
  base: 1,
  shoulder: 2,
  elbow: 3,
  wrist_flex: 4,
  wrist_roll: 5,
  gripper: 6,
};

export const MOVE_JOINT_LIMITS: Record<MoveJoint, { min: number; max: number }> = {
  // SO-101 URDF limits (radians) converted to the servo-angle domain used in this app (0-360),
  // where 180 is the neutral pose: deg = rad * 180 / PI + 180
  // j1 [-1.91986, 1.91986] -> [70, 290]
  // j2 [-1.74533, 1.74533] -> [80, 280]
  // j3 [-1.74533, 1.5708] -> [80, 270]
  // j4 [-1.65806, 1.65806] -> [85, 275]
  // j5 [-2.74385, 2.84121] -> [23, 343]
  // j6 [-0.174533, 1.74533] -> [170, 280]
  base: { min: 70, max: 290 },
  shoulder: { min: 80, max: 280 },
  elbow: { min: 80, max: 270 },
  wrist_flex: { min: 85, max: 275 },
  wrist_roll: { min: 23, max: 343 },
  gripper: { min: 170, max: 280 },
};

export function getMoveJointLimits(joint: string | undefined): { min: number; max: number } {
  if (!joint) return { min: 0, max: 360 };
  return MOVE_JOINT_LIMITS[joint as MoveJoint] ?? { min: 0, max: 360 };
}

export function clampMoveJointAngle(joint: string | undefined, angle: number): number {
  const { min, max } = getMoveJointLimits(joint);
  return Math.max(min, Math.min(max, angle));
}
