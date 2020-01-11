import React from 'react';
import createPlayer from './player';
import createOrdersLine from './orders';
import { fancyTiles } from './tiles';

import './App.css';

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
        {row.map(tile => <td onClick={
          () => Promise.resolve()
            .then(() => props.onPlaceTile
              ? props.onPlaceTile(tile.position)
              : props.player.move(tile.position))
            .catch(alert)
        }>{tile.icon} {props.player.getPosition() === tile.position ? '♟️' : ''}</td>)}
      </tr>
    ))
  }
  </table>
);

const stats = {
  money: { symbol: '💸' },
  points: { symbol: '⭐' },
  sushi: { symbol: '🍣', type: 'food' },
  noodles: { symbol: '🍜', type: 'food' },
  tea: { symbol: '🍵', type: 'food' },
};

const PlayerStats = (props) => {
  const playerStats = Object.entries({
    money: props.player.currentMoney(),
    points: props.player.currentScore(),
    ...props.player.currentFood(),
  }).reduce((result, [statName, value]) => {
    if (!result[value]) {
      result[value] = [];
    }
    
    const statElement = stats[statName].type === 'food'
      ? <div onClick={() => props.onSelectFood(statName)}>{stats[statName].symbol}</div>
      : <div>{stats[statName].symbol}</div>

    result[value].push(statElement);

    return result;
  }, Array.from(new Array(11)));

  return <table class="player-stats">
    <tr>
      {Object.keys(playerStats).map(i => <td>{playerStats[i] || []}</td>)}
    </tr>
    <tr>
      {Object.keys(playerStats).map(i => <td>{i}</td>)}
    </tr>
  </table>
};

const orders = createOrdersLine();

const p1 = createPlayer('p1', orders, fancyTiles);

const Order = ({ id, foods, points, onSelect, money }) => (
  <div class="order" onClick={() => onSelect({ id, foods, points, money })}>
    {Object.entries(foods).map(([type, amount]) => <span>{amount} {stats[type].symbol}</span>)}
    <div>{points} {stats.points.symbol}  {money} {stats.money.symbol}</div>
  </div>
);

const Orders = (props) => (
  <div>
    {props.orders.map(o => <Order { ...o} onSelect={props.onSelectOrder} />)}
  </div>
);

const MarketTile = ({ icon, cost, description,  onSelect, ...tileProps }) => (
  <td onClick={() => onSelect({ icon, cost, ...tileProps })}>
    {icon} <div>cost: {cost}💸</div><div class="tooltip">{description}</div>
  </td>
);

const TilesMarket = ({ onSelect }) => (<table className="player-board small-font">
  <tr>
    {fancyTiles.map(fT => <MarketTile {...fT} onSelect={onSelect} />)}
  </tr>
</table>);

function App() {
  const [turns, setTurns] = React.useState(0);
  const [canMove, setCanMove] = React.useState(true);
  const [actionRequired, setActionRequired] = React.useState('');
  const [selectFood, setSelectFood] = React.useState(() => () => {});
  const [selectOrder, setSelectOrder] = React.useState(() => () => {});
  const [selectMarketTile, setSelectMarketTile] = React.useState(() => () => {});
  const [selectTilePlacement, setSelectTilePlacement] = React.useState(null);
   p1.onMove(() => setTurns(t => t + 1));

   p1.allowSelectFood(() => {
    return new Promise((resolve, reject) => {
      setCanMove(false);
      setSelectFood(() => foodType => resolve({ foodType, amount: 1 }));
      setActionRequired('Select food');
    }).finally(() => {
      setCanMove(true);
      setSelectFood(() => () => {});
      setActionRequired('');
    });
  });

  p1.allowSelectOrder(() => {
    return new Promise((resolve, reject) => {
      setCanMove(false);
      setSelectOrder(() => order => resolve(order));
      setActionRequired('Select order');
    }).finally(() => {
      setCanMove(true);
      setSelectOrder(() => () => {});
      setActionRequired('');
    });
  });

  p1.allowSelectTile(() => {
    return new Promise((resolve, reject) => {
      setCanMove(false);
      setSelectMarketTile(() => tile => resolve(tile));
      setActionRequired('Select a tile from the market');
    }).finally(() => {
      setCanMove(true);
      setSelectMarketTile(() => () => {});
      setActionRequired('');
    });
  });

  p1.allowPlaceTile(() => {
    return new Promise((resolve, reject) => {
      setCanMove(false);
      setSelectTilePlacement(() => position => resolve(position));
      setActionRequired('Place the tile on your board');
    }).finally(() => {
      setCanMove(true);
      setSelectTilePlacement(null);
      setActionRequired('');
    });
  });

  return (
    <div class="wrapper">
      <div>Turn: {turns} {actionRequired}</div>
      <Board player={p1} refresh={() => { setTurns(s => s+1); }} onPlaceTile={selectTilePlacement} />
      <div class="float-right">
        <Orders orders={orders.currentOrders()} onSelectOrder={selectOrder} />
        <PlayerStats player={p1} onSelectFood={selectFood} />
        <TilesMarket onSelect={selectMarketTile} />
      </div>
    </div>
  );
};

export default App;
