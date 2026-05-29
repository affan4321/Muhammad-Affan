import { GRAPHICS_QUALITY_ORDER, type GraphicsQuality } from "./graphicsQuality";

export type UserSettings = {
  playerName: string;
  graphicsQuality: GraphicsQuality;
  masterVolume?: number;
  musicVolume?: number;
  sfxVolume?: number;
  isMuted?: boolean;
};

const STORAGE_KEY = "dark-tunnel-user-settings-v1";

export const DEFAULT_USER_SETTINGS: UserSettings = {
  playerName: "Traveler",
  graphicsQuality: "medium",
  masterVolume: 1,
  musicVolume: 0.8,
  sfxVolume: 0.9,
  isMuted: false,
};

const isGraphicsQuality = (value: unknown): value is GraphicsQuality =>
  typeof value === "string" && GRAPHICS_QUALITY_ORDER.includes(value as GraphicsQuality);

export const loadUserSettings = (): UserSettings | null => {
  if (typeof window === "undefined") return null;

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) return null;

    const parsedValue = JSON.parse(rawValue) as Partial<UserSettings>;
    return {
      playerName:
        typeof parsedValue.playerName === "string" && parsedValue.playerName.trim().length > 0
          ? parsedValue.playerName.trim()
          : DEFAULT_USER_SETTINGS.playerName,
      graphicsQuality: isGraphicsQuality(parsedValue.graphicsQuality)
        ? parsedValue.graphicsQuality
        : DEFAULT_USER_SETTINGS.graphicsQuality,
      masterVolume:
        typeof parsedValue.masterVolume === "number" ? parsedValue.masterVolume : DEFAULT_USER_SETTINGS.masterVolume,
      musicVolume:
        typeof parsedValue.musicVolume === "number" ? parsedValue.musicVolume : DEFAULT_USER_SETTINGS.musicVolume,
      sfxVolume:
        typeof parsedValue.sfxVolume === "number" ? parsedValue.sfxVolume : DEFAULT_USER_SETTINGS.sfxVolume,
      isMuted: typeof parsedValue.isMuted === "boolean" ? parsedValue.isMuted : DEFAULT_USER_SETTINGS.isMuted,
    };
  } catch {
    return null;
  }
};

export const saveUserSettings = (settings: UserSettings) => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};
