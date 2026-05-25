import { CatmullRomCurve3, Vector3 } from "three";

/**
 * Create a simple curved path using CatmullRomCurve3.
 * The tunnel is intentionally kept flat so the cart, track, and camera stay in the same plane.
 */
export const createTunnelCurve = (points: Vector3[]): CatmullRomCurve3 => {
  const curve = new CatmullRomCurve3(points);
  curve.curveType = "catmullrom";
  curve.tension = 0.5;
  return curve;
};

/**
 * Generate initial demo tracks for the portfolio journey.
 */
export const generateDemoTracks = () => {
  const scale = 0.8;

  const scalePoints = (points: Vector3[]) =>
    points.map((p) => new Vector3(p.x * scale, p.y, p.z * scale));

  const mainTrack = createTunnelCurve(
    scalePoints([
      new Vector3(0, 0, 0),
      new Vector3(1, 0, 12),
      new Vector3(2, 0, 26),
      new Vector3(2, 0, 40),
    ])
  );

  const whoAmIPath = createTunnelCurve(
    scalePoints([
      new Vector3(2, 0, 40),
      new Vector3(-3, 0, 52),
      new Vector3(-8, 0, 62),
      new Vector3(-12, 0, 72),
    ])
  );

  const continueMain1 = createTunnelCurve(
    scalePoints([
      new Vector3(2, 0, 40),
      new Vector3(2, 0, 52),
      new Vector3(2, 0, 62),
      new Vector3(2, 0, 72),
    ])
  );

  const resumeCvPath = createTunnelCurve(
    scalePoints([
      new Vector3(2, 0, 72),
      new Vector3(8, 0, 84),
      new Vector3(14, 0, 96),
      new Vector3(20, 0, 108),
    ])
  );

  const socialHandlesPath = createTunnelCurve(
    scalePoints([
      new Vector3(2, 0, 72),
      new Vector3(-4, 0, 84),
      new Vector3(-10, 0, 96),
      new Vector3(-16, 0, 108),
    ])
  );

  const continueMain2 = createTunnelCurve(
    scalePoints([
      new Vector3(2, 0, 72),
      new Vector3(2, 0, 84),
      new Vector3(2, 0, 96),
      new Vector3(2, 0, 108),
    ])
  );

  const aboutMePath = createTunnelCurve(
    scalePoints([
      new Vector3(2, 0, 108),
      new Vector3(-4, 0, 120),
      new Vector3(-10, 0, 132),
      new Vector3(-16, 0, 144),
    ])
  );

  const continueMain3 = createTunnelCurve(
    scalePoints([
      new Vector3(2, 0, 108),
      new Vector3(2, 0, 120),
      new Vector3(2, 0, 132),
      new Vector3(2, 0, 144),
    ])
  );

  const jewelryCadPath = createTunnelCurve(
    scalePoints([
      new Vector3(2, 0, 144),
      new Vector3(-10, 0, 156),
      new Vector3(-22, 0, 168),
      new Vector3(-34, 0, 180),
    ])
  );

  const videoEditingPath = createTunnelCurve(
    scalePoints([
      new Vector3(2, 0, 144),
      new Vector3(-2, 0, 156),
      new Vector3(-6, 0, 168),
      new Vector3(-10, 0, 180),
    ])
  );

  const gameDevPath = createTunnelCurve(
    scalePoints([
      new Vector3(2, 0, 144),
      new Vector3(6, 0, 156),
      new Vector3(10, 0, 168),
      new Vector3(14, 0, 180),
    ])
  );

  const aiJourneyPath = createTunnelCurve(
    scalePoints([
      new Vector3(2, 0, 144),
      new Vector3(10, 0, 156),
      new Vector3(18, 0, 168),
      new Vector3(26, 0, 180),
    ])
  );

  return {
    mainTrack,
    firstPaths: [
      {
        id: "who-am-i",
        label: "Who Am I",
        curve: whoAmIPath,
        nextPaths: [
          {
            id: "continue-main-1",
            label: "Continue on Main",
            curve: continueMain1,
            nextPaths: [
              { id: "resume-cv", label: "Resume/CV", curve: resumeCvPath },
              { id: "social-handles", label: "Social Handles", curve: socialHandlesPath },
              {
                id: "continue-main-2",
                label: "Continue on Main",
                curve: continueMain2,
                nextPaths: [
                  { id: "about-me", label: "About Me", curve: aboutMePath },
                  {
                    id: "continue-main-3",
                    label: "Continue",
                    curve: continueMain3,
                    nextPaths: [
                      { id: "jewelry-cad", label: "Jewelry CAD World", curve: jewelryCadPath },
                      { id: "video-editing", label: "Video Editing World", curve: videoEditingPath },
                      { id: "game-dev", label: "Game Dev World", curve: gameDevPath },
                      { id: "ai-journey", label: "AI Journey", curve: aiJourneyPath },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
};
