"use client";

import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { R2_BASE_URL } from "@/lib/sceneProps";

type Props = {
  variant?: "room1" | "room2";
  scale?: number;
};

export const IsolationRoomModel = ({ variant = "room1", scale = 1 }: Props) => {
  useEffect(() => {
    useGLTF.preload(`${R2_BASE_URL}/models/isolation-room.glb`);
    useGLTF.preload(`${R2_BASE_URL}/models/isolation-room2.glb`);
  }, []);
  const modelPath = variant === "room1" ? `${R2_BASE_URL}/models/isolation-room.glb` : `${R2_BASE_URL}/models/isolation-room2.glb`;
  const gltf = useGLTF(modelPath);

  return (
    <primitive
      object={gltf.scene}
      scale={scale}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    />
  );
};

export default IsolationRoomModel;
