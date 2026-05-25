"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useGameStore } from "@/store/gameStore";
import { SCENE_PROPS, SCENE_PROP_URLS } from "@/lib/sceneProps";
import AnimatedModel from "./models/AnimatedModel";
import PatrolAlongTrack from "./PatrolAlongTrack";

const flatYaw = (direction: THREE.Vector3) => {
  const d = direction.clone();
  d.y = 0;
  if (d.lengthSq() === 0) d.set(0, 0, 1);
  d.normalize();
  return Math.atan2(d.x, d.z);
};

/**
 * Places configured horror (and other animated) props along branch curves or main spine.
 */
export const TrackSetDressing = () => {
  const mainSpine = useGameStore((s) => s.mainSpine);
  const journey = useGameStore((s) => s.journey);
  const mainSegmentIndex = useGameStore((s) => s.mainSegmentIndex);
  const trackContext = useGameStore((s) => s.trackContext);
  const currentTrack = useGameStore((s) => s.currentTrack);

  const placements = useMemo(() => {
    const curvesById = new Map<string, THREE.Curve<THREE.Vector3>>();
    if (mainSpine) curvesById.set("main", mainSpine);
    for (const segment of journey) {
      for (const branch of segment.branches) {
        if (branch.curve) curvesById.set(branch.id, branch.curve);
      }
    }

    return SCENE_PROPS.map((prop, index) => {
      const curve = curvesById.get(prop.trackId);
      if (!curve) return null;

      const minSeg = prop.minMainSegment ?? 0;
      const onThisTrack =
        trackContext === "branch" &&
        journey.some((seg) =>
          seg.branches.some((b) => b.id === prop.trackId && b.curve === currentTrack)
        );
      const visible = mainSegmentIndex >= minSeg || onThisTrack;
      if (!visible) return null;

      const offset = prop.offset ?? [0, 0, 0];

      if (prop.patrol) {
        return {
          key: `prop-${prop.trackId}-${index}`,
          mode: "patrol" as const,
          curve,
          url: SCENE_PROP_URLS[prop.model],
          patrol: prop.patrol,
          offset,
          localRotation: prop.rotation ?? [0, 0, 0],
          scale: prop.scale ?? 0.1,
          animationName: prop.animationName ?? prop.patrol.animationName,
        };
      }

      const t = Math.max(0, Math.min(1, prop.t));
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(Math.max(0.02, t - 0.02)).normalize();
      const yaw = flatYaw(tangent);

      return {
        key: `prop-${prop.trackId}-${index}`,
        mode: "static" as const,
        url: SCENE_PROP_URLS[prop.model],
        position: [
          point.x + offset[0],
          point.y + offset[1],
          point.z + offset[2],
        ] as [number, number, number],
        rotationY: yaw,
        localRotation: prop.rotation ?? [0, 0, 0],
        scale: prop.scale ?? 0.1,
        animationName: prop.animationName,
        baseLight: prop.baseLight,
        light: prop.light,
      };
    }).filter(Boolean);
  }, [mainSpine, journey, mainSegmentIndex, trackContext, currentTrack]);

  return (
    <group name="track-set-dressing">
      {placements.map((p) =>
        p?.mode === "patrol" ? (
          <PatrolAlongTrack
            key={p.key}
            curve={p.curve}
            url={p.url}
            startT={p.patrol.startT}
            endT={p.patrol.endT}
            speed={p.patrol.speed}
            scale={p.scale}
            offset={p.offset}
            localRotation={p.localRotation}
            animationName={p.animationName}
          />
        ) : p?.mode === "static" ? (
          <group
            key={p.key}
            position={p.position}
            rotation={[0, p.rotationY, 0]}
          >
            <group rotation={p.localRotation}>
              <AnimatedModel
                url={p.url}
                scale={p.scale}
                animationName={p.animationName}
                autoPlay
              />
              {p.baseLight !== false ? (
                <pointLight
                  position={[0, 1.2, 0]}
                  intensity={12}
                  distance={5}
                  color="#ffe9c9"
                />
              ) : null}
              {p.light ? (
                <>
                  {p.light.emit !== false ? (
                    <pointLight
                      position={p.light.position}
                      intensity={p.light.intensity}
                      distance={p.light.distance}
                      color={p.light.color ?? "#ffffff"}
                    />
                  ) : null}
                </>
              ) : null}
            </group>
          </group>
        ) : null
      )}
    </group>
  );
};

export default TrackSetDressing;
