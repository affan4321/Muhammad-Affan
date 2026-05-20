"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useGameStore } from "@/store/gameStore";

/**
 * TunnelShell: places simple stretched boxes alongside the track to imply walls/ceiling
 */
const TunnelShell = () => {
  const currentTrack = useGameStore((s) => s.currentTrack);

  const segments = useMemo(() => {
    if (!currentTrack) return [];
    const res: { pos: THREE.Vector3; right: THREE.Vector3; length: number }[] = [];
    const samples = 30;
    let prevPoint = currentTrack.getPointAt(0);
    for (let i = 1; i <= samples; i++) {
      const t = i / samples;
      const pt = currentTrack.getPointAt(t);
      const tangent = currentTrack.getTangentAt(t).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(tangent, up).normalize();
      const length = pt.distanceTo(prevPoint) || 1;
      res.push({ pos: pt.clone(), right, length });
      prevPoint = pt;
    }
    return res;
  }, [currentTrack]);

  if (!currentTrack) return null;

  return (
    <group>
      {segments.map((s, idx) => {
        const leftPos = s.pos.clone().add(s.right.clone().multiplyScalar(-6));
        const rightPos = s.pos.clone().add(s.right.clone().multiplyScalar(6));
        const ceilingPos = s.pos.clone().add(new THREE.Vector3(0, 3.6, 0));

        return (
          <group key={idx}>
            <mesh position={leftPos.toArray()} rotation={[0, 0, 0]}>
              <boxGeometry args={[s.length * 1.05, 6, 6]} />
              <meshStandardMaterial color="#0b0b0b" emissive="#020202" metalness={0.1} roughness={1} />
            </mesh>
            <mesh position={rightPos.toArray()} rotation={[0, 0, 0]}>
              <boxGeometry args={[s.length * 1.05, 6, 6]} />
              <meshStandardMaterial color="#0b0b0b" emissive="#020202" metalness={0.1} roughness={1} />
            </mesh>
            <mesh position={ceilingPos.toArray()} rotation={[0, 0, 0]}>
              <boxGeometry args={[s.length * 1.05, 1.8, 12]} />
              <meshStandardMaterial color="#030303" emissive="#010101" metalness={0} roughness={1} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export default TunnelShell;
