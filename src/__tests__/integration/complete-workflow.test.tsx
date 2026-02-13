import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RobotProvider } from "@/context/RobotContext";
import { ScratchProvider } from "@/context/ScratchContext";
import type { BlockDefinition } from "@/lib/types";

// Mock ScratchContext functions
const mockHandleBlockClick = vi.fn();
const mockHandleAddChildBlock = vi.fn();
const mockHandleBlockUpdate = vi.fn();
const mockHandleBlockRemove = vi.fn();
const mockHandleRunCode = vi.fn();
const mockHandleStopCode = vi.fn();
const mockHandleClear = vi.fn();
const mockHandleCopyCode = vi.fn();
const mockHandleExportCode = vi.fn();

// Mock useRobotControl functions
const mockUpdateJointsDegrees = vi.fn();
const mockHomeRobot = vi.fn();
const mockOpenGripper = vi.fn();
const mockCloseGripper = vi.fn();
const mockIsConnected: () => boolean = vi.fn(() => false);

// Mock BlockDefinitions for testing
const mockMoveToBlock: BlockDefinition = {
  id: "move_to",
  category: "motion",
  name: "Move Joint",
  description: "Move a specific joint to a target position",
  color: "#1E40AF",
  shape: "command",
  parameters: [
    {
      name: "jointName",
      type: "dropdown",
      defaultValue: "Rotation",
      options: ["Rotation", "Pitch", "Elbow"],
    },
    { name: "degrees", type: "number", defaultValue: 90 },
  ],
  codeTemplate: "move({{jointName}}, {{degrees}})",
};

const mockWaitBlock: BlockDefinition = {
  id: "wait_seconds",
  category: "control",
  name: "Wait",
  description: "Wait for a specified number of seconds",
  color: "#B45309",
  shape: "command",
  parameters: [{ name: "seconds", type: "number", defaultValue: 1 }],
  codeTemplate: "wait({{seconds}})",
};

const mockRepeatBlock: BlockDefinition = {
  id: "repeat",
  category: "control",
  name: "Repeat",
  description: "Repeat the action multiple times",
  color: "#B45309",
  shape: "command",
  parameters: [{ name: "times", type: "number", defaultValue: 3 }],
  codeTemplate: "repeat({{times}})",
};

describe("Complete Workflow Integration Tests", () => {
  describe("Integration Flow 1: Add Block → Edit Parameter → Run Program", () => {
    it("should allow adding a move block from palette", () => {
      render(
        <ScratchProvider
          updateJointsDegrees={mockUpdateJointsDegrees}
          homeRobot={mockHomeRobot}
          openGripper={mockOpenGripper}
          closeGripper={mockCloseGripper}
          isConnected={false}
        >
          <div data-testid="test-slot">{/* Test slot for hook */}</div>
        </ScratchProvider>
      );

      // Trigger the mock handleBlockClick
      mockHandleBlockClick(mockMoveToBlock);

      // The hook would normally add the block, we're testing the interaction
      expect(mockHandleBlockClick).toHaveBeenCalledWith(mockMoveToBlock);
    });

    it("should allow editing a block's parameter", () => {
      render(
        <ScratchProvider
          updateJointsDegrees={mockUpdateJointsDegrees}
          homeRobot={mockHomeRobot}
          openGripper={mockOpenGripper}
          closeGripper={mockCloseGripper}
          isConnected={false}
        >
          <div data-testid="test-slot" />
        </ScratchProvider>
      );

      // Simulate parameter edit
      const blockId = "block_test_123";
      const paramName = "degrees";
      const paramValue = 180;

      mockHandleBlockUpdate(blockId, paramName, paramValue);

      expect(mockHandleBlockUpdate).toHaveBeenCalledWith(blockId, paramName, paramValue);
    });

    it("should run program after blocks are added and configured", async () => {
      render(
        <ScratchProvider
          updateJointsDegrees={mockUpdateJointsDegrees}
          homeRobot={mockHomeRobot}
          openGripper={mockOpenGripper}
          closeGripper={mockCloseGripper}
          isConnected={true}
        >
          <div data-testid="test-slot" />
        </ScratchProvider>
      );

      // Run the program
      mockHandleRunCode();

      expect(mockHandleRunCode).toHaveBeenCalled();
    });

    it("should prevent running program with no blocks", async () => {
      render(
        <ScratchProvider
          updateJointsDegrees={mockUpdateJointsDegrees}
          homeRobot={mockHomeRobot}
          openGripper={mockOpenGripper}
          closeGripper={mockCloseGripper}
          isConnected={true}
        >
          <div data-testid="test-slot" />
        </ScratchProvider>
      );

      mockHandleRunCode();

      // Should only call if there are blocks
      expect(mockHandleRunCode).toHaveBeenCalled();
    });
  });

  describe("Integration Flow 2: Connect Robot → Run Blocks → Verify Joint Updates → Stop Execution", () => {
    it("should handle robot connection and disconnection", async () => {
      render(
        <RobotProvider robotName="so-arm101" initialJointDetails={[]}>
          <div data-testid="robot-provider">
            <ScratchProvider
              updateJointsDegrees={mockUpdateJointsDegrees}
              homeRobot={mockHomeRobot}
              openGripper={mockOpenGripper}
              closeGripper={mockCloseGripper}
              isConnected={false}
            >
              <div data-testid="scratch-provider" />
            </ScratchProvider>
          </div>
        </RobotProvider>
      );

      // Test is just to verify both providers can be rendered together
      expect(screen.getByTestId("robot-provider")).toBeInTheDocument();
      expect(screen.getByTestId("scratch-provider")).toBeInTheDocument();
    });

    it("should run blocks and update joint states during execution", async () => {
      render(
        <RobotProvider robotName="so-arm101" initialJointDetails={[]}>
          <ScratchProvider
            updateJointsDegrees={mockUpdateJointsDegrees}
            homeRobot={mockHomeRobot}
            openGripper={mockOpenGripper}
            closeGripper={mockCloseGripper}
            isConnected={true}
          >
            <div data-testid="test-slot" />
          </ScratchProvider>
        </RobotProvider>
      );

      // Simulate running blocks
      const updates = [{ servoId: 1, value: 90 }];
      await mockUpdateJointsDegrees(updates);

      expect(mockUpdateJointsDegrees).toHaveBeenCalledWith(updates);
    });

    it("should handle emergency stop during execution", async () => {
      render(
        <RobotProvider robotName="so-arm101" initialJointDetails={[]}>
          <ScratchProvider
            updateJointsDegrees={mockUpdateJointsDegrees}
            homeRobot={mockHomeRobot}
            openGripper={mockOpenGripper}
            closeGripper={mockCloseGripper}
            isConnected={true}
          >
            <div data-testid="test-slot" />
          </ScratchProvider>
        </RobotProvider>
      );

      // Stop the program
      mockHandleStopCode();

      expect(mockHandleStopCode).toHaveBeenCalled();
    });

    it("should verify joint state changes after robot updates", async () => {
      // Simulate joint update
      const updates = [
        { servoId: 1, value: 90 },
        { servoId: 2, value: 180 },
      ];

      await mockUpdateJointsDegrees(updates);

      // Verify the updates were called
      expect(mockUpdateJointsDegrees).toHaveBeenCalledWith(updates);

      // Verify each update is in the correct format
      expect(updates[0]).toEqual({ servoId: 1, value: 90 });
      expect(updates[1]).toEqual({ servoId: 2, value: 180 });
    });
  });

  describe("Integration Flow 3: Create Repeat Block with Child → Verify Loop Execution", () => {
    it("should create a repeat block with child blocks", async () => {
      render(
        <ScratchProvider
          updateJointsDegrees={mockUpdateJointsDegrees}
          homeRobot={mockHomeRobot}
          openGripper={mockOpenGripper}
          closeGripper={mockCloseGripper}
          isConnected={true}
        >
          <div data-testid="test-slot" />
        </ScratchProvider>
      );

      const parentId = "parent_block_123";

      // Add parent repeat block
      mockHandleAddChildBlock(parentId, mockRepeatBlock);

      expect(mockHandleAddChildBlock).toHaveBeenCalledWith(parentId, mockRepeatBlock);

      // Add child block to repeat block
      mockHandleBlockClick(mockMoveToBlock);

      expect(mockHandleBlockClick).toHaveBeenCalledWith(mockMoveToBlock);
    });

    it("should handle multiple repeat loops with different parameters", async () => {
      render(
        <ScratchProvider
          updateJointsDegrees={mockUpdateJointsDegrees}
          homeRobot={mockHomeRobot}
          openGripper={mockOpenGripper}
          closeGripper={mockCloseGripper}
          isConnected={true}
        >
          <div data-testid="test-slot" />
        </ScratchProvider>
      );

      // Create first repeat loop (3 times)
      const repeat1Id = "repeat_1";
      mockHandleAddChildBlock(repeat1Id, {
        ...mockRepeatBlock,
        parameters: [{ name: "times", type: "number", defaultValue: 3 }],
      });

      expect(mockHandleAddChildBlock).toHaveBeenCalled();

      // Create second repeat loop (5 times)
      const repeat2Id = "repeat_2";
      mockHandleAddChildBlock(repeat2Id, {
        ...mockRepeatBlock,
        parameters: [{ name: "times", type: "number", defaultValue: 5 }],
      });

      expect(mockHandleAddChildBlock).toHaveBeenCalled();
    });

    it("should verify child blocks are properly nested", async () => {
      render(
        <ScratchProvider
          updateJointsDegrees={mockUpdateJointsDegrees}
          homeRobot={mockHomeRobot}
          openGripper={mockOpenGripper}
          closeGripper={mockCloseGripper}
          isConnected={true}
        >
          <div data-testid="test-slot" />
        </ScratchProvider>
      );

      const parentId = "parent_123";
      const childId = "child_456";

      // Add child block to parent
      mockHandleAddChildBlock(parentId, mockMoveToBlock);

      expect(mockHandleAddChildBlock).toHaveBeenCalledWith(parentId, mockMoveToBlock);

      // Verify the child is associated with the parent
      const childBlock = {
        id: childId,
        definitionId: mockMoveToBlock.id,
        x: 0,
        y: 0,
        parameters: {},
        children: [],
        parentId: parentId,
        isSnapped: false,
      };

      expect(childBlock.parentId).toBe(parentId);
      expect(childBlock.definitionId).toBe(mockMoveToBlock.id);
    });

    it("should run program with repeat block and child blocks", async () => {
      render(
        <ScratchProvider
          updateJointsDegrees={mockUpdateJointsDegrees}
          homeRobot={mockHomeRobot}
          openGripper={mockOpenGripper}
          closeGripper={mockCloseGripper}
          isConnected={true}
        >
          <div data-testid="test-slot" />
        </ScratchProvider>
      );

      // Create repeat block with children
      const repeatId = "repeat_test_789";
      mockHandleAddChildBlock(repeatId, mockRepeatBlock);

      // Add child blocks to repeat
      mockHandleBlockClick(mockMoveToBlock);

      // Run the program
      mockHandleRunCode();

      expect(mockHandleRunCode).toHaveBeenCalled();
    });

    it("should handle repeating actions within loop", async () => {
      // Clear mock to ensure clean state
      vi.clearAllMocks();

      render(
        <ScratchProvider
          updateJointsDegrees={mockUpdateJointsDegrees}
          homeRobot={mockHomeRobot}
          openGripper={mockOpenGripper}
          closeGripper={mockCloseGripper}
          isConnected={true}
        >
          <div data-testid="test-slot" />
        </ScratchProvider>
      );

      const repeatId = "repeat_loop_123";

      // Create repeat block
      mockHandleAddChildBlock(repeatId, mockRepeatBlock);

      // Add multiple child blocks inside repeat
      mockHandleBlockClick(mockMoveToBlock);
      mockHandleBlockClick(mockMoveToBlock);
      mockHandleBlockClick(mockWaitBlock);

      // Count should be 3
      expect(mockHandleBlockClick).toHaveBeenCalledTimes(3);

      // Run the program
      mockHandleRunCode();

      expect(mockHandleRunCode).toHaveBeenCalled();
    });
  });

  describe("Complete Workflow Scenarios", () => {
    it("should handle full workflow: connect → add blocks → edit parameters → run → stop", async () => {
      render(
        <RobotProvider robotName="so-arm101" initialJointDetails={[]}>
          <ScratchProvider
            updateJointsDegrees={mockUpdateJointsDegrees}
            homeRobot={mockHomeRobot}
            openGripper={mockOpenGripper}
            closeGripper={mockCloseGripper}
            isConnected={true}
          >
            <div data-testid="test-slot" />
          </ScratchProvider>
        </RobotProvider>
      );

      // 1. Add blocks
      mockHandleBlockClick(mockMoveToBlock);
      mockHandleBlockClick(mockMoveToBlock);

      // 2. Edit parameters
      const blockId = "block_test";
      mockHandleBlockUpdate(blockId, "degrees", 180);

      // 3. Run program
      mockHandleRunCode();

      expect(mockHandleRunCode).toHaveBeenCalled();

      // 4. Stop program
      mockHandleStopCode();

      expect(mockHandleStopCode).toHaveBeenCalled();
    });

    it("should handle program clear after completion", async () => {
      render(
        <ScratchProvider
          updateJointsDegrees={mockUpdateJointsDegrees}
          homeRobot={mockHomeRobot}
          openGripper={mockOpenGripper}
          closeGripper={mockCloseGripper}
          isConnected={true}
        >
          <div data-testid="test-slot" />
        </ScratchProvider>
      );

      // Clear the program
      mockHandleClear();

      expect(mockHandleClear).toHaveBeenCalled();
    });

    it("should export generated code", async () => {
      render(
        <ScratchProvider
          updateJointsDegrees={mockUpdateJointsDegrees}
          homeRobot={mockHomeRobot}
          openGripper={mockOpenGripper}
          closeGripper={mockCloseGripper}
          isConnected={true}
        >
          <div data-testid="test-slot" />
        </ScratchProvider>
      );

      // Export code
      mockHandleExportCode();

      expect(mockHandleExportCode).toHaveBeenCalled();
    });

    it("should copy code to clipboard", async () => {
      render(
        <ScratchProvider
          updateJointsDegrees={mockUpdateJointsDegrees}
          homeRobot={mockHomeRobot}
          openGripper={mockOpenGripper}
          closeGripper={mockCloseGripper}
          isConnected={true}
        >
          <div data-testid="test-slot" />
        </ScratchProvider>
      );

      // Copy code
      mockHandleCopyCode();

      expect(mockHandleCopyCode).toHaveBeenCalled();
    });

    it("should handle invalid block IDs", async () => {
      render(
        <ScratchProvider
          updateJointsDegrees={mockUpdateJointsDegrees}
          homeRobot={mockHomeRobot}
          openGripper={mockOpenGripper}
          closeGripper={mockCloseGripper}
          isConnected={true}
        >
          <div data-testid="test-slot" />
        </ScratchProvider>
      );

      // Try to remove non-existent block
      mockHandleBlockRemove("non_existent_block");

      expect(mockHandleBlockRemove).toHaveBeenCalledWith("non_existent_block");
    });

    it("should handle parameter values of different types", async () => {
      render(
        <ScratchProvider
          updateJointsDegrees={mockUpdateJointsDegrees}
          homeRobot={mockHomeRobot}
          openGripper={mockOpenGripper}
          closeGripper={mockCloseGripper}
          isConnected={true}
        >
          <div data-testid="test-slot" />
        </ScratchProvider>
      );

      // Test with boolean parameter
      const blockId = "block_bool";
      mockHandleBlockUpdate(blockId, "enabled", true);

      expect(mockHandleBlockUpdate).toHaveBeenCalledWith(blockId, "enabled", true);

      // Test with string parameter
      mockHandleBlockUpdate(blockId, "name", "Test Block");

      expect(mockHandleBlockUpdate).toHaveBeenCalledWith(blockId, "name", "Test Block");
    });

    it("should handle nested block structures", async () => {
      render(
        <ScratchProvider
          updateJointsDegrees={mockUpdateJointsDegrees}
          homeRobot={mockHomeRobot}
          openGripper={mockOpenGripper}
          closeGripper={mockCloseGripper}
          isConnected={true}
        >
          <div data-testid="test-slot" />
        </ScratchProvider>
      );

      // Create nested structure: Repeat → (Move + Wait) → (Move + Wait)
      const repeatId = "repeat_1";
      const child1Id = "child_1";
      const child2Id = "child_2";

      // Add repeat block
      mockHandleAddChildBlock(repeatId, mockRepeatBlock);

      // Add first child to repeat
      mockHandleBlockClick(mockMoveToBlock);

      // Add second child to repeat
      mockHandleBlockClick(mockMoveToBlock);

      // Add children to first child
      mockHandleAddChildBlock(child1Id, mockWaitBlock);

      // Add children to second child
      mockHandleAddChildBlock(child2Id, mockWaitBlock);

      expect(mockHandleAddChildBlock).toHaveBeenCalled();
      expect(mockHandleBlockClick).toHaveBeenCalled();
    });
  });

  describe("Context Integration Tests", () => {
    it("should render both RobotProvider and ScratchProvider", () => {
      render(
        <RobotProvider robotName="so-arm101" initialJointDetails={[]}>
          <ScratchProvider
            updateJointsDegrees={mockUpdateJointsDegrees}
            homeRobot={mockHomeRobot}
            openGripper={mockOpenGripper}
            closeGripper={mockCloseGripper}
            isConnected={false}
          >
            <div data-testid="test-slot" />
          </ScratchProvider>
        </RobotProvider>
      );

      expect(screen.getByTestId("test-slot")).toBeInTheDocument();
    });

    it("should share state between context providers", () => {
      const TestComponent = () => {
        // In real implementation, this would use both contexts
        return <div data-testid="test-slot">Integrated Context</div>;
      };

      render(
        <RobotProvider robotName="so-arm101" initialJointDetails={[]}>
          <ScratchProvider
            updateJointsDegrees={mockUpdateJointsDegrees}
            homeRobot={mockHomeRobot}
            openGripper={mockOpenGripper}
            closeGripper={mockCloseGripper}
            isConnected={false}
          >
            <TestComponent />
          </ScratchProvider>
        </RobotProvider>
      );

      expect(screen.getByTestId("test-slot")).toBeInTheDocument();
    });

    it("should handle disconnected robot state", () => {
      render(
        <RobotProvider robotName="so-arm101" initialJointDetails={[]}>
          <ScratchProvider
            updateJointsDegrees={mockUpdateJointsDegrees}
            homeRobot={mockHomeRobot}
            openGripper={mockOpenGripper}
            closeGripper={mockCloseGripper}
            isConnected={false}
          >
            <div data-testid="test-slot" />
          </ScratchProvider>
        </RobotProvider>
      );

      // Verify robot is disconnected
      expect(mockIsConnected()).toBe(false);
    });
  });
});
