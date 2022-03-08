import RouteState from 'route-state';
import handleError from 'handle-error-web';
//import render from './renderers/render'
import { createProbable as Probable } from 'probable';
import seedrandom from 'seedrandom';
import { kruskal } from 'kruskal-mst';
import { getNByNGraph } from '../../graph/get-nxn';
import { IdPt, Edge } from '../../types';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import RandomId from '@jimkang/randomid';

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

  var { mapNodes, mstEdges } = makeMap({ probable, width, height });

  renderNodes(Object.values(mapNodes), width);
  renderEdges(mstEdges, width);
}

function makeMap({ probable, width, height }:
  { probable; width: number; height: number }) {
  const nodeCount = probable.rollDie(6) + probable.rollDie(6);
  var mapNodes: Record<string, IdPt>  = {};
  for (var i = 0; i < nodeCount; ++i) {
    const x = probable.roll(width);
    const y  = probable.roll(height);
    const id = x + ',' + y;
    mapNodes[id] = { id, pt: [x, y] };
  }
 
  console.log('mapNodes', mapNodes);

  var allEdges = getNByNGraph({ points: Object.values(mapNodes) });
  console.log('allEdges', allEdges);

  var mstEdges = kruskal(allEdges)
    .map(({ from, to, weight }) => ({ weight, from: mapNodes[from], to: mapNodes[to] }));
  console.log('mstEdges', mstEdges);

  return { mapNodes, mstEdges };
}

function renderNodes(nodes: IdPt[], width: number) {
  var scale = scaleLinear().domain([0, width]).range([0, 100]);
  // Apply scale to both x and y; keep it square.

  select('.nodes').selectAll('.node').data(nodes)
    .join('circle')
    .attr('r', scale(1))
    .attr('fill', 'hsl(80, 50%, 50%)')
    .attr('cx', (node: IdPt) => scale(node.pt[0]))
    .attr('cy', (node: IdPt) => scale(node.pt[1]))
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

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}

