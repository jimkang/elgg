import RouteState from 'route-state';
import handleError from 'handle-error-web';
//import render from './renderers/render'
import { createProbable as Probable } from 'probable';
import seedrandom from 'seedrandom';
import { Edge, MapNode, Tile } from '../../types';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import RandomId from '@jimkang/randomid';
import { makeMap } from '../../map/make-map';

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

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}

