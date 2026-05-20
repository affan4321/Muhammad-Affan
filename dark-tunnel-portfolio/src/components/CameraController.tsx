"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Euler, Quaternion, Vector3, MathUtils } from "three";
import { useGameStore } from "@/store/gameStore";

/**
 * Camera controller that rides with the handcar and responds to mouse movement
 * without requiring a click or drag gesture.
 */
export const CameraController = () => {
  const camera = useThree((state) => state.camera);
  const currentTrack = useGameStore((state) => state.currentTrack);
  const progress = useGameStore((state) => state.progress);
  const lastTrackPosition = useRef(new Vector3());
  const hasTrackPosition = useRef(false);
  const currentYaw = useRef(0);
  const currentPitch = useRef(0);
  const targetYaw = useRef(0);
  const targetPitch = useRef(0);
  const baseForward = useRef(new Vector3(0, 0, -1));
  const baseUp = useRef(new Vector3(0, 1, 0));
  const baseQuaternion = useRef(new Quaternion());
  const lookQuaternion = useRef(new Quaternion());
  const frameVector = useRef(new Vector3());

  useEffect(() => {
    hasTrackPosition.current = false;
  }, [currentTrack]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const sensitivity = 0.0025;

      targetYaw.current -= event.movementX * sensitivity;
      targetPitch.current = MathUtils.clamp(
        targetPitch.current - event.movementY * sensitivity,
        -1.1,
        1.1
      );
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useFrame(() => {
    if (!currentTrack) return;

    const trackPosition = currentTrack.getPointAt(progress);
    const trackTangent = currentTrack.getTangentAt(progress).normalize();
    const seatPosition = trackPosition
      .clone()
      .add(baseUp.current.clone().multiplyScalar(0.95))
      .add(trackTangent.clone().multiplyScalar(-0.65));

    if (!hasTrackPosition.current) {
      camera.position.copy(seatPosition);
      lastTrackPosition.current.copy(trackPosition);
      baseForward.current.copy(trackTangent);
      hasTrackPosition.current = true;
    } else {
      const delta = trackPosition.clone().sub(lastTrackPosition.current);
      camera.position.add(delta);
      lastTrackPosition.current.copy(trackPosition);
      baseForward.current.copy(trackTangent);
    }

    currentYaw.current = MathUtils.lerp(currentYaw.current, targetYaw.current, 0.14);
    currentPitch.current = MathUtils.lerp(currentPitch.current, targetPitch.current, 0.14);

    baseQuaternion.current.setFromUnitVectors(
      new Vector3(0, 0, -1),
      baseForward.current.clone().normalize()
    );

    lookQuaternion.current.setFromEuler(
      new Euler(currentPitch.current, currentYaw.current, 0, "YXZ")
    );

    camera.position.lerp(seatPosition, 0.2);
    camera.quaternion.slerp(
      baseQuaternion.current.clone().multiply(lookQuaternion.current),
      0.2
    );
    camera.up.copy(baseUp.current);
  });

  return null;
};
