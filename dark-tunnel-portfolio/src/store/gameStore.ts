import { create } from "zustand";
import { GameStoreState } from "./types";
import { Vector3 } from "three";

export const useGameStore = create<GameStoreState>((set) => ({
  // Initial state
  currentTrack: null,
  progress: 0,
  speed: 0.002, // Adjust for handcar movement speed
  currentPosition: new Vector3(0, 0, 0),
  gameState: "IDLE",
  availablePaths: [],
  selectedPath: null,
  isMovingForward: false,
  isMovingBackward: false,

  // Actions
  setCurrentTrack: (curve) => set({ currentTrack: curve }),

  setProgress: (progress) =>
    set({
      progress: Math.max(0, Math.min(1, progress)), // Clamp between 0-1
    }),
  setCurrentPosition: (pos) => set({ currentPosition: pos }),

  setGameState: (state) => set({ gameState: state }),

  setAvailablePaths: (paths) => set({ availablePaths: paths }),

  selectPath: (pathId) =>
    set((state) => ({
      selectedPath: state.availablePaths.find((p) => p.id === pathId) || null,
    })),

  setMovementInput: (forward, backward) =>
    set({
      isMovingForward: forward,
      isMovingBackward: backward,
    }),

  reset: () =>
    set({
      currentTrack: null,
      progress: 0,
      gameState: "IDLE",
      availablePaths: [],
      selectedPath: null,
      isMovingForward: false,
      isMovingBackward: false,
    }),
}));
