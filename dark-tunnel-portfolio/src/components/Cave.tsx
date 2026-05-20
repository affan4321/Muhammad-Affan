"use client";

import { useMemo } from "react";
import StonePillar from "./StonePillar";
import Hologram from "./Hologram";
import { useGameStore } from "@/store/gameStore";

export const Cave = () => {
  const currentTrack = useGameStore((s) => s.currentTrack);

  const cavePos = useMemo(() => {
    if (!currentTrack) return [10, 0, 40];
    try {
      const p = currentTrack.getPointAt(1);
      return [p.x, p.y, p.z];
    } catch (e) {
      return [10, 0, 40];
    }
  }, [currentTrack]);

  return (
    <group position={cavePos as any}>
      <StonePillar position={[0, -1, 0]} scale={1.2} label={"Project Alpha"} />
      <Hologram position={[0, 2.6, 0]} text={"Project Alpha"} />

      {/* additional rock meshes as simple spheres for blocking visual */}
      <mesh position={[3, -1, 4]}>
        <sphereGeometry args={[2, 12, 12]} />
        <meshStandardMaterial color="#2f2f2f" />
      </mesh>
    </group>
  );
};

export default Cave;
