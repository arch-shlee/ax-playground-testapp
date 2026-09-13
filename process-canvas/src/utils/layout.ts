import dagre from 'dagre';
import type { NodeKind, ProcessLink, ProcessStep, Role } from '../types';
import { ROLE_ORDER } from '../types';

export interface Point {
  x: number;
  y: number;
}

export const NODE_SIZE: Record<NodeKind, { width: number; height: number }> = {
  start: { width: 140, height: 64 },
  end: { width: 140, height: 64 },
  process: { width: 200, height: 76 },
  decision: { width: 180, height: 110 },
};

export function getFlowLayout(
  steps: ProcessStep[],
  links: ProcessLink[],
): Record<string, Point> {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'LR', nodesep: 56, ranksep: 96, marginx: 40, marginy: 40 });
  g.setDefaultEdgeLabel(() => ({}));

  steps.forEach((step) => {
    const size = NODE_SIZE[step.kind];
    g.setNode(step.id, { width: size.width, height: size.height });
  });
  links.forEach((link) => {
    if (g.hasNode(link.source) && g.hasNode(link.target)) {
      g.setEdge(link.source, link.target);
    }
  });

  dagre.layout(g);

  const positions: Record<string, Point> = {};
  steps.forEach((step) => {
    const pos = g.node(step.id);
    const size = NODE_SIZE[step.kind];
    positions[step.id] = pos
      ? { x: pos.x - size.width / 2, y: pos.y - size.height / 2 }
      : { x: 0, y: 0 };
  });
  return positions;
}

const LANE_HEIGHT = 180;
const COLUMN_WIDTH = 260;

export function getSwimlaneLayout(steps: ProcessStep[]): Record<string, Point> {
  const positions: Record<string, Point> = {};
  const laneIndex: Record<Role, number> = ROLE_ORDER.reduce((acc, role, i) => {
    acc[role] = i;
    return acc;
  }, {} as Record<Role, number>);

  const sorted = [...steps].sort((a, b) => a.order - b.order);
  sorted.forEach((step, colIdx) => {
    const lane = laneIndex[step.role] ?? ROLE_ORDER.length - 1;
    positions[step.id] = {
      x: 220 + colIdx * COLUMN_WIDTH,
      y: 60 + lane * LANE_HEIGHT,
    };
  });
  return positions;
}

export function getLaneY(role: Role): number {
  const idx = ROLE_ORDER.indexOf(role);
  return 60 + (idx < 0 ? ROLE_ORDER.length - 1 : idx) * LANE_HEIGHT;
}

export const SWIMLANE_LANE_HEIGHT = LANE_HEIGHT;
