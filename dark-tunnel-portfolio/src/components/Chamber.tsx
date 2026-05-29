"use client";

import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls, Text, Html, PerspectiveCamera } from "@react-three/drei";
import IsolationRoomModel from "./models/IsolationRoomModel";
import LampModel from "./models/LampModel";
import PDFViewer from "./PDFViewer";
import { useGameStore } from "@/store/gameStore";
import { getChamberDoorTransform } from "@/lib/chamberDoor";
import { CHAMBER_CONTENT } from "@/lib/chamberContent";

/** Chamber interior with isolation room model and orbit controls. */
export const Chamber = () => {
  const currentTrack = useGameStore((s) => s.currentTrack);
  const gameState = useGameStore((s) => s.gameState);
  const activeBranch = useGameStore((s) => s.activeBranch);
  const focusedChamberObjectId = useGameStore((s) => s.focusedChamberObjectId);
  const openChamberObjectId = useGameStore((s) => s.openChamberObjectId);
  const setFocusedChamberObjectId = useGameStore((s) => s.setFocusedChamberObjectId);
  const setOpenChamberObjectId = useGameStore((s) => s.setOpenChamberObjectId);
  const chamberTrack = activeBranch?.curve ?? currentTrack;

  const interiorPos = useMemo(() => {
    if (!chamberTrack) return [0, 0, 0] as [number, number, number];
    try {
      const door = getChamberDoorTransform(chamberTrack);
      const tangent = chamberTrack.getTangentAt(0.98).clone();
      tangent.y = 0;
      tangent.normalize();
      const forward = new THREE.Vector3(-tangent.x, 0, -tangent.z).normalize();
      return [
        door.position[0] + forward.x * 3,
        door.position[1],
        door.position[2] + forward.z * 3,
      ] as [number, number, number];
    } catch {
      const p = chamberTrack.getPointAt(1);
      return [p.x, p.y, p.z] as [number, number, number];
    }
  }, [chamberTrack]);

  const roomVariant = "room2" as const;
  const room2LightPosition: [number, number, number] = [0, 250, -8];
  const room2FillLightPosition: [number, number, number] = [0, 300, -8];
  const room2FillLightPosition2: [number, number, number] = [0, 150, -290];
  const room2FillLightPosition3: [number, number, number] = [0, 150, 298];
  const room2FillLightPosition4: [number, number, number] = [245, 150, 0];
  const room2FillLightPosition5: [number, number, number] = [-245, 150, 0];
  const spotLightRef = useRef<THREE.SpotLight | null>(null);
  const spotTargetRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    if (spotLightRef.current && spotTargetRef.current) {
      spotLightRef.current.target = spotTargetRef.current;
      spotLightRef.current.target.updateMatrixWorld();
    }
  }, []);

  // Get chamber content
  const chamberContent = useMemo(() => {
    const branchId = activeBranch?.id;
    return branchId ? CHAMBER_CONTENT[branchId] : null;
  }, [activeBranch?.id]);

  const chamberObjectId = chamberContent ? `document-${activeBranch?.id ?? "default"}` : null;
  const isDocumentFocused = chamberObjectId !== null && focusedChamberObjectId === chamberObjectId;
  const isDocumentOpen = chamberObjectId !== null && openChamberObjectId === chamberObjectId;

  useEffect(() => {
    setFocusedChamberObjectId(null);
    setOpenChamberObjectId(null);
  }, [activeBranch?.id, setFocusedChamberObjectId, setOpenChamberObjectId]);

  // Play door opening when entering a chamber (positional if available)
  useEffect(() => {
    if (gameState !== "INSIDE_CHAMBER") return;
    try {
      const door = chamberTrack ? getChamberDoorTransform(chamberTrack) : null;
      const pos = door ? { x: door.position[0], y: door.position[1], z: door.position[2] } : null;
      // Prefer dispatching the positional event (AudioManager listens for it).
      if (pos) {
        try {
          window.dispatchEvent(new CustomEvent("dt-play-positional", { detail: { url: `/audio/sfx/door opening.mp3`, position: pos } }));
        } catch {}
      }

      // Also call the non-positional helper if it's available now, or retry shortly.
      try {
        const play = (window as any).__DT_PLAY_SFX;
        if (typeof play === "function") {
          try { play("door opening.mp3"); } catch {}
        } else {
          setTimeout(() => {
            try {
              const p = (window as any).__DT_PLAY_SFX;
              if (typeof p === "function") p("door opening.mp3");
            } catch {}
          }, 250);
        }
      } catch {}
    } catch {}
  }, [gameState, chamberTrack]);

  useEffect(() => {
    if (gameState !== "INSIDE_CHAMBER" || !chamberObjectId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && isDocumentFocused && !isDocumentOpen) {
        event.preventDefault();
        setOpenChamberObjectId(chamberObjectId);
        try {
          const play = (window as any).__DT_PLAY_SFX;
          if (typeof play === "function") play("paper picking.mp3");
        } catch {}
        return;
      }

      if (event.key === "Escape" && isDocumentOpen) {
        event.preventDefault();
        setOpenChamberObjectId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, chamberObjectId, isDocumentFocused, isDocumentOpen, setOpenChamberObjectId]);

  if (gameState !== "INSIDE_CHAMBER") {
    return null;
  }

  return (
    <group position={interiorPos}>
      <PerspectiveCamera makeDefault position={[0, 170, 300]} rotation={[-Math.PI / 2, 0, 0]} fov={60} />
      <IsolationRoomModel variant={roomVariant} scale={1} />
      {/* Chamber lighting - single hanging lamp from the ceiling */}
      <>
        <group position={room2LightPosition}>
          <LampModel scale={0.08} position={[0, 0, 0]} />
          <mesh position={[0, -4, 0]}>
            <sphereGeometry args={[1.2, 18, 18]} />
            <meshStandardMaterial color="#ffd7a1" emissive="#ffd7a1" emissiveIntensity={4} />
          </mesh>
          {/* Directional cone - use SpotLight aimed downward */}
          <spotLight
            ref={spotLightRef}
            position={[0, 0, 0]}
            intensity={80}
            distance={400}
            angle={Math.PI / 6}
            penumbra={1}
            decay={0.52}
            color="#ffd7a1"
            castShadow
          />
          {/* target object sits below the lamp so the spot aims downward */}
          <mesh ref={spotTargetRef} position={[0, -20, 0]} visible={false}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
          {/* <Text position={[0, -8, 0]} fontSize={2} color="#ffd7a1" anchorX="center" anchorY="middle">
            LIGHT SOURCE
          </Text> */}
        </group>
        <group position={room2FillLightPosition}>
          {/* <mesh>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial color="#ffd7a1" emissive="#ffd7a1" emissiveIntensity={2.5} />
          </mesh> */}
          <pointLight position={[0, 0, 0]} intensity={50} distance={180} color="#ffd7a1" decay={1} />
          {/* <Text position={[0, -4, 0]} fontSize={1.2} color="#ffd7a1" anchorX="center" anchorY="middle">
            FILL LIGHT
          </Text> */}
        </group>
        <group position={room2FillLightPosition2}>
          {/* <mesh>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial color="#ffd7a1" emissive="#ffd7a1" emissiveIntensity={2.5} />
          </mesh> */}
          <pointLight position={[0, 0, 0]} intensity={50} distance={500} color="#ffd7a1" decay={1} />
          {/* <Text position={[0, -4, 0]} fontSize={1.2} color="#ffd7a1" anchorX="center" anchorY="middle">
            FILL LIGHT
          </Text> */}
        </group>
        <group position={room2FillLightPosition3}>
          {/* <mesh>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial color="#ffd7a1" emissive="#ffd7a1" emissiveIntensity={2.5} />
          </mesh> */}
          <pointLight position={[0, 0, 0]} intensity={50} distance={500} color="#ffd7a1" decay={1} />
          {/* <Text position={[0, -4, 0]} fontSize={1.2} color="#ffd7a1" anchorX="center" anchorY="middle">
            FILL LIGHT
          </Text> */}
        </group>
        <group position={room2FillLightPosition4}>
          {/* <mesh>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial color="#ffd7a1" emissive="#ffd7a1" emissiveIntensity={2.5} />
          </mesh> */}
          <pointLight position={[0, 0, 0]} intensity={50} distance={500} color="#ffd7a1" decay={1} />
          {/*  <Text position={[0, -4, 0]} fontSize={1.2} color="#ffd7a1" anchorX="center" anchorY="middle">
            FILL LIGHT
          </Text> */}
        </group>
        <group position={room2FillLightPosition5}>
          {/* <mesh>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial color="#ffd7a1" emissive="#ffd7a1" emissiveIntensity={2.5} />
          </mesh> */}
          <pointLight position={[0, 0, 0]} intensity={50} distance={500} color="#ffd7a1" decay={1} />
          {/* <Text position={[0, -4, 0]} fontSize={1.2} color="#ffd7a1" anchorX="center" anchorY="middle">
            FILL LIGHT
          </Text> */}
        </group>
      </>
      {/* Add interactive objects for information display */}
      {chamberContent && (
        <group position={[0, 0, 0]}>
          <group
            position={[0, 65.5, 12]}
            scale={10}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <mesh
              position={[0, 0, -0.02]}
              onPointerOver={() => chamberObjectId && setFocusedChamberObjectId(chamberObjectId)}
              onPointerOut={() => setFocusedChamberObjectId(null)}
              onPointerDown={(event) => {
                event.stopPropagation();
                  if (chamberObjectId) {
                    setOpenChamberObjectId(chamberObjectId);
                    try {
                      const play = (window as any).__DT_PLAY_SFX;
                      if (typeof play === "function") play("paper picking.mp3");
                    } catch {}
                  }
              }}
              onClick={(event) => {
                event.stopPropagation();
                  if (chamberObjectId) {
                    setOpenChamberObjectId(chamberObjectId);
                    try {
                      const play = (window as any).__DT_PLAY_SFX;
                      if (typeof play === "function") play("paper picking.mp3");
                    } catch {}
                  }
              }}
            >
              <planeGeometry args={[6, 7.5]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
            <mesh>
              <planeGeometry args={[4.5, 5.8]} />
              <meshStandardMaterial
                color={isDocumentFocused || isDocumentOpen ? "#f8ead0" : "#c9b48b"}
                emissive={isDocumentFocused || isDocumentOpen ? "#ffe5a8" : "#000000"}
                emissiveIntensity={isDocumentFocused || isDocumentOpen ? 0.45 : 0.08}
                roughness={0.9}
                metalness={0.05}
              />
            </mesh>
            <mesh position={[0, 0, 0.03]}>
              <planeGeometry args={[4.1, 5.35]} />
              <meshBasicMaterial color="#110f0c" transparent opacity={0.62} />
            </mesh>
            <Text position={[0, 1.7, 0.05]} fontSize={0.34} color="#00ffd5" anchorX="center" anchorY="middle">
              {chamberContent.title}
            </Text>
            <Text position={[0, 1.15, 0.05]} fontSize={0.12} color="#fff2d6" anchorX="center" anchorY="middle">
              Hover or click to open
            </Text>
            <Text position={[0, -1.95, 0.05]} fontSize={0.1} color="#b8b8b8" anchorX="center" anchorY="middle">
              Document
            </Text>
          </group>

          {isDocumentOpen && (
            <Html position={[0, 0.8, -1.8]} transform distanceFactor={1}>
              <div
                style={{
                  width: "520px",
                  maxHeight: "620px",
                  overflow: "auto",
                  background: "rgba(8, 8, 8, 0.95)",
                  border: "1px solid #00ffd5",
                  borderRadius: "12px",
                  boxShadow: "0 24px 80px rgba(0, 0, 0, 0.65)",
                  padding: "16px",
                  pointerEvents: "auto",
                  color: "#f3f3f3",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ color: "#00ffd5", fontSize: "14px", fontWeight: 700, letterSpacing: "0.08em" }}>
                    {chamberContent.title}
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenChamberObjectId(null)}
                    style={{
                      background: "transparent",
                      color: "#00ffd5",
                      border: "1px solid #00ffd5",
                      borderRadius: "8px",
                      padding: "6px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Close (Esc)
                  </button>
                </div>

                {chamberContent.pdfUrl ? (
                  <PDFViewer pdfUrl={chamberContent.pdfUrl} />
                ) : chamberContent.type === "who-am-i" ? (
                  <div style={{ lineHeight: 1.6, fontSize: "14px" }}>
                    <p style={{ marginTop: 0, color: "#fff2d6" }}>{chamberContent.summary}</p>
                    <p style={{ marginBottom: 0, color: "#d8d8d8" }}>{chamberContent.ambitions}</p>
                  </div>
                ) : chamberContent.type === "social" ? (
                  <div style={{ display: "grid", gap: "10px" }}>
                    {chamberContent.socialLinks?.map((link) => (
                      <a
                        key={link.platform}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#00ffd5",
                          textDecoration: "none",
                          padding: "10px 12px",
                          border: "1px solid rgba(0, 255, 213, 0.4)",
                          borderRadius: "8px",
                          background: "rgba(255, 255, 255, 0.03)",
                        }}
                      >
                        {link.platform}
                      </a>
                    ))}
                  </div>
                ) : chamberContent.type === "about-me" ? (
                  <div style={{ lineHeight: 1.6, fontSize: "14px", maxHeight: "400px", overflowY: "auto", paddingRight: "8px" }}>
                    <p style={{ marginTop: 0, color: "#fff2d6", whiteSpace: "pre-wrap" }}>{chamberContent.summary}</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "12px" }}>
                    {chamberContent.projects?.map((project) => (
                      <div
                        key={project.id}
                        style={{
                          border: "1px solid rgba(0, 255, 213, 0.25)",
                          borderRadius: "8px",
                          padding: "10px 12px",
                          background: "rgba(255, 255, 255, 0.03)",
                        }}
                      >
                        <div style={{ color: "#00ffd5", fontSize: "13px", marginBottom: "6px" }}>{project.title}</div>
                        <div style={{ color: "#d8d8d8", fontSize: "12px", lineHeight: 1.5 }}>{project.description}</div>
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#fff2d6", fontSize: "12px", textDecoration: "none" }}
                        >
                          View Project →
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Html>
          )}
        </group>
      )}
      <OrbitControls enabled={!openChamberObjectId} />
    </group>
  );
};

export default Chamber;
