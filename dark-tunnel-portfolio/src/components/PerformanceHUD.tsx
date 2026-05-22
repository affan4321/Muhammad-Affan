"use client";

import { useEffect, useMemo, useState } from "react";

type PerfSample = {
  fps: number;
};

export const PerformanceHUD = () => {
  const [sample, setSample] = useState<PerfSample>({
    fps: 0,
  });

  useEffect(() => {
    let frameId = 0;
    let lastTime = performance.now();
    let frames = 0;
    let accumulator = 0;

    const tick = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;
      frames += 1;
      accumulator += delta;

      if (accumulator >= 500) {
        const fps = (frames * 1000) / accumulator;
        setSample({ fps });

        frames = 0;
        accumulator = 0;
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const panel = useMemo(
    () => (
      <div
        style={{
          position: "fixed",
          top: 10,
          right: 10,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          color: "#7CFFB2",
          fontFamily: "monospace",
          padding: "10px 12px",
          fontSize: "12px",
          zIndex: 110,
          borderRadius: "4px",
          minWidth: "180px",
          pointerEvents: "none",
          boxShadow: "0 0 20px rgba(0, 0, 0, 0.35)",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6 }}>PERF</div>
        <div>FPS: {sample.fps ? sample.fps.toFixed(1) : "--"}</div>
      </div>
    ),
    [sample]
  );

  return panel;
};

export default PerformanceHUD;