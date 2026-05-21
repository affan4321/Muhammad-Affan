"use client";

import { Center, useGLTF } from "@react-three/drei";

export const CartModel = ({
  scale = 0.12,
  position = [0, 0, 0],
  visible = true,
  ...props
}: {
  scale?: number;
  position?: [number, number, number];
  visible?: boolean;
}) => {
  useGLTF.preload("/models/cart.glb");
  const gltf = useGLTF("/models/cart.glb");

  return (
    <group position={position as [number, number, number]} scale={scale} {...props}>
      <Center>
        <primitive object={gltf.scene} dispose={null} visible={visible} />
      </Center>
    </group>
  );
};

export default CartModel;
