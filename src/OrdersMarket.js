import React from 'react';
import { defaultOrdersLine } from './orders';
import { stats } from './PlayerStats';

const Order = ({ id, foods, points, onSelect, money }) => (
  <div class="order" onClick={() => onSelect && onSelect({ id, foods, points, money })}>
    {Object.entries(foods).map(([type, amount]) => <span>{amount} {stats[type].symbol}</span>)}
    <hr/>
    <div>{points} {stats.points.symbol}  {money} {stats.money.symbol}</div>
  </div>
);

const Orders = ({ onSelect }) => (
  <div>
    {defaultOrdersLine.currentOrders().map(o => <Order { ...o} onSelect={onSelect} />)}
  </div>
);

export default Orders;

export {defaultOrdersLine};