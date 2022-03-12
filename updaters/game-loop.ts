import { renderSouls } from '../renderers/render-souls';

export function GameLoop({ app, spriteCache, souls }) {

  return function gameLoop(delta: number) {
    renderSouls({ app, spriteCache, souls });
  };
}
