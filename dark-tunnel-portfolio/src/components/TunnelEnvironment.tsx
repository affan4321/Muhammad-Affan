"use client";

import { useMemo, useState } from "react";
import * as THREE from "three";
import { useGameStore } from "@/store/gameStore";
import HorrorModel2 from "./models/HorrorModel2";
import HorrorModel4 from "./models/HorrorModel4";
import HorrorModel5 from "./models/HorrorModel5";
import HorrorModel9 from "./models/HorrorModel9";
import StreetLampModel from "./models/StreetLampModel";
import { Html, RoundedBox, Text, useGLTF } from "@react-three/drei";
import {
  BRANCH_RAIL_SKIP,
  TERMINAL_BRANCH_RAIL_SKIP,
  getRailSegmentCount,
} from "@/lib/pathGeometry";
import { SMART_MAP_MARKERS, type SmartMapMarker } from "@/lib/smartMap";

useGLTF.preload("/models/railway track.glb");

const getFlatYaw = (direction: THREE.Vector3) => {
  const flatDirection = direction.clone();
  flatDirection.y = 0;
  if (flatDirection.lengthSq() === 0) flatDirection.set(0, 0, 1);
  flatDirection.normalize();
  return Math.atan2(flatDirection.x, flatDirection.z);
};

const SmartMapBoard = ({
  curve,
  marker,
}: {
  curve: THREE.Curve<THREE.Vector3>;
  marker: SmartMapMarker;
}) => {
  const currentPosition = useGameStore((state) => state.currentPosition);
  const overallProgress = useGameStore((state) => state.overallProgress);
  const openMapBoardId = useGameStore((state) => state.openMapBoardId);
  const setFocusedMapBoardId = useGameStore((state) => state.setFocusedMapBoardId);
  const setOpenMapBoardId = useGameStore((state) => state.setOpenMapBoardId);
  const [isHovered, setIsHovered] = useState(false);

  const { point, yaw } = useMemo(() => {
    const sample = curve.getPointAt(marker.t);
    const tangent = curve.getTangentAt(marker.t).normalize();
    return { point: sample, yaw: getFlatYaw(tangent) };
  }, [curve, marker.t]);

  const boardPosition = useMemo(
    () => new THREE.Vector3(point.x, point.y + 1.1, point.z),
    [point]
  );

  const distance = boardPosition.distanceTo(currentPosition);
  const isNear = distance <= 7;
  const isOpen = openMapBoardId === marker.id;

  return (
    <group position={[point.x, point.y, point.z]} rotation={[0, yaw, 0]}>
      <mesh position={[2.6, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 1.2, 0.12]} />
        <meshStandardMaterial color="#24a624" metalness={0.08} roughness={0.88} />
      </mesh>

      <RoundedBox
        position={[2.5, 1.3, 0]}
        castShadow 
          scale={isHovered ? 1.1 : 1}
        onPointerOver={(event) => {
          event.stopPropagation();
          setIsHovered(true);
          setFocusedMapBoardId(marker.id);
          
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          setIsHovered(false);
          setFocusedMapBoardId(null);
        }}
        onClick={(event) => {
          event.stopPropagation();
          setOpenMapBoardId(marker.id);
        }}
        args={[0.2, 0.95, 0.75]}
        radius={0.09}
        smoothness={8}
        
      >
        <meshStandardMaterial
          emissive={isHovered ? "#0caf42" : "#17520c"}
          emissiveIntensity={isHovered ? 0.22 : 0.08}
          metalness={0.12}
          roughness={0.5}
          
        />
      </RoundedBox>

      <Text
        position={[2.38, 1.55, 0.02]}
        rotation={[0, 3 * Math.PI / 2 , 0]}
        fontSize={0.1}
        maxWidth={0.68}
        lineHeight={1.15}
        anchorX="center"
        anchorY="middle"
        color="#9dffb9"
      >
        MAP BOX
      </Text>
      <Text
        position={[2.38, 1.15, 0.02]}
        rotation={[0, 3 * Math.PI / 2, 0]}
        fontSize={0.075}
        maxWidth={0.68}
        lineHeight={1.2}
        anchorX="center"
        anchorY="middle"
        color="#8fd1a2"
      >
        {`${Math.round(overallProgress * 100)}% PATH`}
      </Text>

      {isNear && !isOpen && (
        <Html 
        position={[2.5, 2, 0]}
        transform distanceFactor={7.5}
        rotation={[0, 3 * Math.PI / 2, 0]}
        >
          <div
            style={{
              background: "rgba(0, 0, 0, 0.86)",
              border: "1px solid rgba(24, 255, 95, 0.45)",
              color: "#9dffb9",
              fontSize: "3px",
              letterSpacing: "0.05em",
              borderRadius: "8px",
              padding: "3px 6px",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            Click to open map
          </div>
        </Html>
      )}
    </group>
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
          i === segmentCount - 1 ? 1 : Math.min(1, (i + 0.5) / segmentCount);
        const point = curve.getPointAt(t);
        const direction =
          i === segmentCount - 1
            ? curve.getTangentAt(0.99).clone()
            : curve.getPointAt(Math.min(t + 1 / segmentCount, 1)).clone().sub(point);
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
  const gameState = useGameStore((state) => state.gameState);
  const isMapBoardOpen = useGameStore((state) => Boolean(state.openMapBoardId));

  const visibleSmartMapMarkers = useMemo(
    () =>
      SMART_MAP_MARKERS.filter((marker, index) => {
        if (gameState === "INSIDE_CHAMBER" || isMapBoardOpen) return false;
        if (mainSegmentIndex <= 0) return index === 0;
        return index <= Math.min(mainSegmentIndex + 1, SMART_MAP_MARKERS.length - 1);
      }),
    [gameState, isMapBoardOpen, mainSegmentIndex]
  );

  const branchPaths = useMemo(() => {
    const list: {
      id: string;
      curve: THREE.Curve<THREE.Vector3>;
      isTerminal: boolean;
      showRails: boolean;
      showProps: boolean;
      segmentIndex: number;
    }[] = [];
    journey.forEach((segment, segmentIndex) => {
      const showRails = segmentIndex <= mainSegmentIndex;
      for (const branch of segment.branches) {
        if (branch.curve) {
          const isActive =
            trackContext === "branch" && currentTrack === branch.curve;
          list.push({
            id: branch.id,
            curve: branch.curve,
            isTerminal: Boolean(segment.isTerminalFork),
            showRails,
            showProps: showRails || isActive,
            segmentIndex,
          });
        }
      }
    });
    return list;
  }, [journey, mainSegmentIndex, trackContext, currentTrack]);

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
              <group position={[point.x, point.y, point.z]} rotation={[0, yaw, 0]}>
                <HorrorModel4 scale={3.5} rotation={[0, Math.PI / 2, 0]} position={[-4, 0, 0]} />
              </group>
            );
          })()}
          {(() => {
            const t = 0.2;
            const point = mainSpine.getPointAt(t);
            const tangent = mainSpine.getTangentAt(t).normalize();
            const yaw = getFlatYaw(tangent);
            return (
              <group position={[point.x, point.y, point.z]} rotation={[0, yaw, 0]}>
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
              <group position={[point.x, point.y, point.z]} rotation={[0, yaw, 0]}>
                <StreetLampModel scale={0.2} position={[2, 0, 0]} />
                <pointLight position={[1.5, 2.5, 0]} intensity={7} distance={1} color="#ff0000" />
              </group>
            );
          })()}
          {/* Horror light moved into SCENE_PROPS (TrackSetDressing) */}
          {(() => {
            const t = 0.49;
            const point = mainSpine.getPointAt(t);
            const tangent = mainSpine.getTangentAt(t).normalize();
            const yaw = getFlatYaw(tangent);
            return (
              <group position={[point.x, point.y, point.z]} rotation={[0, yaw, 0]}>
                <HorrorModel2 scale={1} position={[3, 0, 0]} rotation={[0, Math.PI / 4, 0]} />
              </group>
            );
          })()}
          {(() => {
            const t = 0.96;
            const point = mainSpine.getPointAt(t);
            const tangent = mainSpine.getTangentAt(t).normalize();
            const yaw = getFlatYaw(tangent);
            return (
              <group position={[point.x, point.y, point.z]} rotation={[0, yaw, 0]}>
                <StreetLampModel scale={0.2} position={[2, 0, 0]} />
                <pointLight position={[1.5, 2.5, 0]} intensity={7} distance={1} color="#ff0000" />
              </group>
            );
          })()}
          {visibleSmartMapMarkers.map((marker) => (
            <SmartMapBoard key={marker.id} curve={mainSpine} marker={marker} />
          ))}
        </>
      )}

      {branchPaths.map(({ id, curve, isTerminal, showRails, showProps }) => {
        const isActive = trackContext === "branch" && currentTrack === curve;
        const railSkip = isTerminal ? TERMINAL_BRANCH_RAIL_SKIP : BRANCH_RAIL_SKIP;
        return (
          <group key={`branch-env-${id}`}>
            {showRails && (
              <RailwayTracksForCurve
                curve={curve}
                idPrefix={`branch-${id}`}
                modelScale={0.92}
                highlight={isActive}
                skipStartFraction={railSkip}
                tieSpacing={0.78}
              />
            )}
            {showProps && (
              <>
                {id === "who-am-i" &&
                  (() => {
                    const t = 0.6;
                    const point = curve.getPointAt(t);
                    const tangent = curve.getTangentAt(t).normalize();
                    const yaw = getFlatYaw(tangent);
                    return (
                      <group position={[point.x, point.y, point.z]} rotation={[0, yaw, 0]}>
                        <HorrorModel5
                          scale={1}
                          position={[2, 2, 0]}
                          rotation={[0, Math.PI / 2, 0]}
                        />
                      </group>
                    );
                  })()}
                {id === "resume-cv" &&
                  (() => {
                    const t = 0.48;
                    const point = curve.getPointAt(t);
                    const tangent = curve.getTangentAt(t).normalize();
                    const yaw = getFlatYaw(tangent);
                    return (
                      <group position={[point.x, point.y, point.z]} rotation={[0, yaw, 0]}>
                        <HorrorModel9 scale={1} position={[2, 0, 0]} rotation={[0, 0, 0]} />
                      </group>
                    );
                  })()}
                {id === "social-handles" &&
                  (() => {
                    const t = 0.45;
                    const point = curve.getPointAt(t);
                    const tangent = curve.getTangentAt(t).normalize();
                    const yaw = getFlatYaw(tangent);
                    return (
                      <group position={[point.x, point.y, point.z]} rotation={[0, yaw, 0]}>
                        <StreetLampModel scale={0.2} position={[2, 0, 0]} />
                        <pointLight position={[1.5, 2.5, 0]} intensity={7} distance={1} color="#ff0000" />
                      </group>
                    );
                  })()}
                {id === "jewelry-cad" &&
                  (() => {
                    const t = 0.43;
                    const point = curve.getPointAt(t);
                    const tangent = curve.getTangentAt(t).normalize();
                    const yaw = getFlatYaw(tangent);
                    return (
                      <group position={[point.x, point.y, point.z]} rotation={[0, yaw, 0]}>
                        <StreetLampModel scale={0.2} position={[2, 0, 0]} />
                        <pointLight position={[1.5, 2.5, 0]} intensity={7} distance={1} color="#ff0000" />
                      </group>
                    );
                  })()}
                {id === "video-editing" &&
                  (() => {
                    const t = 0.47;
                    const point = curve.getPointAt(t);
                    const tangent = curve.getTangentAt(t).normalize();
                    const yaw = getFlatYaw(tangent);
                    return (
                      <group position={[point.x, point.y, point.z]} rotation={[0, yaw, 0]}>
                        <StreetLampModel scale={0.2} position={[2, 0, 0]} />
                        <pointLight position={[1.5, 2.5, 0]} intensity={7} distance={1} color="#ff0000" />
                      </group>
                    );
                  })()}
                {id === "game-dev" &&
                  (() => {
                    const t = 0.44;
                    const point = curve.getPointAt(t);
                    const tangent = curve.getTangentAt(t).normalize();
                    const yaw = getFlatYaw(tangent);
                    return (
                      <group position={[point.x, point.y, point.z]} rotation={[0, yaw, 0]}>
                        <StreetLampModel scale={0.2} position={[2, 0, 0]} />
                        <pointLight position={[1.5, 2.5, 0]} intensity={7} distance={1} color="#ff0000" />
                      </group>
                    );
                  })()}
                {id === "ai-journey" &&
                  (() => {
                    const t = 0.48;
                    const point = curve.getPointAt(t);
                    const tangent = curve.getTangentAt(t).normalize();
                    const yaw = getFlatYaw(tangent);
                    return (
                      <group position={[point.x, point.y, point.z]} rotation={[0, yaw, 0]}>
                        <StreetLampModel scale={0.2} position={[2, 0, 0]} />
                        <pointLight position={[1.5, 2.5, 0]} intensity={7} distance={1} color="#ff0000" />
                      </group>
                    );
                  })()}
                {/* `HorrorModel9` for social-handles moved into SCENE_PROPS (TrackSetDressing) */}
              </>
            )}
          </group>
        );
      })}
    </>
  );
};
