import math from 'basic-2d-math';
import { IdPt, Edge } from '../types';

// Creates edges between every point and every other point in points.
export function getNByNGraph({ points }: { points: IdPt[] }): Edge[] {
  var graph: Edge[] = [];
  points.forEach(createEdgesToOtherPoints);
  return graph;

  function createEdgesToOtherPoints(src: IdPt, i: number) {
    for (let j = 0; j < points.length; ++j) {
      if (i !== j) {
        let dest = points[j];
        let edge: Edge = {
          start: src,
          end: dest,
          from: src.id,
          to: dest.id,
          weight: math.getVectorMagnitude(math.subtractPairs(src.pt, dest.pt)),
          width: 1
        };
        graph.push(edge);
      }
    }
  }
}

