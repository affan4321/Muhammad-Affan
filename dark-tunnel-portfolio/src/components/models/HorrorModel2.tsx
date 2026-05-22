"use client";

import { Center } from "@react-three/drei";
import AnimatedModel from "./AnimatedModel";

export const HorrorModel2 = ({ scale = 1, position = [0, 0, 0], ...props }: any) => {
  return (
    <group position={position as [number, number, number]} scale={scale} {...props}>
      <Center>
        <AnimatedModel url="/models/horror 2.glb" />
      </Center>
    </group>
  );
};

export default HorrorModel2;
