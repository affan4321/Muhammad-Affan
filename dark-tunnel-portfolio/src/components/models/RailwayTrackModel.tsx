"use client";

import { Center } from "@react-three/drei";
import AnimatedModel from "./AnimatedModel";

export const RailwayTrackModel = ({ scale = 0.18, position = [0, 0, 0], ...props }: any) => {
  return (
    <group position={position as [number, number, number]} scale={scale} {...props}>
      <Center>
        <AnimatedModel url="/models/railway track.glb" />
      </Center>
    </group>
  );
};

export default RailwayTrackModel;
