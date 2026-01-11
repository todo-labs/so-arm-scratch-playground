import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import RobotLoader from "@/components/RobotLoader";
import { Header } from "@/components/Header";
import { HorizontalBlockPalette } from "@/components/HorizontalBlockPalette";
import { Workspace } from "@/components/Workspace";
import { ExecutionControls } from "@/components/ExecutionControls";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

import { RobotProvider, useRobot } from "@/context/RobotContext";
import { ScratchProvider, useScratch } from "@/context/ScratchContext";

import "@/data/defaultBlocks";
import { registry } from "@/lib/blockRegistry";
import { robotConfigMap } from "@/lib/robotConfig";
import { playSound } from "@/lib/theme/scratch";

export default function Home() {
  const robotName = "so-arm101";
  const config = robotConfigMap[robotName];
  const initialJointDetails = config?.defaultJointDetails || [];

  return (
    <RobotProvider
      robotName={robotName}
      initialJointDetails={initialJointDetails}
    >
      <HomeContentWrapper />
    </RobotProvider>
  );
}

function HomeContentWrapper() {
  const {
    connectRobot,
    isConnected,
    disconnectRobot,
    emergencyStop,
    homeRobot,
    updateJointsDegrees,
    openGripper,
    closeGripper,
  } = useRobot();
  const [, setActiveTab] = useState<"blocks" | "robot">("blocks");

  return (
    <ScratchProvider
      updateJointsDegrees={updateJointsDegrees}
      homeRobot={homeRobot}
      openGripper={openGripper}
      closeGripper={closeGripper}
      isConnected={isConnected}
    >
      <PageContent
        setActiveTab={setActiveTab}
        isConnected={isConnected}
        connectRobot={connectRobot}
        disconnectRobot={disconnectRobot}
        emergencyStop={emergencyStop}
        homeRobot={homeRobot}
      />
    </ScratchProvider>
  );
}

type PageContentProps = {
  setActiveTab: (tab: "blocks" | "robot") => void;
  isConnected: boolean;
  connectRobot: () => void;
  disconnectRobot: () => void;
  emergencyStop: () => void;
  homeRobot: () => void;
};
function PageContent({
  setActiveTab,
  isConnected,
  connectRobot,
  disconnectRobot,
  emergencyStop,
  homeRobot,
}: PageContentProps) {
  const {
    blocks,
    handleBlockClick,
    handleBlockUpdate,
    handleBlockRemove,
    handleAddChildBlock,
    handleClear,
    handleRunCode,
    handleStopCode,
    isRunningCode,
  } = useScratch();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  useEffect(() => {
    if (isRunningCode) setActiveTab("robot");
  }, [isRunningCode, setActiveTab]);

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header - always visible and on top */}
      <div className="fixed top-0 left-0 w-full z-40">
        <Header
          isConnected={isConnected}
          connectRobot={connectRobot}
          disconnectRobot={disconnectRobot}
          emergencyStop={emergencyStop}
          homeRobot={homeRobot}
        />
      </div>

      {/* Main Robot Scene (full screen) */}
      <div className="absolute inset-0 z-0">
        <RobotLoader robotName="so-arm101" />
      </div>

      {/* Workspace Sheet */}
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
            >
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
        <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col border-l shadow-2xl" showOverlay={false}>
          <SheetHeader className="px-6 py-6 border-b bg-white">
            <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Robot Programming
            </SheetTitle>
            <SheetDescription className="text-gray-500">
              Build your robot program with blocks. Drag and drop to sequence commands.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 flex flex-col min-h-0">
            {/* Horizontal Block Palette */}
            <HorizontalBlockPalette
              categories={registry.getAllCategories()}
              blocks={registry.getAllBlocks()}
              onBlockClick={handleBlockClick}
            />

            {/* Program Workspace Section */}
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

              {/* Execution Controls */}
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
    </div>
  );
}
