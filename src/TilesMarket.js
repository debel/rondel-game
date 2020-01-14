import React, { useEffect } from 'react';
import { fancyTiles } from './tiles';

const makeGrid = () => fancyTiles.reduce((result, tile, index) => {
  const bucket = tile.type || 1;
  if (!result[bucket]) {
    result[bucket] = [];
  }

  result[bucket].push(tile);
  return result;
}, []);

const MarketTile = ({ icon, cost, description,  onSelect, ...tileProps }) => (
  <td class="market-tile" onClick={() => onSelect && onSelect({ icon, cost, ...tileProps })}>
    {icon}<hr/><div>cost: {cost}💸</div><div class="tooltip">{description}</div>
  </td>
);

const TilesMarket = ({ onSelect }) => (<table className="tiles-market small-font">
  {makeGrid().map(row => <tr>
    {row.map(fT => <MarketTile {...fT} onSelect={onSelect} />)}
  </tr>
  )}
</table>);

export default TilesMarket;
export { fancyTiles };