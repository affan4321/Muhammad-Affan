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

// Disable aggressive preloading on mobile to prevent memory issues
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
if (!isMobile) {
  Object.values(SCENE_PROP_URLS).forEach((url) => useGLTF.preload(url));
  useGLTF.preload(`${R2_BASE_URL}/models/dog.glb`);
} else {
  console.log("Canvas: Skipping model preloading on mobile to save memory");
}

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

    console.log("Canvas: Setting renderer quality", { graphicsQuality, preset });

    // Aggressive pixel ratio capping for mobile to prevent memory issues
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const maxPixelRatio = isMobile ? 1.5 : preset.pixelRatio;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, maxPixelRatio);

    console.log("Canvas: Setting pixel ratio", {
      devicePixelRatio: window.devicePixelRatio,
      presetPixelRatio: preset.pixelRatio,
      isMobile,
      maxPixelRatio,
      targetPixelRatio: pixelRatio,
    });

    renderer.toneMappingExposure = preset.exposure;
    renderer.setPixelRatio(pixelRatio);

    // Disable shadows on mobile to save memory
    if (isMobile) {
      console.log("Canvas: Disabling shadows on mobile for memory savings");
      renderer.shadowMap.enabled = false;
    } else {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = preset.shadowMapType;
    }
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
    console.log("Canvas: Scene mounted, setting isSceneLoading to false");
    setSceneLoading(false);

    // Log memory usage if available
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      console.log("Canvas: Memory usage", {
        usedJSHeapSize: (memory.usedJSHeapSize / 1048576).toFixed(2) + " MB",
        totalJSHeapSize: (memory.totalJSHeapSize / 1048576).toFixed(2) + " MB",
        jsHeapSizeLimit: (memory.jsHeapSizeLimit / 1048576).toFixed(2) + " MB",
      });
    }

    return () => {
      console.log("Canvas: Scene unmounted, setting isSceneLoading to true");
      setSceneLoading(true);
    };
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
    console.log("Canvas: GameInitializer - building journey");
    try {
      const graph = buildJourney();
      useGameStore.getState().setJourneyGraph(graph);
      console.log("Canvas: GameInitializer - journey graph set successfully");
    } catch (e) {
      console.error("Canvas: GameInitializer - failed to build journey", e);
    }
  }, []);

  return <>{children}</>;
};

export const GameCanvas = () => {
  // Force remount on hot reload to prevent Three.js state issues
  const [key, setKey] = useState(0);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    console.log("Canvas: GameCanvas mounted, checking WebGL support");
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        console.error("Canvas: WebGL not supported");
      } else {
        console.log("Canvas: WebGL is supported");
      }
    } catch (e) {
      console.error("Canvas: WebGL check failed", e);
    }
  }, []);

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
          console.log("Canvas: WebGL renderer created successfully");
          rendererRef.current = gl;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.45;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
        onError={(error) => {
          console.error("Canvas: R3F Canvas error:", error);
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
