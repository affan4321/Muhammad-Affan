"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useGameStore } from "@/store/gameStore";
import LampModel from "./models/LampModel";
import DoorModel from "./models/DoorModel";
import { Line, useGLTF } from "@react-three/drei";

const getFlatYaw = (direction: THREE.Vector3) => {
  const flatDirection = direction.clone();
  flatDirection.y = 0;

  if (flatDirection.lengthSq() === 0) {
    flatDirection.set(0, 0, 1);
  }

  flatDirection.normalize();
  return Math.atan2(flatDirection.x, flatDirection.z);
};

const TrackGuideForCurve = ({ curve }: { curve: THREE.Curve<THREE.Vector3> | null }) => {
  const segments = useMemo(() => {
    if (!curve) return [];

    const sampleCount = 65;
    const res: { pos: THREE.Vector3; yaw: number; length: number }[] = [];
    let previousPoint = curve.getPointAt(0);

    for (let i = 1; i <= sampleCount; i++) {
      const t = i / sampleCount;
      const point = curve.getPointAt(t);
      const midpoint = previousPoint.clone().lerp(point, 0.5);
      const direction = point.clone().sub(previousPoint);
      const yaw = getFlatYaw(direction);
      const length = Math.max(direction.length() * 1.2, 0.7);

      res.push({ pos: midpoint, yaw, length });
      previousPoint = point;
    }

    return res;
  }, [curve]);

  if (!curve) return null;

  return (
    <group>
      {segments.map((segment, index) => (
        <group key={`guide-${index}`} position={[segment.pos.x, 0.03, segment.pos.z]} rotation={[0, segment.yaw, 0]}>
          <mesh position={[0, 0, -0.35]}>
            <boxGeometry args={[segment.length, 0.08, 0.08]} />
            <meshStandardMaterial color="#7b7360" roughness={1} metalness={0.05} />
          </mesh>
          <mesh position={[0, 0, 0.35]}>
            <boxGeometry args={[segment.length, 0.08, 0.08]} />
            <meshStandardMaterial color="#7b7360" roughness={1} metalness={0.05} />
          </mesh>
          <mesh position={[0, -0.06, 0]}>
            <boxGeometry args={[segment.length, 0.05, 0.95]} />
            <meshStandardMaterial color="#2a2118" roughness={1} metalness={0} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const DebugCurveLine = ({ curve }: { curve: THREE.Curve<THREE.Vector3> | null }) => {
  const points = useMemo(() => {
    if (!curve) return [];

    const sampleCount = 120;
    return Array.from({ length: sampleCount + 1 }, (_, index) => curve.getPointAt(index / sampleCount));
  }, [curve]);

  if (!curve || points.length === 0) return null;

  return <Line points={points} color="#ff0000" lineWidth={2} transparent opacity={0.95} />;
};

const RailwayTracksForCurve = ({
  curve,
  idPrefix,
  modelScale = 1,
}: {
  curve: THREE.Curve<THREE.Vector3> | null;
  idPrefix: string;
  modelScale?: number;
}) => {
  const gltf = useGLTF("/models/railway track.glb");

  const { segmentCount, modelLength, yawOffset } = useMemo(() => {
    if (!curve || !gltf?.scene) {
      return { segmentCount: 0, modelLength: 1, yawOffset: 0 };
    }

    const size = new THREE.Box3().setFromObject(gltf.scene).getSize(new THREE.Vector3());
    const lengthAxis = size.z >= size.x ? "z" : "x";
    const baseLength = Math.max(size.x, size.z);
    const length = Math.max(baseLength * modelScale, 0.02);
    const curveLength = curve.getLength();
    const count = Math.max(1, Math.ceil(curveLength / length));
    const offset = lengthAxis === "x" ? Math.PI / 2 : 0;

    return { segmentCount: count, modelLength: length, yawOffset: offset };
  }, [curve, gltf, modelScale]);

  if (!curve || !gltf?.scene || segmentCount === 0) return null;

  return (
    <group>
      {Array.from({ length: segmentCount }).map((_, i) => {
        const t = (i + 0.5) / segmentCount;
        const point = curve.getPointAt(t);
        const nextPoint = curve.getPointAt(Math.min(t + 1 / segmentCount, 1));
        const direction = nextPoint.clone().sub(point);
        const yaw = getFlatYaw(direction) + yawOffset;

        return (
          <group key={`${idPrefix}-rail-${i}`} position={[point.x, point.y - 0.45, point.z]} rotation={[0, yaw, 0]}>
            <primitive object={gltf.scene.clone(true)} scale={modelScale} />
          </group>
        );
      })}
    </group>
  );
};

/**
 * TunnelEnvironment - Places decorative models along the track at intervals
 */
export const TunnelEnvironment = () => {
  const currentTrack = useGameStore((state) => state.currentTrack);
  const availablePaths = useGameStore((state) => state.availablePaths);
  const renderRailModels = true;
  const renderTrackGuides = false;

  const environmentModels = useMemo(() => {
    if (!currentTrack) return [];

    const models = [];
    const railSegments = 65;
    const lampSpacing = 0.14;

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

  return (
    <>
      <DebugCurveLine curve={currentTrack} />
      {availablePaths.map((p: any) => (
        <DebugCurveLine key={`debug-line-${p.id}`} curve={p.curve} />
      ))}
      {renderRailModels && (
        <RailwayTracksForCurve curve={currentTrack} idPrefix="main" modelScale={1} />
      )}
      {renderRailModels &&
        availablePaths.map((p: any) => (
          <RailwayTracksForCurve
            key={`branch-${p.id}`}
            curve={p.curve}
            idPrefix={`branch-${p.id}`}
            modelScale={1}
          />
        ))}
      {renderTrackGuides && <TrackGuideForCurve curve={currentTrack} />}
      {renderTrackGuides &&
        availablePaths.map((p: any) => (
          <TrackGuideForCurve key={`branch-guide-${p.id}`} curve={p.curve} />
        ))}
      {environmentModels}
      {/* Doors for each available branch path (offset to the side of the path) */}
      {availablePaths.map((p: any, idx: number) => {
        const curve = p.curve as THREE.Curve<THREE.Vector3>;
        if (!curve) return null;
        const tDoor = 0.18;
        const point = curve.getPointAt(tDoor);
        const tangent = curve.getTangentAt(tDoor).clone();
        tangent.y = 0;
        tangent.normalize();
        const side = new THREE.Vector3(-tangent.z, 0, tangent.x);
        const sideOffset = 2.2 + idx * 0.1; // slight jitter per branch
        const forwardOffset = 0.8;
        const doorPos = point.clone().add(side.clone().multiplyScalar(sideOffset)).add(tangent.clone().multiplyScalar(forwardOffset));
        const doorYaw = getFlatYaw(tangent.clone());

        return (
          <group key={`branch-door-${p.id}`} position={[doorPos.x, doorPos.y, doorPos.z]} rotation={[0, doorYaw, 0]}>
            <DoorModel scale={0.35} />
          </group>
        );
      })}
    </>
  );
};
