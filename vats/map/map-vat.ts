import RouteState from 'route-state';
import handleError from 'handle-error-web';
//import render from './renderers/render'
import { createProbable as Probable } from 'probable';
import seedrandom from 'seedrandom';
import { kruskal } from 'kruskal-mst';
import { getNByNGraph } from '../../graph/get-nxn';
import { Pt, Edge, MapNode, Tile } from '../../types';
import { select } from 'd3-selection';
import { range } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import RandomId from '@jimkang/randomid';
import curry from 'lodash.curry';
import sortedUniqBy from 'lodash.sorteduniqby';

var randomid = RandomId();

var routeState = RouteState({
  followRoute,
  windowObject: window
});

(function go() {
  window.onerror = reportTopLevelError;
  routeState.routeFromHash();
})();

function followRoute({ seed }) {
  if (!seed) {
    routeState.addToRoute({ seed: randomid(8) });
    return;
  }
  var random = seedrandom(seed);
  var probable = Probable({ random });
  console.log('seed', seed);

  const width = 19;
  const height = 19;

  var { mapNodes, mstEdges, edgeTiles } = makeMap({ probable, width, height });

  renderNodes(Object.values(mapNodes), width);
  renderEdges(mstEdges, width);
  renderTiles(edgeTiles, width);
}

function makeMap({ probable, width, height }:
  { probable; width: number; height: number }) {
  
  var edgeWidthTable = probable.createTableFromSizes([ [4, 1], [2, 2], [1, 3]]);

  const nodeCount = probable.rollDie(6) + probable.rollDie(6) + probable.rollDie(6);
  var mapNodes: Record<string, MapNode>  = {};
  for (var i = 0; i < nodeCount; ++i) {
    const x = probable.roll(width);
    const y  = probable.roll(height);
    const pt: Pt = [x, y];
    const id = getPtId(pt);
    mapNodes[id] = { id, pt, radius: probable.rollDie(3) };
  }
 
  console.log('mapNodes', mapNodes);

  var allEdges = getNByNGraph({ points: Object.values(mapNodes) });
  console.log('allEdges', allEdges);

  var mstEdges = kruskal(allEdges)
    .map(({ from, to, weight }) => ({ weight, from: mapNodes[from], to: mapNodes[to] }));
  mstEdges.forEach((edge: Edge) => edge.width = edgeWidthTable.roll());
  console.log('mstEdges', mstEdges);

  var edgeTiles = sortedUniqBy(tileEdges({ edges: mstEdges, tileSize: 1 }), tile => tile.id);
  console.log('edgeTiles', edgeTiles);

  return { mapNodes, mstEdges, edgeTiles };
}

function tileEdges({ edges, tileSize }: { edges: Edge[]; tileSize: number }): Tile[] {
  var tileGroups = edges.map(curry(tileEdge)(tileSize));
  return tileGroups.flat();
}

// This is sort of like Bresenham's line-scanning algorithm, except that we select
// both coordinates that the line is adjacent to instead of picking one or the
// other.
function tileEdge(tileSize: number, edge: Edge): Tile[] {
  const dx = edge.to.pt[0] - edge.from.pt[0];
  const dy = edge.to.pt[1] - edge.from.pt[1];
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
    edge.from.pt[domainIndex],
    // Include the endpoint.
    edge.to.pt[domainIndex] + domainSign,
    domainSign * tileSize
  );
  console.log('domainValues for', edge.from.pt, 'to', edge.to.pt, ':', domainValues);

  const sourceId = getEdgeId(edge);
  const domain0 = edge.from.pt[domainIndex];
  const range0 = edge.from.pt[rangeIndex];
  const minWidth = Math.max(edge.width, Math.abs(slope) === 1 ? 2 : 1);

  return domainValues
    .map(getTilesAtPoint)
    .flat();

  function getTilesAtPoint(domainElement: number) {
    const rangeCenter = slope * (domainElement - domain0) + range0;
    const rangeLowerBound = Math.round(rangeCenter - minWidth/2);
    // If minWidth is 1 and the rangeElement falls between whole numbers,
    // we're just going to have two tiles to cover that.
    let minElements = minWidth;
    if (minElements < 2 && rangeCenter !== Math.floor(rangeCenter)) {
      minElements = 2;
    }
    var rangeElements: number[] = range(rangeLowerBound, rangeLowerBound + minElements);

    return rangeElements.map(makeTileAtPoint);

    function makeTileAtPoint(rangeElement) {
      let pt: Pt = [0,0];
      pt[domainIndex] = domainElement;
      pt[rangeIndex] = rangeElement;
      return makeTile(pt, sourceId, tileSize); 
    }
  }
}

function renderNodes(nodes: MapNode[], width: number) {
  var scale = scaleLinear().domain([0, width]).range([0, 100]);
  // Apply scale to both x and y; keep it square.

  select('.nodes').selectAll('.node').data(nodes)
    .join('circle')
    .attr('fill', 'hsl(80, 50%, 50%)')
    .attr('cx', (node: MapNode) => scale(node.pt[0]))
    .attr('cy', (node: MapNode) => scale(node.pt[1]))
    .attr('r', (node: MapNode) => scale(node.radius))
    .classed('node', true);
}

function renderEdges(edges: Edge[], width: number) {
  var scale = scaleLinear().domain([0, width]).range([0, 100]);
  // Apply scale to both x and y; keep it square.

  select('.edges').selectAll('.edge').data(edges)
    .join('line')
    .attr('x1', (edge: Edge) => scale(edge.from.pt[0]))
    .attr('y1', (edge: Edge) => scale(edge.from.pt[1]))
    .attr('x2', (edge: Edge) => scale(edge.to.pt[0]))
    .attr('y2', (edge: Edge) => scale(edge.to.pt[1]))
    .attr('stroke', 'hsl(200, 50%, 50%)')
    .attr('width', 2)
    .classed('edge', true);
}

function renderTiles(tiles: Tile[], width: number) {
  var scale = scaleLinear().domain([0, width]).range([0, 100]);
  // Apply scale to both x and y; keep it square.

  select('.tiles').selectAll('.tile').data(tiles)
    .join('rect')
    .attr('stroke', 'hsl(240, 50%, 50%)')
    .attr('fill', 'transparent')
    .attr('x', (tile: Tile) => scale(tile.pt[0] - tile.length/2))
    .attr('y', (tile: Tile) => scale(tile.pt[1] - tile.length/2))
    .attr('width', (tile: Tile) => scale(tile.length))
    .attr('height', (tile: Tile) => scale(tile.length))
    .classed('tile', true);
}

function getEdgeId(edge: Edge): string {
  return `edge-${edge.from.id}-to-${edge.to.id}`;
}

function getPtId(pt: Pt): string {
  return pt[0] + ',' + pt[1];
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

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}

