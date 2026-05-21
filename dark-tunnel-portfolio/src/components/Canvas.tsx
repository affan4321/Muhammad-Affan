"use client";

import { useEffect } from "react";
import { Canvas as R3FCanvas } from "@react-three/fiber";
import { PerspectiveCamera, Grid } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import LightingTransition from "./LightingTransition";
import Cave from "./Cave";
import AudioManager from "./AudioManager";
import CaveTrigger from "./CaveTrigger";
import { Cart } from "./Cart";
import Atmospherics from "./Atmospherics";
import TunnelShell from "./TunnelShell";
import { TunnelEnvironment } from "./TunnelEnvironment";
import { useGameStore } from "@/store/gameStore";
import { useCartInput } from "@/hooks/useCartInput";
import { generateDemoTracks } from "@/lib/curves";

/**
 * Inner scene component
 */
const Scene = () => {
  useCartInput();

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, -3]} fov={75} />
      {/* CameraController disabled to avoid fighting the cart-attached camera */}

      {/* Lighting */}
      <hemisphereLight intensity={0.18} color="#5c4c3d" groundColor="#050505" />
      <directionalLight position={[6, 8, 6]} intensity={0.7} color="#fff2db" castShadow={false} />
      <pointLight position={[0, 2.5, 0]} intensity={0.35} distance={30} color="#ffe9c9" />

      {/* Atmosphere and lighting */}
      <Atmospherics />
      <ambientLight intensity={0.05} />
      <TunnelShell />
      <TunnelEnvironment />
      <LightingTransition />

      {/* Environment */}
      <Grid args={[100, 100]} cellSize={5} cellColor="#444" sectionSize={20} sectionColor="#888" />

      {/* Postprocessing */}
      <EffectComposer>
        <Bloom intensity={0.75} luminanceThreshold={0.18} mipmapBlur />
      </EffectComposer>

      {/* Game Objects */}
      <Cart />
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
    const { mainTrack, firstPaths } = generateDemoTracks();

    useGameStore.setState({
      currentTrack: mainTrack,
      gameState: "RIDING",
      availablePaths: firstPaths,
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
