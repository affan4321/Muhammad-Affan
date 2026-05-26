"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas as R3FCanvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import LightingTransition from "./LightingTransition";
import Chamber from "./Chamber";
import AudioManager from "./AudioManager";
import ChamberTrigger from "./ChamberTrigger";
import { Cart } from "./Cart";
import Atmospherics from "./Atmospherics";
import TunnelShell from "./TunnelShell";
import { TunnelEnvironment } from "./TunnelEnvironment";
import { ChamberEntrances } from "./ChamberEntrances";
import { useGameStore } from "@/store/gameStore";
import { useCartInput } from "@/hooks/useCartInput";
import { buildJourney } from "@/lib/journey";
import { TrackSetDressing } from "./TrackSetDressing";
import { SCENE_PROP_URLS } from "@/lib/sceneProps";
import { LoadingScreen } from "./LoadingScreen";

Object.values(SCENE_PROP_URLS).forEach((url) => useGLTF.preload(url));
useGLTF.preload("/models/dog.glb");

if (import.meta.turbopackHot) {
  import.meta.turbopackHot.dispose(() => {
    useGameStore.getState().reset();
  });
}

const TunnelScene = () => {
  useCartInput();
  return (
    <>
      <TunnelShell />
      <TunnelEnvironment />
      <TrackSetDressing />
      <ChamberEntrances />
      <Cart />
    </>
  );
};

const ChamberScene = () => {
  return (
    <>
      <Chamber />
    </>
  );
};

const Scene = () => {
  const setSceneLoading = useGameStore((state) => state.setSceneLoading);
  const gameState = useGameStore((state) => state.gameState);

  useEffect(() => {
    setSceneLoading(false);
    return () => setSceneLoading(true);
  }, [setSceneLoading]);

  const isInsideChamber = gameState === "INSIDE_CHAMBER";

  return (
    <>
      {/* Position/rotation come from Cart + cartRig.ts — do not set position here */}
      {!isInsideChamber && <PerspectiveCamera makeDefault fov={72} />}

      {!isInsideChamber && <Atmospherics />}
      {!isInsideChamber && <LightingTransition />}

      {!isInsideChamber && (
        <EffectComposer>
          <Bloom intensity={0.75} luminanceThreshold={0.18} mipmapBlur />
        </EffectComposer>
      )}

      {/* Level management: only render one scene at a time */}
      {isInsideChamber ? <ChamberScene /> : <TunnelScene />}

      <ChamberTrigger />
      <AudioManager />
    </>
  );
};

const GameInitializer = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const graph = buildJourney();
    useGameStore.getState().setJourneyGraph(graph);
  }, []);

  return <>{children}</>;
};

export const GameCanvas = () => {
  // Force remount on hot reload to prevent Three.js state issues
  const [key, setKey] = useState(0);
  if (import.meta.turbopackHot) {
    import.meta.turbopackHot.accept(() => {
      setKey((prev) => prev + 1);
    });
  }

  return (
    <GameInitializer>
      <R3FCanvas key={key}
        gl={{
          antialias: true,
          alpha: true,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.45;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
        style={{
          width: "100%",
          height: "100vh",
          display: "block",
        }}
      >
        <Suspense fallback={<LoadingScreen />}>
          <Scene />
        </Suspense>
      </R3FCanvas>
    </GameInitializer>
  );
};
