import { BlockInstance } from "./types";
import { parseBlocksForCommands } from "./utils";
import { BLOCK_IDS } from "./blockIds";
import { EXECUTION_CONFIG } from "./executionConfig";
import { logger } from "./logger";

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

    signal?.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new ExecutionAbortedError());
    }, { once: true });
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
  blocks: BlockInstance[],
  deps: BlockExecutorDeps,
  options: ExecuteBlocksOptions = {}
): Promise<void> {
  const { updateJointsDegrees, homeRobot, openGripper, closeGripper, isConnected } = deps;
  const { signal } = options;

  if (!updateJointsDegrees) {
    throw new Error("Robot control functions not available.");
  }

  // Check initial state
  checkAborted(signal);
  checkConnection(isConnected);

  // Always home the robot before starting any program
  if (homeRobot) {
    log.info("Homing robot before program execution");
    await homeRobot();
    await delay(EXECUTION_CONFIG.POST_HOME_DELAY_MS, signal);
  }

  // Execute the user's program blocks
  for (const block of blocks) {
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
    }

    // Delay between blocks (also cancellable)
    await delay(EXECUTION_CONFIG.INTER_BLOCK_DELAY_MS, signal);
  }
}
