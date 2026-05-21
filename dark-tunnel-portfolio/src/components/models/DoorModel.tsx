"use client";

import { Center, useGLTF } from "@react-three/drei";

export const DoorModel = ({ scale = 0.3, position = [0, 0, 0], ...props }: any) => {
  const gltf = useGLTF("/models/door.glb");
  if (!gltf?.scene) return null;

  return (
    <group position={position as [number, number, number]} scale={scale} {...props}>
      <Center>
        <primitive object={gltf.scene.clone(true)} dispose={null} frustumCulled={false} />
      </Center>
    </group>
  );
};

export default DoorModel;
