"use client";

import { useEffect, useRef } from "react";
import { Howl, Howler } from "howler";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useGameStore } from "@/store/gameStore";

const SFX_CACHE = new Map<string, Howl>();

// Tune each background independently so louder tracks can be normalized here
// while still respecting the global music slider.
const BACKGROUND_VOLUME_MULTIPLIERS: Record<string, number> = {
  main: 0.8,
  "resume-cv": 0.5,
  "who-am-i": 0.15,
  "social-handles": 0.72,
  "jewelry-cad": 0.66,
  "video-editing": 0.66,
  "game-dev": 0.7,
};

const getBackgroundVolumeMultiplier = (bgKey: string) => BACKGROUND_VOLUME_MULTIPLIERS[bgKey] ?? 0.75;

export default function AudioManager() {
  const masterVolume = useGameStore((s) => s.masterVolume);
  const musicVolume = useGameStore((s) => s.musicVolume);
  const sfxVolume = useGameStore((s) => s.sfxVolume);
  const isMuted = useGameStore((s) => s.isMuted);
  const isSceneLoading = useGameStore((s) => s.isSceneLoading);
  const overallProgress = useGameStore((s) => s.overallProgress);
  const branchProgress = useGameStore((s) => s.segmentProgress);
  const activeBranch = useGameStore((s) => s.activeBranch);
  const trackContext = useGameStore((s) => s.trackContext);
  const isCartMoving = useGameStore((s) => s.isCartMoving);
  const gameState = useGameStore((s) => s.gameState);

  const { scene, camera } = useThree();
  const listenerRef = useRef<THREE.AudioListener | null>(null);
  const bgRef = useRef<Howl | null>(null);
  const currentBgSrcRef = useRef<string | null>(null);
  const cartRef = useRef<Howl | null>(null);
  const cartWasMovingRef = useRef(false);
  const milestoneSoundTriggeredRef = useRef(false);
  const overall54SoundTriggeredRef = useRef(false);
  const whoAmiSoundTriggeredRef = useRef(false);
  const bgNeedsRestartRef = useRef(true);

  // Ensure a single AudioListener on the camera
  useEffect(() => {
    if (!camera) return;
    let listener = (camera as any).audioListener as THREE.AudioListener | undefined;
    if (!listener) {
      listener = new THREE.AudioListener();
      (camera as any).audioListener = listener;
      camera.add(listener);
    }
    listenerRef.current = listener;

    return () => {
      // don't remove listener on unmount, camera lifecycle handled by R3F
    };
  }, [camera]);

  // Background music (Howler)
  useEffect(() => {
    if (isSceneLoading) {
      if (bgRef.current) {
        try {
          bgRef.current.stop();
          bgRef.current.unload();
        } catch {}
        bgRef.current = null;
        currentBgSrcRef.current = null;
      }
      return;
    }

    const BG_MAP: Record<string, string> = {
      "resume-cv": "/audio/bg2.mp3",
      "who-am-i": "/audio/bg3.mp3",
      "social-handles": "/audio/bg4.mp3",
      "jewelry-cad": "/audio/bg5.mp3",
      "video-editing": "/audio/bg6.mp3",
      "game-dev": "/audio/bg7.mp3",
    };

    const bgKey = trackContext === "branch" && activeBranch?.id ? activeBranch.id : "main";
    const targetSrc = bgKey === "main" ? "/audio/bg.mp3" : BG_MAP[bgKey] ?? "/audio/bg.mp3";
    const trackMultiplier = getBackgroundVolumeMultiplier(bgKey);

    if (isMuted) {
      bgNeedsRestartRef.current = true;
      if (bgRef.current) {
        try {
          bgRef.current.stop();
          bgRef.current.unload();
        } catch {}
        bgRef.current = null;
        currentBgSrcRef.current = null;
      }
      return;
    }

    try {
      Howler.mute(false);
      if (Howler.ctx && Howler.ctx.state === "suspended") {
        void Howler.ctx.resume();
      }
    } catch {}

    const needsRestart = bgNeedsRestartRef.current || currentBgSrcRef.current !== targetSrc || !bgRef.current;

    // if already playing the same source and we don't need a restart, just update volume
    if (!needsRestart && currentBgSrcRef.current === targetSrc && bgRef.current) {
      bgRef.current.volume(musicVolume * masterVolume * trackMultiplier);
      return;
    }

    const fadeDuration = 400;

    // fade out existing
    if (bgRef.current) {
      try {
        const old = bgRef.current;
        const fromVol = old.volume() as number || 0;
        old.fade(fromVol, 0, fadeDuration);
        setTimeout(() => {
          try { old.unload(); } catch {}
        }, fadeDuration + 50);
      } catch {}
      bgRef.current = null;
      currentBgSrcRef.current = null;
    }

    // create new Howl at zero volume then fade in
    const howl = new Howl({
      src: [targetSrc],
      loop: true,
      volume: 0,
      html5: true,
    });
    bgRef.current = howl;
    currentBgSrcRef.current = targetSrc;
    bgNeedsRestartRef.current = false;
    const targetVol = musicVolume * masterVolume * trackMultiplier;
    const playWhenReady = () => {
      try { howl.play(); } catch {}
      try { howl.fade(0, targetVol, fadeDuration); } catch {}
    };
    howl.once("load", playWhenReady);
    // Try playing immediately; if audio isn't ready yet the once('load') handler will fade when ready.
    try { howl.play(); } catch {}
    if (howl.state && howl.state() === "loaded") playWhenReady();

    return () => {
      try { howl.unload(); } catch {}
      if (currentBgSrcRef.current === targetSrc) currentBgSrcRef.current = null;
      bgRef.current = null;
    };
  }, [activeBranch, trackContext, musicVolume, masterVolume, isMuted, isSceneLoading]);

  // React to volume/mute changes
  useEffect(() => {
    Howler.volume(isMuted ? 0 : masterVolume);
    Howler.mute(isMuted);
    if (bgRef.current) {
      const bgKey = trackContext === "branch" && activeBranch?.id ? activeBranch.id : "main";
      const trackMultiplier = getBackgroundVolumeMultiplier(bgKey);
      const targetVolume = musicVolume * masterVolume * trackMultiplier;
      bgRef.current.volume(targetVolume);
    }
    if (!isMuted) {
      bgNeedsRestartRef.current = true;
    }
  }, [masterVolume, musicVolume, isMuted, trackContext, activeBranch?.id]);

  // Cart movement loop. Starts only while the cart is actually moving.
  useEffect(() => {
    const shouldPlay = !isSceneLoading && gameState === "RIDING" && isCartMoving && !isMuted;
    const targetVolume = shouldPlay ? Math.max(0, Math.min(1, sfxVolume * masterVolume * 0.15)) : 0;

    if (shouldPlay) {
      if (!cartWasMovingRef.current || !cartRef.current) {
        try {
          cartRef.current?.stop();
          cartRef.current?.unload();
        } catch {}

        cartRef.current = new Howl({
          src: ["/audio/cart-sound.mp3"],
          loop: true,
          volume: targetVolume,
          html5: true,
        });

        try {
          cartRef.current.play();
        } catch {}
        cartWasMovingRef.current = true;
        return;
      }

      cartRef.current.volume(targetVolume);
      return;
    }

    if (cartWasMovingRef.current) {
      try {
        cartRef.current?.stop();
        cartRef.current?.unload();
      } catch {}
      cartRef.current = null;
      cartWasMovingRef.current = false;
    }
  }, [gameState, isCartMoving, sfxVolume, masterVolume, isMuted, isSceneLoading]);

  useEffect(() => {
    return () => {
      try {
        cartRef.current?.unload();
      } catch {}
    };
  }, []);

  // Play non-positional SFX via Howler (overlapping allowed)
  const playSfx = (filename: string) => {
    if (!filename) return;
    const key = filename;
    let howl = SFX_CACHE.get(key);
    if (!howl) {
      howl = new Howl({
        src: [`/audio/sfx/${filename}`],
        volume: sfxVolume * masterVolume,
        html5: true,
        pool: 8,
      });
      SFX_CACHE.set(key, howl);
    }
    if (!isMuted) {
      howl.volume(sfxVolume * masterVolume);
      howl.play();
    }
  };

  // Play the milestone cue once when overall progress crosses 4%.
  useEffect(() => {
    const milestone = 0.04;

    if (overallProgress < milestone) {
      milestoneSoundTriggeredRef.current = false;
      return;
    }

    if (milestoneSoundTriggeredRef.current) return;

    milestoneSoundTriggeredRef.current = true;
    playSfx("332822__carmsie__you-cant-see-me.mp3");
  }, [overallProgress]);

  // Play the 54% overall milestone cue once.
  useEffect(() => {
    const milestone = 0.54;

    if (overallProgress < milestone) {
      overall54SoundTriggeredRef.current = false;
      return;
    }

    if (overall54SoundTriggeredRef.current) return;

    overall54SoundTriggeredRef.current = true;
    playSfx("791293__sadiquecat__ghost-you-better-run-edited.mp3");
  }, [overallProgress]);

  // Play a Who Am I-only cue once when the branch reaches 47% progress.
  useEffect(() => {
    const isWhoAmIPath = trackContext === "branch" && activeBranch?.id === "who-am-i";
    const milestone = 0.47;

    if (!isWhoAmIPath) {
      whoAmiSoundTriggeredRef.current = false;
      return;
    }

    if (branchProgress < milestone) return;
    if (whoAmiSoundTriggeredRef.current) return;

    whoAmiSoundTriggeredRef.current = true;
    playSfx("59560__dangerbabe__moans01.mp3");
  }, [activeBranch?.id, branchProgress, trackContext]);

  // Positional audio playback (dispatch events with detail { url, position: {x,y,z} })
  useEffect(() => {
    const loader = new THREE.AudioLoader();
    const handler = (ev: Event) => {
      const detail = (ev as CustomEvent).detail as { url: string; position: { x: number; y: number; z: number } };
      if (!detail || !listenerRef.current) return;
      const { url, position } = detail;
      const sound = new THREE.PositionalAudio(listenerRef.current!);
      sound.setRefDistance(2);
      sound.setRolloffFactor(1);
      sound.setVolume(isMuted ? 0 : sfxVolume * masterVolume);
      loader.load(url, (buffer) => {
        sound.setBuffer(buffer);
        const holder = new THREE.Object3D();
        holder.position.set(position.x, position.y, position.z);
        holder.add(sound);
        scene.add(holder);
        try {
          sound.play();
        } catch {}
        const cleanup = () => {
          try {
            scene.remove(holder);
            holder.remove(sound);
            // disconnect underlying nodes if present
            try {
              // @ts-ignore
              if (sound.source && typeof sound.source.onended !== "undefined") sound.source.onended = null;
            } catch {}
          } catch {}
        };
        // try to hook into end event
        try {
          // @ts-ignore
          if (sound.source) sound.source.onended = cleanup;
        } catch {}
      });
    };

    window.addEventListener("dt-play-positional", handler as EventListener);
    return () => window.removeEventListener("dt-play-positional", handler as EventListener);
  }, [scene, sfxVolume, masterVolume, isMuted]);

  // expose helpers for quick use in code
  useEffect(() => {
    (window as any).__DT_PLAY_SFX = playSfx;
    (window as any).__DT_PLAY_POSITIONAL = (url: string, pos: { x: number; y: number; z: number }) => {
      window.dispatchEvent(new CustomEvent("dt-play-positional", { detail: { url, position: pos } }));
    };
    return () => {
      delete (window as any).__DT_PLAY_SFX;
      delete (window as any).__DT_PLAY_POSITIONAL;
    };
  }, [sfxVolume, masterVolume, isMuted]);

  return null;
}
