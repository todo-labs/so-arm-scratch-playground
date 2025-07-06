"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { BlockDefinition, BlockInstance } from "@/lib/types";
import { parseBlocksForCommands } from "@/lib/utils";
import type { UpdateJointsDegrees } from "@/hooks/useRobotControl";

// Context type
type ScratchContextType = {
  blocks: BlockInstance[];
  setBlocks: React.Dispatch<React.SetStateAction<BlockInstance[]>>;
  generatedCode: string;
  isRunningCode: boolean;
  setGeneratedCode: React.Dispatch<React.SetStateAction<string>>;
  handleBlockClick: (definition: BlockDefinition) => void;
  handleAddChildBlock: (parentId: string, definition: BlockDefinition) => void;
  handleBlockUpdate: (
    id: string,
    param: string,
    value: boolean | number | string
  ) => void;
  handleBlockRemove: (id: string) => void;
  handleRunCode: () => void;
  handleClear: () => void;
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
}: ScratchProviderProps & {
  openGripper?: () => Promise<void>;
  closeGripper?: () => Promise<void>;
}) {
  const [blocks, setBlocks] = useState<BlockInstance[]>([]);
  const [generatedCode, setGeneratedCode] = useState("");
  const [isRunningCode, setIsRunningCode] = useState(false);

  const handleBlockClick = useCallback((definition: BlockDefinition) => {
    const newBlock: BlockInstance = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      definitionId: definition.id,
      x: 0,
      y: 0,
      parameters: definition.parameters.reduce<
        Record<string, boolean | number | string>
      >((acc, p) => {
        acc[p.name] = p.defaultValue;
        return acc;
      }, {}),
      children: [],
      isSnapped: false,
    };
    setBlocks((prev) => [...prev, newBlock]);
  }, []);

  const handleAddChildBlock = useCallback(
    (parentId: string, definition: BlockDefinition) => {
      const newChild: BlockInstance = {
        id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        definitionId: definition.id,
        x: 0,
        y: 0,
        parameters: definition.parameters.reduce<
          Record<string, boolean | number | string>
        >((acc, p) => {
          acc[p.name] = p.defaultValue;
          return acc;
        }, {}),
        children: [],
        parentId,
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
          b.id === id
            ? { ...b, parameters: { ...b.parameters, [param]: value } }
            : b
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

  const handleRunCode = useCallback(async () => {
    if (blocks.length === 0) {
      alert("Please add blocks to run the code.");
      return;
    }

    if (!updateJointsDegrees) {
      alert("Robot control functions not available.");
      return;
    }

    setIsRunningCode(true);
    setTimeout(() => {}, 2_000); // Simulate loading delay
    try {
      for (const block of blocks) {
        if (block.definitionId === "home_robot" && homeRobot) {
          await homeRobot();
        } else if (block.definitionId === "move_to") {
          const commands = parseBlocksForCommands([block]);
          if (commands.length > 0) {
            await updateJointsDegrees(commands);
          }
        } else if (block.definitionId === "open_gripper" && openGripper) {
          await openGripper();
        } else if (block.definitionId === "close_gripper" && closeGripper) {
          await closeGripper();
        } else if (block.definitionId === "wait_seconds") {
          const duration =
            typeof block.parameters.seconds === "number"
              ? block.parameters.seconds * 1000
              : parseFloat(String(block.parameters.seconds)) * 1000;
          await new Promise((resolve) => setTimeout(resolve, duration));
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      setIsRunningCode(false);
    } catch (error) {
      setIsRunningCode(false);
      alert("Error running code – see console for details.");
      console.error("Error running code:", error);
    }
  }, [blocks, updateJointsDegrees, homeRobot, openGripper, closeGripper]);

  return (
    <ScratchContext.Provider
      value={{
        blocks,
        setBlocks,
        generatedCode,
        setGeneratedCode,
        handleBlockClick,
        handleAddChildBlock,
        handleBlockUpdate,
        handleBlockRemove,
        handleRunCode,
        handleClear,
        isRunningCode,
      }}
    >
      {children}
    </ScratchContext.Provider>
  );
}
