"use client";

import { useGLTF } from "@react-three/drei";

export const LampModel = ({ scale = 0.01, position = [0, 0, 0], ...props }: any) => {
  const gltf = useGLTF("/models/lamp.glb");
  return (
    <group position={position as [number, number, number]} scale={scale} {...props}>
      <primitive object={gltf.scene} />
    </group>
  );
};

export default LampModel;
