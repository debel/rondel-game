import { randomizeBoard, emptyTile } from './tiles';

import { playerHasFoodForOrder} from './orders';

export const SELECTING_OPTIONS = {
  food: 'food',
  tile: 'tile',
  position: 'position',
  order: 'order',
  action: 'action',
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
    async selectPosition() {
      return initiateSelect(SELECTING_OPTIONS.position).then(position => {
        if (position === 'x') { throw new Error('cannot select the centeral square'); }
        return position;
      });
    },
    async swapTiles(position1, position2) {
      const t1 = board[position1];
      const t2 = board[position2];

      t1.position = position2;
      t2.position = position1;

      board[position1] = t2;
      board[position2] = t1;
    },
    async selectTile() {
      return initiateSelect(SELECTING_OPTIONS.tile);
    },
    async placeTile(selectedTile) {
      return initiateSelect(SELECTING_OPTIONS.position)
        .then((selectedPosition) => {
          if (selectedPosition === 'x') {
            throw new Error('illegal position');
          }
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