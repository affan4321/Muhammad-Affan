"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGameStore } from "@/store/gameStore";
import { useCartMouseLook } from "@/hooks/useCartMouseLook";
import { lerpAngle, yawFromTrackTangent } from "@/lib/pathGeometry";
import * as THREE from "three";
import CartModel from "./models/CartModel";
import ArmsModel from "./models/ArmsModel";
import { CART_RIG } from "@/lib/cartRig";

const HEADING_SAMPLE_MIN_T = 0.04;

const applyFirstPersonRig = (
  camera: THREE.Camera,
  armsRig: THREE.Group | null,
  look: { yaw: number; pitch: number }
) => {
  const cam = camera as THREE.PerspectiveCamera;
  if (cam.isPerspectiveCamera) {
    cam.fov = CART_RIG.camera.fov;
    cam.updateProjectionMatrix();
  }

  const [cx, cy, cz] = CART_RIG.camera.position;
  camera.position.set(cx, cy, cz);

  const [brx, bry, brz] = CART_RIG.camera.rotation;
  camera.rotation.order = "YXZ";
  camera.rotation.set(brx + look.pitch, bry + look.yaw, brz);

  if (armsRig && armsRig.parent === camera) {
    const [ax, ay, az] = CART_RIG.arms.position;
    armsRig.position.set(ax, ay, az);
    const [arx, ary, arz] = CART_RIG.arms.rotation;
    armsRig.rotation.set(arx, ary, arz);
    armsRig.scale.setScalar(1);
  }
};

export const Cart = () => {
  const groupRef = useRef<THREE.Group>(null!);
  const armsRigRef = useRef<THREE.Group>(null!);
  const rigAttachedRef = useRef(false);
  const cartYaw = useRef(0);
  const yawInitialized = useRef(false);
  const currentTrack = useGameStore((state) => state.currentTrack);
  const segmentProgress = useGameStore((state) => state.segmentProgress);
  const setSegmentProgress = useGameStore((state) => state.setSegmentProgress);
  const stepToPreviousMainSegment = useGameStore(
    (state) => state.stepToPreviousMainSegment
  );
  const returnFromBranchToFork = useGameStore(
    (state) => state.returnFromBranchToFork
  );
  const speed = useGameStore((state) => state.speed);
  const isMovingForward = useGameStore((state) => state.isMovingForward);
  const isMovingBackward = useGameStore((state) => state.isMovingBackward);
  const gameState = useGameStore((state) => state.gameState);
  const trackContext = useGameStore((state) => state.trackContext);
  const mainSegmentIndex = useGameStore((state) => state.mainSegmentIndex);
  const { camera } = useThree();
  const { getSmoothedLook } = useCartMouseLook();
  const currentTrackId = useGameStore((state) => state.currentTrack);

  useEffect(() => {
    yawInitialized.current = false;
  }, [currentTrackId]);

  const placeCart = (progress: number) => {
    if (!currentTrack || !groupRef.current) return;
    const t = Math.max(0, Math.min(1, progress));
    const headingT = Math.min(1, Math.max(t, HEADING_SAMPLE_MIN_T));
    const position = currentTrack.getPointAt(t);
    const tangent = currentTrack.getTangentAt(headingT).normalize();
    const targetYaw = yawFromTrackTangent(tangent);

    groupRef.current.position.copy(position);
    groupRef.current.position.y += CART_RIG.trackOffsetY;

    if (!yawInitialized.current) {
      cartYaw.current = targetYaw;
      yawInitialized.current = true;
    } else {
      cartYaw.current = lerpAngle(cartYaw.current, targetYaw, CART_RIG.turnSmooth);
    }
    groupRef.current.rotation.set(0, cartYaw.current, 0);
    useGameStore.setState({ currentPosition: position.clone() });
  };

  useFrame(() => {
    if (!groupRef.current || !camera) return;

    if (!rigAttachedRef.current) {
      const originalParent = camera.parent;
      groupRef.current.add(camera);
      const armsRig = armsRigRef.current;
      if (armsRig) camera.add(armsRig);
      rigAttachedRef.current = true;
      (camera as THREE.Object3D & { _cartOrigParent?: THREE.Object3D | null })._cartOrigParent =
        originalParent;
    }

    const look = getSmoothedLook();
    applyFirstPersonRig(camera, armsRigRef.current, look);

    if (!currentTrack || gameState === "IDLE") return;

    if (gameState === "CHOOSING_PATH" || gameState === "INSIDE_CAVE") {
      placeCart(segmentProgress);
      return;
    }

    let newProgress = segmentProgress;
    if (isMovingForward) newProgress += speed;
    if (isMovingBackward) newProgress -= speed;

    if (isMovingBackward && newProgress < 0) {
      if (trackContext === "branch") {
        returnFromBranchToFork();
        return;
      }
      if (trackContext === "main" && mainSegmentIndex > 0) {
        stepToPreviousMainSegment();
        return;
      }
    }

    newProgress = Math.max(0, Math.min(1, newProgress));
    setSegmentProgress(newProgress);
    placeCart(newProgress);
  });

  useEffect(() => {
    return () => {
      rigAttachedRef.current = false;
      try {
        const armsRig = armsRigRef.current;
        if (armsRig) camera.remove(armsRig);
        groupRef.current?.remove(camera);
        const orig = (camera as THREE.Object3D & { _cartOrigParent?: THREE.Object3D | null })
          ._cartOrigParent;
        orig?.add(camera);
        camera.position.set(0, 0, 0);
        camera.rotation.set(0, 0, 0);
      } catch (e) {}
    };
  }, [camera]);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <CartModel
        scale={CART_RIG.cart.scale}
        visible
        position={CART_RIG.cart.position}
      />
      <group ref={armsRigRef}>
        <ArmsModel scale={CART_RIG.arms.scale} />
      </group>
    </group>
  );
};
