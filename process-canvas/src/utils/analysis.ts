import type { ProcessGraph, ProcessStep } from '../types';

export interface ProcessAnalysis {
  totalSteps: number;
  roleCount: number;
  decisionCount: number;
  unassignedSteps: ProcessStep[];
  loopCount: number;
  checkpointSteps: ProcessStep[];
}

export function analyzeProcess(graph: ProcessGraph): ProcessAnalysis {
  const { steps, links } = graph;
  const roles = new Set(steps.map((s) => s.role).filter((r) => r !== '담당자 미지정'));
  const orderById = new Map(steps.map((s) => [s.id, s.order]));

  // a "loop" is an edge that points back to an earlier step, not merely a
  // failure branch that still moves the process forward
  const loopCount = links.filter((l) => {
    const sourceOrder = orderById.get(l.source);
    const targetOrder = orderById.get(l.target);
    return sourceOrder !== undefined && targetOrder !== undefined && targetOrder < sourceOrder;
  }).length;

  return {
    totalSteps: steps.length,
    roleCount: roles.size,
    decisionCount: steps.filter((s) => s.kind === 'decision').length,
    unassignedSteps: steps.filter((s) => s.role === '담당자 미지정'),
    loopCount,
    checkpointSteps: steps.filter((s) => s.checkpoints.trim().length > 0),
  };
}
