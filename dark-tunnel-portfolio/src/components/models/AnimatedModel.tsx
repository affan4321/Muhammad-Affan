"use client";

import { useEffect } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";

interface AnimatedModelProps {
  url: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  autoPlay?: boolean;
  animationName?: string;
  [key: string]: any;
}

export const AnimatedModel = ({
  url,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  autoPlay = true,
  animationName,
  ...props
}: AnimatedModelProps) => {
  const gltf = useGLTF(url);
  const { actions, names } = useAnimations(gltf.animations, gltf.scene);

  useEffect(() => {
    if (autoPlay && names.length > 0) {
      // Play the specified animation or the first available one
      const targetAnimation = animationName 
        ? actions[animationName] 
        : actions[names[0]];
      
      if (targetAnimation) {
        targetAnimation.reset().play();
      }
    }
  }, [actions, names, autoPlay, animationName]);

  return (
    <primitive 
      object={gltf.scene.clone(true)} 
      position={position}
      rotation={rotation}
      scale={scale}
      dispose={null}
      {...props}
    />
  );
};

export default AnimatedModel;
