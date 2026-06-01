"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";

export const PortraitModeOverlay = () => {
  const gameState = useGameStore((state) => state.gameState);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };

    const checkIOS = () => {
      const isIOSDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      setIsIOS(isIOSDevice);
    };

    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    const checkFullscreenStatus = () => {
      // Check both standard and webkit fullscreen APIs
      const fullscreenActive = !!(
        (document as any).fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(fullscreenActive);
    };

    checkMobile();
    checkIOS();
    checkOrientation();
    checkFullscreenStatus();

    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);
    window.addEventListener("fullscreenchange", checkFullscreenStatus);
    window.addEventListener("webkitfullscreenchange", checkFullscreenStatus);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
      window.removeEventListener("fullscreenchange", checkFullscreenStatus);
      window.removeEventListener("webkitfullscreenchange", checkFullscreenStatus);
    };
  }, []);

  const toggleFullscreen = async () => {
    console.log("PortraitModeOverlay: Toggle fullscreen clicked on", isIOS ? "iOS" : "Android");

    if (isIOS) {
      // iOS doesn't support fullscreen API in Safari
      // Try webkit approach for WebApps or provide instructions
      console.log("PortraitModeOverlay: iOS detected - using webkit approach");
      
      const doc = document as any;
      
      if (!isFullscreen) {
        try {
          // Try webkit fullscreen (may work in some contexts)
          if (doc.documentElement.webkitRequestFullscreen) {
            await doc.documentElement.webkitRequestFullscreen();
            console.log("PortraitModeOverlay: Webkit fullscreen requested");
          } else if (doc.documentElement.requestFullscreen) {
            await doc.documentElement.requestFullscreen();
            console.log("PortraitModeOverlay: Standard fullscreen requested");
          } else {
            // Fallback: show message to user
            console.log("PortraitModeOverlay: Fullscreen not supported on this iOS version");
            alert("For best experience on iOS, please:\n1. Rotate your device to landscape\n2. Or enable fullscreen in Safari (Aa menu > Enter Full Screen)");
          }
        } catch (err) {
          console.error("PortraitModeOverlay: Error requesting fullscreen:", err);
          alert("Fullscreen not available in this browser mode.\n\nPlease rotate your device to landscape for the best experience.");
        }
      } else {
        try {
          if (doc.webkitExitFullscreen) {
            await doc.webkitExitFullscreen();
          } else if (doc.exitFullscreen) {
            await doc.exitFullscreen();
          }
          console.log("PortraitModeOverlay: Exited fullscreen");
        } catch (err) {
          console.error("PortraitModeOverlay: Error exiting fullscreen:", err);
        }
      }
    } else {
      // Android - use standard Fullscreen API
      const doc = document as any;
      
      if (!isFullscreen) {
        try {
          console.log("PortraitModeOverlay: Requesting fullscreen on Android");
          const elem = doc.documentElement;
          
          // Try different fullscreen methods for compatibility
          if (elem.requestFullscreen) {
            await elem.requestFullscreen();
          } else if (elem.webkitRequestFullscreen) {
            await elem.webkitRequestFullscreen();
          } else if (elem.mozRequestFullScreen) {
            await elem.mozRequestFullScreen();
          } else if (elem.msRequestFullscreen) {
            await elem.msRequestFullscreen();
          }

          // Try to lock orientation to landscape on Android
          if ((screen.orientation as any)?.lock) {
            try {
              await (screen.orientation as any).lock('landscape');
              console.log("PortraitModeOverlay: Locked orientation to landscape");
            } catch (err: any) {
              console.warn("PortraitModeOverlay: Could not lock orientation:", err.message);
            }
          }
        } catch (err) {
          console.error("PortraitModeOverlay: Error requesting fullscreen:", err);
        }
      } else {
        try {
          const doc = document as any;
          if (doc.exitFullscreen) {
            await doc.exitFullscreen();
          } else if (doc.webkitExitFullscreen) {
            await doc.webkitExitFullscreen();
          } else if (doc.mozCancelFullScreen) {
            await doc.mozCancelFullScreen();
          } else if (doc.msExitFullscreen) {
            await doc.msExitFullscreen();
          }
          console.log("PortraitModeOverlay: Exited fullscreen");
        } catch (err) {
          console.error("PortraitModeOverlay: Error exiting fullscreen:", err);
        }
      }
    }
  };

  // Only show overlay during gameplay (not IDLE) and when in portrait mode on mobile
  const hasStartedGame = gameState !== "IDLE";
  if (!isMobile || !hasStartedGame || !isPortrait) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 48,
          marginBottom: 20,
        }}
      >
        📱
      </div>
      <h2
        style={{
          color: "#e7ffe9",
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 16,
          margin: 0,
        }}
      >
        Rotate Your Device
      </h2>
      <p
        style={{
          color: "rgba(231, 255, 233, 0.8)",
          fontSize: 16,
          marginBottom: 32,
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {isIOS
          ? "For the best experience, please rotate your device to landscape mode."
          : "For the best experience, please rotate your device to landscape mode or enable fullscreen."}
      </p>
      {!isIOS && (
        <button
          onClick={toggleFullscreen}
          style={{
            padding: "16px 32px",
            borderRadius: 12,
            border: "1px solid rgba(160, 255, 183, 0.22)",
            background: "rgba(31, 255, 95, 0.12)",
            color: "#f2fff4",
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 600,
            backdropFilter: "blur(10px)",
          }}
        >
          {isFullscreen ? "Exit Fullscreen" : "Enable Fullscreen"}
        </button>
      )}
      {isIOS && (
        <div
          style={{
            padding: "12px 20px",
            borderRadius: 12,
            border: "1px solid rgba(160, 255, 183, 0.22)",
            background: "rgba(31, 255, 95, 0.08)",
            color: "#c0ffc3",
            fontSize: 13,
            lineHeight: 1.6,
            maxWidth: 280,
          }}
        >
          💡 <strong>Tip:</strong> On iPhone, swipe down from top-right to access Control Center and lock auto-rotate orientation.
        </div>
      )}
    </div>
  );
};

export default PortraitModeOverlay;
