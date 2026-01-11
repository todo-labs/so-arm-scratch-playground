export interface RobotArmState {
  base: number;
  shoulder: number;
  elbow: number;
  wrist: number;
  gripper: number;
  x: number;
  y: number;
  z: number;
}

export type JointDetails = {
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
