"use client";

import { Center, useGLTF } from "@react-three/drei";

export const RustyLampModel = ({ scale = 1, position = [0, 0, 0], ...props }: any) => {
  const gltf = useGLTF("/models/rusty lamp.glb");
  return (
    <group position={position as [number, number, number]} scale={scale} {...props}>
      <Center>
        <primitive object={gltf.scene.clone(true)} dispose={null} />
      </Center>
    </group>
  );
};

export default RustyLampModel;
