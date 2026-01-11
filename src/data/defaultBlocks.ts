import type { BlockDefinition } from "@/lib/types";
import { registry } from "@/lib/blockRegistry";
import { BLOCK_IDS } from "@/lib/blockIds";

const defaultBlocks: BlockDefinition[] = [
  // Motion blocks
  {
    id: BLOCK_IDS.MOVE_TO,
    category: "motion",
    name: "move to",
    color: "hsl(217, 91%, 60%)",
    shape: "command",
    parameters: [
      {
        name: "joint",
        type: "dropdown",
        defaultValue: "base",
        options: [
          "base",
          "shoulder",
          "elbow",
          "wrist_flex",
          "wrist_roll",
          "gripper",
        ],
      },
      {
        name: "angle",
        type: "angle",
        defaultValue: 0,
        min: 0,
        max: 360,
      },
    ],
    codeTemplate: "moveTo('{{joint}}', {{angle}});",
  },

  // System blocks
  {
    id: BLOCK_IDS.HOME_ROBOT,
    category: "motion",
    name: "home robot",
    color: "hsl(217, 91%, 60%)",
    shape: "command",
    parameters: [],
    codeTemplate: "homeRobot();",
  },

  // Gripper blocks
  {
    id: BLOCK_IDS.OPEN_GRIPPER,
    category: "gripper",
    name: "open gripper",
    color: "hsl(120, 60%, 60%)",
    shape: "command",
    parameters: [],
    codeTemplate: "openGripper();",
  },
  {
    id: BLOCK_IDS.CLOSE_GRIPPER,
    category: "gripper",
    name: "close gripper",
    color: "hsl(120, 60%, 60%)",
    shape: "command",
    parameters: [],
    codeTemplate: "closeGripper();",
  },

  // Control blocks
  {
    id: BLOCK_IDS.WAIT_SECONDS,
    category: "control",
    name: "wait seconds",
    color: "hsl(38, 92%, 50%)",
    shape: "command",
    parameters: [
      {
        name: "seconds",
        type: "number",
        defaultValue: 1,
        min: 0,
        max: 60,
        step: 1,
      },
    ],
    codeTemplate: "wait({{seconds}});",
  },
  {
    id: BLOCK_IDS.REPEAT,
    category: "control",
    name: "repeat",
    color: "hsl(38, 92%, 50%)",
    shape: "command",
    parameters: [
      {
        name: "times",
        type: "number",
        defaultValue: 3,
        min: 1,
        max: 999,
      },
    ],
    codeTemplate: "for (let i = 0; i < {{times}}; i++) {\n  {{children}}\n}",
  },
  {
    id: BLOCK_IDS.IF_CONDITION,
    category: "control",
    name: "if then",
    color: "hsl(38, 92%, 50%)",
    shape: "command",
    parameters: [
      {
        name: "condition",
        type: "boolean",
        defaultValue: true,
      },
    ],
    codeTemplate: "if ({{condition}}) {\n  {{children}}\n}",
  },
  {
    id: BLOCK_IDS.WHILE_LOOP,
    category: "control",
    name: "while",
    color: "hsl(38, 92%, 50%)",
    shape: "command",
    parameters: [
      {
        name: "condition",
        type: "boolean",
        defaultValue: true,
      },
    ],
    codeTemplate: "while ({{condition}}) {\n  {{children}}\n}",
  },
];

// Register all default blocks
defaultBlocks.forEach((block) => {
  registry.registerBlock(block);
});

export { defaultBlocks };
