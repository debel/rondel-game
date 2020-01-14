import React from 'react';

export const stats = {
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

export default PlayerStats;