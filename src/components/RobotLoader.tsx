import { Html, useProgress } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";
import { useRobot } from "@/context/RobotContext";
import { robotConfigMap } from "@/lib/robotConfig";
import { RobotScene } from "./RobotScene";

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
  if (!config) throw new Error(`Robot configuration for "${robotName}" not found.`);
  const { urdfUrl, orbitTarget, camera } = config;
  const handleSceneCreated = (state: { scene: THREE.Scene }) => {
    state.scene.background = new THREE.Color(0x263238);
  };

  return (
    <Canvas
      shadows
      camera={{
        position: camera.position,
        fov: camera.fov,
      }}
      onCreated={handleSceneCreated}
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
  );
}
