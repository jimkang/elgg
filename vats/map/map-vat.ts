import RouteState from 'route-state';
import handleError from 'handle-error-web';
//import render from './renderers/render'
import { createProbable as Probable } from 'probable';
import seedrandom from 'seedrandom';

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
}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}

