import RouteState from 'route-state';
import handleError from 'handle-error-web';
//import render from './renderers/render'
import { createProbable as Probable } from 'probable';
import seedrandom from 'seedrandom';
import { version } from './package.json';
import { makeMap } from './map/make-map';
import { Loader, Application } from 'pixi.js';
import { wireZoomControls } from './dom/wire-zoom-controls';
import RandomId from '@jimkang/randomid';
import { renderMap } from './renderers/render-map';

var randomid = RandomId();

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
  Loader.shared
    .add('assets/atlas.json')
    .load(() => setUp(seed));
// TODO: Error handling?
}

function setUp(seed) {
  var random = seedrandom(seed);
  var probable = Probable({ random });
  const width = 32;
  const height = 32;

  var app = new Application({
    width: 800,
    height: 600,
    antialias: false,
    transparent: false,
    resolution: 1
  });

  var { mapNodes, edges, edgeTiles, nodeTiles } = makeMap({ probable, width, height });

  app.stage.y = 100;
  document.body.append(app.view);

  renderMap({ app, edgeTiles, nodeTiles });

  wireZoomControls({ onZoomCtrlChange });

  function onZoomCtrlChange({ newScale }) {
    app.stage.scale.x = +newScale;
    app.stage.scale.y = +newScale;
    app.renderer.render(app.stage);
  }
}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}

function renderVersion() {
  var versionInfo = document.getElementById('version-info');
  versionInfo.textContent = version;
}
