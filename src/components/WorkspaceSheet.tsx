import { useState } from "react";
import { ExecutionControls } from "@/components/ExecutionControls";
import { HorizontalBlockPalette } from "@/components/HorizontalBlockPalette";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Workspace } from "@/components/Workspace";
import { registry } from "@/lib/blockRegistry";
import { playSound } from "@/lib/theme/scratch";
import type { BlockDefinition, BlockInstance } from "@/lib/types";

interface WorkspaceSheetProps {
  isConnected: boolean;
  blocks: BlockInstance[];
  handleBlockClick: (definition: BlockDefinition) => void;
  handleBlockUpdate: (
    blockId: string,
    parameterId: string,
    value: boolean | number | string
  ) => void;
  handleBlockRemove: (id: string) => void;
  handleAddChildBlock: (parentId: string, definition: BlockDefinition) => void;
  handleClear: () => void;
  handleRunCode: () => void;
  handleStopCode: () => void;
  isRunningCode: boolean;
}

export function WorkspaceSheet({
  isConnected,
  blocks,
  handleBlockClick,
  handleBlockUpdate,
  handleBlockRemove,
  handleAddChildBlock,
  handleClear,
  handleRunCode,
  handleStopCode,
  isRunningCode,
}: WorkspaceSheetProps) {
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  return (
    <Sheet open={workspaceOpen} onOpenChange={setWorkspaceOpen} modal={false}>
      <SheetTrigger asChild>
        <Button
          className="fixed right-8 top-24 z-30 shadow-lg rounded-full"
          size="lg"
          variant="default"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            role="img"
          >
            <title>Open Program Workspace</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          Program Workspace
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 flex flex-col border-l shadow-2xl"
        showOverlay={false}
      >
        <SheetHeader className="px-6 py-6 border-b bg-white">
          <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Robot Programming
          </SheetTitle>
          <SheetDescription className="text-gray-500">
            Build your robot program with blocks. Drag and drop to sequence commands.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 flex flex-col">
          <HorizontalBlockPalette
            categories={registry.getAllCategories()}
            blocks={registry.getAllBlocks()}
            onBlockClick={handleBlockClick}
          />

          <div className="flex-1 flex flex-col bg-gray-50/30 overflow-hidden">
            <div className="px-6 py-4 border-b bg-white/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">Workspace</h3>
                  <p className="text-xs text-gray-500">
                    {blocks.filter((b) => !b.parentId).length} root commands
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => {
                      playSound("click");
                      handleClear();
                    }}
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100 h-8"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </div>
            <ScrollArea className="flex-1 overflow-hidden">
              <Workspace
                blocks={blocks}
                onBlockUpdate={handleBlockUpdate}
                onBlockRemove={handleBlockRemove}
                onAddChildBlock={handleAddChildBlock}
              />
            </ScrollArea>

            <div className="p-4 bg-white border-t border-slate-200">
              <ExecutionControls
                isRunning={isRunningCode}
                isConnected={isConnected}
                onRun={handleRunCode}
                onStop={handleStopCode}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
