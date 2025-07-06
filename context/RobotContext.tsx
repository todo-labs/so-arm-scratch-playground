"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useRobotControl, JointState } from "@/hooks/useRobotControl";
import { robotConfigMap } from "@/lib/robotConfig";
import type { JointDetails } from "@/components/RobotScene";

type RobotContextType = {
  isConnected: boolean;
  connectRobot: () => Promise<void>;
  disconnectRobot: () => Promise<void>;
  emergencyStop: () => Promise<void>;
  homeRobot: () => Promise<void>;
  openGripper: () => Promise<void>;
  closeGripper: () => Promise<void>;
  jointStates: JointState[];
  setJointDetails: (details: JointDetails[]) => void;
  updateJointsDegrees: (
    updates: { servoId: number; value: number }[]
  ) => Promise<void>;
};

const RobotContext = createContext<RobotContextType | undefined>(undefined);

export function RobotProvider({
  children,
  robotName,
  initialJointDetails,
}: {
  children: ReactNode;
  robotName: string;
  initialJointDetails: JointDetails[];
}) {
  const config = robotConfigMap[robotName];
  if (!config) throw new Error(`Config for ${robotName} not found.`);
  const { urdfInitJointAngles } = config;
  const {
    isConnected,
    connectRobot,
    disconnectRobot,
    emergencyStop,
    homeRobot,
    openGripper,
    closeGripper,
    jointStates,
    setJointDetails,
    updateJointsDegrees,
  } = useRobotControl(initialJointDetails, urdfInitJointAngles);

  return (
    <RobotContext.Provider
      value={{
        isConnected,
        connectRobot,
        disconnectRobot,
        emergencyStop,
        homeRobot,
        openGripper,
        closeGripper,
        jointStates,
        setJointDetails,
        updateJointsDegrees,
      }}
    >
      {children}
    </RobotContext.Provider>
  );
}

export function useRobot() {
  const ctx = useContext(RobotContext);
  if (!ctx) throw new Error("useRobot must be used within RobotProvider");
  return ctx;
}
