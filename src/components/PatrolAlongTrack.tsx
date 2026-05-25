"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import AnimatedModel from "./models/AnimatedModel";
import { yawFromTrackTangent } from "@/lib/pathGeometry";

export type PatrolAlongTrackProps = {
  curve: THREE.Curve<THREE.Vector3>;
  url: string;
  /** 0–1 along the curve */
  startT?: number;
  endT?: number;
  /** How fast to travel the patrol span (higher = faster). ~0.05–0.12 typical. */
  speed?: number;
  scale?: number;
  offset?: [number, number, number];
  localRotation?: [number, number, number];
  animationName?: string;
};

/**
 * Plays a GLB clip and moves the model along a track segment, then loops.
 * (Clip = leg motion; parent group = actual distance covered.)
 */
export const PatrolAlongTrack = ({
  curve,
  url,
  startT = 0.15,
  endT = 0.9,
  speed = 0.07,
  scale = 1,
  offset = [0, 0, 0],
  localRotation = [0, 0, 0],
  animationName,
}: PatrolAlongTrackProps) => {
  const groupRef = useRef<THREE.Group>(null!);
  const progress = useRef(0);
  const tangent = useRef(new THREE.Vector3());
  const position = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    progress.current += speed * delta;
    if (progress.current >= 1) progress.current = 0;

    const t = startT + progress.current * (endT - startT);
    curve.getPointAt(t, position.current);
    curve.getTangentAt(Math.min(0.99, t + 0.02), tangent.current);
    tangent.current.y = 0;
    if (tangent.current.lengthSq() < 1e-6) tangent.current.set(0, 0, 1);
    tangent.current.normalize();

    groupRef.current.position.set(
      position.current.x + offset[0],
      position.current.y + offset[1],
      position.current.z + offset[2]
    );
    groupRef.current.rotation.set(0, yawFromTrackTangent(tangent.current), 0);
  });

  return (
    <group ref={groupRef}>
      <group rotation={localRotation}>
        <AnimatedModel
          url={url}
          scale={scale}
          animationName={animationName}
          autoPlay
        />
        <pointLight position={[0, 2, 0]} intensity={4} distance={12} color="#ff4422" />
      </group>
    </group>
  );
};

export default PatrolAlongTrack;
