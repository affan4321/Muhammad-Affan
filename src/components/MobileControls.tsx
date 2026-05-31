"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";

export const MobileControls = () => {
  const setMovingForward = useGameStore((state) => state.setMovingForward);
  const setMovingBackward = useGameStore((state) => state.setMovingBackward);
  const isUiPaused = useGameStore((state) => state.isUiPaused);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isMobile) return null;

  const handleForwardStart = () => {
    if (isUiPaused) return;
    const backward = useGameStore.getState().isMovingBackward;
    setMovingForward(true);
    setMovingBackward(backward);
  };

  const handleForwardEnd = () => {
    if (isUiPaused) return;
    const backward = useGameStore.getState().isMovingBackward;
    setMovingForward(false);
    setMovingBackward(backward);
  };

  const handleBackwardStart = () => {
    if (isUiPaused) return;
    const forward = useGameStore.getState().isMovingForward;
    setMovingForward(forward);
    setMovingBackward(true);
  };

  const handleBackwardEnd = () => {
    if (isUiPaused) return;
    const forward = useGameStore.getState().isMovingForward;
    setMovingForward(forward);
    setMovingBackward(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 40,
        right: 40,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        zIndex: 1000,
        pointerEvents: "auto",
      }}
    >
      <button
        onTouchStart={handleForwardStart}
        onTouchEnd={handleForwardEnd}
        onMouseDown={handleForwardStart}
        onMouseUp={handleForwardEnd}
        style={{
          width: 70,
          height: 70,
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          border: "2px solid rgba(255, 255, 255, 0.4)",
          color: "white",
          fontSize: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          userSelect: "none",
          WebkitUserSelect: "none",
          touchAction: "manipulation",
        }}
      >
        ↑
      </button>
      <button
        onTouchStart={handleBackwardStart}
        onTouchEnd={handleBackwardEnd}
        onMouseDown={handleBackwardStart}
        onMouseUp={handleBackwardEnd}
        style={{
          width: 70,
          height: 70,
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          border: "2px solid rgba(255, 255, 255, 0.4)",
          color: "white",
          fontSize: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          userSelect: "none",
          WebkitUserSelect: "none",
          touchAction: "manipulation",
        }}
      >
        ↓
      </button>
    </div>
  );
};

export default MobileControls;
