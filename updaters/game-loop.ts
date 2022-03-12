import { renderSouls } from '../renderers/render-souls';
import { multiplyPairBySingleValue, addPairs } from 'basic-2d-math';
import { Pt } from '../types';

export function GameLoop({ app, spriteCache, souls, player, tileLength }) {
  return function gameLoop(delta: number) {
    renderSouls({ app, spriteCache, souls });
    centerPlayer();
  };

  function centerPlayer() {
    var playerToOrigin = multiplyPairBySingleValue(player.pos, -tileLength);
    var stageCenter: Pt = [app.stage.width/2, app.stage.height/2];
    var stageMove = addPairs(playerToOrigin, stageCenter);
    app.stage.x = stageMove[0];
    app.stage.y = stageMove[1];
  }
}
