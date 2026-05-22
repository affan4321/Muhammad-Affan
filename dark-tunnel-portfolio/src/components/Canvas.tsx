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
import { IglooEntrances } from "./IglooEntrances";
import { useGameStore } from "@/store/gameStore";
import { useCartInput } from "@/hooks/useCartInput";
import { buildJourney } from "@/lib/journey";

const Scene = () => {
  useCartInput();

  return (
    <>
      {/* Position/rotation come from Cart + cartRig.ts — do not set position here */}
      <PerspectiveCamera makeDefault fov={72} />

      <fog attach="fog" args={["#000000", 1, 6]} />
      <Atmospherics />
      <TunnelShell />
      <TunnelEnvironment />
      <IglooEntrances />
      <LightingTransition />

      <EffectComposer>
        <Bloom intensity={0.75} luminanceThreshold={0.18} mipmapBlur />
      </EffectComposer>

      <Cart />
      <Cave />
      <CaveTrigger />
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
