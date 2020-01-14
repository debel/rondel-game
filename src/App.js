import React, { useEffect } from 'react';
import createPlayer, { SELECTING_OPTIONS } from './player';
import OrdersMarket, { defaultOrdersLine } from './OrdersMarket';
import TilesMarket, { fancyTiles } from './TilesMarket';
import Board from './Board';
import PlayerStats from './PlayerStats';

import './App.css';

const p1 = createPlayer('p1', defaultOrdersLine, fancyTiles);

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
        <OrdersMarket onSelect={selector(SELECTING_OPTIONS.order)} />
        <TilesMarket onSelect={selector(SELECTING_OPTIONS.tile)} />
      </div>
    </div>
  );
};

export default App;
