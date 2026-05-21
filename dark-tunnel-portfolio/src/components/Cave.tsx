"use client";

import { useMemo } from "react";
import StonePillar from "./StonePillar";
import Hologram from "./Hologram";
import { useGameStore } from "@/store/gameStore";
import * as THREE from "three";

export const Cave = () => {
  const currentTrack = useGameStore((s) => s.currentTrack);
  const availablePaths = useGameStore((s) => s.availablePaths);

  const cavePos = useMemo(() => {
    if (!currentTrack) return [10, 0, 40];
    try {
      const branchPoints = availablePaths
        .map((path) => path.curve?.getPointAt(0))
        .filter((point): point is THREE.Vector3 => Boolean(point));

      if (branchPoints.length > 0) {
        const split = branchPoints.reduce((acc, point) => acc.add(point.clone()), new THREE.Vector3()).multiplyScalar(1 / branchPoints.length);

        const tangent = currentTrack.getTangentAt(1).clone();
        tangent.y = 0;
        tangent.normalize();
        const side = new THREE.Vector3(-tangent.z, 0, tangent.x);

        const sideOffset = side.multiplyScalar(0); // left/right
        const forwardOffset = tangent.clone().multiplyScalar(7.5); // forward/back

        return [
          split.x + sideOffset.x + forwardOffset.x,
          split.y + sideOffset.y + forwardOffset.y,
          split.z + sideOffset.z + forwardOffset.z,
        ];
      }

      const p = currentTrack.getPointAt(1);
      return [p.x, p.y, p.z];
    } catch (e) {
      return [10, 0, 40];
    }
  }, [currentTrack, availablePaths]);

  return (
    <group position={cavePos as any}>
      <StonePillar position={[0, -1, 0]} scale={1.2} label={"Project Alpha"} />
      <Hologram position={[0, 2.6, 0]} text={"Project Alpha"} />

    </group>
  );
};

export default Cave;
