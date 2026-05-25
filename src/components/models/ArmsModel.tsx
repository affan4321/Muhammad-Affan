"use client";

import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

type ArmsModelProps = {
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  visible?: boolean;
};

export const ArmsModel = ({
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  visible = true,
}: ArmsModelProps) => {
  useGLTF.preload("/models/arms.glb");
  const gltf = useGLTF("/models/arms.glb");

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      renderOrder={10}
    >
      <primitive object={gltf.scene} visible={visible} />
    </group>
  );
};

export default ArmsModel;
