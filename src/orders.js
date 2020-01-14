const foodTypes = ['sushi', 'noodles', 'tea'];

const chooseRandomFood = () => foodTypes[Math.floor(Math.random() * 3)];

export const createOrder = (id, min = 2, max = 6) => {
    const itemCount = Math.floor(Math.random() * (max - 1)) + min;

    return Array.from(new Array(itemCount), chooseRandomFood).reduce((result, foodType) => {
        if (!result.foods[foodType]) {
            result.foods[foodType] = 0;
        }

        result.foods[foodType] += 1;

        return result;
    }, { id, foods: {}, points: 2* (itemCount -1) - 1, money: Math.min(itemCount - 1, 4) });
};

const createOrdersLine = (n = 3) => {
  const orders = Array.from(new Array(3), (_, i) => createOrder(i));

  return {
    currentOrders() { 
      return [...orders].filter(o => o);
    },
    discardOrder(id) {
      delete orders[id];
      orders[orders.length] = createOrder(orders.length);
    },
  };
};

export default createOrdersLine;

export const defaultOrdersLine = createOrdersLine();

export const playerHasFoodForOrder = (playerFoods, order) => Object.entries(order.foods)
.map(([foodType, amount]) => playerFoods[foodType] >= amount)
.every(hasFoodType => hasFoodType === true);
