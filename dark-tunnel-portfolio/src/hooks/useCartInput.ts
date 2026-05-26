"use client";

import { useCallback, useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { getForkChoices, getSegmentCurve, syncOverallProgress } from "@/lib/journey";

/**
 * Hook to handle keyboard and mouse input for cart movement
 */
export const useCartInput = () => {
  const setMovingForward = useGameStore((state) => state.setMovingForward);
  const setMovingBackward = useGameStore((state) => state.setMovingBackward);
  const leftShiftPressedRef = useRef(false);

  const jumpToMainSegment = useCallback((segmentIndex: number) => {
    const state = useGameStore.getState();
    if (!state.mainSpine) return;

    const segment = state.journey[segmentIndex];
    if (!segment) return;

    const nextCurve = getSegmentCurve(
      {
        mainSpine: state.mainSpine,
        segments: state.journey,
      },
      segmentIndex
    );

    if (!nextCurve) return;

    useGameStore.setState({
      currentTrack: nextCurve,
      mainSegmentIndex: segmentIndex,
      trackContext: "main",
      segmentProgress: 1,
      availablePaths: getForkChoices(segment),
      activeBranch: null,
      gameState: "CHOOSING_PATH",
      overallProgress: syncOverallProgress(
        "main",
        segmentIndex,
        1,
        state.completedChambers,
        state.totalChambers
      ),
    });
  }, []);

  const jumpToChamber = useCallback((chamberId: string) => {
    const state = useGameStore.getState();
    if (!state.mainSpine) return;

    const segmentIndex = state.journey.findIndex((segment) =>
      segment.branches.some((branch) => branch.id === chamberId)
    );
    if (segmentIndex < 0) return;

    const segment = state.journey[segmentIndex];
    const branch = segment.branches.find((item) => item.id === chamberId);
    if (!branch?.curve) return;

    const chamberPosition = branch.curve.getPointAt(1).clone();

    useGameStore.setState({
      currentTrack: branch.curve,
      mainSegmentIndex: segmentIndex,
      trackContext: "branch",
      segmentProgress: 1,
      availablePaths: [],
      activeBranch: branch,
      currentPosition: chamberPosition,
      isMovingForward: false,
      isMovingBackward: false,
      gameState: "INSIDE_CHAMBER",
      overallProgress: syncOverallProgress(
        "branch",
        segmentIndex,
        1,
        state.completedChambers,
        state.totalChambers
      ),
    });
  }, []);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ShiftLeft") {
        leftShiftPressedRef.current = true;
        return;
      }

      if (leftShiftPressedRef.current && !e.repeat) {
        switch (e.code) {
          case "Digit2":
            jumpToMainSegment(1);
            e.preventDefault();
            return;
          case "Digit3":
            jumpToMainSegment(2);
            e.preventDefault();
            return;
          case "Digit4":
            jumpToMainSegment(3);
            e.preventDefault();
            return;
          case "KeyQ":
            jumpToChamber("who-am-i");
            e.preventDefault();
            return;
          case "KeyW":
            jumpToChamber("resume-cv");
            e.preventDefault();
            return;
          case "KeyE":
            jumpToChamber("social-handles");
            e.preventDefault();
            return;
          case "KeyR":
            jumpToChamber("about-me");
            e.preventDefault();
            return;
          case "KeyT":
            jumpToChamber("jewelry-cad");
            e.preventDefault();
            return;
          case "KeyY":
            jumpToChamber("video-editing");
            e.preventDefault();
            return;
          case "KeyU":
            jumpToChamber("game-dev");
            e.preventDefault();
            return;
          case "KeyI":
            jumpToChamber("ai-journey");
            e.preventDefault();
            return;
          default:
            break;
        }
      }

      if (leftShiftPressedRef.current) {
        e.preventDefault();
        return;
      }

      const forward = useGameStore.getState().isMovingForward;
      const backward = useGameStore.getState().isMovingBackward;

      switch (e.key.toLowerCase()) {
        case "arrowup":
        case "w":
          setMovingForward(true);
          setMovingBackward(backward);
          break;
        case "arrowdown":
        case "s":
          setMovingForward(forward);
          setMovingBackward(true);
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ShiftLeft") {
        leftShiftPressedRef.current = false;
        return;
      }

      const forward = useGameStore.getState().isMovingForward;
      const backward = useGameStore.getState().isMovingBackward;

      switch (e.key.toLowerCase()) {
        case "arrowup":
        case "w":
          setMovingForward(false);
          setMovingBackward(backward);
          break;
        case "arrowdown":
        case "s":
          setMovingForward(forward);
          setMovingBackward(false);
          break;
        default:
          break;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const forward = useGameStore.getState().isMovingForward;
      const backward = useGameStore.getState().isMovingBackward;

      if (e.button === 0) {
        // Left click
        setMovingForward(true);
        setMovingBackward(backward);
      } else if (e.button === 2) {
        // Right click
        setMovingForward(forward);
        setMovingBackward(true);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      const forward = useGameStore.getState().isMovingForward;
      const backward = useGameStore.getState().isMovingBackward;

      if (e.button === 0) {
        setMovingForward(false);
        setMovingBackward(backward);
      } else if (e.button === 2) {
        setMovingForward(forward);
        setMovingBackward(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    // Prevent context menu on right click
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [jumpToChamber, jumpToMainSegment, setMovingBackward, setMovingForward]);
};