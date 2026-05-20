"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Simple particle field for dust/fog mote effect
export const Atmospherics = () => {
  const pointsRef = useRef<THREE.Points>(null!);

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const count = 400;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);

  const mat = useMemo(() => {
    return new THREE.PointsMaterial({
      color: new THREE.Color(0xffffff),
      size: 0.06,
      transparent: true,
      opacity: 0.06,
      depthWrite: false,
    });
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.01;
    const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      let z = pos.getZ(i);
      z += delta * 0.6; // slowly move towards camera
      if (z > 60) z = -60;
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
  });

  return (
    <>
      {/* Scene fog */}
      <fog attach="fog" args={["#000000", 0.05]} />

      <points ref={pointsRef} geometry={geom} material={mat} position={[0, 0.5, 0]} />
    </>
  );
};

export default Atmospherics;
