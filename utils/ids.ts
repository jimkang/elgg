import { Pt, Edge } from '../types';

export function getEdgeId(edge: Edge): string {
  return `edge-${edge.from.id}-to-${edge.to.id}`;
}

export function getPtId(pt: Pt): string {
  return pt[0] + ',' + pt[1];
}

