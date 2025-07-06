"use client";

import { useEffect, useState } from "react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import RobotLoader from "@/components/RobotLoader";
import { Header } from "@/components/Header";
import { BlockPalette } from "@/components/BlockPalette";
import { Workspace } from "@/components/Workspace";

import { RobotProvider, useRobot } from "@/context/RobotContext";
import { ScratchProvider, useScratch } from "@/context/ScratchContext";

import "@/data/defaultBlocks";
import { registry } from "@/lib/blockRegistry";
import type { JointDetails } from "@/components/RobotScene";

export default function Home() {
  const initialJointDetails: JointDetails[] = [
    {
      name: "Rotation",
      servoId: 1,
      jointType: "revolute",
      limit: { lower: 0, upper: 360 },
    },
    {
      name: "Pitch",
      servoId: 2,
      jointType: "revolute",
      limit: { lower: 0, upper: 360 },
    },
    {
      name: "Elbow",
      servoId: 3,
      jointType: "revolute",
      limit: { lower: 0, upper: 360 },
    },
    {
      name: "Wrist_Pitch",
      servoId: 4,
      jointType: "revolute",
      limit: { lower: 0, upper: 360 },
    },
    {
      name: "Wrist_Roll",
      servoId: 5,
      jointType: "revolute",
      limit: { lower: 0, upper: 360 },
    },
    {
      name: "Jaw",
      servoId: 6,
      jointType: "revolute",
      limit: { lower: 0, upper: 360 },
    },
  ];
  return (
    <RobotProvider
      robotName="so-arm101"
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
  const [activeTab, setActiveTab] = useState<"blocks" | "robot">("blocks");

  return (
    <ScratchProvider
      updateJointsDegrees={updateJointsDegrees}
      homeRobot={homeRobot}
      openGripper={openGripper}
      closeGripper={closeGripper}
      isConnected={isConnected}
    >
      <PageContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isConnected={isConnected}
        connectRobot={connectRobot}
        disconnectRobot={disconnectRobot}
        emergencyStop={emergencyStop}
      />
    </ScratchProvider>
  );
}

type PageContentProps = {
  activeTab: "blocks" | "robot";
  setActiveTab: (tab: "blocks" | "robot") => void;
  isConnected: boolean;
  connectRobot: () => void;
  disconnectRobot: () => void;
  emergencyStop: () => void;
};
function PageContent({
  activeTab,
  setActiveTab,
  isConnected,
  connectRobot,
  disconnectRobot,
  emergencyStop,
}: PageContentProps) {
  const {
    blocks,
    handleBlockClick,
    handleBlockUpdate,
    handleBlockRemove,
    handleAddChildBlock,
    isRunningCode,
  } = useScratch();

  useEffect(() => {
    if (isRunningCode) setActiveTab("robot");
  }, [isRunningCode, setActiveTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <Header
        isConnected={isConnected}
        connectRobot={connectRobot}
        disconnectRobot={disconnectRobot}
        emergencyStop={emergencyStop}
      />
      {/* Virtual Mode Indicator */}
      {!isConnected && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mx-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">
                <strong>Virtual Mode:</strong> Commands will only affect the
                virtual robot. Connect to a physical robot to control real
                hardware.
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-140px)] flex">
        <Tabs
          value={activeTab}
          onValueChange={(value: string) =>
            setActiveTab(value as "blocks" | "robot")
          }
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="w-full flex mb-2">
            <TabsTrigger value="blocks" className="flex-1">
              Blocks
            </TabsTrigger>
            <TabsTrigger value="robot" className="flex-1">
              Robot
            </TabsTrigger>
          </TabsList>
          <TabsContent value="blocks" className="flex-1 min-h-0 flex">
            <BlockPalette
              categories={registry.getAllCategories()}
              blocks={registry.getAllBlocks()}
              onBlockClick={handleBlockClick}
            />
            <Workspace
              blocks={blocks}
              onBlockUpdate={handleBlockUpdate}
              onBlockRemove={handleBlockRemove}
              onAddChildBlock={handleAddChildBlock}
            />
          </TabsContent>
          <TabsContent value="robot" className="flex-1 min-h-0">
            <RobotLoader robotName="so-arm101" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
