"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";

export const MobileControls = () => {
  const setMovingForward = useGameStore((state) => state.setMovingForward);
  const setMovingBackward = useGameStore((state) => state.setMovingBackward);
  const isUiPaused = useGameStore((state) => state.isUiPaused);
  const [isMobile, setIsMobile] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);

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
    setActiveButton("forward");
    const backward = useGameStore.getState().isMovingBackward;
    setMovingForward(true);
    setMovingBackward(backward);
  };

  const handleForwardEnd = () => {
    if (isUiPaused) return;
    setActiveButton(null);
    const backward = useGameStore.getState().isMovingBackward;
    setMovingForward(false);
    setMovingBackward(backward);
  };

  const handleBackwardStart = () => {
    if (isUiPaused) return;
    setActiveButton("backward");
    const forward = useGameStore.getState().isMovingForward;
    setMovingForward(forward);
    setMovingBackward(true);
  };

  const handleBackwardEnd = () => {
    if (isUiPaused) return;
    setActiveButton(null);
    const forward = useGameStore.getState().isMovingForward;
    setMovingForward(forward);
    setMovingBackward(false);
  };

  const buttonStyle = (isActive: boolean) => ({
    width: 70,
    height: 70,
    borderRadius: "50%",
    backgroundColor: isActive ? "rgba(255, 255, 255, 0.35)" : "rgba(255, 255, 255, 0.15)",
    border: `2px solid ${isActive ? "rgba(255, 255, 255, 0.6)" : "rgba(255, 255, 255, 0.3)"}`,
    color: "white",
    fontSize: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    userSelect: "none" as const,
    WebkitUserSelect: "none" as const,
    touchAction: "manipulation" as const,
    transition: "all 0.1s ease-out",
    transform: isActive ? "scale(0.95)" : "scale(1)",
    boxShadow: isActive ? "0 0 15px rgba(255, 255, 255, 0.3)" : "none",
  });

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
        touchAction: "none",
      }}
    >
      <button
        onTouchStart={handleForwardStart}
        onTouchEnd={handleForwardEnd}
        onTouchCancel={handleForwardEnd}
        onMouseDown={handleForwardStart}
        onMouseUp={handleForwardEnd}
        onMouseLeave={handleForwardEnd}
        style={buttonStyle(activeButton === "forward")}
      >
        ↑
      </button>
      <button
        onTouchStart={handleBackwardStart}
        onTouchEnd={handleBackwardEnd}
        onTouchCancel={handleBackwardEnd}
        onMouseDown={handleBackwardStart}
        onMouseUp={handleBackwardEnd}
        onMouseLeave={handleBackwardEnd}
        style={buttonStyle(activeButton === "backward")}
      >
        ↓
      </button>
    </div>
  );
};

export default MobileControls;
