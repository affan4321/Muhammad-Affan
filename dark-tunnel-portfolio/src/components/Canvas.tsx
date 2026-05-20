"use client";

import { useEffect } from "react";
import { Canvas as R3FCanvas } from "@react-three/fiber";
import { PerspectiveCamera, Grid } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import LightingTransition from "./LightingTransition";
import Cave from "./Cave";
import AudioManager from "./AudioManager";
import CaveTrigger from "./CaveTrigger";
import { Handcar } from "./Handcar";
import { CameraController } from "./CameraController";
import Atmospherics from "./Atmospherics";
import TunnelShell from "./TunnelShell";
import { TunnelEnvironment } from "./TunnelEnvironment";
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

      {/* Atmosphere and lighting */}
      <Atmospherics />
      <ambientLight intensity={0.02} />
      <TunnelShell />
      <TunnelEnvironment />
      {/* LightingTransition will animate directional light intensity */}
      <LightingTransition />

      {/* Environment */}
      <Grid args={[100, 100]} cellSize={5} cellColor="#444" sectionSize={20} sectionColor="#888" />

      {/* Postprocessing */}
      <EffectComposer>
        <Bloom intensity={0.8} luminanceThreshold={0.2} mipmapBlur />
      </EffectComposer>

      {/* Game Objects */}
      <Handcar />
      <Cave />
      <CaveTrigger />
      <AudioManager />
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
