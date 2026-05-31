"use client";

import { useEffect, useRef } from "react";
import { Howl, Howler } from "howler";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useGameStore } from "@/store/gameStore";
import { R2_BASE_URL } from "@/lib/sceneProps";

const SFX_CACHE = new Map<string, Howl>();

// Tune each background independently so louder tracks can be normalized here
// while still respecting the global music slider.
const BACKGROUND_VOLUME_MULTIPLIERS: Record<string, number> = {
  main: 0.8,
  "resume-cv": 0.3,
  "who-am-i": 0.15,
  "social-handles": 0.22,
  "jewelry-cad": 0.26,
  "video-editing": 0.26,
  "game-dev": 0.3,
  "about-me": 0.3,
  "ai-journey": 0.3,
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
  const overall66SoundTriggeredRef = useRef(false);
  const whoAmiSoundTriggeredRef = useRef(false);
  const resumeCvSoundTriggeredRef = useRef(false);
  const resumeCv63SoundTriggeredRef = useRef(false);
  const socialHandlesSoundTriggeredRef = useRef(false);
  const aboutMeSoundTriggeredRef = useRef(false);
  const videoEditingSoundTriggeredRef = useRef(false);
  const aiJourneySoundTriggeredRef = useRef(false);
  const bgNeedsRestartRef = useRef(true);
  const sliceLoopRef = useRef<Howl | null>(null);
  const previousProgressRef = useRef(overallProgress);
  const musicVolumeRef = useRef(musicVolume);
  const masterVolumeRef = useRef(masterVolume);
  const sfxVolumeRef = useRef(sfxVolume);
  const isMutedRef = useRef(isMuted);

  // Update refs when values change
  useEffect(() => {
    musicVolumeRef.current = musicVolume;
  }, [musicVolume]);
  useEffect(() => {
    masterVolumeRef.current = masterVolume;
  }, [masterVolume]);
  useEffect(() => {
    sfxVolumeRef.current = sfxVolume;
  }, [sfxVolume]);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

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

  // Background music (Howler) - only handles source changes
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
      "resume-cv": `${R2_BASE_URL}/audio/bg2.mp3`,
      "who-am-i": `${R2_BASE_URL}/audio/bg3.mp3`,
      "social-handles": `${R2_BASE_URL}/audio/bg4.mp3`,
      "jewelry-cad": `${R2_BASE_URL}/audio/bg5.mp3`,
      "video-editing": `${R2_BASE_URL}/audio/bg6.mp3`,
      "game-dev": `${R2_BASE_URL}/audio/bg7.mp3`,
      "about-me": `${R2_BASE_URL}/audio/bg8.mp3`,
      "ai-journey": `${R2_BASE_URL}/audio/bg9.mp3`,
    };

    const bgKey = trackContext === "branch" && activeBranch?.id ? activeBranch.id : "main";
    const targetSrc = bgKey === "main" ? `${R2_BASE_URL}/audio/bg.mp3` : BG_MAP[bgKey] ?? `${R2_BASE_URL}/audio/bg.mp3`;
    const trackMultiplier = getBackgroundVolumeMultiplier(bgKey);

    try {
      if (Howler.ctx && Howler.ctx.state === "suspended") {
        void Howler.ctx.resume();
      }
    } catch {}

    // stop and unload existing
    if (bgRef.current) {
      try {
        bgRef.current.stop();
        bgRef.current.unload();
      } catch {}
      bgRef.current = null;
      currentBgSrcRef.current = null;
    }

    // create new Howl with target volume
    const targetVol = isMutedRef.current ? 0 : musicVolumeRef.current * masterVolumeRef.current * trackMultiplier;
    const howl = new Howl({
      src: [targetSrc],
      loop: true,
      volume: targetVol,
      html5: true,
    });
    bgRef.current = howl;
    currentBgSrcRef.current = targetSrc;

    const playWhenReady = () => {
      try {
        howl.play();
      } catch (e) {
        console.error("Failed to play audio:", e);
      }
    };
    howl.once("load", playWhenReady);
    // Try playing immediately
    try {
      howl.play();
    } catch (e) {
      console.error("Failed to play audio immediately:", e);
    }
    if (howl.state && howl.state() === "loaded") playWhenReady();

    return () => {
      try { howl.unload(); } catch {}
      if (currentBgSrcRef.current === targetSrc) currentBgSrcRef.current = null;
      bgRef.current = null;
    };
  }, [activeBranch, trackContext, isSceneLoading]);

  // Update background music volume without recreating
  useEffect(() => {
    if (bgRef.current) {
      const bgKey = trackContext === "branch" && activeBranch?.id ? activeBranch.id : "main";
      const trackMultiplier = getBackgroundVolumeMultiplier(bgKey);
      const targetVolume = isMuted ? 0 : musicVolume * masterVolume * trackMultiplier;
      bgRef.current.volume(targetVolume);
    }
  }, [musicVolume, masterVolume, isMuted, trackContext, activeBranch?.id]);

  // Cart movement loop. Starts only while the cart is actually moving.
  useEffect(() => {
    const shouldPlay = !isSceneLoading && gameState === "RIDING" && isCartMoving;
    const targetVolume = shouldPlay ? (isMuted ? 0 : Math.max(0, Math.min(1, sfxVolume * masterVolume * 0.15))) : 0;

    if (shouldPlay) {
      if (!cartWasMovingRef.current || !cartRef.current) {
        try {
          cartRef.current?.stop();
          cartRef.current?.unload();
        } catch {}

        cartRef.current = new Howl({
          src: [`${R2_BASE_URL}/audio/cart-sound.mp3`],
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
        src: [`${R2_BASE_URL}/audio/sfx/${filename}`],
        volume: isMuted ? 0 : sfxVolume * masterVolume,
        html5: true,
        pool: 8,
      });
      SFX_CACHE.set(key, howl);
    }
    howl.volume(isMuted ? 0 : sfxVolume * masterVolume);
    howl.play();
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

  // Play the 66% overall milestone cue once.
  useEffect(() => {
    const milestone = 0.66;

    if (overallProgress < milestone) {
      overall66SoundTriggeredRef.current = false;
      return;
    }

    if (overall66SoundTriggeredRef.current) return;

    overall66SoundTriggeredRef.current = true;
    playSfx("760657__humanpaperclip__creepy-laughter-female-0101-e.mp3");
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

  // Play a Resume CV cue once when the branch reaches 43% progress.
  useEffect(() => {
    const isResumeCvPath = trackContext === "branch" && activeBranch?.id === "resume-cv";
    const milestone = 0.43;

    if (!isResumeCvPath) {
      resumeCvSoundTriggeredRef.current = false;
      return;
    }

    if (branchProgress < milestone) return;
    if (resumeCvSoundTriggeredRef.current) return;

    resumeCvSoundTriggeredRef.current = true;
    playSfx("3.mp3");
  }, [activeBranch?.id, branchProgress, trackContext]);

  // Play a Resume CV cue once when the branch reaches 63% progress.
  useEffect(() => {
    const isResumeCvPath = trackContext === "branch" && activeBranch?.id === "resume-cv";
    const milestone = 0.63;

    if (!isResumeCvPath) {
      resumeCv63SoundTriggeredRef.current = false;
      return;
    }

    if (branchProgress < milestone) return;
    if (resumeCv63SoundTriggeredRef.current) return;

    resumeCv63SoundTriggeredRef.current = true;
    playSfx("404920__coldvet__dog-growl-beast-creature.mp3");
  }, [activeBranch?.id, branchProgress, trackContext]);

  // Play an AI Journey cue once when the branch reaches 43% progress.
  useEffect(() => {
    const isAiJourneyPath = trackContext === "branch" && activeBranch?.id === "ai-journey";
    const milestone = 0.43;

    if (!isAiJourneyPath) {
      aiJourneySoundTriggeredRef.current = false;
      return;
    }

    if (branchProgress < milestone) return;
    if (aiJourneySoundTriggeredRef.current) return;

    aiJourneySoundTriggeredRef.current = true;
    playSfx("3.mp3");
  }, [activeBranch?.id, branchProgress, trackContext]);

  // Play a Social Handles cue once when the branch reaches 69% progress.
  useEffect(() => {
    const isSocialHandlesPath = trackContext === "branch" && activeBranch?.id === "social-handles";
    const milestone = 0.69;

    if (!isSocialHandlesPath) {
      socialHandlesSoundTriggeredRef.current = false;
      return;
    }

    if (branchProgress < milestone) return;
    if (socialHandlesSoundTriggeredRef.current) return;

    socialHandlesSoundTriggeredRef.current = true;
    playSfx("245412__peridactyloptrix__demonic-voice-2.mp3");
  }, [activeBranch?.id, branchProgress, trackContext]);

  // Play an About Me cue once when the branch reaches 68% progress.
  useEffect(() => {
    const isAboutMePath = trackContext === "branch" && activeBranch?.id === "about-me";
    const milestone = 0.68;

    if (!isAboutMePath) {
      aboutMeSoundTriggeredRef.current = false;
      return;
    }

    if (branchProgress < milestone) return;
    if (aboutMeSoundTriggeredRef.current) return;

    aboutMeSoundTriggeredRef.current = true;
    playSfx("271628__carmsie__i-own-you.mp3");
  }, [activeBranch?.id, branchProgress, trackContext]);

  // Play a Video Editing cue once when the branch reaches 69% progress.
  useEffect(() => {
    const isVideoEditingPath = trackContext === "branch" && activeBranch?.id === "video-editing";
    const milestone = 0.69;

    if (!isVideoEditingPath) {
      videoEditingSoundTriggeredRef.current = false;
      return;
    }

    if (branchProgress < milestone) return;
    if (videoEditingSoundTriggeredRef.current) return;

    videoEditingSoundTriggeredRef.current = true;
    playSfx("718345__rydra_wong__distorted-female-and-male-laughter.mp3");
  }, [activeBranch?.id, branchProgress, trackContext]);

  // Play slice.mp3 in a loop from 83% to 93% overall progress
  useEffect(() => {
    const startThreshold = 0.83;
    const endThreshold = 0.93;
    const prevProgress = previousProgressRef.current;
    const currentProgress = overallProgress;

    const wasInRange = prevProgress >= startThreshold && prevProgress <= endThreshold;
    const isInRange = currentProgress >= startThreshold && currentProgress <= endThreshold;
    const enteredRange = !wasInRange && isInRange;
    const exitedRange = wasInRange && !isInRange;

    previousProgressRef.current = currentProgress;

    if (enteredRange) {
      try {
        if (Howler.ctx && Howler.ctx.state === "suspended") {
          void Howler.ctx.resume();
        }
      } catch {}

      if (!sliceLoopRef.current) {
        const targetVol = isMutedRef.current ? 0 : sfxVolumeRef.current * masterVolumeRef.current;
        const howl = new Howl({
          src: [`${R2_BASE_URL}/audio/sfx/slice.mp3`],
          loop: true,
          volume: targetVol,
          html5: true,
        });
        sliceLoopRef.current = howl;
        try {
          howl.play();
        } catch (e) {
          console.error("Failed to play slice loop:", e);
        }
      }
    } else if (exitedRange) {
      if (sliceLoopRef.current) {
        try {
          sliceLoopRef.current.stop();
          sliceLoopRef.current.unload();
        } catch {}
        sliceLoopRef.current = null;
      }
    }
  }, [overallProgress]);

  // Update slice loop volume
  useEffect(() => {
    if (sliceLoopRef.current) {
      sliceLoopRef.current.volume(isMuted ? 0 : sfxVolume * masterVolume);
    }
  }, [sfxVolume, masterVolume, isMuted]);

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
