import { Edge } from '../types';

// This isn't strict about direction.
export function edgesAreEqual(a: Edge, b: Edge): boolean {
  return (a.start.id === b.start.id && a.end.id === b.end.id) ||
    (a.start.id === b.end.id && a.end.id === b.start.id);
} 

