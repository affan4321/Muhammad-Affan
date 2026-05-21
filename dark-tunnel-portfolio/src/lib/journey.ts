import { CatmullRomCurve3, Curve, Vector3 } from "three";
import { PathOption, JourneySegment, JourneyGraph } from "@/store/types";
import {
  assignBranchSides,
  createBranchCurve,
  createMainSpine,
  createSegmentCurve,
  headingToSide,
  junctionHeadings,
  terminalFanHeadings,
} from "./pathGeometry";

const SEGMENT_ENDS = [0.25, 0.5, 0.75, 1] as const;

export const buildJourney = (): JourneyGraph => {
  const mainSpine = createMainSpine();

  const forkAt = (spineT: number) => ({
    point: mainSpine.getPointAt(spineT),
    tangent: mainSpine.getTangentAt(spineT),
    t: spineT,
  });

  const branch = (
    id: string,
    label: string,
    curve: CatmullRomCurve3,
    headingDeg: number
  ): PathOption => ({
    id,
    label,
    curve,
    kind: "branch",
    caveId: id,
    side: headingToSide(headingDeg),
  });

  const cont = (id: string, label: string): PathOption => ({
    id,
    label,
    kind: "continue",
    side: "center",
  });

  const makeBranches = (
    defs: { id: string; label: string; headingDeg: number; length?: number }[],
    fork: Vector3,
    tangent: Vector3
  ): PathOption[] => {
    const slots = assignBranchSides(defs.length);
    return defs.map((def, i) => {
      const curve = createBranchCurve(
        fork,
        tangent,
        def.headingDeg,
        def.length ?? 28,
        slots[i]?.lateral ?? 0
      );
      return branch(def.id, def.label, curve, def.headingDeg);
    });
  };

  const [t1, t2, t3, t4] = SEGMENT_ENDS;
  const f1 = forkAt(t1);
  const f2 = forkAt(t2);
  const f3 = forkAt(t3);
  const f4 = forkAt(t4);

  const [h1] = junctionHeadings(1);
  const [h2a, h2b] = junctionHeadings(2);
  const [h3] = junctionHeadings(1);
  const fan = terminalFanHeadings();

  const segments: JourneySegment[] = [
    {
      id: "segment-1",
      mainStartT: 0,
      mainEndT: t1,
      forkLabel: "First Junction",
      forkPoint: f1.point,
      isTerminalFork: false,
      branches: makeBranches(
        [{ id: "who-am-i", label: "Who Am I", headingDeg: h1 }],
        f1.point,
        f1.tangent
      ),
      continuePath: cont("continue-main-1", "Continue on Main"),
    },
    {
      id: "segment-2",
      mainStartT: t1,
      mainEndT: t2,
      forkLabel: "Second Junction",
      forkPoint: f2.point,
      isTerminalFork: false,
      branches: makeBranches(
        [
          { id: "resume-cv", label: "Resume/CV", headingDeg: h2a },
          { id: "social-handles", label: "Social Handles", headingDeg: h2b },
        ],
        f2.point,
        f2.tangent
      ),
      continuePath: cont("continue-main-2", "Continue on Main"),
    },
    {
      id: "segment-3",
      mainStartT: t2,
      mainEndT: t3,
      forkLabel: "Third Junction",
      forkPoint: f3.point,
      isTerminalFork: false,
      branches: makeBranches(
        [{ id: "about-me", label: "About Me", headingDeg: h3 }],
        f3.point,
        f3.tangent
      ),
      continuePath: cont("continue-main-3", "Continue"),
    },
    {
      id: "segment-4",
      mainStartT: t3,
      mainEndT: t4,
      forkLabel: "Final Junction",
      forkPoint: f4.point,
      isTerminalFork: true,
      branches: makeBranches(
        [
          { id: "jewelry-cad", label: "Jewelry CAD World", headingDeg: fan[0], length: 32 },
          { id: "video-editing", label: "Video Editing World", headingDeg: fan[1], length: 30 },
          { id: "game-dev", label: "Game Dev World", headingDeg: fan[2], length: 32 },
          { id: "ai-journey", label: "AI Journey", headingDeg: fan[3], length: 34 },
        ],
        f4.point,
        f4.tangent
      ),
      continuePath: null,
    },
  ];

  return { mainSpine, segments };
};

export const getForkChoices = (segment: JourneySegment): PathOption[] => {
  const choices: PathOption[] = [...segment.branches];
  if (segment.continuePath && !segment.isTerminalFork) {
    choices.push(segment.continuePath);
  }
  return choices;
};

export const getSegmentCurve = (
  graph: JourneyGraph,
  segmentIndex: number
): Curve<Vector3> | null => {
  const segment = graph.segments[segmentIndex];
  if (!segment) return null;
  return createSegmentCurve(graph.mainSpine, segment.mainStartT, segment.mainEndT);
};

export const collectAllPathCurves = (graph: JourneyGraph): Curve<Vector3>[] => {
  const curves: Curve<Vector3>[] = [graph.mainSpine];
  for (const segment of graph.segments) {
    for (const b of segment.branches) {
      if (b.curve) curves.push(b.curve);
    }
  }
  return curves;
};

export const syncOverallProgress = (
  trackContext: "main" | "branch",
  mainSegmentIndex: number,
  segmentProgress: number,
  _completedCaves: number,
  totalCaves: number
): number => {
  const total = Math.max(1, totalCaves);
  if (trackContext === "branch") {
    return Math.min(1, mainSegmentIndex / total);
  }
  return Math.min(1, (mainSegmentIndex + segmentProgress) / total);
};
