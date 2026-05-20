"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

type Props = {
  position?: [number, number, number];
  scale?: number;
  label?: string;
};

export const StonePillar = ({ position = [0, 0, 0], scale = 1, label }: Props) => {
  const pillarRef = useRef<any>(null);
  useFrame((state, delta) => {
    if (pillarRef.current) {
      pillarRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group position={position as any}>
      <mesh ref={pillarRef} castShadow receiveShadow>
        <cylinderGeometry args={[1 * scale, 1.3 * scale, 6 * scale, 24]} />
        <meshStandardMaterial color={"#3b3b3b"} roughness={0.9} metalness={0.05} />
      </mesh>

      <mesh position={[0, 2.2 * scale, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.5 * scale, 1.6 * scale]} />
        <meshStandardMaterial emissive={label ? "#00ffd5" : "#003344"} emissiveIntensity={label ? 1.2 : 0.4} transparent opacity={0.9} />
      </mesh>
    </group>
  );
};

export default StonePillar;
