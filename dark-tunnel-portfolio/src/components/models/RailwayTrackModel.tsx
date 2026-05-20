"use client";

import { useGLTF } from "@react-three/drei";

export const RailwayTrackModel = ({ scale = 0.01, position = [0, 0, 0], ...props }: any) => {
  const gltf = useGLTF("/models/railway track.glb");
  return (
    <group position={position as [number, number, number]} scale={scale} {...props}>
      <primitive object={gltf.scene} />
    </group>
  );
};

export default RailwayTrackModel;
