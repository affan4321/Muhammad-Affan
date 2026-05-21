"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/store/gameStore";

const samplePointsAlongCurves = (
  curves: THREE.Curve<THREE.Vector3>[],
  count: number
): Float32Array => {
  const positions = new Float32Array(count * 3);
  if (curves.length === 0) return positions;

  const perCurve = Math.ceil(count / curves.length);

  let idx = 0;
  for (const curve of curves) {
    for (let i = 0; i < perCurve && idx < count; i++) {
      const t = Math.random();
      const p = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(tangent, up).normalize();
      const spread = 2.8;
      const lateral = (Math.random() - 0.5) * spread;
      const vertical = Math.random() * 2.2 + 0.3;
      const along = (Math.random() - 0.5) * 1.2;

      positions[idx * 3] = p.x + right.x * lateral + tangent.x * along;
      positions[idx * 3 + 1] = p.y + vertical;
      positions[idx * 3 + 2] = p.z + right.z * lateral + tangent.z * along;
      idx++;
    }
  }

  return positions;
};

export const Atmospherics = () => {
  const pathCurves = useGameStore((s) => s.pathCurves);
  const pointsRef = useRef<THREE.Points>(null!);

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const count = 900;
    const positions = samplePointsAlongCurves(pathCurves as THREE.Curve<THREE.Vector3>[], count);
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [pathCurves]);

  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color(0xc8b8a0),
        size: 0.07,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    []
  );

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i);
      y += delta * (0.08 + (i % 5) * 0.01);
      if (y > 4) y = 0.2;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  });

  return (
    <>
      <fog attach="fog" args={["#080604", 6, 72]} />
      <points ref={pointsRef} geometry={geom} material={mat} />
    </>
  );
};

export default Atmospherics;
