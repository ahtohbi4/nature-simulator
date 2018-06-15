import NotificationsManager from './NotificationsManager';
import Tiger from './Tiger';
import calculateDistance from '../utils/calculateDistance';

const DAY_DURATION = 150; // @units ms
const DAY_OF_APOCALYPSE = 1000;

const START_POPULATION = [
  {
    Animal: Tiger,
    count: 6,
  },
];

export default class Planet {
  constructor(params) {
    const {
      container,
      notificationsContainer,

      name,
      width,
      height,
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

    // Объект окружения. Хранит такие параметры планеты, которые должны быть доступны во внутренних объектах.
    this.environment = {
      // Текущий день.
      day: 0,
    };

    this.notifications = new NotificationsManager({
      container: notificationsContainer,
    }, {
      environment: this.environment,
    });

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

  notify(message) {
    this.notifications.push({ message });
  }

  start() {
    this.notify('Well... We are starting!');

    this.populate();

    this.iterator = setInterval(this.makeStep, DAY_DURATION);
  }

  populate() {
    this.animals = START_POPULATION.reduce(
      (result, { Animal, count }) => [
        ...result,
        ...Array.apply(null, Array(count)).map(
          () =>
            new Animal({}, {
              environment: this.environment,
              notifications: this.notifications,

              onChildbirth: (child) => {
                this.animals.push(child);
              },
              onDie: ({ name, type }) => {
                this.notify(`The ${type} <strong>${name}</strong> has died.`);
              },
            }),
        ),
      ],
      [],
    );

    this.notify(`Planet <strong>${this.name}</strong> was populated...`);

    this.render();
  }

  makeStep() {
    if (this.environment.day === DAY_OF_APOCALYPSE) {
      clearInterval(this.iterator);

      return this;
    }

    this.animals.forEach(animal => animal.makeStep({
      distances: this.distances[animal.name],
    }));

    this.render();
    this.environment.day += 1;
  }

  render() {
    this.canvas.clearRect(0, 0, this.width, this.height)
    this.canvas.strokeRect(0, 0, this.width, this.height);

    this.animals.forEach((animal) => animal.render(this.canvas));

    this.canvas.fillStyle = '#345';
    this.canvas.font = '300 14px/18px Arial';
    this.canvas.fillText(`Day ${this.environment.day}`, 5, 18);
  }
}
