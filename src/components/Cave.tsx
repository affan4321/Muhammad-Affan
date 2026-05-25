"use client";

import { useMemo } from "react";
import * as THREE from "three";
import Hologram from "./Hologram";
import { useGameStore } from "@/store/gameStore";
import { getIglooDoorTransform } from "@/lib/iglooDoor";

/** Hologram content inside the igloo (door is rendered by IglooEntrances). */
export const Cave = () => {
  const currentTrack = useGameStore((s) => s.currentTrack);
  const gameState = useGameStore((s) => s.gameState);
  const activeBranch = useGameStore((s) => s.activeBranch);

  const interiorPos = useMemo(() => {
    if (!currentTrack) return [0, 2, 0] as [number, number, number];
    try {
      const door = getIglooDoorTransform(currentTrack);
      const tangent = currentTrack.getTangentAt(0.98).clone();
      tangent.y = 0;
      tangent.normalize();
      const forward = new THREE.Vector3(-tangent.x, 0, -tangent.z).normalize();
      return [
        door.position[0] + forward.x * 5,
        door.position[1] + 1.5,
        door.position[2] + forward.z * 5,
      ] as [number, number, number];
    } catch {
      const p = currentTrack.getPointAt(1);
      return [p.x, p.y + 2, p.z] as [number, number, number];
    }
  }, [currentTrack]);

  const label = activeBranch?.label ?? "Information Igloo";

  if (gameState !== "INSIDE_CAVE") {
    return null;
  }

  return (
    <group position={interiorPos}>
      <Hologram position={[0, 0, 0]} text={label} />
    </group>
  );
};

export default Cave;
