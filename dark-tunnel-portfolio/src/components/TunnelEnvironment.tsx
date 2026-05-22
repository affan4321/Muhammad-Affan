"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useGameStore } from "@/store/gameStore";
import HorrorModel2 from "./models/HorrorModel2";
import HorrorModel4 from "./models/HorrorModel4";
import HorrorModel5 from "./models/HorrorModel5";
import HorrorModel9 from "./models/HorrorModel9";
import StreetLampModel from "./models/StreetLampModel";
import { useGLTF } from "@react-three/drei";
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
          <RailwayTracksForCurve
            curve={mainSpine}
            idPrefix="main-spine"
            modelScale={1}
            highlight={trackContext === "main"}
          />
          {(() => {
            const t = 0.11;
            const point = mainSpine.getPointAt(t);
            const tangent = mainSpine.getTangentAt(t).normalize();
            const yaw = getFlatYaw(tangent);
            return (
              <group
                position={[point.x, point.y, point.z]}
                rotation={[0, yaw, 0]}
              >
                <HorrorModel4 scale={3.5} rotation={[0, Math.PI /2, 0]} position={[-5, 0, 0]} />
              </group>
            );
          })()}
          {(() => {
            const t = 0.20;
            const point = mainSpine.getPointAt(t);
            const tangent = mainSpine.getTangentAt(t).normalize();
            const yaw = getFlatYaw(tangent);
            return (
              <group
                position={[point.x, point.y, point.z]}
                rotation={[0, yaw, 0]}
              >
                <StreetLampModel scale={0.2} position={[2, 0, 0]} />
                <pointLight position={[1.5, 2.5, 0]} intensity={7} distance={1} color="#ff0000" />
              </group>
            );
          })()}
          {(() => {
            const t = 0.42;
            const point = mainSpine.getPointAt(t);
            const tangent = mainSpine.getTangentAt(t).normalize();
            const yaw = getFlatYaw(tangent);
            return (
              <group
                position={[point.x, point.y, point.z]}
                rotation={[0, yaw, 0]}
              >
                <StreetLampModel scale={0.2} position={[2, 0, 0]} />
                <pointLight position={[1.5, 2.5, 0]} intensity={7} distance={1} color="#ff0000" />
              </group>
            );
          })()}
          {(() => {
            const t = 0.49;
            const point = mainSpine.getPointAt(t);
            const tangent = mainSpine.getTangentAt(t).normalize();
            const yaw = getFlatYaw(tangent);
            return (
              <group
                position={[point.x, point.y, point.z]}
                rotation={[0, yaw, 0]}
              >
                <HorrorModel2 scale={1} position={[3, 0, 0]} rotation={[0, Math.PI / 4, 0]} />
              </group>
            );
          })()}
        </>
      )}

      {branchPaths.map(({ id, curve, isTerminal, showRails, segmentIndex }) => {
        const isActive = trackContext === "branch" && currentTrack === curve;
        const railSkip = isTerminal ? TERMINAL_BRANCH_RAIL_SKIP : BRANCH_RAIL_SKIP;
        const isFuture = segmentIndex > mainSegmentIndex + 1;
        return (
          <group key={`branch-env-${id}`}>
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
                {id === "who-am-i" && (() => {
                  const t = 0.6;
                  const point = curve.getPointAt(t);
                  const tangent = curve.getTangentAt(t).normalize();
                  const yaw = getFlatYaw(tangent);
                  return (
                    <group
                      position={[point.x, point.y, point.z]}
                      rotation={[0, yaw, 0]}
                    >
                      <HorrorModel5 scale={1} position={[2, 2, 0]} rotation={[0, Math.PI / 2, 0]} />
                    </group>
                  );
                })()}
                {id === "resume-cv" && (() => {
                  const t = 0.48;
                  const point = curve.getPointAt(t);
                  const tangent = curve.getTangentAt(t).normalize();
                  const yaw = getFlatYaw(tangent);
                  return (
                    <group
                      position={[point.x, point.y, point.z]}
                      rotation={[0, yaw, 0]}
                    >
                      <HorrorModel9 scale={1} position={[2, 0, 0]} rotation={[0, 0, 0]} />
                    </group>
                  );
                })()}
              </>
            )}
          </group>
        );
      })}
    </>
  );
};
