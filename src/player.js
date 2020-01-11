import baseTiles, { emptyTile } from './tiles';

emptyTile.icon = '🍵 + 1';

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

const playerHasFoodForOrder = (playerFoods, order) => Object.entries(order.foods)
.map(([foodType, amount]) => playerFoods[foodType] >= amount)
.every(hasFoodType => hasFoodType === true);

const createPlayer = (name, ordersLine, tileMarket) => {
  const board = randomizeBoard();
  const modifiers = {
    gainFood(foodType, amount) {
      if (foodType === 'tea') {
        this.gainFood('tea', 1, false);
      }
    }
  };
  const foods = { sushi: 0, noodles: 0, tea: 0 };
  let position = 0;
  let money = 0;
  let points = 0;
  let initiateSelectFood = () => Promise.resolve();
  let initiateSelectOrder = () => Promise.resolve();
  let initiateSelectTile = () => Promise.resolve();
  let initiateTilePlacement = () => Promise.resolve();
  let notifyOnMove = () => {};
  let isSelecting = null;

  return {
    allowSelectFood(newSetter) {
      initiateSelectFood = newSetter;
    },
    allowSelectOrder(newSetter) {
      initiateSelectOrder = newSetter;
    },
    allowSelectTile(newSetter) {
      initiateSelectTile = newSetter;
    },
    allowPlaceTile(newSetter) {
      initiateTilePlacement = newSetter;
    },
    gainMoney(amount) {
      money += amount;
    },
    async loseMoney(amount) {
      if (money < amount) {
        throw new Error('Not enough money');
      }

      money -= amount;
    },
    gainPoints(amount) {
      points += amount;
    },
    gainFood(type, amount, callModifiers = true) {
      if (!foods[type]) {
        foods[type] = 0;
      }

      if (callModifiers && modifiers['gainFood']) {
        modifiers.gainFood.call(this, type, amount);
      }

      foods[type] += amount;
    },
    async loseFood(type, amount) {
      if (!foods[type] || foods[type] < amount) {
        throw new Error(`Not enough ${type}`);
      }

      foods[type] -= amount;
    },
    selectFood(checkIfHas = true) {
      if (isSelecting) {
        throw new Error(`already selecting ${isSelecting}`);
      }

      const allFood = Object.entries(foods).reduce((result, [_, amount]) => result + amount, 0);
      if (checkIfHas && allFood === 0) { throw new Error('Not enough food'); }

      isSelecting = 'food';
      return initiateSelectFood()
        .finally(() => {
          isSelecting = null;
        });
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
    getPosition() {
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
    async selectOrder(allOrders) {
      if (isSelecting) { throw new Error(`already selecting ${isSelecting}`)};

      const hasValidOptions = ordersLine.currentOrders()
        .map(order => playerHasFoodForOrder(foods, order))
        .some(canFulfil => canFulfil === true);
      
      if (!hasValidOptions) { throw new Error('Cannot fulfil any orders right now'); }

      return initiateSelectOrder();
    },
    async fulfilOrder(selectedOrder) {
      const foodItems = Object.entries(selectedOrder.foods);
      
      if (!playerHasFoodForOrder(foods, selectedOrder)) {
        throw new Error('Cannot fulfil order');
      }

      foodItems.forEach(([type, amount]) => {
        this.loseFood(type, amount);
      });

      ordersLine.discardOrder(selectedOrder.id);
      this.gainPoints(selectedOrder.points);
      this.gainMoney(selectedOrder.money);
    },
    async selectTile() {
      if (isSelecting) { throw new Error(`already selecting ${isSelecting}`)};

      const canBuyATile = tileMarket
        .map(tile => money >= tile.cost)
        .some(canBuy => canBuy === true);

      if (!canBuyATile) {
        throw new Error('cannot afford any tiles');
      }
  
      isSelecting = true;
      return initiateSelectTile();
    },
    async placeTile(selectedTile) {
      return this.loseMoney(selectedTile.cost)
        .then(initiateTilePlacement)
        .then((selectedPosition) => {
          board[selectedPosition] = { ...selectedTile, position: selectedPosition };  
        }).finally(() => { isSelecting = false; });
    },
  };
};

export default createPlayer;