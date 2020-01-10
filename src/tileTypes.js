const gainFood = foodType => (player, numberOfMeeples = 1) => {
    return Promise.resolve(player.gainFood(foodType, numberOfMeeples));
};

const foodTypes = ['sushi', 'noodles', 'tea'];

const chooseRandomFood = () => foodTypes[Math.floor(Math.random() * 3)];

export const createOrder = (min = 2, max = 5) => {
    const itemCount = Math.floor(Math.random() * (max - 1)) + min;

    return Array.from(new Array(itemCount), chooseRandomFood).reduce((result, foodType) => {
        if (!result.foods[foodType]) {
            result.foods[foodType] = 0;
        }

        result.foods[foodType] += 1;

        return result;
    }, { foods: {}, points: Math.floor(itemCount/2 +itemCount*itemCount/5) });
};

const tileTypes = [
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
        activate(player, numberOfMeeples = 1) {
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
        activate(playerState, numberOfMeeples) {},
    },
    {
        icon: '🛠️',
        title: 'Improve',
        description: 'Improve your restaurant (buy tiles)',
        type: 0,
        cost: 0,
        activate(playerState, numberOfMeeples) {},
    },
    {
        icon: '🍽️',
        title: 'Dining',
        description: 'Get points for food',
        type: 0,
        cost: 0,
        activate(player, numberOfMeeples = 1) {
            return player.fulfilOrder()
                .catch((error) => {
                    alert(error);
                    this.activate(player);
                })
        }
    },
    {
        icon: '🧩',
        name: 'Rearrange',
        text: 'Rearrange tiles on your board',
        type: 0,
        cost: 0,
        activate(playerState, numberOfMeeples) {},
    },
];

export const emptyTile = {
    icon: '',
    title: '',
    description: '',
    type: 0,
    cost: 0,
    position: 'x',
    activate(playerState, numberOfMeeples) {},  
};

export default tileTypes;