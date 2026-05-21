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

      <hemisphereLight intensity={0.28} color="#5c4c3d" groundColor="#050505" />
      <directionalLight position={[6, 8, 6]} intensity={0.55} color="#fff2db" castShadow={false} />
      <pointLight position={[0, 2.5, 0]} intensity={0.45} distance={45} color="#ffe9c9" />

      <Atmospherics />
      <ambientLight intensity={0.05} />
      <TunnelShell />
      <TunnelEnvironment />
      <IglooEntrances />
      <LightingTransition />

      <Grid args={[100, 100]} cellSize={5} cellColor="#444" sectionSize={20} sectionColor="#888" />

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
