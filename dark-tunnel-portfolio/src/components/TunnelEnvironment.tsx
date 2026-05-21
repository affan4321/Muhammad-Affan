"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useGameStore } from "@/store/gameStore";
import LampModel from "./models/LampModel";
import { Line, useGLTF } from "@react-three/drei";
import {
  BRANCH_RAIL_SKIP,
  TERMINAL_BRANCH_RAIL_SKIP,
  getRailSegmentCount,
} from "@/lib/pathGeometry";

const getFlatYaw = (direction: THREE.Vector3) => {
  const flatDirection = direction.clone();
  flatDirection.y = 0;
  if (flatDirection.lengthSq() === 0) flatDirection.set(0, 0, 1);
  flatDirection.normalize();
  return Math.atan2(flatDirection.x, flatDirection.z);
};

const PathLine = ({
  curve,
  color,
  opacity,
  lineWidth,
  sampleFrom = 0,
}: {
  curve: THREE.Curve<THREE.Vector3>;
  color: string;
  opacity: number;
  lineWidth: number;
  sampleFrom?: number;
}) => {
  const points = useMemo(() => {
    const start = Math.max(0, Math.min(0.9, sampleFrom));
    const sampleCount = 100;
    return Array.from({ length: sampleCount + 1 }, (_, i) => {
      const t = start + (i / sampleCount) * (1 - start);
      return curve.getPointAt(t);
    });
  }, [curve, sampleFrom]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={lineWidth}
      transparent
      opacity={opacity}
    />
  );
};

const RailwayTracksForCurve = ({
  curve,
  idPrefix,
  modelScale = 1,
  highlight = false,
  skipStartFraction = 0,
  tieSpacing = 0.72,
}: {
  curve: THREE.Curve<THREE.Vector3>;
  idPrefix: string;
  modelScale?: number;
  highlight?: boolean;
  skipStartFraction?: number;
  tieSpacing?: number;
}) => {
  const gltf = useGLTF("/models/railway track.glb");

  const { segmentCount, yawOffset } = useMemo(() => {
    if (!gltf?.scene) {
      return { segmentCount: 0, yawOffset: 0 };
    }

    const size = new THREE.Box3().setFromObject(gltf.scene).getSize(new THREE.Vector3());
    const lengthAxis = size.z >= size.x ? "z" : "x";
    const baseLength = Math.max(size.x, size.z);
    const pieceLength = Math.max(baseLength * modelScale, 0.02);
    const curveLength = curve.getLength();
    const count = getRailSegmentCount(curveLength, pieceLength, tieSpacing);
    const offset = lengthAxis === "x" ? Math.PI / 2 : 0;

    return { segmentCount: count, yawOffset: offset };
  }, [curve, gltf, modelScale, tieSpacing]);

  if (!gltf?.scene || segmentCount === 0) return null;

  const startIndex = Math.floor(segmentCount * skipStartFraction);

  return (
    <group>
      {Array.from({ length: segmentCount }).map((_, i) => {
        if (i < startIndex) return null;
        const t =
          i === segmentCount - 1
            ? 1
            : Math.min(1, (i + 0.5) / segmentCount);
        const point = curve.getPointAt(t);
        let direction: THREE.Vector3;
        
        if (i === segmentCount - 1) {
          // For the last segment, use the curve tangent at the end
          direction = curve.getTangentAt(0.99).clone();
        } else {
          const nextT = Math.min(t + 1 / segmentCount, 1);
          const nextPoint = curve.getPointAt(nextT);
          direction = nextPoint.clone().sub(point);
        }
        
        const yaw = getFlatYaw(direction) + yawOffset;

        return (
          <group
            key={`${idPrefix}-rail-${i}`}
            position={[point.x, point.y - 0.45, point.z]}
            rotation={[0, yaw, 0]}
          >
            <primitive
              object={gltf.scene.clone(true)}
              scale={modelScale * (highlight ? 1 : 0.95)}
            />
          </group>
        );
      })}
    </group>
  );
};

const LampsAlongCurve = ({
  curve,
  idPrefix,
  spacing = 0.1,
  sampleFrom = 0,
}: {
  curve: THREE.Curve<THREE.Vector3>;
  idPrefix: string;
  spacing?: number;
  sampleFrom?: number;
}) => {
  const lamps = useMemo(() => {
    const items: React.ReactNode[] = [];
    const start = Math.max(0, Math.min(0.9, sampleFrom));
    for (let t = start; t <= 1; t += spacing) {
      const point = curve.getPointAt(t);
      const nextPoint = curve.getPointAt(Math.min(t + spacing, 1));
      const direction = nextPoint.clone().sub(point);
      const yaw = getFlatYaw(direction);
      const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
      const lampPosition = point.clone().add(right.multiplyScalar(2.5));

      items.push(
        <group
          key={`${idPrefix}-lamp-${t.toFixed(2)}`}
          position={[lampPosition.x, lampPosition.y + 1.5, lampPosition.z]}
          rotation={[0, yaw + Math.PI, 0]}
        >
          <LampModel scale={0.28} />
        </group>
      );
    }
    return items;
  }, [curve, idPrefix, spacing, sampleFrom]);

  return <>{lamps}</>;
};

export const TunnelEnvironment = () => {
  const mainSpine = useGameStore((state) => state.mainSpine);
  const currentTrack = useGameStore((state) => state.currentTrack);
  const journey = useGameStore((state) => state.journey);
  const trackContext = useGameStore((state) => state.trackContext);
  const mainSegmentIndex = useGameStore((state) => state.mainSegmentIndex);

  const branchPaths = useMemo(() => {
    const list: {
      id: string;
      curve: THREE.Curve<THREE.Vector3>;
      isTerminal: boolean;
      showRails: boolean;
      segmentIndex: number;
    }[] = [];
    journey.forEach((segment, segmentIndex) => {
      const showRails = segmentIndex <= mainSegmentIndex;
      for (const branch of segment.branches) {
        if (branch.curve) {
          list.push({
            id: branch.id,
            curve: branch.curve,
            isTerminal: Boolean(segment.isTerminalFork),
            showRails,
            segmentIndex,
          });
        }
      }
    });
    return list;
  }, [journey, mainSegmentIndex]);

  return (
    <>
      {mainSpine && (
        <>
          <PathLine curve={mainSpine} color="#3d5a48" opacity={0.55} lineWidth={2.5} />
          <RailwayTracksForCurve
            curve={mainSpine}
            idPrefix="main-spine"
            modelScale={1}
            highlight={trackContext === "main"}
          />
          <LampsAlongCurve curve={mainSpine} idPrefix="main" spacing={0.09} />
        </>
      )}

      {branchPaths.map(({ id, curve, isTerminal, showRails, segmentIndex }) => {
        const isActive = trackContext === "branch" && currentTrack === curve;
        const railSkip = isTerminal ? TERMINAL_BRANCH_RAIL_SKIP : BRANCH_RAIL_SKIP;
        const isFuture = segmentIndex > mainSegmentIndex + 1;
        return (
          <group key={`branch-env-${id}`}>
            <PathLine
              curve={curve}
              color={isActive ? "#00ff88" : isFuture ? "#1a3028" : "#2a4a3a"}
              opacity={isActive ? 0.9 : isFuture ? 0.22 : 0.5}
              lineWidth={isActive ? 2 : 1.2}
            />
            {showRails && (
              <>
                <RailwayTracksForCurve
                  curve={curve}
                  idPrefix={`branch-${id}`}
                  modelScale={0.92}
                  highlight={isActive}
                  skipStartFraction={railSkip}
                  tieSpacing={0.78}
                />
                <LampsAlongCurve curve={curve} idPrefix={`branch-lamp-${id}`} spacing={0.12} />
              </>
            )}
          </group>
        );
      })}
    </>
  );
};
