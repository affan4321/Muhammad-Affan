"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html, Center, PerspectiveCamera, useGLTF, useProgress } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Howl } from "howler";
import * as THREE from "three";
import { useGameStore } from "@/store/gameStore";
import { R2_BASE_URL } from "@/lib/sceneProps";

const LoadingModel = ({ onModelLoaded }: { onModelLoaded: () => void }) => {
  const { scene } = useGLTF(`${R2_BASE_URL}/models/muhammad-affan-model-compressed.glb`);

  useEffect(() => {
    onModelLoaded();
  }, [onModelLoaded]);

  return (
    <Center>
      <primitive object={scene} scale={1.05} />
    </Center>
  );
};

export const LoadingScreen = () => {
  const progress = useProgress((state) => state.progress);
  const isSceneLoading = useGameStore((state) => state.isSceneLoading);
  const setSceneLoading = useGameStore((state) => state.setSceneLoading);
  const modelGroup = useRef<THREE.Group | null>(null);
  const progressTextRef = useRef<HTMLDivElement | null>(null);
  const maxProgress = useRef(0);
  const loaderMusicRef = useRef<Howl | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Stop any existing audio before creating new instance
    if (loaderMusicRef.current) {
      try {
        loaderMusicRef.current.stop();
        loaderMusicRef.current.unload();
      } catch {}
      loaderMusicRef.current = null;
    }

    const music = new Howl({
      src: [`${R2_BASE_URL}/audio/GTA%20San%20Andreas%20Theme.mp3`],
      loop: true,
      volume: 0.85,
      html5: true,
      preload: true,
      onload: () => {
        console.log("LoadingScreen: Audio loaded successfully");
        setAudioLoaded(true);
        // Only play if not already playing
        if (!music.playing()) {
          try {
            music.play();
            console.log("LoadingScreen: Audio started playing on load");
          } catch (e) {
            console.error("Failed to play audio on load:", e);
          }
        }
      },
      onloaderror: (id, error) => {
        console.error("Audio load error:", error);
      },
      onplayerror: (id, error) => {
        console.error("Audio play error:", error);
      },
    });

    loaderMusicRef.current = music;

    // Try to play immediately
    if (!music.playing()) {
      try {
        music.play();
        console.log("LoadingScreen: Attempted to play audio immediately");
      } catch (e) {
        console.error("Failed to play audio immediately:", e);
      }
    }

    const playWhenReady = () => {
      if (loaderMusicRef.current === music && !music.playing()) {
        try {
          music.play();
          console.log("LoadingScreen: Audio started playing on interaction");
        } catch (e) {
          console.error("Failed to play audio on interaction:", e);
        }
      }
    };

    const handleUserInteraction = () => {
      playWhenReady();
    };

    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("touchstart", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);

    return () => {
      try {
        music.stop();
        music.unload();
      } catch {}
      loaderMusicRef.current = null;
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };
  }, []);

  // Start 5-second delay when both model and audio are loaded
  useEffect(() => {
    if (modelLoaded && audioLoaded) {
      console.log("LoadingScreen: Model and audio loaded, starting 5-second delay");
      delayTimeoutRef.current = setTimeout(() => {
        console.log("LoadingScreen: 5-second delay complete, hiding loading screen");
        setSceneLoading(false);
      }, 5000);
    }

    return () => {
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }
    };
  }, [modelLoaded, audioLoaded, setSceneLoading]);

  useFrame((_, delta) => {
    // Stop useFrame when not loading to prevent performance drain
    if (!isSceneLoading) return;

    if (modelGroup.current) {
      modelGroup.current.rotation.y += delta * 0.6;
    }

    const nextProgress = Math.min(100, progress);
    if (nextProgress > maxProgress.current) {
      maxProgress.current = nextProgress;
      if (progressTextRef.current) {
        progressTextRef.current.textContent = nextProgress.toFixed(1);
      }
    }
  });

  if (!isSceneLoading) return null;

  return (
    <>
      <PerspectiveCamera makeDefault fov={33} position={[0, 0, 8.2]} />
      <color attach="background" args={["#050000"]} />
      <fog attach="fog" args={["#050000", 5, 18]} />
      <ambientLight intensity={0.05} />
      <directionalLight position={[-7, 2.5, 7]} intensity={3.6} color="#ffd2b8" />
      <directionalLight position={[6, 0, -4]} intensity={0.35} color="#5a1820" />

      <group ref={modelGroup} position={[-1.05, -0.3, 0]} scale={window.innerWidth <= 768 ? 3 : 4}>
        <React.Suspense fallback={null}>
          <LoadingModel onModelLoaded={() => setModelLoaded(true)} />
        </React.Suspense>
      </group>

      <Html
        fullscreen
        transform={false}
        style={{ pointerEvents: "none", width: "100vw", height: "100vh" }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "grid",
            gridTemplateColumns: window.innerWidth <= 768 ? "1fr" : "1fr 1fr",
            color: "#ffd9d9",
            fontFamily:
              'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            background: "transparent",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "end",
              justifyContent: "center",
              paddingLeft: "2rem",
              paddingRight: "2rem",
              gap: 10,
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              paddingLeft: "2rem",
              paddingRight: "2rem",
              gap: 10,
            }}
          >
            <div style={{ fontSize: "clamp(14px, 3vw, 18px)", fontWeight: 600, letterSpacing: "0.18em" }}>
              Loading...
            </div>
            <div
              ref={progressTextRef}
              style={{ fontSize: "clamp(48px, 8vw, 82px)", fontWeight: 600, lineHeight: 0.92, color: "#ff6e6e" }}
            >
              0.0
            </div>
          </div>
        </div>
      </Html>
    </>
  );
};

export default LoadingScreen;