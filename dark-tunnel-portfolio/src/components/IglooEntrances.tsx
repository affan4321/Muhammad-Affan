"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import DoorModel from "./models/DoorModel";
import { useGameStore } from "@/store/gameStore";
import { getIglooDoorTransform } from "@/lib/iglooDoor";
import { DOOR_RIG } from "@/lib/doorRig";

useGLTF.preload("/models/door.glb");

/**
 * One door at the end of every branch path (each information igloo entrance).
 */
export const IglooEntrances = () => {
  const journey = useGameStore((state) => state.journey);
  const trackContext = useGameStore((state) => state.trackContext);
  const currentTrack = useGameStore((state) => state.currentTrack);
  const gameState = useGameStore((state) => state.gameState);

  const entrances = useMemo(() => {
    const list: {
      id: string;
      curve: NonNullable<(typeof journey)[0]["branches"][0]["curve"]>;
      transform: ReturnType<typeof getIglooDoorTransform>;
    }[] = [];

    for (const segment of journey) {
      for (const branch of segment.branches) {
        if (!branch.curve) continue;
        list.push({
          id: branch.id,
          curve: branch.curve,
          transform: getIglooDoorTransform(branch.curve),
        });
      }
    }
    return list;
  }, [journey]);

  if (entrances.length === 0) return null;

  const onActiveBranch =
    trackContext === "branch" &&
    (gameState === "RIDING" || gameState === "INSIDE_CAVE");

  return (
    <group name="igloo-entrances">
      {entrances.map(({ id, curve, transform }) => {
        const active = onActiveBranch && currentTrack === curve;

        return (
          <group
            key={`igloo-entrance-${id}`}
            position={transform.position}
            rotation={[0, transform.rotationY, 0]}
          >
            <DoorModel scale={DOOR_RIG.scale} />
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

export default IglooEntrances;
