"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
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
import { SCENE_PROP_URLS, R2_BASE_URL } from "@/lib/sceneProps";
import { LoadingScreen } from "./LoadingScreen";
import { GRAPHICS_QUALITY_PRESETS } from "@/lib/graphicsQuality";

Object.values(SCENE_PROP_URLS).forEach((url) => useGLTF.preload(url));
useGLTF.preload(`${R2_BASE_URL}/models/dog.glb`);

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

const RendererQualityController = ({
  rendererRef,
}: {
  rendererRef: MutableRefObject<THREE.WebGLRenderer | null>;
}) => {
  const graphicsQuality = useGameStore((state) => state.graphicsQuality);
  const preset = GRAPHICS_QUALITY_PRESETS[graphicsQuality];

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    renderer.toneMappingExposure = preset.exposure;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, preset.pixelRatio));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = preset.shadowMapType;
  }, [preset, rendererRef]);

  return null;
};

const Scene = ({
  rendererRef,
}: {
  rendererRef: MutableRefObject<THREE.WebGLRenderer | null>;
}) => {
  const setSceneLoading = useGameStore((state) => state.setSceneLoading);
  const gameState = useGameStore((state) => state.gameState);
  const graphicsQuality = useGameStore((state) => state.graphicsQuality);
  const preset = GRAPHICS_QUALITY_PRESETS[graphicsQuality];

  useEffect(() => {
    setSceneLoading(false);
    return () => setSceneLoading(true);
  }, [setSceneLoading]);

  const isInsideChamber = gameState === "INSIDE_CHAMBER";

  return (
    <>
      {/* Position/rotation come from Cart + cartRig.ts — do not set position here */}
      {!isInsideChamber && <PerspectiveCamera makeDefault fov={72} />}
      <RendererQualityController rendererRef={rendererRef} />

      {!isInsideChamber && <Atmospherics />}
      {!isInsideChamber && <LightingTransition />}

      {!isInsideChamber && (
        <EffectComposer>
          <Bloom intensity={preset.bloomIntensity} luminanceThreshold={preset.bloomThreshold} mipmapBlur />
        </EffectComposer>
      )}

      {/* Level management: only render one scene at a time */}
      {isInsideChamber ? <ChamberScene /> : <TunnelScene />}

      <ChamberTrigger />
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
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
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
          rendererRef.current = gl;
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
        <AudioManager />
        <Suspense fallback={<LoadingScreen />}>
          <Scene rendererRef={rendererRef} />
        </Suspense>
      </R3FCanvas>
    </GameInitializer>
  );
};
