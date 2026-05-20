"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useGameStore } from "@/store/gameStore";

const getFlatYaw = (direction: THREE.Vector3) => {
  const flatDirection = direction.clone();
  flatDirection.y = 0;

  if (flatDirection.lengthSq() === 0) {
    flatDirection.set(0, 0, 1);
  }

  flatDirection.normalize();
  return Math.atan2(flatDirection.x, flatDirection.z);
};

/**
 * TunnelShell: places continuous stretched boxes alongside the track to imply walls and ceiling
 */
const TunnelShell = () => {
  const currentTrack = useGameStore((s) => s.currentTrack);

  const segments = useMemo(() => {
    if (!currentTrack) return [];

    const res: { pos: THREE.Vector3; yaw: number; length: number }[] = [];
    const sampleCount = 60;
    let previousPoint = currentTrack.getPointAt(0);

    for (let i = 1; i <= sampleCount; i++) {
      const t = i / sampleCount;
      const point = currentTrack.getPointAt(t);
      const midpoint = previousPoint.clone().lerp(point, 0.5);
      const direction = point.clone().sub(previousPoint);
      const yaw = getFlatYaw(direction);
      const length = Math.max(direction.length() * 1.2, 0.75);

      res.push({ pos: midpoint, yaw, length });
      previousPoint = point;
    }

    return res;
  }, [currentTrack]);

  if (!currentTrack) return null;

  return (
    <group>
      {segments.map((segment, index) => (
        <group key={index} position={[segment.pos.x, segment.pos.y, segment.pos.z]} rotation={[0, segment.yaw, 0]}>
          <mesh position={[0, 0.4, -6]}>
            <boxGeometry args={[segment.length, 6.5, 6.5]} />
            <meshStandardMaterial color="#0b0b0b" emissive="#020202" metalness={0.1} roughness={1} />
          </mesh>
          <mesh position={[0, 0.4, 6]}>
            <boxGeometry args={[segment.length, 6.5, 6.5]} />
            <meshStandardMaterial color="#0b0b0b" emissive="#020202" metalness={0.1} roughness={1} />
          </mesh>
          <mesh position={[0, 3.7, 0]}>
            <boxGeometry args={[segment.length, 1.8, 12]} />
            <meshStandardMaterial color="#030303" emissive="#010101" metalness={0} roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default TunnelShell;
