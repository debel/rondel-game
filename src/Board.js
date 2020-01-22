import React, { useEffect } from 'react';

const orderTilesInGrid = (tiles) => ([
  [tiles[0], tiles[1], tiles[2]], 
  [tiles[7], tiles.x,  tiles[3]],
  [tiles[6], tiles[5], tiles[4]],
]);

const Board = (props) => (
  <table class="player-board">
  {
    orderTilesInGrid(props.player.currentBoard()).map(row => (
      <tr>
        {row.map(tile => <td class={`board-tile ${tile.background}`} onClick={
          () => Promise.resolve()
            .then(() => props.onPlaceTile
              ? props.onPlaceTile(tile.position)
              : props.player.move(tile.position))
            .catch(alert)
        }><div class="iconography">{tile.icon}</div> {props.player.currentPosition() === tile.position ? '♟️' : ''}
          <div class="tooltip">{tile.description}</div>
        </td>)}
      </tr>
    ))
  }
  </table>
);

export default Board;