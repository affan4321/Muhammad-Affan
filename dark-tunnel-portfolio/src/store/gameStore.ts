import { create } from "zustand";
import { GameStoreState, JourneyGraph } from "./types";
import { Vector3 } from "three";
import { collectAllPathCurves, getSegmentCurve, syncOverallProgress } from "@/lib/journey";

export const useGameStore = create<GameStoreState>((set, get) => ({
  currentTrack: null,
  segmentProgress: 0,
  mainSegmentIndex: 0,
  trackContext: "main",
  overallProgress: 0,
  completedCaves: 0,
  totalCaves: 3,
  completedCaveIds: [],
  speed: 0.001,
  currentPosition: new Vector3(0, 0, 0),
  journey: [],
  mainSpine: null,
  pathCurves: [],
  gameState: "IDLE",
  availablePaths: [],
  activeBranch: null,
  isMovingForward: false,
  isMovingBackward: false,
  isDebugCameraLocked: false,

  setCurrentTrack: (curve) => set({ currentTrack: curve }),

  setSegmentProgress: (progress) =>
    set((state) => {
      const segmentProgress = Math.max(0, Math.min(1, progress));
      return {
        segmentProgress,
        overallProgress: syncOverallProgress(
          state.trackContext,
          state.mainSegmentIndex,
          segmentProgress,
          state.completedCaves,
          state.totalCaves
        ),
      };
    }),

  setTotalCaves: (count) =>
    set((state) => {
      const totalCaves = Math.max(1, Math.floor(count));
      const completedCaves = Math.min(state.completedCaves, totalCaves);
      return {
        totalCaves,
        completedCaves,
        overallProgress: syncOverallProgress(
          state.trackContext,
          state.mainSegmentIndex,
          state.segmentProgress,
          completedCaves,
          totalCaves
        ),
      };
    }),

  setJourneyGraph: (graph: JourneyGraph) => {
    const firstCurve = getSegmentCurve(graph, 0);
    set({
      journey: graph.segments,
      mainSpine: graph.mainSpine,
      pathCurves: collectAllPathCurves(graph),
      totalCaves: Math.max(1, graph.segments.length),
      mainSegmentIndex: 0,
      trackContext: "main",
      currentTrack: firstCurve,
      segmentProgress: 0,
      overallProgress: 0,
      completedCaves: 0,
      completedCaveIds: [],
      gameState: graph.segments.length > 0 ? "RIDING" : "IDLE",
      availablePaths: [],
      activeBranch: null,
    });
  },

  setCurrentPosition: (pos) => set({ currentPosition: pos }),

  setGameState: (gameState) => set({ gameState }),

  setAvailablePaths: (paths) => set({ availablePaths: paths }),

  setActiveBranch: (path) => set({ activeBranch: path }),

  selectPathAtFork: (path) => {
    const state = get();
    const graph: JourneyGraph = {
      mainSpine: state.mainSpine!,
      segments: state.journey,
    };

    if (path.kind === "branch") {
      if (!path.curve) return;
      set({
        activeBranch: path,
        trackContext: "branch",
        currentTrack: path.curve,
        segmentProgress: 0.08,
        availablePaths: [],
        gameState: "RIDING",
        overallProgress: syncOverallProgress(
          "branch",
          state.mainSegmentIndex,
          0.08,
          state.completedCaves,
          state.totalCaves
        ),
      });
      return;
    }

    const nextIndex = state.mainSegmentIndex + 1;
    const nextCurve = getSegmentCurve(graph, nextIndex);
    if (!nextCurve) return;

    set({
      activeBranch: null,
      trackContext: "main",
      currentTrack: nextCurve,
      mainSegmentIndex: nextIndex,
      segmentProgress: 0.08,
      availablePaths: [],
      gameState: "RIDING",
      overallProgress: syncOverallProgress(
        "main",
        nextIndex,
        0.08,
        state.completedCaves,
        state.totalCaves
      ),
    });
  },

  completeIgloo: () => {
    const state = get();
    const branch = state.activeBranch;
    if (!branch?.caveId) return;

    const graph: JourneyGraph = {
      mainSpine: state.mainSpine!,
      segments: state.journey,
    };

    const alreadyDone = state.completedCaveIds.includes(branch.caveId);
    const completedCaveIds = alreadyDone
      ? state.completedCaveIds
      : [...state.completedCaveIds, branch.caveId];
    const completedCaves = alreadyDone
      ? state.completedCaves
      : Math.min(state.completedCaves + 1, state.totalCaves);

    const nextIndex = state.mainSegmentIndex + 1;
    const nextCurve = getSegmentCurve(graph, nextIndex);

    if (!nextCurve) {
      const atFork = getSegmentCurve(graph, state.mainSegmentIndex);
      set({
        completedCaveIds,
        completedCaves,
        activeBranch: null,
        trackContext: "main",
        currentTrack: atFork,
        segmentProgress: 0.99,
        gameState: "RIDING",
        availablePaths: [],
        overallProgress: syncOverallProgress(
          "main",
          state.mainSegmentIndex,
          0.99,
          completedCaves,
          state.totalCaves
        ),
      });
      return;
    }

    set({
      completedCaveIds,
      completedCaves,
      activeBranch: null,
      trackContext: "main",
      currentTrack: nextCurve,
      mainSegmentIndex: nextIndex,
      segmentProgress: 0,
      availablePaths: [],
      gameState: "RIDING",
      overallProgress: syncOverallProgress(
        "main",
        nextIndex,
        0,
        completedCaves,
        state.totalCaves
      ),
    });
  },

  returnFromBranchToFork: () => {
    const state = get();
    if (state.trackContext !== "branch") return;

    const graph: JourneyGraph = {
      mainSpine: state.mainSpine!,
      segments: state.journey,
    };
    const mainCurve = getSegmentCurve(graph, state.mainSegmentIndex);
    if (!mainCurve) return;

    set({
      trackContext: "main",
      currentTrack: mainCurve,
      segmentProgress: 0.97,
      activeBranch: null,
      gameState: "RIDING",
      availablePaths: [],
      overallProgress: syncOverallProgress(
        "main",
        state.mainSegmentIndex,
        0.97,
        state.completedCaves,
        state.totalCaves
      ),
    });
  },

  stepToPreviousMainSegment: () => {
    const state = get();
    if (state.trackContext !== "main" || state.mainSegmentIndex <= 0) return;

    const graph: JourneyGraph = {
      mainSpine: state.mainSpine!,
      segments: state.journey,
    };
    const prevIndex = state.mainSegmentIndex - 1;
    const prevCurve = getSegmentCurve(graph, prevIndex);
    if (!prevCurve) return;

    set({
      mainSegmentIndex: prevIndex,
      currentTrack: prevCurve,
      segmentProgress: 0.97,
      gameState: "RIDING",
      availablePaths: [],
      activeBranch: null,
      overallProgress: syncOverallProgress(
        "main",
        prevIndex,
        0.97,
        state.completedCaves,
        state.totalCaves
      ),
    });
  },

  setMovementInput: (forward, backward) =>
    set({
      isMovingForward: forward,
      isMovingBackward: backward,
    }),

  setDebugCameraLocked: (locked) => set({ isDebugCameraLocked: locked }),

  reset: () =>
    set({
      currentTrack: null,
      segmentProgress: 0,
      mainSegmentIndex: 0,
      trackContext: "main",
      overallProgress: 0,
      completedCaves: 0,
      totalCaves: 3,
      completedCaveIds: [],
      gameState: "IDLE",
      journey: [],
      mainSpine: null,
      pathCurves: [],
      availablePaths: [],
      activeBranch: null,
      isMovingForward: false,
      isMovingBackward: false,
      isDebugCameraLocked: false,
    }),
}));
