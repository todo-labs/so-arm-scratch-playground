import type React from "react";
import { createContext, type ReactNode, useCallback, useContext, useRef, useState } from "react";
import type { UpdateJointsDegrees } from "@/hooks/useRobotControl";
import {
  ConnectionLostError,
  ExecutionAbortedError,
  ExecutionLimitError,
  executeBlocks,
} from "@/lib/blockExecutor";
import { logger } from "@/lib/logger";
import type { BlockDefinition, BlockInstance } from "@/lib/types";

const log = logger.scope("Scratch");

// Context type
type ScratchContextType = {
  blocks: BlockInstance[];
  setBlocks: React.Dispatch<React.SetStateAction<BlockInstance[]>>;
  importBlocks: (blocks: BlockInstance[]) => void;
  generatedCode: string;
  isRunningCode: boolean;
  setGeneratedCode: React.Dispatch<React.SetStateAction<string>>;
  handleBlockClick: (definition: BlockDefinition) => void;
  handleAddChildBlock: (
    parentId: string,
    definition: BlockDefinition,
    childSlot?: "then" | "else"
  ) => void;
  handleBlockUpdate: (id: string, param: string, value: boolean | number | string) => void;
  handleBlockRemove: (id: string) => void;
  handleRunCode: (options?: { simulate?: boolean }) => void;
  handleStopCode: () => void;
  handleClear: () => void;
  handleCopyCode: () => void;
  handleExportCode: () => void;
};

const ScratchContext = createContext<ScratchContextType | undefined>(undefined);

export function useScratch() {
  const ctx = useContext(ScratchContext);
  if (!ctx) throw new Error("useScratch must be used within a ScratchProvider");
  return ctx;
}

type ScratchProviderProps = {
  children: ReactNode;
  updateJointsDegrees?: UpdateJointsDegrees;
  homeRobot?: () => Promise<void>;
  openGripper?: () => Promise<void>;
  closeGripper?: () => Promise<void>;
  isConnected?: boolean;
};

export function ScratchProvider({
  children,
  updateJointsDegrees,
  homeRobot,
  openGripper,
  closeGripper,
  isConnected = false,
}: ScratchProviderProps) {
  const [blocks, setBlocks] = useState<BlockInstance[]>([]);
  const [requiresImportTrustConfirmation, setRequiresImportTrustConfirmation] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [isRunningCode, setIsRunningCode] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const importBlocks = useCallback((importedBlocks: BlockInstance[]) => {
    setBlocks(importedBlocks);
    setRequiresImportTrustConfirmation(true);
  }, []);

  const handleBlockClick = useCallback((definition: BlockDefinition) => {
    const newBlock: BlockInstance = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      definitionId: definition.id,
      x: 0,
      y: 0,
      parameters: definition.parameters.reduce<Record<string, boolean | number | string>>(
        (acc, p) => {
          acc[p.name] = p.defaultValue;
          return acc;
        },
        {}
      ),
      children: [],
      isSnapped: false,
    };
    setBlocks((prev) => [...prev, newBlock]);
  }, []);

  const handleAddChildBlock = useCallback(
    (parentId: string, definition: BlockDefinition, childSlot: "then" | "else" = "then") => {
      const newChild: BlockInstance = {
        id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        definitionId: definition.id,
        x: 0,
        y: 0,
        parameters: definition.parameters.reduce<Record<string, boolean | number | string>>(
          (acc, p) => {
            acc[p.name] = p.defaultValue;
            return acc;
          },
          {}
        ),
        children: [],
        parentId,
        childSlot,
        isSnapped: false,
      };
      setBlocks((prev) => [...prev, newChild]);
    },
    []
  );

  const handleBlockUpdate = useCallback(
    (id: string, param: string, value: boolean | number | string) => {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, parameters: { ...b.parameters, [param]: value } } : b
        )
      );
    },
    []
  );

  const handleBlockRemove = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id && b.parentId !== id));
  }, []);

  const handleClear = () => {
    setBlocks([]);
    setGeneratedCode("");
  };

  const handleStopCode = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsRunningCode(false);
  }, []);

  const handleRunCode = useCallback(async (options?: { simulate?: boolean }) => {
    const simulate = options?.simulate === true;

    if (blocks.length === 0) {
      alert("Please add blocks to run the code.");
      return;
    }

    if (!updateJointsDegrees) {
      alert("Robot control functions not available.");
      return;
    }

    if (!isConnected && !simulate) {
      alert("Robot is not connected. Please connect first.");
      return;
    }

    if (requiresImportTrustConfirmation) {
      const approved = window.confirm(
        "This program was imported from an external source. Only run it if you trust the source. Continue?"
      );
      if (!approved) {
        return;
      }
      setRequiresImportTrustConfirmation(false);
    }

    // Cancel any existing execution
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this execution
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsRunningCode(true);

    try {
      await executeBlocks(
        blocks,
        {
          updateJointsDegrees,
          homeRobot,
          openGripper,
          closeGripper,
          isConnected: simulate ? undefined : () => isConnected,
        },
        { signal }
      );
      setIsRunningCode(false);
    } catch (error) {
      setIsRunningCode(false);
      if (error instanceof ExecutionAbortedError) {
        log.info("Execution was stopped by user");
      } else if (error instanceof ConnectionLostError) {
        alert("Robot connection lost during execution.");
        console.error("Connection lost:", error);
      } else if (error instanceof ExecutionLimitError) {
        alert("Execution stopped for safety. Reduce loop counts or program size.");
        console.error("Execution stopped by safety guard:", error);
      } else {
        alert("Error running code – see console for details.");
        console.error("Error running code:", error);
      }
    } finally {
      abortControllerRef.current = null;
    }
  }, [
    blocks,
    updateJointsDegrees,
    homeRobot,
    openGripper,
    closeGripper,
    isConnected,
    requiresImportTrustConfirmation,
  ]);

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(generatedCode);
  }, [generatedCode]);

  const handleExportCode = useCallback(() => {
    const blob = new Blob([generatedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "robot-scratch-program.js";
    a.click();
    URL.revokeObjectURL(url);
  }, [generatedCode]);

  return (
    <ScratchContext.Provider
      value={{
        blocks,
        setBlocks,
        importBlocks,
        generatedCode,
        setGeneratedCode,
        handleBlockClick,
        handleAddChildBlock,
        handleBlockUpdate,
        handleBlockRemove,
        handleRunCode,
        handleStopCode,
        handleClear,
        handleCopyCode,
        handleExportCode,
        isRunningCode,
      }}
    >
      {children}
    </ScratchContext.Provider>
  );
}
