import tileTypes, { emptyTile } from './tileTypes';

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
  const sequence = generateRandomSequence(tileTypes.length);
  const board = sequence.map((i, j) => ({ ...tileTypes[i], position: j }));
  board.x = emptyTile;
  return board;
};

const createPlayer = (name, ) => {
  const board = randomizeBoard();
  const modifiers = {};
  const foods = { sushi: 0, noodles: 0, tea: 0 };
  let position = 0;
  let money = 0;
  let points = 0;
  let initiateSelectFood = () => Promise.resolve();
  let initiateSelectOrder = () => Promise.resolve();
  let isSelectingFood = false;

  return {
    allowSelectFood(newSetter) {
      initiateSelectFood = newSetter;
    },
    allowSelectOrder(newSetter) {
      initiateSelectOrder = newSetter;
    },
    gainMoney(amount) {
      money += amount;
    },
    loseMoney(amount) {
      if (money < amount) {
        throw new Error('Not enough money');
      }

      money -= amount;
    },

    gainPoints(amount) {
      points += amount;
    },

    gainFood(type, amount) {
      if (!foods[type]) {
        foods[type] = 0;
      }

      foods[type] += amount;
    },
    async loseFood(type, amount) {
      if (!foods[type] || foods[type] < amount) {
        throw new Error(`Not enough ${type}`);
      }

      foods[type] -= amount;
    },
    selectFood() {
      const allFood = Object.entries(foods).reduce((result, [_, amount]) => result + amount, 0);
      if (allFood === 0) { throw new Error('Not enough food'); }

      isSelectingFood = true;
      return initiateSelectFood()
        .finally(() => {
          isSelectingFood = false;
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
    move(target) {
      if (isSelectingFood) throw new Error('select food first');

      const validForSmall = position < 6 && (position < target && target - position <= 2);
      const validForSix = position === 6 && (target === 7 || target === 0);
      const validForSeven = position === 7 && (target === 0 || target === 1);
      
      if (validForSmall || validForSix || validForSeven) {
        position = target;
        return board[target].activate(this);
      }

      throw new Error('Illigal move');
    },
    async fulfilOrder() {
      return initiateSelectOrder().then((selectedOrder) => {
        const foodItems = Object.entries(selectedOrder.foods);
        const hasAllRequiredFood = foodItems
          .map(([foodType, amount]) => foods[foodType] >= amount)
          .every(hasFoodType => hasFoodType === true);

        if (!hasAllRequiredFood) {
          throw new Error('Cannot fulfil order');
        }

        foodItems.forEach(([type, amount]) => {
          this.loseFood(type, amount);
        });

        this.gainPoints(selectedOrder.points);
      });
    },
  };
};

export default createPlayer;