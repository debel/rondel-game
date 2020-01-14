import baseTiles, { emptyTile } from './tiles';

import { playerHasFoodForOrder} from './orders';

export const SELECTING_OPTIONS = {
  food: 'food',
  tile: 'tile',
  position: 'position',
  order: 'order',
  action: 'action',
};

const generateRandomSequence = (n = 8) => {
  const allValues = Array.from(new Array(n), (_, i) => i);
  const result = [];

  for (let i = 0; i < n; i += 1) {
    const selectedIndex = Math.floor(Math.random() * allValues.length);
    const selected = allValues.splice(selectedIndex, 1)[0];
    result.push(selected);
  }

  return result;
};

const randomizeBoard = () => {
  const sequence = generateRandomSequence(baseTiles.length);
  const board = sequence.map((i, j) => ({ ...baseTiles[i], position: j }));
  board.x = emptyTile;
  return board;
};

const createPlayer = (name, ordersLine, tileMarket) => {
  const board = randomizeBoard();
  const modifiers = {};
  const foods = { sushi: 0, noodles: 0, tea: 0 };
  let totalFood = 0;
  let position = 0;
  let money = 0;
  let points = 0;
  let isSelecting = null;
  let setState = () => {};
  let notifyOnMove = () => {};
  let resolveSelect = null;
  const initiateSelect = (type, options) => new Promise((resolve, reject) => {
    isSelecting = type;
    setState({ type, options });
    resolveSelect = (value) => {
      isSelecting = null;
      resolveSelect = null;
      setState(null);
      return resolve(value);
    };
  });

  return {
    onSetState(setter) {
      setState = setter;
    },
    gainMoney(amount) { money += amount; },
    async loseMoney(amount) {
      if (money < amount) { throw new Error('Not enough money'); }

      money -= amount;
    },
    gainPoints(amount) { points += amount; },
    gainFood(type, amount, callModifiers = true) {
      if (!foods[type]) {
        foods[type] = 0;
      }

      if (callModifiers && modifiers['gainFood']) {
        modifiers.gainFood.call(this, type, amount);
      }

      foods[type] += amount;
      totalFood += amount;
    },
    async loseFood(type, amount) {
      if (!foods[type] || foods[type] < amount) {
        throw new Error(`Not enough ${type}`);
      }

      foods[type] -= amount;
      totalFood -= amount;
    },
    hasAnyFood() {
      return totalFood > 0;
    },
    selectFood() {
      return initiateSelect(SELECTING_OPTIONS.food);
    },
    currentMoney() {
      return money;
    },
    currentScore() {
      return points;
    },
    currentFood() {
      return {...foods};
    },
    currentBoard() {
      return board;
    },
    currentPosition() {
      return position;
    },
    onMove(cb) {
      notifyOnMove = cb;
    },
    move(target) {
      if (isSelecting) throw new Error(`select ${isSelecting} first`);

      const validForSmall = position < 6 && (position < target && target - position <= 2);
      const validForSix = position === 6 && (target === 7 || target === 0);
      const validForSeven = position === 7 && (target === 0 || target === 1);
      
      if (validForSmall || validForSix || validForSeven) {
        position = target;
        return Promise.resolve()
          .then(() => board[target].activate(this))
          .finally(notifyOnMove);
      }

      throw new Error('Illigal move');
    },
    async selectOrder() {
      return initiateSelect(SELECTING_OPTIONS.order);
    },
    async fulfilOrder(selectedOrder) {
      const foodItems = Object.entries(selectedOrder.foods);
      
      if (!playerHasFoodForOrder(foods, selectedOrder)) {
        isSelecting = null;
        throw new Error('Cannot fulfil order');
      }

      foodItems.forEach(([type, amount]) => {
        this.loseFood(type, amount);
      });

      ordersLine.discardOrder(selectedOrder.id);
      this.gainPoints(selectedOrder.points);
      this.gainMoney(selectedOrder.money);
      isSelecting = null;
    },
    async selectTile() {
      return initiateSelect(SELECTING_OPTIONS.tile);
    },
    async placeTile(selectedTile) {
      return initiateSelect(SELECTING_OPTIONS.position)
        .then((selectedPosition) => {
          board[selectedPosition] = { ...selectedTile, position: selectedPosition };  
          setState(undefined); // force update board;
        })
    },
    uiSelection(type, option) {
      return resolveSelect(option);
    },
    selectAction(options) {
      return initiateSelect(SELECTING_OPTIONS.action, options);
    }
  };
};

export default createPlayer;