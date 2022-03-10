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
import accessor from 'accessor';

var randomid = RandomId();

var routeState = RouteState({
  followRoute,
  windowObject: window
});

(function go() {
  window.onerror = reportTopLevelError;
  routeState.routeFromHash();
})();

function followRoute({ seed, width = 32, height = 32 }) {
  if (!seed) {
    routeState.addToRoute({ seed: randomid(8) });
    return;
  }
  var random = seedrandom(seed);
  var probable = Probable({ random });
  console.log('seed', seed);

  var { mapNodes, edges, edgeTiles, nodeTiles } = makeMap({ probable, width, height });

  var scale = scaleLinear().domain([0, width]).range([0, 100]);
  // Apply scale to both x and y; keep it square.

  // We put the center of a tile at integer coordinates. So, a tile at 0, 0 has its
  // center on the corner of the view. We need to shift things a bit to show the
  // whole tile.
  const halfTileLength = scale(0.5);
  select('.outmost').attr('transform', `translate(${halfTileLength}, ${halfTileLength})`);

  renderNodes(Object.values(mapNodes), scale);
  renderEdges(edges, scale);
  renderTiles(edgeTiles.concat(nodeTiles), scale);
}

function renderNodes(nodes: MapNode[], scale) {
  select('.nodes').selectAll('.node').data(nodes)
    .join('circle')
    .attr('fill', 'hsl(80, 50%, 50%)')
    .attr('cx', (node: MapNode) => scale(node.pt[0]))
    .attr('cy', (node: MapNode) => scale(node.pt[1]))
    .attr('r', (node: MapNode) => scale(node.radius))
    .classed('node', true);
}

function renderEdges(edges: Edge[], scale) {
  select('.edges').selectAll('.edge').data(edges)
    .join('line')
    .attr('x1', (edge: Edge) => scale(edge.start.pt[0]))
    .attr('y1', (edge: Edge) => scale(edge.start.pt[1]))
    .attr('x2', (edge: Edge) => scale(edge.end.pt[0]))
    .attr('y2', (edge: Edge) => scale(edge.end.pt[1]))
    .attr('stroke', 'hsl(200, 50%, 50%)')
    .attr('width', 2)
    .classed('edge', true);
}

function renderTiles(tiles: Tile[], scale) {
  select('.tiles').selectAll('.tile').data(tiles, accessor())
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

