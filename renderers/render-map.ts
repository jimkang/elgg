import { Rectangle, Sprite, utils } from 'pixi.js';
import { Tile } from '../types';

const tileLength = 32;

export function renderMap({ app, edgeTiles, nodeTiles }) {
  var texture = utils.TextureCache['floor-tile-green.png'];
  var rect = new Rectangle(0, 0, tileLength, tileLength);
  texture.frame = rect;

  nodeTiles.forEach(addFloorTileSprite);
  edgeTiles.forEach(addFloorTileSprite);

  app.renderer.render(app.stage);

  function addFloorTileSprite(tile: Tile) {
    var floorTile = new Sprite(texture);
    floorTile.width = tileLength; 
    floorTile.height = tileLength; 
    floorTile.x = tile.pt[0] * tileLength;
    floorTile.y = tile.pt[1] * tileLength;
    app.stage.addChild(floorTile);
  }
}

