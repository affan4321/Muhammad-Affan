/**
 * First-person rig tuning — adjust these to fit cart.glb + arms.glb.
 *
 * - Eye height = camera.position[1]  (NOT cart.position[1])
 * - cart.position moves the cart MESH only
 * - Saves apply on every frame (hot reload friendly)
 * 
 * Mobile-optimized: Touch camera movement is handled in CameraController.tsx
 * with mobile-specific sensitivity tuning for smooth freehand control
 */
export const CART_RIG = {
  cart: {
    scale: 0.016,
    position: [0, -0.25, -0.12] as [number, number, number],
  },
  camera: {
    position: [0, 1.7, -0.4] as [number, number, number],
    rotation: [-0.065, 0, 0] as [number, number, number],
    fov: 72,
  },
  arms: {
    scale: 0.018,
    position: [0, -0.01, -0.15] as [number, number, number],
    rotation: [-0.5, Math.PI, 0] as [number, number, number],
  },
  trackOffsetY: 0.05,
  /** How fast cart yaw catches the track tangent (0–1 per frame). */
  turnSmooth: 0.14,
  mouseLook: {
    sensitivity: 0.0028,
    pitchMin: -1.15,
    pitchMax: 0.5,
    smooth: 0.14,
    resetSmooth: 0.22,
    /** After this many ms without mouse move, view recenters to track forward. */
    idleMs: 999999,
    idleRecenterSmooth: 0.07,
  },
};
