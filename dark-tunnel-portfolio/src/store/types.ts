import { Vector3, Curve } from "three";

export type GameState = "RIDING" | "CHOOSING_PATH" | "INSIDE_CAVE" | "IDLE";
export type TrackContext = "main" | "branch";
export type PathKind = "branch" | "continue";

export interface PathOption {
  id: string;
  label: string;
  description?: string;
  curve?: Curve<Vector3>;
  kind: PathKind;
  caveId?: string;
  side?: "left" | "right" | "center";
}

export interface JourneySegment {
  id: string;
  mainStartT: number;
  mainEndT: number;
  forkLabel: string;
  forkPoint: Vector3;
  branches: PathOption[];
  continuePath: PathOption | null;
  /** Final hub: main stops here; only branch picks (no continue, no rail past hub). */
  isTerminalFork?: boolean;
}

export interface JourneyGraph {
  mainSpine: Curve<Vector3>;
  segments: JourneySegment[];
}

export interface GameStoreState {
  // Movement
  currentTrack: Curve<Vector3> | null;
  /** Progress along the current segment (0–1), main or branch */
  segmentProgress: number;
  /** Which main-line segment the player is on */
  mainSegmentIndex: number;
  /** main = riding the spine; branch = side path to igloo */
  trackContext: TrackContext;
  /** Global journey progress (0–1), divided by cave count */
  overallProgress: number;
  completedCaves: number;
  totalCaves: number;
  completedCaveIds: string[];
  speed: number;
  currentPosition: Vector3;

  journey: JourneySegment[];
  mainSpine: Curve<Vector3> | null;
  pathCurves: Curve<Vector3>[];

  // State
  gameState: GameState;
  availablePaths: PathOption[];
  activeBranch: PathOption | null;

  // Input
  isMovingForward: boolean;
  isMovingBackward: boolean;

  // Actions
  setCurrentTrack: (curve: Curve<Vector3>) => void;
  setSegmentProgress: (progress: number) => void;
  setTotalCaves: (count: number) => void;
  setJourneyGraph: (graph: JourneyGraph) => void;
  setCurrentPosition: (pos: Vector3) => void;
  setGameState: (state: GameState) => void;
  setAvailablePaths: (paths: PathOption[]) => void;
  setActiveBranch: (path: PathOption | null) => void;
  selectPathAtFork: (path: PathOption) => void;
  completeIgloo: () => void;
  stepToPreviousMainSegment: () => void;
  returnFromBranchToFork: () => void;
  setMovementInput: (forward: boolean, backward: boolean) => void;
  reset: () => void;
}
