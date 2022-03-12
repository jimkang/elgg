import { Tile, Soul } from '../types';

export function makePlayer({ prob, nodeTiles, edgeTiles }: { prob; nodeTiles: Tile[]; edgeTiles: Tile[] }): Soul {

  var pos = prob.roll(3) === 0 ?
    prob.pick(edgeTiles).pt :
    prob.pick(nodeTiles).pt;
  
  return {
    type: 'figure',
    id: 'player',
    textureId: 'pc-down.png',
    direction: [0, 1],
    pos,
    items: [],
    hp: 6,
    maxHP: 6
  }; 
}
