"use client";

import { useGLTF } from "@react-three/drei";

type Props = {
  variant?: "room1" | "room2";
  scale?: number;
};

// Preload models to prevent hanging
useGLTF.preload("/models/isolation-room.glb");
useGLTF.preload("/models/isolation-room2.glb");

export const IsolationRoomModel = ({ variant = "room1", scale = 1 }: Props) => {
  const modelPath = variant === "room1" ? "/models/isolation-room.glb" : "/models/isolation-room2.glb";
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
