"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Center, OrbitControls, useProgress, useGLTF } from "@react-three/drei";

const LoadingModel = () => {
  const { scene } = useGLTF("/models/muhammad-affan-model-compressed.glb");
  return (
    <Center>
      <primitive object={scene} scale={1.05} rotation={[0, Math.PI / 4, 0]} />
    </Center>
  );
};

export const LoadingScreen = () => {
  const { active } = useProgress();
  const [showPreview, setShowPreview] = useState(false);
  const [bootVisible, setBootVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setBootVisible(false);
    }, 350);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!active) return;

    const timer = window.setTimeout(() => {
      setShowPreview(true);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [active]);

  const shouldShow = active || bootVisible;
  if (!shouldShow) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background:
          "radial-gradient(circle at center, rgba(35, 0, 0, 0.55), rgba(0, 0, 0, 0.98) 62%)",
        color: "#ffd9d9",
        fontFamily:
          'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div style={{ fontSize: 14, letterSpacing: "0.35em", textTransform: "uppercase" }}>
          Loading
        </div>
      </div>

      {showPreview ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
          }}
        >
          <div
            style={{
              width: "min(580px, 88vw)",
              height: "min(520px, 62vh)",
            }}
          >
            <Canvas
              camera={{ position: [0, 0, 4.4], fov: 35 }}
              dpr={1}
              frameloop="demand"
              gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
              style={{ width: "100%", height: "100%" }}
            >
              <ambientLight intensity={2} />
              <directionalLight position={[2, 3, 4]} intensity={2.6} color="#ffd9c0" />
              <directionalLight position={[-3, -2, -4]} intensity={0.55} color="#4b0000" />
              <Suspense fallback={null}>
                <LoadingModel />
              </Suspense>
              <OrbitControls enablePan={false} enableZoom={false} enableRotate />
            </Canvas>
          </div>
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "2px solid rgba(255, 145, 145, 0.25)",
              borderTopColor: "#ff6e6e",
              animation: "loader-spin 0.9s linear infinite",
            }}
          />
        </div>
      )}

      <style>{`@keyframes loader-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default LoadingScreen;