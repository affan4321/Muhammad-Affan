"use client";

import { Center, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useEffect } from "react";

export const CartModel = ({ scale = 0.12, position = [0, 0, 0], visible = true, ...props }: any) => {
  useGLTF.preload("/models/cart.glb");
  const gltf = useGLTF("/models/cart.glb");

  useEffect(() => {
    try {
      if (gltf?.scene) {
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const size = new THREE.Vector3();
        box.getSize(size);
        // Log bounding size to help debug scaling/position issues
        // eslint-disable-next-line no-console
        console.log("Cart GLTF bounds:", size.toArray());
      }
    } catch (err) {
      // ignore
    }
  }, [gltf]);
  return (
    <group position={position as [number, number, number]} scale={scale} {...props}>
      <Center>
        <primitive object={gltf.scene} dispose={null} visible={visible} />
      </Center>
    </group>
  );
};

export default CartModel;
