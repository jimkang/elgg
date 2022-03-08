import math from 'basic-2d-math';
import { IdPt, Edge } from './types';

// Creates edges between every point and every other point in points.
export function getNByNGraph(
  { points, startProp = 'from', destProp = 'to', distProp = 'weight' }:
  { points: IdPt[]; startProp?: string; destProp?: string; distProp?: string } 
): Edge[] {
  var graph: Edge = [];
  points.forEach(createEdgesToOtherPoints);
  return graph;

  function createEdgesToOtherPoints(src: IdPt, i: number) {
    for (let j = 0; j < points.length; ++j) {
      if (i !== j) {
        let dest = points[j];
        graph.push({
          [startProp]: src.id,
          [destProp]: dest.id,
          [distProp]: math.getVectorMagnitude(math.subtractPairs(src.pt, dest.pt))
        });
      }
    }
  }
}

