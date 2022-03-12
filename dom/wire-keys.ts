import { Pt } from '../types';
import StrokeRouter from 'strokerouter';

var routerConnected = false;

export function wireKeys(
  { onKeyDirection }:
  { onKeyDirection: (Pt) => void }
) {
  var docStrokeRouter = StrokeRouter(document);

  docStrokeRouter.routeKeyUp('h', null, () => onKeyDirection([-1, 0]));
  docStrokeRouter.routeKeyUp('leftArrow', null, () => onKeyDirection([-1, 0]));
  docStrokeRouter.routeKeyUp('j', null, () => onKeyDirection([0, 1]));
  docStrokeRouter.routeKeyUp('downArrow', null, () => onKeyDirection([0, 1]));
  docStrokeRouter.routeKeyUp('k', null, () => onKeyDirection([0, -1]));
  docStrokeRouter.routeKeyUp('upArrow', null, () => onKeyDirection([0, -1]));
  docStrokeRouter.routeKeyUp('l', null, () => onKeyDirection([1, 0]));
  docStrokeRouter.routeKeyUp('rightArrow', null, () => onKeyDirection([1, 0]));

  if (!routerConnected) {
    document.addEventListener('keyup', docStrokeRouter.onKeyUp);
    routerConnected = true;
  }
}
