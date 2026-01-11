// Execution timing configuration
export const EXECUTION_CONFIG = {
  /** Delay between consecutive block executions (ms) */
  INTER_BLOCK_DELAY_MS: 500,
  /** Delay after homing before program execution (ms) */
  POST_HOME_DELAY_MS: 1000,
  /** Default wait duration if not specified (ms) */
  DEFAULT_WAIT_MS: 1000,
} as const;

// Servo configuration
export const SERVO_CONFIG = {
  /** Gripper servo ID */
  GRIPPER_SERVO_ID: 6,
  /** Gripper open angle (degrees) */
  GRIPPER_OPEN_ANGLE: 270,
  /** Gripper close angle (degrees) */
  GRIPPER_CLOSE_ANGLE: 180,
  /** Servo position range */
  POSITION_MIN: 0,
  POSITION_MAX: 4096,
  /** Angle range */
  ANGLE_MIN: 0,
  ANGLE_MAX: 360,
} as const;
