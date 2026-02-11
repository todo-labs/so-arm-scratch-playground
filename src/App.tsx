import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import RobotLoader from "@/components/RobotLoader";
import { WorkspaceSheet } from "@/components/WorkspaceSheet";

import { RobotProvider, useRobot } from "@/context/RobotContext";
import { ScratchProvider, useScratch } from "@/context/ScratchContext";
import { ThemeProvider } from "@/context/ThemeContext";

import { robotConfigMap } from "@/lib/robotConfig";

export default function Home() {
  const robotName = "so-arm101";
  const config = robotConfigMap[robotName];
  const initialJointDetails = config?.defaultJointDetails || [];

  return (
    <ThemeProvider>
      <RobotProvider robotName={robotName} initialJointDetails={initialJointDetails}>
        <HomeContentWrapper />
      </RobotProvider>
    </ThemeProvider>
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
      <WorkspaceSheet
        isConnected={isConnected}
        blocks={blocks}
        handleBlockClick={handleBlockClick}
        handleBlockUpdate={handleBlockUpdate}
        handleBlockRemove={handleBlockRemove}
        handleAddChildBlock={handleAddChildBlock}
        handleClear={handleClear}
        handleRunCode={handleRunCode}
        handleStopCode={handleStopCode}
        isRunningCode={isRunningCode}
      />
    </div>
  );
}
