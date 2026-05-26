"use client";

import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Html, PerspectiveCamera } from "@react-three/drei";
import IsolationRoomModel from "./models/IsolationRoomModel";
import { useGameStore } from "@/store/gameStore";
import { getChamberDoorTransform } from "@/lib/chamberDoor";
import { CHAMBER_CONTENT } from "@/lib/chamberContent";

/** Chamber interior with isolation room model and orbit controls. */
export const Chamber = () => {
  const currentTrack = useGameStore((s) => s.currentTrack);
  const gameState = useGameStore((s) => s.gameState);
  const activeBranch = useGameStore((s) => s.activeBranch);

  const interiorPos = useMemo(() => {
    if (!currentTrack) return [0, 0, 0] as [number, number, number];
    try {
      const door = getChamberDoorTransform(currentTrack);
      const tangent = currentTrack.getTangentAt(0.98).clone();
      tangent.y = 0;
      tangent.normalize();
      const forward = new THREE.Vector3(-tangent.x, 0, -tangent.z).normalize();
      return [
        door.position[0] + forward.x * 3,
        door.position[1],
        door.position[2] + forward.z * 3,
      ] as [number, number, number];
    } catch {
      const p = currentTrack.getPointAt(1);
      return [p.x, p.y, p.z] as [number, number, number];
    }
  }, [currentTrack]);

  // Determine which room variant to use based on branch
  const roomVariant = useMemo(() => {
    const branchId = activeBranch?.id;
    // isolation-room for AI and video editing
    if (branchId === "ai-journey" || branchId === "video-editing") {
      return "room1";
    }
    // isolation-room2 for others
    return "room2";
  }, [activeBranch?.id]);

  // Get chamber content
  const chamberContent = useMemo(() => {
    const branchId = activeBranch?.id;
    return branchId ? CHAMBER_CONTENT[branchId] : null;
  }, [activeBranch?.id]);

  if (gameState !== "INSIDE_CHAMBER") {
    return null;
  }

  return (
    <group position={interiorPos}>
      <PerspectiveCamera makeDefault position={[0, 150, 300]} rotation={[-Math.PI / 2, 0, 0]} fov={60} />
      <IsolationRoomModel variant={roomVariant} scale={1} />
      {/* Chamber lighting - hanging lamp from ceiling */}
      <pointLight
        position={[0, 2.5, 0]}
        intensity={roomVariant === "room2" ? 50 : 80}
        distance={200}
        color="#ffaa00"
        // color="#fff"
        decay={7.5}
        castShadow
      />
      {/* <ambientLight intensity={0} /> */}
      <hemisphereLight intensity={40} color="#ffffff" groundColor="#000000" />
      {/* Add interactive objects for information display */}
      {chamberContent && (
        <group position={[0, 0, 0]}>
          {/* Information display on wall */}
          <mesh position={[0, 2, -2.5]} rotation={[0, 0, 0]}>
            <planeGeometry args={[3, 2]} />
            <meshBasicMaterial color="#00ffd5" transparent opacity={0.1} />
          </mesh>
          <Text
            position={[0, 2, -2.4]}
            fontSize={0.3}
            color="#00ffd5"
            anchorX="center"
            anchorY="middle"
          >
            {chamberContent.title}
          </Text>
          {/* Display content-specific information */}
          {chamberContent.type === "who-am-i" && (
            <>
              <Text
                position={[-1.5, 1.5, -2.4]}
                fontSize={0.15}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                maxWidth={2}
              >
                {chamberContent.summary}
              </Text>
              <Text
                position={[1.5, 1.5, -2.4]}
                fontSize={0.15}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                maxWidth={2}
              >
                {chamberContent.ambitions}
              </Text>
            </>
          )}
          {chamberContent.type === "social" && (
            <>
              {chamberContent.socialLinks?.map((link, index) => (
                <Html
                  key={index}
                  position={[0, 1.5 - index * 0.5, -2.3]}
                  transform
                  distanceFactor={1}
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#00ffd5",
                      textDecoration: "none",
                      fontWeight: "bold",
                      fontSize: "14px",
                      padding: "8px 16px",
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      border: "1px solid #00ffd5",
                      borderRadius: "4px",
                    }}
                  >
                    {link.platform}
                  </a>
                </Html>
              ))}
            </>
          )}
          {chamberContent.type === "portfolio" && (
            <>
              {chamberContent.projects?.map((project, index) => (
                <group key={project.id} position={[0, 1.5 - index * 0.6, -2.3]}>
                  <Text
                    fontSize={0.12}
                    color="#00ffd5"
                    anchorX="center"
                    anchorY="middle"
                  >
                    {project.title}
                  </Text>
                  <Text
                    position={[0, -0.2, 0]}
                    fontSize={0.08}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={2.5}
                  >
                    {project.description}
                  </Text>
                  <Html position={[0, -0.4, 0]} transform distanceFactor={1}>
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#00ffd5",
                        textDecoration: "none",
                        fontSize: "10px",
                      }}
                    >
                      View Project →
                    </a>
                  </Html>
                </group>
              ))}
            </>
          )}
        </group>
      )}
      <OrbitControls />
    </group>
  );
};

export default Chamber;
