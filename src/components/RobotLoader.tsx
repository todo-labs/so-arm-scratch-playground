
import { Suspense } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Html, useProgress } from "@react-three/drei";

import { RobotScene } from "./RobotScene";
import { useRobot } from "@/context/RobotContext";
import { robotConfigMap } from "@/lib/robotConfig";

type RobotLoaderProps = {
  robotName: string;
};

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center className="text-4xl text-white">
      {progress} % loaded
    </Html>
  );
}

export default function RobotLoader({ robotName }: RobotLoaderProps) {
  const { jointStates, setJointDetails } = useRobot();
  const config = robotConfigMap[robotName];
  if (!config)
    throw new Error(`Robot configuration for "${robotName}" not found.`);
  const { urdfUrl, orbitTarget, camera } = config;

  return (
    <>
      <Canvas
        shadows
        camera={{
          position: camera.position,
          fov: camera.fov,
        }}
        onCreated={({ scene }) =>
          (scene.background = new THREE.Color(0x263238))
        }
      >
        <Suspense fallback={<Loader />}>
          <RobotScene
            robotName={robotName}
            urdfUrl={urdfUrl}
            orbitTarget={orbitTarget}
            setJointDetails={setJointDetails}
            jointStates={jointStates}
          />
        </Suspense>
      </Canvas>
    </>
  );
}
