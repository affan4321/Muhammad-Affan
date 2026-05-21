"use client";

import { Center, useGLTF } from "@react-three/drei";

export const RailwayTrackModel = ({ scale = 0.18, position = [0, 0, 0], ...props }: any) => {
  useGLTF.preload("/models/railway track.glb");
  const gltf = useGLTF("/models/railway track.glb");
  return (
    <group position={position as [number, number, number]} scale={scale} {...props}>
      <Center>
        <primitive object={gltf.scene} dispose={null} />
      </Center>
    </group>
  );
};

export default RailwayTrackModel;
