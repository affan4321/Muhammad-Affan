"use client";

import { useMemo } from "react";
import { useGameStore } from "@/store/gameStore";
import LampModel from "./models/LampModel";
import RailwayTrackModel from "./models/RailwayTrackModel";
import DoorModel from "./models/DoorModel";

/**
 * TunnelEnvironment - Places decorative models along the track at intervals
 */
export const TunnelEnvironment = () => {
  const currentTrack = useGameStore((state) => state.currentTrack);

  const environmentModels = useMemo(() => {
    if (!currentTrack) return [];

    const models = [];

    // Place lamps at regular intervals along the track
    for (let i = 0; i < 1; i += 0.15) {
      const pos = currentTrack.getPointAt(i);
      const tangent = currentTrack.getTangentAt(i).normalize();
      
      // Offset lamps to the side
      const offsetX = tangent.z * 2;
      const offsetZ = -tangent.x * 2;

      models.push(
        <group key={`lamp-${i}`} position={[pos.x + offsetX, pos.y + 1.5, pos.z + offsetZ]}>
          <LampModel scale={0.3} />
        </group>
      );
    }

    // Place rail segments along the track
    for (let i = 0; i < 1; i += 0.2) {
      const pos = currentTrack.getPointAt(i);
      models.push(
        <group key={`rail-${i}`} position={[pos.x, pos.y - 0.5, pos.z]}>
          <RailwayTrackModel scale={0.25} />
        </group>
      );
    }

    // Place cave entrance doors at specific points
    const doorPosition = currentTrack.getPointAt(0.95);
    const doorTangent = currentTrack.getTangentAt(0.95).normalize();
    models.push(
      <group key="cave-door" position={[doorPosition.x, doorPosition.y, doorPosition.z]}>
        <DoorModel scale={0.4} />
      </group>
    );

    return models;
  }, [currentTrack]);

  return <>{environmentModels}</>;
};
