"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { useGameStore } from "@/store/gameStore";
import { CHAMBER_CONTENT } from "@/lib/chamberContent";
import PDFViewer from "./PDFViewer";

type TiltCardProps = {
  title: string;
  subtitle?: string;
  accent?: string;
  children: ReactNode;
};

const TiltCard = ({ title, subtitle, accent = "#00ffd5", children }: TiltCardProps) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState("perspective(1200px) rotateX(0deg) rotateY(0deg)");
  const [glow, setGlow] = useState("50% 50%");

  const resetTransform = () => {
    setTransform("perspective(1200px) rotateX(0deg) rotateY(0deg)");
    setGlow("50% 50%");
  };

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 12;
    const rotateX = ((y / rect.height) - 0.5) * -12;

    setTransform(`perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
    setGlow(`${(x / rect.width) * 100}% ${(y / rect.height) * 100}%`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseEnter={handleMove}
      onMouseLeave={resetTransform}
      style={{
        position: "relative",
        transform,
        transition: "transform 160ms ease, box-shadow 160ms ease",
        transformStyle: "preserve-3d",
        boxShadow: "0 24px 80px rgba(0, 0, 0, 0.55)",
        borderRadius: "18px",
        overflow: "hidden",
        background: "linear-gradient(180deg, rgba(13,13,13,0.98), rgba(7,7,7,0.94))",
        border: "1px solid rgba(0, 255, 213, 0.25)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(circle at ${glow}, rgba(255,255,255,0.15), transparent 35%)`,
          opacity: 0.8,
        }}
      />
      <div style={{ position: "relative", padding: "18px", transform: "translateZ(30px)" }}>
        <div style={{ color: accent, fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", marginBottom: subtitle ? "6px" : "10px" }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ color: "#8a8a8a", fontSize: "12px", marginBottom: "14px", lineHeight: 1.4 }}>
            {subtitle}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

/**
 * Information chamber — end of a branch path; return to main track afterward.
 */
export const ChamberPanel = () => {
  const gameState = useGameStore((s) => s.gameState);
  const activeBranch = useGameStore((s) => s.activeBranch);
  const completeChamber = useGameStore((s) => s.completeChamber);
  const focusedChamberObjectId = useGameStore((s) => s.focusedChamberObjectId);
  const openChamberObjectId = useGameStore((s) => s.openChamberObjectId);
  const setOpenChamberObjectId = useGameStore((s) => s.setOpenChamberObjectId);

  useEffect(() => {
    if (gameState !== "INSIDE_CHAMBER") return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (focusedChamberObjectId || openChamberObjectId) return;
      if (e.key === "Escape") {
        e.preventDefault();
        completeChamber();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameState, completeChamber, focusedChamberObjectId, openChamberObjectId]);

  const branchId = activeBranch?.id;
  const content = branchId ? CHAMBER_CONTENT[branchId] : null;
  const title = content?.title ?? activeBranch?.label ?? "Information Chamber";
  const isDocumentOpen = Boolean(openChamberObjectId && content);

  const renderedContent = useMemo(() => {
    if (!content) return null;

    if (content.pdfUrl) {
      return (
        <TiltCard title={content.title} subtitle="Open the document inside the card" accent="#00ffd5">
          <PDFViewer pdfUrl={content.pdfUrl} />
        </TiltCard>
      );
    }

    if (content.type === "who-am-i") {
      return (
        <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          <TiltCard title="Summary" subtitle={content.title} accent="#39c9ff">
            <p style={{ margin: 0, color: "#f2f2f2", lineHeight: 1.7, fontSize: "15px" }}>{content.summary}</p>
          </TiltCard>
          <TiltCard title="Ambitions" subtitle={content.title} accent="#ff7df1">
            <p style={{ margin: 0, color: "#f2f2f2", lineHeight: 1.7, fontSize: "15px" }}>{content.ambitions}</p>
          </TiltCard>
        </div>
      );
    }

    if (content.type === "social") {
      return (
        <div style={{ display: "grid", gap: "14px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {content.socialLinks?.map((link, index) => (
            <TiltCard key={link.platform} title={link.platform} subtitle={`Link ${index + 1}`} accent="#00ffd5">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  color: "#fff2d6",
                  textDecoration: "none",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid rgba(0,255,213,0.28)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                Open profile →
              </a>
            </TiltCard>
          ))}
        </div>
      );
    }

    return (
      <div style={{ display: "grid", gap: "14px", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {content.projects?.map((project, index) => (
          <TiltCard key={project.id} title={project.title} subtitle={`Project ${index + 1}`} accent="#00ffd5">
            <p style={{ margin: "0 0 12px 0", color: "#d8d8d8", lineHeight: 1.6, fontSize: "14px" }}>{project.description}</p>
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#fff2d6",
                fontSize: "12px",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              View Project →
            </a>
          </TiltCard>
        ))}
      </div>
    );
  }, [content]);

  if (gameState !== "INSIDE_CHAMBER") {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        left: 20,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        border: "1px solid #00ffd5",
        borderRadius: "8px",
        padding: "16px 20px",
        zIndex: 60,
        pointerEvents: "auto",
      }}
    >
      <p style={{ color: "#00ffd5", margin: "0 0 8px 0", fontSize: "11px", letterSpacing: "0.1em" }}>{title}</p>
      <p style={{ color: "#666", margin: "0 0 12px 0", fontSize: "12px" }}>
        WASD/Arrows to move · Mouse to look
      </p>
      <button
        type="button"
        onClick={() => completeChamber()}
        style={{
          padding: "8px 16px",
          backgroundColor: "#00ffd5",
          color: "#000",
          border: "none",
          borderRadius: "4px",
          fontWeight: "bold",
          cursor: "pointer",
          fontSize: "12px",
        }}
      >
        Exit Chamber (Esc)
      </button>

      {isDocumentOpen && content && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            background: "rgba(0, 0, 0, 0.72)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            style={{
              width: "min(1120px, 94vw)",
              maxHeight: "90vh",
              overflow: "auto",
              background: "rgba(10, 10, 10, 0.92)",
              border: "1px solid rgba(0, 255, 213, 0.32)",
              borderRadius: "18px",
              boxShadow: "0 40px 120px rgba(0, 0, 0, 0.72)",
              padding: "20px",
              color: "#f3f3f3",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "18px" }}>
              <div>
                <div style={{ color: "#00ffd5", fontSize: "14px", fontWeight: 700, letterSpacing: "0.08em" }}>{content.title}</div>
                <div style={{ color: "#8a8a8a", fontSize: "12px", marginTop: "4px" }}>
                  Hover each card to tilt · Press Esc to close
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenChamberObjectId(null)}
                style={{
                  padding: "8px 12px",
                  background: "transparent",
                  border: "1px solid #00ffd5",
                  color: "#00ffd5",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Close
              </button>
            </div>

            {renderedContent}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChamberPanel;
