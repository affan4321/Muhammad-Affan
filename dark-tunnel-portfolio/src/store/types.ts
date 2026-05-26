import { Vector3, Curve } from "three";
import type { GraphicsQuality } from "@/lib/graphicsQuality";

export type GameState = "RIDING" | "CHOOSING_PATH" | "INSIDE_CHAMBER" | "IDLE";
export type TrackContext = "main" | "branch";
export type PathKind = "branch" | "continue";

export interface PathOption {
  id: string;
  label: string;
  description?: string;
  curve?: Curve<Vector3>;
  kind: PathKind;
  chamberId?: string;
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
  /** main = riding the spine; branch = side path to chamber */
  trackContext: TrackContext;
  /** Global journey progress (0–1), divided by chamber count */
  overallProgress: number;
  completedChambers: number;
  totalChambers: number;
  completedChamberIds: string[];
  speed: number;
  currentPosition: Vector3;

  journey: JourneySegment[];
  mainSpine: Curve<Vector3> | null;
  pathCurves: Curve<Vector3>[];

  // State
  gameState: GameState;
  availablePaths: PathOption[];
  activeBranch: PathOption | null;
  isSceneLoading: boolean;
  focusedChamberObjectId: string | null;
  openChamberObjectId: string | null;
  focusedMapBoardId: string | null;
  openMapBoardId: string | null;
  playerName: string;
  graphicsQuality: GraphicsQuality;

  // Input
  isMovingForward: boolean;
  isMovingBackward: boolean;
  isMovingLeft: boolean;
  isMovingRight: boolean;
  isDebugCameraLocked: boolean;

  // Actions
  setCurrentTrack: (curve: Curve<Vector3>) => void;
  setSegmentProgress: (progress: number) => void;
  setTotalChambers: (count: number) => void;
  setJourneyGraph: (graph: JourneyGraph) => void;
  setCurrentPosition: (pos: Vector3) => void;
  setGameState: (state: GameState) => void;
  setMovingForward: (value: boolean) => void;
  setMovingBackward: (value: boolean) => void;
  setMovingLeft: (value: boolean) => void;
  setMovingRight: (value: boolean) => void;
  setAvailablePaths: (paths: PathOption[]) => void;
  setActiveBranch: (path: PathOption | null) => void;
  setSceneLoading: (loading: boolean) => void;
  setPlayerName: (playerName: string) => void;
  setGraphicsQuality: (graphicsQuality: GraphicsQuality) => void;
  setFocusedChamberObjectId: (objectId: string | null) => void;
  setOpenChamberObjectId: (objectId: string | null) => void;
  setFocusedMapBoardId: (boardId: string | null) => void;
  setOpenMapBoardId: (boardId: string | null) => void;
  selectPathAtFork: (path: PathOption) => void;
  completeChamber: () => void;
  returnToBeginning: () => void;
  stepToPreviousMainSegment: () => void;
  returnFromBranchToFork: () => void;
  setMovementInput: (forward: boolean, backward: boolean) => void;
  setDebugCameraLocked: (locked: boolean) => void;
  reset: () => void;
}
