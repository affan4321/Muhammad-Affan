/**
 * Place animated set-dressing on a track by branch id (or "main" for the spine).
 * `t` is 0–1 along that curve — e.g. 0.48 = 48% along the Resume/CV branch.
 */
export type ScenePropModel =
  | "horror1"
  | "horror11"
  | "horror3"
  | "horror6"
  | "horror7"
  | "horror8"
  | "horror9"
  | "horrorLight"
  | "dog";

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
  baseLight?: boolean;
  light?: {
    position: [number, number, number];
    intensity: number;
    distance: number;
    color?: string;
    emit?: boolean;
  };
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
    offset: [0, 0, 0],
    rotation: [0, 2 * Math.PI, 0],
    minMainSegment: 1,
    patrol: { startT: 0.8, endT: 0.6, speed: 0.2 },
  },
  {
    trackId: "resume-cv",
    t: 0.8,
    model: "dog",
    scale: 0.25,
    rotation: [0, Math.PI / 4, 0],
    offset: [-4, 0, 0],
    minMainSegment: 1,
  },
  {
    trackId: "about-me",
    t: 0.72,
    model: "horror3",
    scale: 0.05,
    offset: [3, 0, 0],
    rotation: [0, Math.PI+1, 0],
    minMainSegment: 2,
  },
  {
    trackId: "social-handles",
    t: 0.75,
    model: "horror9",
    scale: 0.015,
    offset: [-5, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  {
    trackId: "video-editing",
    t: 0.73,
    model: "horror8",
    scale: 0.9,
    offset: [2, -0.4, 0],
    rotation: [0, Math.PI, 0],
    minMainSegment: 3,
  },
  {
    trackId: "ai-journey",
    t: 0,
    model: "horror11",
    scale: 1.75,
    offset: [3, 0, 0],
    rotation: [0, 2 * Math.PI, 0],
    minMainSegment: 3,
    patrol: { startT: 0.8, endT: 0.6, speed: 0.2 },
  },
  {
    trackId: "main",
    t: 0.62,
    model: "horrorLight",
    scale: 0.35,
    offset: [2, 0, 0],
    rotation: [0, Math.PI+1, 0],
    baseLight: false,
    light: {
      position: [0, 6.6, 0.4],
      intensity: 200,
      distance: 20,
      color: "#5a0000",
      emit: true,
    },
  },
  {
    trackId: "main",
    t: 0.88,
    model: "horror7",
    scale: 1.5,
    offset: [3, 0, 0],
    rotation: [0, Math.PI + 1, 0],
  },
  {
    trackId: "main",
    t: 1.0,
    model: "horror6",
    scale: 3,
    offset: [-0.5, -0.7, 11.5],
    rotation: [0, Math.PI, 0],
    light: {
      position: [0, 6.6, 0.4],
      intensity: 200,
      distance: 20,
      color: "#5a0000",
      emit: true,
    },
  },
];

/** GLB paths — keep in sync with public/models */
export const SCENE_PROP_URLS: Record<ScenePropModel, string> = {
  horror1: "/models/horror 1.glb",
  horror11: "/models/horror 1.1.glb",
  horror3: "/models/horror 3.glb",
  horror6: "/models/horror 6.glb",
  horror7: "/models/horror 7.glb",
  horror8: "/models/horror 8.glb",
  horror9: "/models/horror 9.glb",
  horrorLight: "/models/horror light.glb",
  dog: "/models/dog.glb",
};
