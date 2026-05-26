import { create } from "zustand";
import { GameStoreState, JourneyGraph, TrackContext } from "./types";
import { Vector3 } from "three";
import { buildJourney, collectAllPathCurves, getSegmentCurve, syncOverallProgress } from "@/lib/journey";

export const useGameStore = create<GameStoreState>((set, get) => ({
  currentTrack: null,
  segmentProgress: 0,
  mainSegmentIndex: 0,
  trackContext: "main" as TrackContext,
  overallProgress: 0,
  completedChambers: 0,
  totalChambers: 4,
  completedChamberIds: [],
  speed: 0.002,
  currentPosition: new Vector3(0, 0, 0),
  journey: [],
  mainSpine: null,
  pathCurves: [],
  gameState: "IDLE",
  availablePaths: [],
  activeBranch: null,
  isSceneLoading: true,
  focusedChamberObjectId: null,
  openChamberObjectId: null,
  focusedMapBoardId: null,
  openMapBoardId: null,
  isMovingForward: false,
  isMovingBackward: false,
  isMovingLeft: false,
  isMovingRight: false,
  isDebugCameraLocked: false,

  setCurrentTrack: (curve) => set({ currentTrack: curve }),
  setMovingForward: (value) => set({ isMovingForward: value }),
  setMovingBackward: (value) => set({ isMovingBackward: value }),
  setMovingLeft: (value) => set({ isMovingLeft: value }),
  setMovingRight: (value) => set({ isMovingRight: value }),

  setSegmentProgress: (progress) =>
    set((state) => {
      const segmentProgress = Math.max(0, Math.min(1, progress));
      return {
        segmentProgress,
        overallProgress: syncOverallProgress(
          state.trackContext,
          state.mainSegmentIndex,
          segmentProgress,
          state.completedChambers,
          state.totalChambers
        ),
      };
    }),

  setTotalChambers: (count) =>
    set((state) => {
      const totalChambers = Math.max(1, Math.floor(count));
      const completedChambers = Math.min(state.completedChambers, totalChambers);
      return {
        totalChambers,
        completedChambers,
        overallProgress: syncOverallProgress(
          state.trackContext,
          state.mainSegmentIndex,
          state.segmentProgress,
          completedChambers,
          totalChambers
        ),
      };
    }),

  setJourneyGraph: (graph: JourneyGraph) => {
    const firstCurve = getSegmentCurve(graph, 0);
    set({
      journey: graph.segments,
      mainSpine: graph.mainSpine,
      pathCurves: collectAllPathCurves(graph),
      totalChambers: Math.max(1, graph.segments.length),
      mainSegmentIndex: 0,
      trackContext: "main" as TrackContext,
      currentTrack: firstCurve,
      segmentProgress: 0,
      overallProgress: 0,
      completedChambers: 0,
      completedChamberIds: [],
      gameState: graph.segments.length > 0 ? "RIDING" : "IDLE",
      availablePaths: [],
      activeBranch: null,
      focusedChamberObjectId: null,
      openChamberObjectId: null,
      focusedMapBoardId: null,
      openMapBoardId: null,
    });
  },

  setCurrentPosition: (pos) => set({ currentPosition: pos }),

  setGameState: (gameState) => set({ gameState }),

  setAvailablePaths: (paths) => set({ availablePaths: paths }),

  setActiveBranch: (path) => set({ activeBranch: path }),

  setSceneLoading: (loading) => set({ isSceneLoading: loading }),

  setFocusedChamberObjectId: (objectId) =>
    set({ focusedChamberObjectId: objectId }),

  setOpenChamberObjectId: (objectId) =>
    set({ openChamberObjectId: objectId }),

  setFocusedMapBoardId: (boardId) =>
    set({ focusedMapBoardId: boardId }),

  setOpenMapBoardId: (boardId) =>
    set({ openMapBoardId: boardId }),

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
        trackContext: "branch" as TrackContext,
        currentTrack: path.curve,
        segmentProgress: 0,
        availablePaths: [],
        gameState: "RIDING",
        overallProgress: syncOverallProgress(
          "branch",
          state.mainSegmentIndex,
          0,
          state.completedChambers,
          state.totalChambers
        ),
      });
      return;
    }

    const nextIndex = state.mainSegmentIndex + 1;
    const nextCurve = getSegmentCurve(graph, nextIndex);
    if (!nextCurve) return;

    set({
      activeBranch: null,
      trackContext: "main" as TrackContext,
      currentTrack: nextCurve,
      mainSegmentIndex: nextIndex,
      segmentProgress: 0,
      availablePaths: [],
      gameState: "RIDING",
      overallProgress: syncOverallProgress(
        "main",
        nextIndex,
        0,
        state.completedChambers,
        state.totalChambers
      ),
    });
  },

  completeChamber: () => {
    const state = get();
    const branch = state.activeBranch;
    if (!branch?.chamberId) return;

    const graph: JourneyGraph = {
      mainSpine: state.mainSpine!,
      segments: state.journey,
    };

    const alreadyDone = state.completedChamberIds.includes(branch.chamberId);
    const completedChamberIds = alreadyDone
      ? state.completedChamberIds
      : [...state.completedChamberIds, branch.chamberId];
    const completedChambers = alreadyDone
      ? state.completedChambers
      : Math.min(state.completedChambers + 1, state.totalChambers);

    const nextIndex = state.mainSegmentIndex + 1;
    const nextCurve = getSegmentCurve(graph, nextIndex);

    if (!nextCurve) {
      const atFork = getSegmentCurve(graph, state.mainSegmentIndex);
      set({
        completedChamberIds,
        completedChambers,
        activeBranch: null,
        trackContext: "main" as TrackContext,
        currentTrack: atFork,
        segmentProgress: 0.99,
        gameState: "RIDING",
        availablePaths: [],
        overallProgress: syncOverallProgress(
          "main",
          state.mainSegmentIndex,
          0.99,
          completedChambers,
          state.totalChambers
        ),
      });
      return;
    }

    set({
      completedChamberIds,
      completedChambers,
      activeBranch: null,
      trackContext: "main" as TrackContext,
      currentTrack: nextCurve,
      mainSegmentIndex: nextIndex,
      segmentProgress: 0,
      availablePaths: [],
      gameState: "RIDING",
      overallProgress: syncOverallProgress(
        "main",
        nextIndex,
        0,
        completedChambers,
        state.totalChambers
      ),
    });
  },

  returnToBeginning: () => {
    const graph = buildJourney();
    const firstCurve = getSegmentCurve(graph, 0);

    set({
      currentTrack: firstCurve,
      segmentProgress: 0,
      mainSegmentIndex: 0,
      trackContext: "main" as TrackContext,
      overallProgress: 0,
      completedChambers: 0,
      totalChambers: Math.max(1, graph.segments.length),
      completedChamberIds: [],
      speed: 0.002,
      currentPosition: new Vector3(0, 0, 0),
      journey: graph.segments,
      mainSpine: graph.mainSpine,
      pathCurves: collectAllPathCurves(graph),
      gameState: graph.segments.length > 0 ? "RIDING" : "IDLE",
      availablePaths: [],
      activeBranch: null,
      isSceneLoading: false,
      focusedChamberObjectId: null,
      openChamberObjectId: null,
      focusedMapBoardId: null,
      openMapBoardId: null,
      isMovingForward: false,
      isMovingBackward: false,
      isMovingLeft: false,
      isMovingRight: false,
      isDebugCameraLocked: false,
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
      trackContext: "main" as TrackContext,
      currentTrack: mainCurve,
      segmentProgress: 0.97,
      activeBranch: null,
      gameState: "RIDING",
      availablePaths: [],
      overallProgress: syncOverallProgress(
        "main",
        state.mainSegmentIndex,
        0.97,
        state.completedChambers,
        state.totalChambers
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
        state.completedChambers,
        state.totalChambers
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
      trackContext: "main" as TrackContext,
      overallProgress: 0,
      completedChambers: 0,
      totalChambers: 4,
      completedChamberIds: [],
      gameState: "IDLE",
      journey: [],
      mainSpine: null,
      pathCurves: [],
      availablePaths: [],
      activeBranch: null,
      isMovingForward: false,
      isMovingBackward: false,
      isDebugCameraLocked: false,
      isSceneLoading: true,
      focusedChamberObjectId: null,
      openChamberObjectId: null,
      focusedMapBoardId: null,
      openMapBoardId: null,
      currentPosition: new Vector3(0, 0, 0),
    }),
}));
