import { CatmullRomCurve3, Curve, Vector3 } from "three";
import { createTunnelCurve } from "./curves";

/** Extend main segments slightly past fork points so approach rails meet the junction. */
export const MAIN_SEGMENT_JUNCTION_PAD = 0.02;

export class SpineSegmentCurve extends Curve<Vector3> {
  constructor(
    private spine: Curve<Vector3>,
    private tStart: number,
    private tEnd: number,
    private padStart = 0,
    private padEnd = 0
  ) {
    super();
  }

  private spineTAt(t: number): number {
    const span = this.tEnd - this.tStart;
    return Math.min(1, Math.max(0, this.tStart + t * span));
  }

  getPointAt(t: number, optionalTarget?: Vector3): Vector3 {
    return this.spine.getPointAt(this.spineTAt(t), optionalTarget);
  }

  getTangentAt(t: number, optionalTarget?: Vector3): Vector3 {
    return this.spine.getTangentAt(this.spineTAt(t), optionalTarget);
  }
}

export type BranchSide = "left" | "right" | "center";

const S = 0.8;
export const MAIN_X = 2 * S;

/** Main tunnel weave — lower amplitude + tension = gradual curves, less rail overlap. */
export const MAIN_SPINE_WIND = {
  amplitude: 2.0 * S,
  tension: 0.4,
};

/**
 * Main path with long, gentle S-curves. Forks sample position/tangent from this curve.
 */
export const createMainSpine = (): CatmullRomCurve3 => {
  const zEnd = 144 * S;
  const a = MAIN_SPINE_WIND.amplitude;
  const x0 = MAIN_X;

  const points = [
    new Vector3(x0, 0, 0),
    new Vector3(x0 + a * 0.2, 0, zEnd * 0.08),
    new Vector3(x0 + a * 0.35, 0, zEnd * 0.16),
    new Vector3(x0 + a * 0.25, 0, zEnd * 0.24),
    new Vector3(x0 - a * 0.15, 0, zEnd * 0.32),
    new Vector3(x0 - a * 0.35, 0, zEnd * 0.4),
    new Vector3(x0 - a * 0.45, 0, zEnd * 0.48),
    new Vector3(x0 - a * 0.3, 0, zEnd * 0.56),
    new Vector3(x0 + a * 0.1, 0, zEnd * 0.64),
    new Vector3(x0 + a * 0.4, 0, zEnd * 0.72),
    new Vector3(x0 + a * 0.5, 0, zEnd * 0.8),
    new Vector3(x0 + a * 0.35, 0, zEnd * 0.88),
    new Vector3(x0 + a * 0.1, 0, zEnd * 0.94),
    new Vector3(x0 - a * 0.05, 0, zEnd),
  ];

  const curve = createTunnelCurve(points);
  curve.curveType = "catmullrom";
  curve.tension = MAIN_SPINE_WIND.tension;
  return curve;
};

const flatForward = (tangent: Vector3): Vector3 => {
  const f = tangent.clone();
  f.y = 0;
  if (f.lengthSq() < 1e-6) f.set(0, 0, 1);
  return f.normalize();
};

/** Skip only ties that would stack exactly on the main rail at the fork. */
export const BRANCH_RAIL_SKIP = 0.03;
export const TERMINAL_BRANCH_RAIL_SKIP = 0.05;

/** Lateral offset (m) at the fork — only used on multi-branch terminal fan. */
export const assignBranchSides = (count: number): { lateral: number }[] => {
  if (count <= 3) return Array.from({ length: count }, () => ({ lateral: 0 }));
  return [
    { lateral: -2.8 * S },
    { lateral: -0.9 * S },
    { lateral: 0.9 * S },
    { lateral: 2.8 * S },
  ];
};

/**
 * Branch starts exactly at the fork, runs with main tangent, then peels off gradually.
 */
export const createBranchCurve = (
  fork: Vector3,
  mainTangent: Vector3,
  headingDeg: number,
  lengthScale = 28,
  lateral = 0
): CatmullRomCurve3 => {
  const forward = flatForward(mainTangent);
  const right = new Vector3(-forward.z, 0, forward.x);
  const rad = (headingDeg * Math.PI) / 180;
  const dir = forward
    .clone()
    .multiplyScalar(Math.cos(rad))
    .add(right.clone().multiplyScalar(Math.sin(rad)))
    .normalize();

  const origin = fork.clone().add(right.clone().multiplyScalar(lateral));
  const runAlongMain = 11 * S;
  const p0 = origin.clone();
  const p1 = origin.clone().add(forward.clone().multiplyScalar(runAlongMain * 0.4));
  const p2 = origin.clone().add(forward.clone().multiplyScalar(runAlongMain * 0.85));
  const p2b = origin.clone().add(forward.clone().multiplyScalar(runAlongMain));
  const peelTarget = origin.clone().add(dir.clone().multiplyScalar(16 * S));
  const p3 = p2b.clone().lerp(peelTarget, 0.35);
  const p4 = origin.clone().add(dir.clone().multiplyScalar(lengthScale * S));
  const p5 = p4.clone().add(dir.clone().multiplyScalar(10 * S));

  const curve = createTunnelCurve([p0, p1, p2, p2b, p3, p4, p5]);
  curve.tension = 0.5;
  return curve;
};

export const headingToSide = (headingDeg: number): BranchSide => {
  if (headingDeg < -8) return "left";
  if (headingDeg > 8) return "right";
  return "center";
};

export const junctionHeadings = (count: number): number[] => {
  if (count === 1) return [-42];
  if (count === 2) return [-48, 48];
  return [-52, 52, 0];
};

export const terminalFanHeadings = (): number[] => [-72, -30, 30, 72];

export const createSegmentCurve = (
  spine: Curve<Vector3>,
  tStart: number,
  tEnd: number
): SpineSegmentCurve => {
  const padStart = tStart > 0 ? MAIN_SEGMENT_JUNCTION_PAD : 0;
  const padEnd = tEnd < 1 ? MAIN_SEGMENT_JUNCTION_PAD : 0;
  return new SpineSegmentCurve(spine, tStart, tEnd, padStart, padEnd);
};

export const getRailSegmentCount = (
  curveLength: number,
  pieceLength: number,
  spacing = 0.72
): number => {
  return Math.max(8, Math.ceil(curveLength / (pieceLength * spacing)));
};

/** Y rotation (rad) so object forward (-Z) aligns with flat track tangent. */
export const yawFromTrackTangent = (tangent: Vector3, offset = 0): number => {
  const f = flatForward(tangent);
  return Math.atan2(f.x, f.z) + Math.PI + offset;
};

export const lerpAngle = (from: number, to: number, t: number): number => {
  const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from));
  return from + delta * t;
};
