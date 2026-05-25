"use client";

import { Center } from "@react-three/drei";
import AnimatedModel from "./AnimatedModel";

export const HorrorLightModel = ({ scale = 1, position = [0, 0, 0], ...props }: any) => {
  return (
    <group position={position as [number, number, number]} scale={scale} {...props}>
      <Center>
        <AnimatedModel url="/models/horror light.glb" />
      </Center>
    </group>
  );
};

export default HorrorLightModel;
