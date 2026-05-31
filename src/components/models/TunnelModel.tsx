"use client";

import { Center } from "@react-three/drei";
import AnimatedModel from "./AnimatedModel";
import { R2_BASE_URL } from "@/lib/sceneProps";

export const TunnelModel = ({ scale = 1, position = [0, 0, 0], ...props }: any) => {
  return (
    <group position={position as [number, number, number]} scale={scale} {...props}>
      <Center>
        <AnimatedModel url={`${R2_BASE_URL}/models/tunnel.glb`} />
      </Center>
    </group>
  );
};

export default TunnelModel;
