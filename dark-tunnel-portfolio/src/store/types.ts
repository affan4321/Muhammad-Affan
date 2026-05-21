import { Vector3, Curve } from "three";

export type GameState = "RIDING" | "CHOOSING_PATH" | "INSIDE_CAVE" | "IDLE";

export interface PathOption {
  id: string;
  label: string;
  description?: string;
  curve?: Curve<Vector3>;
  nextPaths?: PathOption[];
}

export interface GameStoreState {
  // Movement
  currentTrack: Curve<Vector3> | null;
  progress: number;
  overallProgress: number;
  completedCaves: number;
  totalCaves: number;
  speed: number;
  currentPosition: Vector3;

  // State
  gameState: GameState;
  availablePaths: PathOption[];
  selectedPath: PathOption | null;

  // Input
  isMovingForward: boolean;
  isMovingBackward: boolean;

  // Actions
  setCurrentTrack: (curve: Curve<Vector3>) => void;
  setProgress: (progress: number) => void;
  setTotalCaves: (count: number) => void;
  incrementCompletedCaves: () => void;
  setCurrentPosition: (pos: Vector3) => void;
  setGameState: (state: GameState) => void;
  setAvailablePaths: (paths: PathOption[]) => void;
  selectPath: (pathId: string) => void;
  setMovementInput: (forward: boolean, backward: boolean) => void;
  reset: () => void;
}
