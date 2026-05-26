import { Curve, Vector3 } from "three";
import { yawFromTrackTangent } from "./pathGeometry";
import { CHAMBER_DOOR_RIG } from "./chamberDoorRig";

export type ChamberDoorTransform = {
  position: [number, number, number];
  rotationY: number;
};

/** World transform for the chamber entrance door at the end of a branch curve. */
export const getChamberDoorTransform = (
  curve: Curve<Vector3>
): ChamberDoorTransform => {
  const end = curve.getPointAt(1);
  const sampleT = Math.max(0.9, 1 - 0.04);
  const tangent = curve.getTangentAt(sampleT).clone();
  tangent.y = 0;
  if (tangent.lengthSq() < 1e-6) tangent.set(0, 0, 1);
  tangent.normalize();

  const back = tangent.clone().multiplyScalar(CHAMBER_DOOR_RIG.approachOffset);
  return {
    position: [
      end.x - back.x,
      end.y + CHAMBER_DOOR_RIG.height,
      end.z - back.z,
    ],
    rotationY: yawFromTrackTangent(tangent),
  };
};
