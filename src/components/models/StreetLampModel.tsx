"use client";

import { Center } from "@react-three/drei";
import AnimatedModel from "./AnimatedModel";

export const StreetLampModel = ({ scale = 1, position = [0, 0, 0], ...props }: any) => {
  return (
    <group position={position as [number, number, number]} scale={scale} {...props}>
      <Center>
        <AnimatedModel url="/models/street_lamp.glb" />
      </Center>
    </group>
  );
};

export default StreetLampModel;
