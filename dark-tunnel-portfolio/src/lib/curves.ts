import { CatmullRomCurve3, Vector3 } from "three";

/**
 * Create a simple curved path using CatmullRomCurve3
 * This ensures smooth, natural movement along the tunnel
 */
export const createTunnelCurve = (points: Vector3[]): CatmullRomCurve3 => {
  const curve = new CatmullRomCurve3(points);
  curve.curveType = "catmullrom";
  curve.tension = 0.5; // Smoothness of the curve
  return curve;
};

/**
 * Get camera position and look direction for smooth camera follow
 */
export const getCameraPositionAndTarget = (
  curve: CatmullRomCurve3,
  progress: number,
  lookAheadDistance: number = 0.05
) => {
  const position = curve.getPointAt(progress);
  const tangent = curve.getTangentAt(progress).normalize();

  // Look ahead of current position for smoother camera movement
  const lookAtPoint = curve.getPointAt(
    Math.min(1, progress + lookAheadDistance)
  );

  return { position, lookAtPoint, tangent };
};

/**
 * Generate initial demo tracks for Phase 1
 */
export const generateDemoTracks = () => {
  // Main tunnel track
  const mainTrack = createTunnelCurve([
    new Vector3(0, 0, 0), // Start
    new Vector3(5, 1, 10), // First segment
    new Vector3(8, 2, 25), // Middle
    new Vector3(10, 1, 40), // End
  ]);

  // Alternative paths for branching
  const leftPath = createTunnelCurve([
    new Vector3(10, 1, 40), // Start from end of main
    new Vector3(5, 0, 50),
    new Vector3(0, -2, 60),
    new Vector3(-8, -1, 70),
  ]);

  const rightPath = createTunnelCurve([
    new Vector3(10, 1, 40),
    new Vector3(15, 2, 50),
    new Vector3(20, 0, 60),
    new Vector3(25, 1, 70),
  ]);

  return { mainTrack, leftPath, rightPath };
};
