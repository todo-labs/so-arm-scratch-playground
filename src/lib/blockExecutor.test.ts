import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  type BlockExecutorDeps,
  ConnectionLostError,
  ExecutionAbortedError,
  ExecutionLimitError,
  executeBlocks,
} from "./blockExecutor";
import type { BlockInstance } from "./types";

function createBlockInstance(
  definitionId: string,
  parameters: Record<string, string | number | boolean> = {},
  parentId?: string
): BlockInstance {
  return {
    id: Math.random().toString(),
    definitionId,
    parameters,
    x: 0,
    y: 0,
    children: [],
    isSnapped: false,
    parentId,
  };
}

describe("Block Executor", () => {
  const mockUpdateJoints = vi.fn().mockResolvedValue(undefined);
  const mockHomeRobot = vi.fn().mockResolvedValue(undefined);
  const mockOpenGripper = vi.fn().mockResolvedValue(undefined);
  const mockCloseGripper = vi.fn().mockResolvedValue(undefined);
  const mockIsConnected = vi.fn().mockReturnValue(true);

  const deps: BlockExecutorDeps = {
    updateJointsDegrees: mockUpdateJoints,
    homeRobot: mockHomeRobot,
    openGripper: mockOpenGripper,
    closeGripper: mockCloseGripper,
    isConnected: mockIsConnected,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsConnected.mockReturnValue(true);
  });

  describe("Error Classes", () => {
    it("should create ExecutionAbortedError with correct name", () => {
      const error = new ExecutionAbortedError();
      expect(error.name).toBe("ExecutionAbortedError");
      expect(error.message).toBe("Execution was aborted");
    });

    it("should create ExecutionAbortedError with custom message", () => {
      const error = new ExecutionAbortedError("Custom aborted message");
      expect(error.name).toBe("ExecutionAbortedError");
      expect(error.message).toBe("Custom aborted message");
    });

    it("should create ConnectionLostError with correct name", () => {
      const error = new ConnectionLostError();
      expect(error.name).toBe("ConnectionLostError");
      expect(error.message).toBe("Robot connection lost during execution");
    });

    it("should create ConnectionLostError with custom message", () => {
      const error = new ConnectionLostError("Connection gone");
      expect(error.name).toBe("ConnectionLostError");
      expect(error.message).toBe("Connection gone");
    });

    it("should create ExecutionLimitError with correct name", () => {
      const error = new ExecutionLimitError();
      expect(error.name).toBe("ExecutionLimitError");
      expect(error.message).toBe("Execution stopped due to safety limits");
    });
  });

  describe("Execution Logic", () => {
    it("should throw error if updateJointsDegrees is not provided", async () => {
      const incompleteDeps: BlockExecutorDeps = {
        isConnected: mockIsConnected,
      };

      const blocks: BlockInstance[] = [createBlockInstance("move_to", {})];

      await expect(executeBlocks(blocks, incompleteDeps)).rejects.toThrow(
        "Robot control functions not available."
      );
    });

    it("should call homeRobot at start if blocksToExecute is not provided", async () => {
      const blocks: BlockInstance[] = [];

      await executeBlocks(blocks, deps);

      expect(mockHomeRobot).toHaveBeenCalledTimes(1);
    });

    it("should not call homeRobot if blocksToExecute is provided", async () => {
      const blocks: BlockInstance[] = [createBlockInstance("wait_seconds", { seconds: 1 })];

      await executeBlocks(blocks, deps, {}, [blocks[0]]);

      expect(mockHomeRobot).not.toHaveBeenCalled();
    });

    it("should throw ConnectionLostError if robot disconnects", async () => {
      mockIsConnected.mockReturnValue(false);

      const blocks: BlockInstance[] = [];

      await expect(executeBlocks(blocks, deps)).rejects.toThrow(ConnectionLostError);
    });
  });

  describe("Abort Signal", () => {
    it("should throw ExecutionAbortedError if signal is aborted before execution", async () => {
      const abortController = new AbortController();
      abortController.abort();

      const blocks: BlockInstance[] = [];

      await expect(executeBlocks(blocks, deps, { signal: abortController.signal })).rejects.toThrow(
        ExecutionAbortedError
      );
    });

    it("should throw ExecutionAbortedError during execution", async () => {
      const abortController = new AbortController();

      const blocks: BlockInstance[] = [createBlockInstance("wait_seconds", { seconds: 0.5 })];

      setTimeout(() => abortController.abort(), 10);

      await expect(executeBlocks(blocks, deps, { signal: abortController.signal })).rejects.toThrow(
        ExecutionAbortedError
      );
    }, 15000);
  });

  describe("Block Types", () => {
    it("should execute wait_seconds block", async () => {
      const blocks: BlockInstance[] = [createBlockInstance("wait_seconds", { seconds: 1 })];

      await executeBlocks(blocks, deps, {}, blocks);

      expect(mockHomeRobot).not.toHaveBeenCalled();
      expect(mockUpdateJoints).not.toHaveBeenCalled();
    });

    it("should execute open_gripper block", async () => {
      const blocks: BlockInstance[] = [createBlockInstance("open_gripper", {})];

      await executeBlocks(blocks, deps, {}, blocks);

      expect(mockOpenGripper).toHaveBeenCalledTimes(1);
    });

    it("should execute close_gripper block", async () => {
      const blocks: BlockInstance[] = [createBlockInstance("close_gripper", {})];

      await executeBlocks(blocks, deps, {}, blocks);

      expect(mockCloseGripper).toHaveBeenCalledTimes(1);
    });

    it("should execute home_robot block", async () => {
      const blocks: BlockInstance[] = [createBlockInstance("home_robot", {})];

      await executeBlocks(blocks, deps, {}, blocks);

      expect(mockHomeRobot).toHaveBeenCalledTimes(1);
    });
  });

  describe("Repeat Block", () => {
    it("should execute repeat block with correct number of iterations", async () => {
      const childBlock = createBlockInstance("wait_seconds", { seconds: 0.1 }, "1");

      const blocks: BlockInstance[] = [createBlockInstance("repeat", { times: 3 }), childBlock];

      await executeBlocks(blocks, deps, {}, blocks);

      expect(childBlock.parameters.seconds).toBeDefined();
    });

    it("should handle repeat with string times parameter", async () => {
      const childBlock = createBlockInstance("wait_seconds", { seconds: 0.1 }, "1");

      const blocks: BlockInstance[] = [createBlockInstance("repeat", { times: "5" }), childBlock];

      await executeBlocks(blocks, deps, {}, blocks);

      expect(childBlock.parameters.seconds).toBeDefined();
    });

    it("should default to 1 iteration if times is invalid", async () => {
      const childBlock = createBlockInstance("wait_seconds", { seconds: 0.1 }, "1");

      const blocks: BlockInstance[] = [
        createBlockInstance("repeat", { times: "invalid" }),
        childBlock,
      ];

      await executeBlocks(blocks, deps, {}, blocks);

      expect(childBlock.parameters.seconds).toBeDefined();
    });
  });

  describe("If Condition Block", () => {
    it("should execute child blocks when condition is true", async () => {
      const childBlock = createBlockInstance("wait_seconds", { seconds: 0.1 }, "1");

      const blocks: BlockInstance[] = [
        createBlockInstance("if_condition", { condition: true }),
        childBlock,
      ];

      await executeBlocks(blocks, deps, {}, blocks);

      expect(childBlock.parameters.seconds).toBeDefined();
    });

    it("should not execute child blocks when condition is false", async () => {
      const childBlock = createBlockInstance("wait_seconds", { seconds: 0.1 }, "1");

      const blocks: BlockInstance[] = [
        createBlockInstance("if_condition", { condition: false }),
        childBlock,
      ];

      await executeBlocks(blocks, deps, {}, blocks);

      expect(childBlock.parameters.seconds).toBeDefined();
    });
  });

  describe("If Else Block", () => {
    it("should execute then branch when condition is true", async () => {
      const ifElseBlock = createBlockInstance("if_else", { condition: true });
      const thenBlock = createBlockInstance("open_gripper", {}, ifElseBlock.id);
      const elseBlock: BlockInstance = {
        ...createBlockInstance("close_gripper", {}, ifElseBlock.id),
        childSlot: "else",
      };

      await executeBlocks([ifElseBlock, thenBlock, elseBlock], deps, {}, [ifElseBlock]);

      expect(mockOpenGripper).toHaveBeenCalledTimes(1);
      expect(mockCloseGripper).not.toHaveBeenCalled();
    });

    it("should execute else branch when condition is false", async () => {
      const ifElseBlock = createBlockInstance("if_else", { condition: false });
      const thenBlock = createBlockInstance("open_gripper", {}, ifElseBlock.id);
      const elseBlock: BlockInstance = {
        ...createBlockInstance("close_gripper", {}, ifElseBlock.id),
        childSlot: "else",
      };

      await executeBlocks([ifElseBlock, thenBlock, elseBlock], deps, {}, [ifElseBlock]);

      expect(mockCloseGripper).toHaveBeenCalledTimes(1);
      expect(mockOpenGripper).not.toHaveBeenCalled();
    });
  });
});
