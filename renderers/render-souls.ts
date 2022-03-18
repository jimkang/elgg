import { Rectangle, Sprite, utils } from 'pixi.js';
import { Soul } from '../types';

const tileLength = 32;

export function renderSouls({ app, souls, spriteCache }:
  { app; souls: Soul[]; spriteCache: Record<string, Sprite>}) {
  var texture = utils.TextureCache['floor-tile-green.png'];
  var rect = new Rectangle(0, 0, tileLength, tileLength);
  texture.frame = rect;

  souls.forEach(addSoulSprite);

  app.renderer.render(app.stage);

  function addSoulSprite(soul: Soul) {
    var sprite = spriteCache[soul.id];
    if (!sprite) {
      sprite = new Sprite(utils.TextureCache[soul.textureId]);
      spriteCache[soul.id] = sprite;
      app.stage.addChild(sprite);
    }
    sprite.width = tileLength; 
    sprite.height = tileLength; 
    sprite.x = soul.pos[0] * tileLength;
    sprite.y = soul.pos[1] * tileLength;
  }
}

