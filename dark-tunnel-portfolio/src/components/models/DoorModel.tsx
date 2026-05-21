"use client";

import { Center, useGLTF } from "@react-three/drei";

export const DoorModel = ({ scale = 0.01, position = [0, 0, 0], ...props }: any) => {
  const gltf = useGLTF("/models/door.glb");
  return (
    <group position={position as [number, number, number]} scale={scale} {...props}>
      <Center>
        <primitive object={gltf.scene} dispose={null} />
      </Center>
    </group>
  );
};

export default DoorModel;
