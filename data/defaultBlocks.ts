import type { BlockDefinition } from "@/lib/types";
import { registry } from "@/lib/blockRegistry";

const defaultBlocks: BlockDefinition[] = [
  // Motion blocks
  {
    id: "move_to",
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
    id: "home_robot",
    category: "motion",
    name: "home robot",
    color: "hsl(217, 91%, 60%)",
    shape: "command",
    parameters: [],
    codeTemplate: "homeRobot();",
  },

  // Gripper blocks
  {
    id: "open_gripper",
    category: "gripper",
    name: "open gripper",
    color: "hsl(120, 60%, 60%)",
    shape: "command",
    parameters: [],
    codeTemplate: "openGripper();",
  },
  {
    id: "close_gripper",
    category: "gripper",
    name: "close gripper",
    color: "hsl(120, 60%, 60%)",
    shape: "command",
    parameters: [],
    codeTemplate: "closeGripper();",
  },

  // Control blocks
  {
    id: "wait_seconds",
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
    id: "repeat",
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
    id: "if_condition",
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
];

// Register all default blocks
defaultBlocks.forEach((block) => {
  registry.registerBlock(block);
});

export { defaultBlocks };
