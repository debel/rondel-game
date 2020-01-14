import React, { useEffect } from 'react';
import createPlayer, { SELECTING_OPTIONS } from './player';
import { defaultOrdersLine } from './orders';
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
        {row.map(tile => <td class="board-tile" onClick={
          () => Promise.resolve()
            .then(() => props.onPlaceTile
              ? props.onPlaceTile(tile.position)
              : props.player.move(tile.position))
            .catch(alert)
        }>{tile.icon} {props.player.currentPosition() === tile.position ? '♟️' : ''}
          <div class="tooltip">{tile.description}</div>
        </td>)}
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
      ? <div onClick={() => props.onSelectFood && props.onSelectFood({ foodType: statName, amount: 1 })}>{stats[statName].symbol}</div>
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

const orders = defaultOrdersLine;

const p1 = createPlayer('p1', orders, fancyTiles);

const Order = ({ id, foods, points, onSelect, money }) => (
  <div class="order" onClick={() => onSelect && onSelect({ id, foods, points, money })}>
    {Object.entries(foods).map(([type, amount]) => <span>{amount} {stats[type].symbol}</span>)}
    <hr/>
    <div>{points} {stats.points.symbol}  {money} {stats.money.symbol}</div>
  </div>
);

const Orders = (props) => (
  <div>
    {props.orders.map(o => <Order { ...o} onSelect={props.onSelectOrder} />)}
  </div>
);

const MarketTile = ({ icon, cost, description,  onSelect, ...tileProps }) => (
  <td class="market-tile" onClick={() => onSelect && onSelect({ icon, cost, ...tileProps })}>
    {icon}<hr/><div>cost: {cost}💸</div><div class="tooltip">{description}</div>
  </td>
);

const TilesMarket = ({ onSelect }) => (<table className="player-board small-font">
  <tr>
    {fancyTiles.map(fT => <MarketTile {...fT} onSelect={onSelect} />)}
  </tr>
</table>);

const ActionOptions = ({ options, forceRefresh }) => (
  options && <div class="action-options">
    {options.map(option => (
      <div class="action-option" onClick={() => option.action().then(forceRefresh)}>{option.icon}</div>
    ))}
  </div>
);

function App() {
  const [turns, setTurns] = React.useState(0);
  const [x, setX] = React.useState(0);
  const [isSelecting, setIsSelecting] = React.useState(null);
  const [actionOptions, setActionOptions] = React.useState(null); 
  const selector = type => (isSelecting && isSelecting === type)
    ? option => p1.uiSelection(type, option) 
    : null;

  useEffect(() => {
    p1.onMove(() => setTurns(t => t + 1));

    p1.onSetState(state => {
      const { type = null, options = null } = state || {};
      setIsSelecting(type);
      setActionOptions(options);
    });
  }, []);

  return (
    <div class="wrapper">
      <div>Turn: {turns} {isSelecting ? `Select ${isSelecting}` : ''}</div>
      <ActionOptions options={actionOptions} forceRefresh={() => setX(x => x+1)} />
      <div class="float-left">
        <Board player={p1} onPlaceTile={selector(SELECTING_OPTIONS.position)} />
        <PlayerStats player={p1} onSelectFood={selector(SELECTING_OPTIONS.food)} />
      </div>
      <div class="float-right">
        <Orders 
          orders={orders.currentOrders()}
          onSelectOrder={selector(SELECTING_OPTIONS.order)}
        />
        <TilesMarket onSelect={selector(SELECTING_OPTIONS.tile)} />
      </div>
    </div>
  );
};

export default App;
