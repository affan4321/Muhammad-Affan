import * as THREE from "three";

export type GraphicsQuality = "low" | "medium" | "high" | "ultra";

export type GraphicsQualityPreset = {
  label: string;
  description: string;
  pixelRatio: number;
  exposure: number;
  bloomIntensity: number;
  bloomThreshold: number;
  shadowMapType: THREE.ShadowMapType;
};

export const GRAPHICS_QUALITY_PRESETS: Record<GraphicsQuality, GraphicsQualityPreset> = {
  low: {
    label: "Low",
    description: "Fastest rendering, reduced postprocessing.",
    pixelRatio: 0.75,
    exposure: 1.2,
    bloomIntensity: 0.35,
    bloomThreshold: 0.3,
    shadowMapType: THREE.BasicShadowMap,
  },
  medium: {
    label: "Medium",
    description: "Balanced visuals and performance.",
    pixelRatio: 1,
    exposure: 1.32,
    bloomIntensity: 0.55,
    bloomThreshold: 0.22,
    shadowMapType: THREE.PCFShadowMap,
  },
  high: {
    label: "High",
    description: "Sharper image with richer lighting.",
    pixelRatio: 1.25,
    exposure: 1.45,
    bloomIntensity: 0.72,
    bloomThreshold: 0.18,
    shadowMapType: THREE.PCFSoftShadowMap,
  },
  ultra: {
    label: "Ultra",
    description: "Maximum clarity and polish.",
    pixelRatio: 1.5,
    exposure: 1.55,
    bloomIntensity: 0.9,
    bloomThreshold: 0.12,
    shadowMapType: THREE.PCFSoftShadowMap,
  },
};

export const GRAPHICS_QUALITY_ORDER: GraphicsQuality[] = ["low", "medium", "high", "ultra"];
