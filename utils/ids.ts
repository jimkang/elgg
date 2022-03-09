import { Pt, Edge } from '../types';

export function getEdgeId(edge: Edge): string {
  return `edge-${edge.start.id}-to-${edge.end.id}`;
}

export function getPtId(pt: Pt): string {
  return pt[0] + ',' + pt[1];
}

