import Tiger from './Tiger';
import calculateDistance from '../utils/calculateDistance';

const DAY_DURATION = 500; // @units ms
const DAY_OF_APOCALYPSE = 100;

const START_POPULATION = [
  {
    Animal: Tiger,
    count: 2,
  },
];

export default class Planet {
  constructor(params) {
    const {
      container,
      name,
      width,
      height,

      notifications,
    } = params;
    this.container = container;
  
    const canvas = document.createElement('canvas');
    this.width = canvas.width = width;
    this.height = canvas.height = height;
    this.container.appendChild(canvas);

    if (typeof canvas.getContext !== 'function') {
      throw new Error('Canvas is not supported.');
    }

    this.canvas = canvas.getContext('2d');

    this.name = name;

    this.animals = [];
    this.day = 0;

    this.pushMessage = (params) => notifications.push(Object.assign(params, {
      day: this.day,
    }));

    this.makeStep = this.makeStep.bind(this);
  }

  /**
   * @examples
   *
   * {
   *   <name>: [
   *     {
   *       distance: <number>,
   *       target: <Animal>,
   *     },
   *     <...>
   *   ],
   * }
   */
  get distances() {
    const result = {};

    this.animals.forEach((animal, index, animals) => {
      const { name, position } = animal;

      animals.slice(index + 1).forEach(neighbor => {
        const { name: nName, position: nPosition } = neighbor;
        const distance = calculateDistance(position, nPosition);

        result[name] = Array.prototype.concat(result[name] || [], [
          {
            distance,
            target: neighbor,
          },
        ]);
        result[nName] = Array.prototype.concat(result[nName] || [], [
          {
            distance,
            target: animal,
          },
        ]);
      });
    });

    return result;
  }

  start() {
    this.pushMessage({
      message: 'Well... We are starting!',
    })

    this.populate();

    this.iterator = setInterval(this.makeStep, DAY_DURATION);
  }

  populate() {
    this.animals = START_POPULATION.reduce(
      (result, { Animal, count }) => [
        ...result,
        ...Array.apply(null, Array(count)).map(
          () =>
            new Animal({
              dayOfBirth: this.day,
              pushMessage: this.pushMessage,
            }, {
              onDie: ({ name, type }) => {
                this.pushMessage({
                  message: `The ${type} <strong>${name}</strong> has died.`,
                });
              },
            }),
        ),
      ],
      [],
    );

    this.pushMessage({
      message: `Planet <strong>${this.name}</strong> was populated...`,
    })

    this.render();
  }

  makeStep() {
    if (this.day === DAY_OF_APOCALYPSE) {
      clearInterval(this.iterator);

      return this;
    }

    this.animals.forEach(animal => animal.makeStep({
      day: this.day,
      distances: this.distances[animal.name],
    }));

    this.render();
    this.day += 1;
  }

  render() {
    this.canvas.clearRect(0, 0, this.width, this.height)
    this.canvas.strokeRect(0, 0, this.width, this.height);

    this.animals.forEach((animal) => animal.render(this.canvas));

    this.canvas.fillStyle = '#345';
    this.canvas.font = '300 14px/18px Arial';
    this.canvas.fillText(`Day ${this.day}`, 5, 18);
  }
}
