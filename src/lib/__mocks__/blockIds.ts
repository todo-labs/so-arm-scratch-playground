export const BLOCK_IDS = {
  MOVE_TO: "move_to",
  HOME_ROBOT: "home_robot",
  OPEN_GRIPPER: "open_gripper",
  CLOSE_GRIPPER: "close_gripper",
  WAIT_SECONDS: "wait_seconds",
  REPEAT: "repeat",
  IF_CONDITION: "if_condition",
  WHILE_LOOP: "while_loop",
} as const;

export type BlockId = (typeof BLOCK_IDS)[keyof typeof BLOCK_IDS];
