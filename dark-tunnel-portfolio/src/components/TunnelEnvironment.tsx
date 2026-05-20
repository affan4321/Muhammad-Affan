"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useGameStore } from "@/store/gameStore";
import LampModel from "./models/LampModel";
import RailwayTrackModel from "./models/RailwayTrackModel";
import DoorModel from "./models/DoorModel";

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
 * TunnelEnvironment - Places decorative models along the track at intervals
 */
export const TunnelEnvironment = () => {
  const currentTrack = useGameStore((state) => state.currentTrack);

  const environmentModels = useMemo(() => {
    if (!currentTrack) return [];

    const models = [];
    const railSegments = 60;
    const lampSpacing = 0.14;

    for (let i = 0; i < railSegments; i++) {
      const startT = i / railSegments;
      const endT = Math.min((i + 1) / railSegments, 1);
      const startPoint = currentTrack.getPointAt(startT);
      const endPoint = currentTrack.getPointAt(endT);
      const midpoint = startPoint.clone().lerp(endPoint, 0.5);
      const direction = endPoint.clone().sub(startPoint);
      const yaw = getFlatYaw(direction);
      const segmentLength = Math.max(direction.length() * 1.25, 0.75);

      models.push(
        <group
          key={`rail-${i}`}
          position={[midpoint.x, midpoint.y - 0.45, midpoint.z]}
          rotation={[0, yaw, 0]}
        >
          <RailwayTrackModel scale={[segmentLength * 0.22, 0.22, 0.22] as any} position={[0, 0, 0]} />
        </group>
      );
    }

    for (let t = 0; t <= 1; t += lampSpacing) {
      const point = currentTrack.getPointAt(t);
      const nextPoint = currentTrack.getPointAt(Math.min(t + lampSpacing, 1));
      const direction = nextPoint.clone().sub(point);
      const yaw = getFlatYaw(direction);
      const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
      const lampPosition = point.clone().add(right.multiplyScalar(2.7));

      models.push(
        <group
          key={`lamp-${t.toFixed(2)}`}
          position={[lampPosition.x, lampPosition.y + 1.5, lampPosition.z]}
          rotation={[0, yaw + Math.PI, 0]}
        >
          <LampModel scale={0.3} />
        </group>
      );
    }

    const doorT = 0.96;
    const doorPoint = currentTrack.getPointAt(doorT);
    const doorNextPoint = currentTrack.getPointAt(1);
    const doorYaw = getFlatYaw(doorNextPoint.clone().sub(doorPoint));

    models.push(
      <group
        key="cave-door"
        position={[doorPoint.x, doorPoint.y, doorPoint.z]}
        rotation={[0, doorYaw, 0]}
      >
        <DoorModel scale={0.4} />
      </group>
    );

    return models;
  }, [currentTrack]);

  return <>{environmentModels}</>;
};
