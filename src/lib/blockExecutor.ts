import { BLOCK_IDS } from "./blockIds";
import { EXECUTION_CONFIG } from "./executionConfig";
import { logger } from "./logger";
import type { BlockInstance } from "./types";
import { parseBlocksForCommands } from "./utils";

const log = logger.scope("BlockExecutor");

export class ExecutionAbortedError extends Error {
  constructor(message = "Execution was aborted") {
    super(message);
    this.name = "ExecutionAbortedError";
  }
}

export class ConnectionLostError extends Error {
  constructor(message = "Robot connection lost during execution") {
    super(message);
    this.name = "ConnectionLostError";
  }
}

export interface BlockExecutorDeps {
  updateJointsDegrees?: (updates: { servoId: number; value: number }[]) => Promise<void>;
  homeRobot?: () => Promise<void>;
  openGripper?: () => Promise<void>;
  closeGripper?: () => Promise<void>;
  isConnected?: () => boolean;
}

export interface ExecuteBlocksOptions {
  signal?: AbortSignal;
}

/**
 * Helper to create a cancellable delay
 */
function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new ExecutionAbortedError());
      return;
    }

    const timeout = setTimeout(resolve, ms);

    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timeout);
        reject(new ExecutionAbortedError());
      },
      { once: true }
    );
  });
}

/**
 * Checks if the signal has been aborted and throws if so
 */
function checkAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new ExecutionAbortedError();
  }
}

/**
 * Checks if the robot is still connected
 */
function checkConnection(isConnected?: () => boolean): void {
  if (isConnected && !isConnected()) {
    throw new ConnectionLostError();
  }
}

/**
 * Executes a sequence of blocks with abort and connection checking support
 */
export async function executeBlocks(
  allBlocks: BlockInstance[],
  deps: BlockExecutorDeps,
  options: ExecuteBlocksOptions = {},
  blocksToExecute?: BlockInstance[]
): Promise<void> {
  const { updateJointsDegrees, homeRobot, openGripper, closeGripper, isConnected } = deps;
  const { signal } = options;

  if (!updateJointsDegrees) {
    throw new Error("Robot control functions not available.");
  }

  // Check initial state
  checkAborted(signal);
  checkConnection(isConnected);

  // If blocksToExecute is not provided, we start with top-level blocks
  const currentBlocks = blocksToExecute || allBlocks.filter((b) => !b.parentId);

  // If this is the initial call (no blocksToExecute provided), home the robot
  if (!blocksToExecute && homeRobot) {
    log.info("Homing robot before program execution");
    await homeRobot();
    await delay(EXECUTION_CONFIG.POST_HOME_DELAY_MS, signal);
  }

  // Execute the blocks in the current segment
  for (const block of currentBlocks) {
    // Check abort and connection before each block
    checkAborted(signal);
    checkConnection(isConnected);

    if (block.definitionId === BLOCK_IDS.HOME_ROBOT && homeRobot) {
      await homeRobot();
    } else if (block.definitionId === BLOCK_IDS.MOVE_TO) {
      const commands = parseBlocksForCommands([block]);
      if (commands.length > 0) {
        await updateJointsDegrees(commands);
      }
    } else if (block.definitionId === BLOCK_IDS.OPEN_GRIPPER && openGripper) {
      await openGripper();
    } else if (block.definitionId === BLOCK_IDS.CLOSE_GRIPPER && closeGripper) {
      await closeGripper();
    } else if (block.definitionId === BLOCK_IDS.WAIT_SECONDS) {
      const duration =
        typeof block.parameters.seconds === "number"
          ? block.parameters.seconds * 1000
          : parseFloat(String(block.parameters.seconds)) * 1000 || EXECUTION_CONFIG.DEFAULT_WAIT_MS;
      await delay(duration, signal);
    } else if (block.definitionId === BLOCK_IDS.REPEAT) {
      const times =
        typeof block.parameters.times === "number"
          ? block.parameters.times
          : parseInt(String(block.parameters.times), 10) || 1;
      const childBlocks = allBlocks.filter((b) => b.parentId === block.id);

      for (let i = 0; i < times; i++) {
        checkAborted(signal);
        checkConnection(isConnected);
        await executeBlocks(allBlocks, deps, options, childBlocks);
      }
    } else if (block.definitionId === BLOCK_IDS.IF_CONDITION) {
      const condition = !!block.parameters.condition;
      if (condition) {
        const childBlocks = allBlocks.filter((b) => b.parentId === block.id);
        await executeBlocks(allBlocks, deps, options, childBlocks);
      }
    } else if (block.definitionId === BLOCK_IDS.WHILE_LOOP) {
      const childBlocks = allBlocks.filter((b) => b.parentId === block.id);

      // Caution: This is a recursive execution. The condition should ideally be checked
      // dynamically, but since we are evaluating statically from parameters for now:
      while (
        (block.parameters.condition as unknown) === true ||
        block.parameters.condition === "true"
      ) {
        checkAborted(signal);
        checkConnection(isConnected);
        await executeBlocks(allBlocks, deps, options, childBlocks);

        // Safety delay to prevent infinite fast loops
        await delay(EXECUTION_CONFIG.INTER_BLOCK_DELAY_MS, signal);

        // Check condition again (though blocks currently are static during run)
        if (
          (block.parameters.condition as unknown) === false ||
          block.parameters.condition === "false"
        )
          break;
      }
    }

    // Delay between blocks (also cancellable)
    await delay(EXECUTION_CONFIG.INTER_BLOCK_DELAY_MS, signal);
  }
}
