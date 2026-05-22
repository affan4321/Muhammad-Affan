"use client";

import { useEffect, useMemo, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";

export interface AnimatedModelProps {
  url: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  autoPlay?: boolean;
  animationName?: string;
  [key: string]: unknown;
}

/**
 * Loads a GLB and plays embedded clips. Clones with SkeletonUtils so skinned
 * animations still run (a plain scene.clone() breaks the mixer).
 */
export const AnimatedModel = ({
  url,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  autoPlay = true,
  animationName,
  ...props
}: AnimatedModelProps) => {
  const { scene, animations } = useGLTF(url);
  const root = useMemo(() => SkeletonUtils.clone(scene) as THREE.Group, [scene]);
  const { actions, names, mixer } = useAnimations(animations, root);
  const logged = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "development" && !logged.current) {
      console.info(
        `[AnimatedModel] ${url} clips:`,
        names.length > 0 ? names : "(none — mesh only)"
      );
      logged.current = true;
    }
  }, [url, names]);

  useEffect(() => {
    if (!autoPlay || names.length === 0) return;

    const action = animationName ? actions[animationName] : actions[names[0]];
    if (!action) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[AnimatedModel] No clip "${animationName ?? names[0]}" on ${url}`);
      }
      return;
    }

    action.reset().fadeIn(0.15).play();
    return () => {
      action.fadeOut(0.15);
    };
  }, [actions, names, autoPlay, animationName, url]);

  useEffect(() => {
    return () => {
      mixer?.stopAllAction();
    };
  }, [mixer]);

  return (
    <primitive
      object={root}
      position={position}
      rotation={rotation}
      scale={scale}
      frustumCulled={false}
      {...props}
    />
  );
};

export default AnimatedModel;
