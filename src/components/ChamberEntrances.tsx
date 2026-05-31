"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import DoorModel from "./models/DoorModel";
import RustyLampModel from "./models/RustyLampModel";
import { useGameStore } from "@/store/gameStore";
import { getChamberDoorTransform } from "@/lib/chamberDoor";
import { CHAMBER_DOOR_RIG } from "@/lib/chamberDoorRig";
import { R2_BASE_URL } from "@/lib/sceneProps";

useGLTF.preload(`${R2_BASE_URL}/models/door.glb`);
useGLTF.preload(`${R2_BASE_URL}/models/rusty%20lamp.glb`);

/**
 * One door at the end of every branch path (each information chamber entrance).
 */
export const ChamberEntrances = () => {
  const journey = useGameStore((state) => state.journey);
  const trackContext = useGameStore((state) => state.trackContext);
  const currentTrack = useGameStore((state) => state.currentTrack);
  const gameState = useGameStore((state) => state.gameState);

  const entrances = useMemo(() => {
    const list: {
      id: string;
      curve: NonNullable<(typeof journey)[0]["branches"][0]["curve"]>;
      transform: ReturnType<typeof getChamberDoorTransform>;
    }[] = [];

    for (const segment of journey) {
      for (const branch of segment.branches) {
        if (!branch.curve) continue;
        list.push({
          id: branch.id,
          curve: branch.curve,
          transform: getChamberDoorTransform(branch.curve),
        });
      }
    }
    return list;
  }, [journey]);

  if (entrances.length === 0) return null;

  const onActiveBranch =
    trackContext === "branch" &&
    (gameState === "RIDING" || gameState === "INSIDE_CHAMBER");

  return (
    <group name="chamber-entrances">
      {entrances.map(({ id, curve, transform }) => {
        const active = onActiveBranch && currentTrack === curve;

        return (
          <group
            key={`chamber-entrance-${id}`}
            position={transform.position}
            rotation={[0, transform.rotationY, 0]}
          >
            <DoorModel scale={CHAMBER_DOOR_RIG.scale} />
            <RustyLampModel
              scale={5}
              position={[0, 2.7, 0]}
              rotation={[1, 0, 1.5]}
            />
            <pointLight
              position={[0, 2.5, 0.8]}
              intensity={25}
              distance={100}
              color="#ffaa00"
              castShadow
            />
            {active && (
              <pointLight
                position={[0, 2.5, 0]}
                intensity={2.2}
                distance={18}
                color="#ffe9c9"
              />
            )}
          </group>
        );
      })}
    </group>
  );
};

export default ChamberEntrances;
