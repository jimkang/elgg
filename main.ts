import RouteState from 'route-state';
import handleError from 'handle-error-web';
//import render from './renderers/render'
import { createProbable as Probable } from 'probable';
import seedrandom from 'seedrandom';
import { version } from './package.json';
import { makeMap } from './map/make-map';
import { makePlayer } from './souls/make-player';
import { Loader, Application, Sprite } from 'pixi.js';
import { wireZoomControls } from './dom/wire-zoom-controls';
import { wireKeys } from './dom/wire-keys';
import RandomId from '@jimkang/randomid';
import { renderMap } from './renderers/render-map';
import { addPairs } from 'basic-2d-math';
import { GameLoop } from './updaters/game-loop';
import { Pt } from './types';

var randomid = RandomId();
var resourcesLoaded = false;

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
 
  if (resourcesLoaded) {
    setUp(seed);
  } else {
    Loader.shared
      .add('assets/atlas.json')
      .load(() => setUp(seed));
    // TODO: Error handling?
  }
}

function setUp(seed) {
  resourcesLoaded = true;

  var random = seedrandom(seed);
  var prob = Probable({ random });
  const width = 32;
  const height = 32;

  var spriteCache: Record<string, Sprite> = {};
  var app = new Application({
    width: 800,
    height: 600,
    antialias: false,
    transparent: false,
    resolution: 1
  });

  app.stage.y = 100;
  document.body.append(app.view);

  var { mapNodes, edges, edgeTiles, nodeTiles } = makeMap({ prob, width, height });
  var player = makePlayer({ prob, edgeTiles, nodeTiles });

  renderMap({ app, edgeTiles, nodeTiles });

  wireZoomControls({ onZoomCtrlChange });
  wireKeys({ onKeyDirection });

  app.ticker.add(GameLoop({ app, spriteCache, souls: [ player ]}));

  function onZoomCtrlChange({ newScale }) {
    app.stage.scale.x = +newScale;
    app.stage.scale.y = +newScale;
    app.renderer.render(app.stage);
  }

  function onKeyDirection(vector: Pt) {
    player.pos = addPairs(player.pos, vector);
    // TODO: Kick off everyone else's turn before changing pos.
  }
}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}

function renderVersion() {
  var versionInfo = document.getElementById('version-info');
  versionInfo.textContent = version;
}
