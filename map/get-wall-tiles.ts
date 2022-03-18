import { Tile, Soul, Pt } from '../types';
export function getWallTiles({ nodeTiles, edgeTiles }:
  { nodeTiles: Tile[]; edgeTiles: Tile[] }): Soul[] {

  // TODO: Filter out nodeTiles that aren't bordering nothing.
  var wallTiles = nodeTiles.map(wallTileForNodeTile);
  // TODO: Edge-adjacent tiles.
  return wallTiles;

  function wallTileForNodeTile(nodeTile: Tile): Soul {
    return {
      id: 'wall-' + nodeTile.id, // TODO: random id
      type: 'figure',
      direction: [0, 1],
      pos: nodeTile.pt.slice() as Pt,
      // TODO: sourceType and sourceId
      items: [],
      hp: 1000,
      maxHP: 1000,
      textureId: 'wall-tile-green.png'
    };
  }
}
