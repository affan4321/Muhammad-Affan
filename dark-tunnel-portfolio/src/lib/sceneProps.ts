/**
 * Place animated set-dressing on a track by branch id (or "main" for the spine).
 * `t` is 0–1 along that curve — e.g. 0.48 = 48% along the Resume/CV branch.
 */
export type ScenePropModel =
  | "horror1"
  | "horror11"
  | "horror7"
  | "horror9";

/** Move along the track while playing a clip, then loop (start → end → start). */
export type ScenePropPatrol = {
  startT: number;
  endT: number;
  /** Travel speed along the patrol span; try 0.04–0.12 */
  speed?: number;
  animationName?: string;
};

export type ScenePropPlacement = {
  /** Branch id from journey (e.g. "resume-cv") or "main" for mainSpine */
  trackId: string;
  /** Fixed point on track — ignored when `patrol` is set */
  t: number;
  model: ScenePropModel;
  scale?: number;
  offset?: [number, number, number];
  rotation?: [number, number, number];
  animationName?: string;
  /** Loop: run along track from startT to endT, reset, repeat */
  patrol?: ScenePropPatrol;
  /**
   * Prop renders once the player has reached this main-line segment index.
   * Resume/CV lives on segment 2 → use minMainSegment: 1 (after first junction).
   */
  minMainSegment?: number;
};

/** Extra props via TrackSetDressing — main/branch ghosts & lamps live in TunnelEnvironment.tsx */
export const SCENE_PROPS: ScenePropPlacement[] = [
  {
    trackId: "resume-cv",
    t: 0,
    model: "horror1",
    scale: 2,
    offset: [3.5, 0, 0],
    rotation: [0, 2 * Math.PI, 0],
    minMainSegment: 1,
    patrol: { startT: 0.9, endT: 0.4, speed: 0.2 },
  },
];

/** GLB paths — keep in sync with public/models */
export const SCENE_PROP_URLS: Record<ScenePropModel, string> = {
  horror1: "/models/horror 1.glb",
  horror11: "/models/horror 1.1.glb",
  horror7: "/models/horror 7.glb",
  horror9: "/models/horror 9.glb",
};
