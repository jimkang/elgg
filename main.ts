import RouteState from 'route-state';
import handleError from 'handle-error-web';
//import render from './renderers/render'
import { createProbable as Probable } from 'probable';
import seedrandom from 'seedrandom';
import { version } from './package.json';
import { makeMap } from './map/make-map';
import { Rectangle, Sprite, Loader, Application, utils } from 'pixi.js';
import { Tile } from './types';
import curry from 'lodash.curry';

import RandomId from '@jimkang/randomid';
var randomid = RandomId();

const tileLength = 32;

var routeState = RouteState({
  followRoute,
  windowObject: window
});

(function go() {
  window.onerror = reportTopLevelError;
  renderVersion();
  routeState.routeFromHash();
})();

function followRoute({ seed }) {
  if (!seed) {
    routeState.addToRoute({ seed: randomid(8) });
    return;
  }
  var random = seedrandom(seed);
  var probable = Probable({ random });
  const width = 32;
  const height = 32;
  var { mapNodes, edges, edgeTiles, nodeTiles } = makeMap({ probable, width, height });

  Loader.shared
    .add('assets/atlas.json')
    .load(curry(proceedWithAssets)({ mapNodes, edges, edgeTiles, nodeTiles }));
// TODO: Error handling?
// TODO: Is it really necessary to load images at runtime? Can I just build them into the bundle?
}

function proceedWithAssets({ mapNodes, edges, edgeTiles, nodeTiles }, loader, resources) {
  var texture = utils.TextureCache['floor-tile-green.png'];
  var rect = new Rectangle(0, 0, 32, 32);
  texture.frame = rect;
  
  var app = new Application({
    width: 800,
    height: 600,
    antialias: false,
    transparent: false,
    resolution: 1
  });

  nodeTiles.forEach(addFloorTileSprite);
  edgeTiles.forEach(addFloorTileSprite);

  app.stage.y = 100;
  //app.stage.scale.x = 0.5;
  //app.stage.scale.y = 0.5;

  app.renderer.render(app.stage);

  document.body.append(app.view);

  function addFloorTileSprite(tile: Tile) {
    var floorTile = new Sprite(texture);
    floorTile.width = tileLength; 
    floorTile.height = tileLength; 
    floorTile.x = tile.pt[0] * tileLength;
    floorTile.y = tile.pt[1] * tileLength;
    app.stage.addChild(floorTile);
  }
}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}

function renderVersion() {
  var versionInfo = document.getElementById('version-info');
  versionInfo.textContent = version;
}
