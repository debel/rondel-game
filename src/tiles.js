import { defaultOrdersLine, playerHasFoodForOrder } from './orders';

const gainFood = foodType => (player, numberOfMeeples = 1) => {
  return Promise.resolve(player.gainFood(foodType, numberOfMeeples));
};

const gainSelectedFoodExcept = (forbiddenFood, tile, player, numberOfMeeples = 1) => {
  return player.selectFood(false)
    .then(({ foodType, amount }) => {
      if (foodType === forbiddenFood) {
        alert(`Cannot make ${forbiddenFood} here`);
        return tile.activate(player, numberOfMeeples);
      }
      return player.gainFood(foodType, numberOfMeeples);
    });
};

const sellAFood = (player, numberOfMeeples = 1) => player.selectFood().then(({ foodType, amount }) => (
  player.loseFood(foodType, amount)
    .then(() => player.gainMoney(amount * numberOfMeeples))
));

export const emptyTile = {
  icon: '',
  title: '',
  description: '',
  type: 0,
  cost: 0,
  position: 'x',
  activate(playerState, numberOfMeeples) { },
};

export const fancyTiles = [
  {
    icon: '🍵 / 🍜',
    title: 'Tea or Noodles',
    description: 'make either tea or noodles',
    type: 1,
    cost: 2,
    activate(player, numberOfMeeples = 1) {
      return gainSelectedFoodExcept('sushi', this, player, numberOfMeeples);
    },
  },
  {
    icon: '🍵 / 🍣',
    title: 'Tea or Sushi',
    description: 'make either tea or sushi',
    type: 1,
    cost: 2,
    activate(player, numberOfMeeples = 1) {
      return gainSelectedFoodExcept('noodles', this, player, numberOfMeeples);
    },
  },
  {
    icon: '🍣 / 🍜',
    title: 'Sushi or Noodles',
    description: 'make either sushi or noodles',
    type: 1,
    cost: 2,
    activate(player, numberOfMeeples = 1) {
      return gainSelectedFoodExcept('tea', this, player, numberOfMeeples);
    },
  },
  {
    icon: '🥡 / 🍽️',
    title: 'Sell or Dine',
    description: 'discard food for money or fulfil an order',
    type: 1,
    cost: 4,
    activate(player, numberOfMeeples = 1) {
      const thisTile = this;
      return player.selectAction([
        { icon: '🍽️', action() { return baseTiles[6].activate(player).catch(error => {
          alert(error);
          return thisTile.activate(player);
        }); }},
        { icon: '🥡', action() { return baseTiles[3].activate(player).catch(error => {
          alert(error);
          return thisTile.activate(player);
        }); }},
      ]);
    },
  },
  {
    icon: '🥡🥡',
    title: 'Sell 2 food',
    description: 'sell 2 food',
    type: 1,
    cost: 3,
    activate(player, numberOfMeeples = 1) {
      return sellAFood(player, numberOfMeeples)
        .then(() => sellAFood(player, numberOfMeeples))
        .catch((error) => {
          return this.activate(player);
        });
    },
  },
];

const baseTiles = [
  {
    icon: '🍣',
    title: 'Sushi',
    description: 'Cook some sushi',
    type: 0,
    cost: 0,
    activate: gainFood('sushi'),
  },
  {
    icon: '🍜',
    title: 'Noodles',
    description: 'Cook some noodles',
    type: 0,
    cost: 0,
    activate: gainFood('noodles'),
  },
  {
    icon: '🍵',
    title: 'Tea',
    description: 'Produce some tea',
    type: 0,
    cost: 0,
    activate: gainFood('tea'),
  },
  {
    icon: '🥡',
    title: 'Takeout',
    description: 'Sell food for money',
    type: 0,
    cost: 0,
    async activate(player, numberOfMeeples = 1) {
      if (!player.hasAnyFood()) { throw new Error('no food to sell'); }

      return player.selectFood().then(({ foodType, amount }) => (
        player.loseFood(foodType, amount)
          .then(() => player.gainMoney(amount * numberOfMeeples))
          .catch((error) => {
            alert(error);
            return this.activate(player);
          })
      ));
    },
  },
  {
    icon: '👩‍🍳',
    title: 'Hire',
    description: 'Hire a worker (new meeple)',
    type: 0,
    cost: 0,
    async activate(player, numberOfMeeples) { },
  },
  {
    icon: '🛠️',
    title: 'Improve',
    description: 'Improve your restaurant (buy tiles)',
    type: 0,
    cost: 0,
    async activate(player, numberOfMeeples) {
      const canBuyATile = fancyTiles
        .map(tile => player.currentMoney() >= tile.cost)
        .some(canBuy => canBuy === true);

      if (!canBuyATile) {
        throw new Error('cannot afford any tiles');
      }

      return player.selectTile()
        .then(tile => player.loseMoney(tile.cost)
          .then(
            () => player.placeTile(tile),
            (error) => {
            alert(error);
            return this.activate(player);
          })
        )
    },
  },
  {
    icon: '🍽️',
    title: 'Dining',
    description: 'Fulfil an order',
    type: 0,
    cost: 0,
    async activate(player, numberOfMeeples = 1) {
      const hasValidOptions = defaultOrdersLine.currentOrders()
      .map(order => playerHasFoodForOrder(player.currentFood(), order))
      .some(canFulfil => canFulfil === true);
    
      if (!hasValidOptions) { throw new Error('Cannot fulfil any orders right now'); }

      return player.selectOrder()
        .then(selectedOrder => player.fulfilOrder(selectedOrder), alert)
        .catch((error) => {
          alert(error);
          return this.activate(player);
      });
    }
  },
  {
    icon: '🧩',
    name: 'Rearrange',
    text: 'Rearrange tiles on your board',
    type: 0,
    cost: 0,
    activate(player, numberOfMeeples) {
    },
  },
];

export default baseTiles;