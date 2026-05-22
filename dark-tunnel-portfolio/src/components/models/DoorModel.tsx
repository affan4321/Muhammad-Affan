"use client";

import { Center } from "@react-three/drei";
import AnimatedModel from "./AnimatedModel";

export const DoorModel = ({ scale = 0.3, position = [0, 0, 0], ...props }: any) => {
  return (
    <group position={position as [number, number, number]} scale={scale} {...props}>
      <Center>
        <AnimatedModel url="/models/door.glb" frustumCulled={false} />
      </Center>
    </group>
  );
};

export default DoorModel;
