"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

type Props = {
  text?: string;
  position?: [number, number, number];
};

export const Hologram = ({ text = "Project", position = [0, 2.6, 0] }: Props) => {
  const ref = useRef<any>(null);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.3;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.2) * 0.05;
    }
  });

  return (
    <group ref={ref} position={position as any}>
      <mesh>
        <planeGeometry args={[1.8, 0.9]} />
        <meshStandardMaterial emissive={"#00ffd5"} emissiveIntensity={1.6} toneMapped={false} transparent opacity={0.9} />
      </mesh>

      {/* simple text using HTML could be added later */}
    </group>
  );
};

export default Hologram;
