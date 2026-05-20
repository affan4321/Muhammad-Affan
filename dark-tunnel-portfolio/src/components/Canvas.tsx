"use client";

import { useEffect } from "react";
import { Canvas as R3FCanvas } from "@react-three/fiber";
import { PerspectiveCamera, Grid } from "@react-three/drei";
import { Handcar } from "./Handcar";
import { CameraController } from "./CameraController";
import { useGameStore } from "@/store/gameStore";
import { useHandcarInput } from "@/hooks/useHandcarInput";
import { generateDemoTracks } from "@/lib/curves";

/**
 * Inner scene component
 */
const Scene = () => {
  // Setup input (must be done here in the component)
  useHandcarInput();

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, -3]} fov={75} />
      <CameraController />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
      />

      {/* Environment */}
      <Grid
        args={[100, 100]}
        cellSize={5}
        cellColor="#444"
        sectionSize={20}
        sectionColor="#888"
      />

      {/* Game Objects */}
      <Handcar />
    </>
  );
};

/**
 * Initialization wrapper - initializes game state when component mounts
 */
const GameInitializer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  useEffect(() => {
    const { mainTrack, leftPath, rightPath } = generateDemoTracks();

    useGameStore.setState({
      currentTrack: mainTrack,
      gameState: "RIDING",
      availablePaths: [
        { id: "left", label: "Left Path", curve: leftPath },
        { id: "right", label: "Right Path", curve: rightPath },
      ],
    });
  }, []);

  return <>{children}</>;
};

export const GameCanvas = () => {
  return (
    <GameInitializer>
      <R3FCanvas
        gl={{
          antialias: true,
          alpha: true,
        }}
        style={{
          width: "100%",
          height: "100vh",
          display: "block",
        }}
      >
        <Scene />
      </R3FCanvas>
    </GameInitializer>
  );
};
