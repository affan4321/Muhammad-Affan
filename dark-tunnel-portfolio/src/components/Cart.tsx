"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGameStore } from "@/store/gameStore";
import * as THREE from "three";
import CartModel from "./models/CartModel";

/**
 * Cart component - renders the cart model that moves along the track
 */
export const Cart = () => {
  const groupRef = useRef<THREE.Group>(null!);
  const currentTrack = useGameStore((state) => state.currentTrack);
  const progress = useGameStore((state) => state.progress);
  const setProgress = useGameStore((state) => state.setProgress);
  const speed = useGameStore((state) => state.speed);
  const isMovingForward = useGameStore((state) => state.isMovingForward);
  const isMovingBackward = useGameStore((state) => state.isMovingBackward);
  const gameState = useGameStore((state) => state.gameState);
  const { camera } = useThree();

  useFrame(() => {
    if (!currentTrack || gameState === "IDLE") {
      return;
    }

    let newProgress = progress;
    if (isMovingForward) {
      newProgress += speed;
    }
    if (isMovingBackward) {
      newProgress -= speed;
    }

    newProgress = Math.max(0, Math.min(1, newProgress));
    setProgress(newProgress);

    const position = currentTrack.getPointAt(newProgress);
    const tangent = currentTrack.getTangentAt(newProgress).normalize();
    const flatTangent = tangent.clone();
    flatTangent.y = 0;

    if (flatTangent.lengthSq() === 0) {
      flatTangent.set(0, 0, 1);
    }

    flatTangent.normalize();

    if (groupRef.current) {
      groupRef.current.position.copy(position);
      groupRef.current.position.y += 0.08;
      groupRef.current.rotation.set(0, Math.atan2(flatTangent.x, -flatTangent.z), 0);
    }

    useGameStore.setState({ currentPosition: position.clone() });
  });

  useEffect(() => {
    // Attach camera to cart group for first-person view
    if (groupRef.current && camera) {
      const originalParent = camera.parent;
      groupRef.current.add(camera);
      camera.position.set(0, 1.15, -1.2);
      camera.rotation.set(0, 0, 0);

      return () => {
        try {
          groupRef.current?.remove(camera);
          originalParent?.add(camera);
        } catch (e) {}
      };
    }
    return () => {};
  }, [camera]);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <CartModel scale={0.18} visible={false} />
    </group>
  );
};