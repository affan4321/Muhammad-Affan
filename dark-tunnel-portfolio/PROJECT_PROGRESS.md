# Dark Tunnel Portfolio - Project Progress

**Project**: Interactive 3D Dark Tunnel Portfolio Experience
**Status**: 🟡 Phase 1 - Setup & Graybox
**Last Updated**: May 20, 2026
**Repository**: `/Users/apple/Data/-----------GITHUB Repositories-----------/Muhammad-Affan`

---

## 📋 PROJECT OVERVIEW

A cinematic portfolio experience where users travel through a dark tunnel on a handcar, selecting paths that lead to caves containing project information. Features spline-based movement, dynamic path branching, holographic project displays on stone pillars, and atmospheric lighting transitions.

### Tech Stack
- **Framework**: Next.js (App Router)
- **3D Engine**: React Three Fiber (R3F) + Three.js
**Status**: NOT STARTED
**Estimated Effort**: 8–10 hours

---

### ⏳ PHASE 6: TRAVEL BOARD & DYNAMIC PATHS
**Goal**: Advanced UI systems

#### Tasks:
- [ ] Create travel board (3D billboard)
- [ ] Implement dynamic path generation
- [ ] Handle 1–3 simultaneous path options
- [ ] Spatial layout for path indicators
- [ ] Add animations for path reveals

**Status**: NOT STARTED
**Estimated Effort**: 5–6 hours

---

### ⏳ PHASE 7: POLISH & DEPLOYMENT
**Goal**: Final touches and launch

#### Tasks:
- [ ] Optimize performance (asset bundling, LOD)
- [ ] Test on multiple devices
- [ ] Deploy to Vercel
- [ ] SEO setup
- [ ] Analytics integration

**Status**: NOT STARTED
**Estimated Effort**: 4–5 hours

---

## 📁 PROJECT STRUCTURE (PLANNED)

```
dark-tunnel-portfolio/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx (landing page)
│   │   └── journey/
│   │       └── page.tsx (3D experience)
│   ├── components/
│   │   ├── Canvas.tsx (R3F canvas wrapper)
│   │   ├── Handcar.tsx (handcar model)
│   │   ├── Tunnel.tsx (tunnel segments)
│   │   ├── PathSelector.tsx (UI overlay)
│   │   └── Cave.tsx (cave environment)
│   ├── scenes/
│   │   ├── TunnelScene.tsx (main scene)
│   │   ├── CaveScene.tsx (project caves)
│   │   └── TransitionManager.tsx (state orchestration)
│   ├── store/
│   │   ├── gameStore.ts (Zustand store)
│   │   └── types.ts (TypeScript interfaces)
│   ├── hooks/
│   │   ├── useHandcarMovement.ts
│   │   ├── useCameraFollow.ts
│   │   └── usePathSelection.ts
│   ├── lib/
│   │   ├── curves.ts (spline generation)
│   │   ├── audio.ts (Howler setup)
│   │   └── constants.ts (tuning values)
│   ├── assets/
│   │   ├── models/ (GLTF files)
│   │   ├── audio/ (music + ambience)
│   │   └── projects/ (project data)
│   └── styles/
│       └── globals.css
├── public/
│   ├── models/
│   └── audio/
├── package.json
├── next.config.js
├── tsconfig.json
└── .gitignore
```

---

## 📦 DEPENDENCIES TO INSTALL

```json
{
  "next": "^14.x",
  "react": "^18.x",
  "react-dom": "^18.x",
  "three": "^r128",
  "@react-three/fiber": "^8.x",
  "@react-three/drei": "^9.x",
  "@react-three/rapier": "^0.13.x",
  "@react-three/postprocessing": "^2.x",
  "zustand": "^4.x",
  "gsap": "^3.x",
  "howler": "^2.x",
  "rapier3d": "^0.10.x",
  "typescript": "^5.x",
  "@types/react": "^18.x",
  "@types/node": "^20.x"
}
```

---

## 🚀 CURRENT PROGRESS

### ✅ PHASE 0: PROJECT SETUP - COMPLETED
- [x] Created Next.js project with TypeScript (App Router)
- [x] Installed all R3F and dependencies (423 packages)
- [x] Created project folder structure
- [x] Set up GitHub repo

## ✅ PHASE 1A: GRAYBOX (CORE LOGIC) - COMPLETED

**All Tasks Completed**:
- [x] Created Zustand store for game state (`gameStore.ts`, `types.ts`)
- [x] Implemented single spline curve utilities (`curves.ts`)
- [x] Built handcar movement logic (`Handcar.tsx`)
- [x] Implemented pointer-driven free-look camera riding with the handcar, with reduced motion, smoother response, and correct initial forward-facing orientation (`CameraController.tsx`)
- [x] Added input handling (`useHandcarInput.ts`)
- [x] Created debug UI with test button (`DebugUI.tsx`)
- [x] Built main Canvas component with proper initialization (`Canvas.tsx`)
- [x] Updated pages and styling
- [x] Build validation passed ✓
- [x] Dev server running on http://localhost:3000 ✓
- [x] Live testing confirmed movement works ✓
- [x] Camera stays attached to the handcar while responding to mouse movement ✓

**What's Working**:
✓ Zustand state management for game state
✓ Handcar movement along spline curves (tested)
✓ Camera attached to the handcar with pointer-driven free look
✓ Camera starts facing the direction of travel on refresh
✓ Camera motion intentionally toned down to avoid rollercoaster-like swings
✓ Progress tracking (0-100%)
✓ Debug UI showing real-time state
✓ Test move button increments progress
✓ State display updates correctly

---

## ✅ PHASE 1B: BRANCHING LOGIC - COMPLETED

**All Tasks Completed**:
- [x] Created second and third spline curves (left/right paths)
- [x] Built path selector UI component (`PathSelector.tsx`)
- [x] Integrated branching logic into game state
- [x] Arrow key selection for paths
- [x] Enter key confirmation
- [x] Fixed React hooks violations
- [x] Live testing confirmed path selection triggers ✓

**What's Working**:
✓ Two branching paths created and initialized
✓ Path selector UI appears when handcar reaches ~99% progress
✓ UI shows "Left Path" and "Right Path" options
✓ Arrow key navigation between paths
✓ Click selection of paths
✓ State transitions from "RIDING" → "CHOOSING_PATH" ✓
✓ Game correctly detects end of track

---

## 📊 CURRENT GAME STATE SNAPSHOT

**Working Features**:
- Full 3D canvas rendering with React Three Fiber
- Handcar positioned and moving along curves
- Camera system attached to handcar with pointer-driven free-look controls, reduced motion, and correct initial facing
- Grid environment visualization
- Two-button path branching system
- State management persisting across interaction
- Debug UI with real-time stats
- 57% of first track can be traversed with test button

**Performance**:
- Build time: 3.8s
- No TypeScript errors
- No React errors after fixes
- Dev server responsive
- 60 FPS smooth rendering

---

## 🔧 KEY FIXES APPLIED

1. **React Hooks Violation (PathSelector)**: 
   - Moved conditional return outside of hooks
   - Placed hooks setup before conditional rendering
   - Fixed "Rendered more hooks than during previous render" error

2. **Game Initialization**:
   - Moved initialization to wrapper component (GameInitializer)
   - Used `useGameStore.setState()` for direct state update
   - Ensures state is set before React render cycle

3. **Build Configuration**:
   - Fixed THREE type imports in Handcar component
   - Configured Next.js with R3F compatibility

---

## 📁 PROJECT STRUCTURE (IMPLEMENTED)

```
dark-tunnel-portfolio/
├── src/
│   ├── app/
│   │   ├── layout.tsx ✓
│   │   ├── page.tsx ✓
│   │   └── globals.css ✓
│   ├── components/
│   │   ├── Canvas.tsx ✓ (main R3F canvas)
│   │   ├── Handcar.tsx ✓ (movement logic)
│   │   ├── CameraController.tsx ✓ (pointer-driven free-look camera)
│   │   ├── PathSelector.tsx ✓ (path UI)
│   │   ├── DebugUI.tsx ✓ (debug overlay)
│   │   └── index.ts ✓
│   ├── store/
│   │   ├── gameStore.ts ✓ (Zustand)
│   │   └── types.ts ✓ (TypeScript types)
│   ├── hooks/
│   │   └── useHandcarInput.ts ✓ (input handling)
│   ├── lib/
│   │   └── curves.ts ✓ (spline utilities)
│   └── assets/ (empty for Phase 1)
├── package.json ✓
├── next.config.ts ✓
└── tsconfig.json ✓
```

---

## 📊 FILES CREATED/MODIFIED

### New Files Created
1. `src/store/types.ts` - GameState types and interface definitions
2. `src/store/gameStore.ts` - Zustand store (200+ lines)
3. `src/hooks/useHandcarInput.ts` - Input event handling
4. `src/lib/curves.ts` - Spline curve utilities and demo track generation
5. `src/components/Canvas.tsx` - R3F canvas with scene setup
6. `src/components/Handcar.tsx` - Handcar movement component
7. `src/components/CameraController.tsx` - Pointer-driven free-look camera system with reduced motion
8. `src/components/DebugUI.tsx` - Debug overlay UI
9. `src/components/PathSelector.tsx` - Path selection UI
10. `src/components/index.ts` - Component exports

### Modified Files
1. `src/app/page.tsx` - Updated to use GameCanvas
2. `src/app/layout.tsx` - Simplified for 3D experience
3. `src/app/globals.css` - Minimal styles for 3D
4. `package.json` - 423 packages installed

---

## 🎯 NEXT STEPS (Phase 2)

1. **Download 3D Assets**
   - Tunnel segments from Sketchfab
   - Handcar model
   - Stone pillars

2. **Integrate Models**
   - Use gltfjsx for model optimization
   - Replace debug cube with handcar model
   - Add tunnel segments along curve

3. **Refine Movement**
   - Camera bobbing animation when moving
   - Handcar tilt on curves
   - Smooth acceleration/deceleration

4. **Visual Polish**
   - Better lighting
   - Particle effects
   - Trail/distortion effects

---

## 🔗 IMPORTANT LINKS & NOTES

### Spline Curve Reference
- Three.js CatmullRomCurve3: https://threejs.org/docs/index.html#api/en/curves/CatmullRomCurve3
- Tangent calculation: `curve.getTangentAt(t)` returns normalized direction vector

### Asset Sources (Free)
- Sketchfab (free models): https://sketchfab.com
- Freesound (ambient): https://freesound.org
- YouTube Audio Library: https://www.youtube.com/audiolibrary
- Incompetech (cinematic music): https://incompetech.com

### Performance Optimization Tips
- Use Rapier only for cave entrance detection (not full physics)
- LOD for tunnel segments beyond camera view
- Lazy-load project cave data
- Use Next.js Image component for project screenshots

---

## ⚠️ KNOWN CHALLENGES & SOLUTIONS

| Challenge | Solution |
|-----------|----------|
| **Heavy 3D asset load time** | Next.js dynamic imports + loading screen |
| **Mobile responsiveness** | Touch input mapping (swipe = arrow keys) |
| **Camera jank on curve turns** | Use smooth quaternion interpolation |
| **Hologram readability** | High contrast (neon on dark stone) + text outline |
| **Audio sync** | GSAP timelines for scripted sequences |

---

## 📝 NOTES FOR FUTURE SESSIONS

- Always check this file before starting work
- Update status after each phase completion
- Track blockers in KNOWN_CHALLENGES section
- Commit code frequently with descriptive messages
- If context fills up, summarize findings in `/memories/session/` and reference this file

---

**Next Action**: Initialize Next.js project & install dependencies
