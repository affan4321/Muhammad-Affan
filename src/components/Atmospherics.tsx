"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/store/gameStore";

const createDustTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.4, "rgba(255, 255, 255, 0.5)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};

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
      const spread = 4.0;
      const lateral = (Math.random() - 0.5) * spread;
      const vertical = Math.random() * 3.0 + 0.5;
      const along = (Math.random() - 0.5) * 2.0;

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

  const dustTexture = useMemo(() => createDustTexture(), []);

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const count = 2000;
    const positions = samplePointsAlongCurves(pathCurves as THREE.Curve<THREE.Vector3>[], count);
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [pathCurves]);

  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({
        map: dustTexture,
        color: new THREE.Color(0xd4c4a8),
        size: 0.05,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
        sizeAttenuation: true,
        blending: THREE.NormalBlending,
      }),
    [dustTexture]
  );

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i);
      y += delta * (0.05 + Math.random() * 0.02);
      if (y > 5) y = 0.3;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  });

  return (
    <>
      <fog attach="fog" args={["#000000", 1, 6]} />
      <points ref={pointsRef} geometry={geom} material={mat} />
    </>
  );
};

export default Atmospherics;
