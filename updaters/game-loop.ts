import { renderSouls } from '../renderers/render-souls';
import { multiplyPairBySingleValue, addPairs } from 'basic-2d-math';
import { Pt } from '../types';

export function GameLoop({ app, spriteCache, souls, player, tileLength }) {
  return function gameLoop(delta: number) {
    renderSouls({ app, spriteCache, souls });
    centerPlayer();
  };

  function centerPlayer() {
    var playerToOrigin = multiplyPairBySingleValue(
      [player.pos[0], player.pos[1]],
      -tileLength
    );
    // stage changes size depending on what sprites it contains. Don't use it
    // for scaling calculations. screen stays constant. Content nor scale affect
    // it.
    var stageCenter: Pt = [
      app.screen.width/2 / app.stage.scale.x,
      app.screen.height/2 / app.stage.scale.y
    ];
    // Shift the stage so that the upper left corner hits the player, then
    // move the stage again so that target ends up in the center.
    var stageMove = addPairs(playerToOrigin, stageCenter);
    // Apply the scale. If the scale is 0.5, then we want to move the stage half as much
    // because the contents of the stage are half as big, so moving the stage by 1 would
    // move its contents by 2, in effect.
    // If the scale is 2, then a 1 on the outside of the stage is actually 0.5 inside,
    // and moving the stage by 1 would move its contents by 0.5.
    app.stage.x = stageMove[0] * app.stage.scale.x;
    app.stage.y = stageMove[1] * app.stage.scale.y;
  }
}
