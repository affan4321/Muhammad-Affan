"use client";

import { Center, useGLTF } from "@react-three/drei";
import { R2_BASE_URL } from "@/lib/sceneProps";

export const CartModel = ({
  scale = 0.14,
  position = [0, 0, 0],
  visible = true,
  ...props
}: {
  scale?: number;
  position?: [number, number, number];
  visible?: boolean;
}) => {
  useGLTF.preload(`${R2_BASE_URL}/models/cart.glb`);
  useGLTF.preload(`${R2_BASE_URL}/models/cart-lamp.glb`);
  const gltf = useGLTF(`${R2_BASE_URL}/models/cart.glb`);
  const lampGltf = useGLTF(`${R2_BASE_URL}/models/cart-lamp.glb`);

  return (
    <>
      <group position={position as [number, number, number]} scale={scale} {...props}>
        <Center>
          <primitive object={gltf.scene} dispose={null} visible={visible} />
        </Center>
      </group>
      <primitive object={lampGltf.scene.clone(true)} dispose={null} visible={visible} position={[position[0] + 0.9, position[1] + 0.8, position[2]]} rotation={[0, Math.PI, 0]} scale={scale * 0.4} />
      <pointLight position={[position[0] + 0.6, position[1] + 0.6, position[2]+0.8]} intensity={7} distance={1} color="#ffaa00" />
      <primitive object={lampGltf.scene.clone(true)} dispose={null} visible={visible} position={[position[0] - 0.5, position[1] + 0.8, position[2]]} rotation={[0, Math.PI, 0]} scale={scale * 0.4} />
      <pointLight position={[position[0] - 0.5, position[1] + 0.6, position[2]+0.8]} intensity={7} distance={1} color="#ffaa00" />
    </>
  );
};

export default CartModel;
