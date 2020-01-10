import React from 'react';
import createPlayer from './player';
import { createOrder } from './tileTypes';

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
            .then(() => props.player.move(tile.position))
            .catch(alert)
            .then(props.refresh)
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
  }, {});

  return <table class="player-stats">
    <tr>
      {Array.from(Array(10)).map((_, i) => <td>{playerStats[i] || []}</td>)}
    </tr>
    <tr>
      {Array.from(Array(10)).map((_, i) => <td>{i}</td>)}
    </tr>
  </table>
};

const p1 = createPlayer('p1');

const Order = ({ foods, points, onSelect }) => (
  <div class="order" onClick={() => onSelect({ foods, points })}>
    {Object.entries(foods).map(([type, amount]) => <span>{amount} {stats[type].symbol}</span>)}
    <div>{points} {stats.points.symbol}</div>
  </div>
);

const Orders = (props) => (
  <div>
    {props.orders.map(o => <Order { ...o} onSelect={props.onSelectOrder} />)}
  </div>
)

function App() {
  const [turns, setTurns] = React.useState(0);
  const [actionRequired, setActionRequired] = React.useState('');
  const [selectFood, setSelectFood] = React.useState(() => () => {});
  const [selectOrder, setSelectOrder] = React.useState(() => () => {});
  const [orders, setOrders] = React.useState([
    createOrder(),
    createOrder(),
    createOrder(),
  ])

   p1.allowSelectFood(() => {
    return new Promise((resolve, reject) => {
      setSelectFood(() => foodType => resolve({ foodType, amount: 1 }));
      setActionRequired('Select food');
    }).finally(() => {
      setSelectFood(() => () => {});
      setActionRequired('');
    });
  });

  p1.allowSelectOrder(() => {
    return new Promise((resolve, reject) => {
      setSelectOrder(() => order => resolve(order));
      setActionRequired('Select order');
    }).finally(() => {
      setSelectOrder(() => () => {});
      setActionRequired('');
    });
  });

  return (
    <div class="wrapper">
      <div>Turn: {turns} {actionRequired}</div>
      <Board player={p1} refresh={() => { setTurns(s => s+1); }} />
      <div class="float-right">
        <Orders orders={orders} onSelectOrder={selectOrder} />
        <PlayerStats player={p1} onSelectFood={selectFood} />
      </div>
    </div>
  );
};

export default App;
