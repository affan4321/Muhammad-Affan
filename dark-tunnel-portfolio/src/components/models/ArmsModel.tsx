"use client";

import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { R2_BASE_URL } from "@/lib/sceneProps";

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
  useEffect(() => {
    useGLTF.preload(`${R2_BASE_URL}/models/arms.glb`);
  }, []);
  const gltf = useGLTF(`${R2_BASE_URL}/models/arms.glb`);

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
