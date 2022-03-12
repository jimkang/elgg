import { Pt, Edge, MapNode, Tile } from '../types';
import { kruskal } from 'kruskal-mst';
import { getNByNGraph } from './get-nxn';
import { range } from 'd3-array';
import curry from 'lodash.curry';
import sortedUniqBy from 'lodash.sorteduniqby';
import { getPtId, getEdgeId } from '../utils/ids';
import { edgesAreEqual } from '../utils/comparisons';

export function makeMap({ prob, width, height }:
  { prob; width: number; height: number }) {
  
  var edgeWidthTable = prob.createTableFromSizes([[4, 1], [2, 2], [1, 3]]);

  const nodeCount = prob.rollDie(6) + prob.rollDie(6) + prob.rollDie(6);
  var mapNodes: Record<string, MapNode>  = {};
  for (var i = 0; i < nodeCount; ++i) {
    const radius = prob.rollDie(3); 
    const x = radius + prob.roll(width - 2 * radius);
    const y = radius + prob.roll(height- 2 * radius);
    const pt: Pt = [x, y];
    const id = getPtId(pt);
    mapNodes[id] = { id, pt, radius };
  }
 
  console.log('mapNodes', mapNodes);

  var allEdges: Edge[] = getNByNGraph({ points: Object.values(mapNodes) });
  console.log('allEdges', allEdges);

  var mstEdges = kruskal(allEdges as []) as Edge[];
  console.log('mstEdges', mstEdges);

  var extraEdges = allEdges.filter((edge: Edge) => !mstEdges.find(mstEdge => edgesAreEqual(mstEdge, edge)));
  const extraEdgeLimit = Math.floor(mstEdges.length/2);
  const extraEdgeCount = prob.roll(extraEdgeLimit);
  // Not a deep clone.
  var edges = mstEdges.concat(prob.sample(extraEdges, extraEdgeCount));
  // Add variable widths.
  edges.forEach((edge: Edge) => edge.width = edgeWidthTable.roll());
  console.log('edges', edges);

  var edgeTiles = sortedUniqBy(
    tileEdges({ edges, tileSize: 1 }),
    tile => tile.id
  );
  console.log('edgeTiles', edgeTiles);

  var nodeTiles = sortedUniqBy(
    tileMapNodes({ nodes: Object.values(mapNodes), tileSize: 1 }),
    tile => tile.id
  );
  console.log('nodeTiles', nodeTiles);

  return { mapNodes, edges, edgeTiles, nodeTiles };
}

function tileEdges({ edges, tileSize }: { edges: Edge[]; tileSize: number }): Tile[] {
  var tileGroups = edges.map(curry(tileEdge)(tileSize));
  return tileGroups.flat() as Tile[];
}

// This is sort of like Bresenham's line-scanning algorithm, except that we select
// both coordinates that the line is adjacent to instead of picking one or the
// other.
function tileEdge(tileSize: number, edge: Edge): Tile[] {
  const dx = edge.end.pt[0] - edge.start.pt[0];
  const dy = edge.end.pt[1] - edge.start.pt[1];
  const traditionalSlope = dy/dx;
  // If traditionalSlope is greater than 1, use y as the domain, for finer-grain traversal.
  // If it's less than 1, use x as the domain.
  
  let domainIndex = 0;
  let rangeIndex = 1;
  let slope = traditionalSlope;
  let domainSign = dx > 0 ? 1 : -1;
  if (Math.abs(traditionalSlope) > 1) { 
    domainIndex = 1;
    rangeIndex = 0 ;
    slope =  1/traditionalSlope;
    domainSign = dy > 0 ? 1 : -1;
  } 
   
  var domainValues = range(
    edge.start.pt[domainIndex],
    // Include the endpoint.
    edge.end.pt[domainIndex] + domainSign,
    domainSign * tileSize
  );
  console.log('domainValues for', edge.start.pt, 'to', edge.end.pt, ':', domainValues);

  const sourceId = getEdgeId(edge);
  const domain0 = edge.start.pt[domainIndex];
  const range0 = edge.start.pt[rangeIndex];
  const minWidth = Math.max(edge.width, Math.abs(slope) === 1 ? 2 : 1);

  return domainValues
    .map(getTilesAtPoint)
    .flat();

  function getTilesAtPoint(domainElement: number) {
    const rangeCenter = slope * (domainElement - domain0) + range0;
    const rangeLowerBound = Math.round(rangeCenter - minWidth/2);
    // If minWidth is 1 and the rangeElement falls between whole numbers,
    // we're just going end have two tiles end cover that.
    let minElements = minWidth;
    if (minElements < 2 && rangeCenter !== Math.floor(rangeCenter)) {
      minElements = 2;
    }
    var rangeElements: number[] = range(rangeLowerBound, rangeLowerBound + minElements);

    return rangeElements.map(makeTileAtPoint);

    function makeTileAtPoint(rangeElement) {
      let pt: Pt = [0, 0];
      pt[domainIndex] = domainElement;
      pt[rangeIndex] = rangeElement;
      return makeTile(pt, sourceId, tileSize); 
    }
  }
}

function tileMapNodes({ nodes, tileSize }: { nodes: MapNode[]; tileSize: number }): Tile[] {
  var tileGroups = nodes.map(curry(tileMapNode)(tileSize));
  return tileGroups.flat() as Tile[];
}

function tileMapNode(tileSize: number, node: MapNode): Tile[] {
  const rSq = node.radius * node.radius;
  // Tile a quarter circle.
  var quarterCircleBorder: Pt[] = range(0, node.radius + 1)
    .map(x => [x, Math.sqrt(rSq - x * x)]);

  var quarterCirclePts: Pt[] = [];
  for (let i = 0; i < quarterCircleBorder.length; ++i) {
    let borderPt: Pt = quarterCircleBorder[i];
    const yMax = borderPt[1];
    for (let y = 0; y <= yMax; ++y) {
      quarterCirclePts.push([borderPt[0], y]);
    }
  }

  // Reflect it to fill out the rest of the circle.
  var preOffsetPts: Pt[] = quarterCirclePts.slice()
    .concat(quarterCirclePts.map(([x, y]) => [-x, y]))
    .concat(quarterCirclePts.map(([x, y]) => [-x, -y]))
    .concat(quarterCirclePts.map(([x, y]) => [x, -y]));

  preOffsetPts = sortedUniqBy(preOffsetPts, getPtId);
 
  var pts: Pt[] = preOffsetPts.map(pt => [pt[0] + node.pt[0], pt[1] + node.pt[1]]);
  return pts.map(pt => makeTile(pt, node.id, tileSize));
}

function makeTile(pt: Pt, sourceId: string, length: number): Tile {
  return     {
    id: `tile-${getPtId(pt)}`,
    sourceId,
    sourceType: 'Edge',
    length,
    pt
  };
}

