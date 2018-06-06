import generate from 'nanoid/generate';

import randomFloatAroundValue from '../utils/randomFloatAroundValue';
import randomFloatInRange from '../utils/randomFloatInRange';
import randomIntegerInRange from '../utils/randomIntegerInRange';
import randomItemFromList from '../utils/randomItemFromList';

const VIEW_RADIUS_DEFAULT = 30;

export default class Animal {
  constructor(params, options = {}) {
    const {
      color = '#000',
      dayOfBirth,
      habitat,
      lifetime,
      parents = null,
      speed,
      viewRadius = VIEW_RADIUS_DEFAULT,

      pushMessage,
    } = params;

    // Окраска вида.
    this.color = color;
    // День рождения.
    this.dayOfBirth = dayOfBirth;
    // День смерти или гибели.
    this.dayOfDeath = null;
    // Уровень здоровьяю. Значение в процентах от 0 до 100.
    this.health = 100;
    // Уровень голода. Значение в процентах от 0 до 100.
    this.hunger = 0;

    // Ссылки на объекты родителей { father: <...>, mother: <...> }.
    this.parents = parents;
    // Среда обитания - прямоугольник.
    this.habitat = habitat;

    if (this.parents !== null) {
      const { mother: { direction, position } } = this.parents;

      this.direction = direction;
      this.position = position;
    } else {
      // Направление движения. Значение от -180 до 180 градусов относительно оси X.
      this.direction = Animal.generateDirection();
      // Положение особи в его среде обитания { x: <...>, y: <...> }.
      this.position = {
        x: randomIntegerInRange(this.habitat.x0, this.habitat.x1),
        y: randomIntegerInRange(this.habitat.y0, this.habitat.y1),
      };
    }

    // Кличка особи.
    this.name = generate('abcdefghijklmnopqrstuvwxyz', 5)
      .replace(/^\w/g, (char) => char.toUpperCase());

    // Пол особи.
    this.gender = randomItemFromList([
      Animal.GENDER_FEMALE,
      Animal.GENDER_MALE,
    ]);
    // Продолжительность жизни в днях.
    this.lifetime = randomFloatAroundValue(lifetime);

    if (speed > viewRadius) {
      throw new Error('The value of the parameter "viewRadius" must be greater than the value of the parameter "speed".');
    }

    // Скорость передвижения.
    this.speed = randomFloatAroundValue(speed);
    // Радиус обзора - расстояние, на котором особь может увидеть других особей.
    this.viewRadius = randomFloatAroundValue(viewRadius);

    this.say = (message) => pushMessage({
      author: this.name,
      message,
    });

    const {
      onBurn = () => null,
      onDie = () => null,
    } = options;
    this.onBurn = onBurn;
    this.onDie = onDie;

    this.onBurn(this);
    this.say(`Hi everyone! I am a ${this.type} <strong>${this.name}</strong>. Today I was born.`);
  }

  get isAlive() {
    return (this.health > 10);
  }

  get type() {
    return this.constructor.name.toLowerCase();
  }

  get vizibleWalls() {
    const {
      habitat: { x0, x1, y0, y1 },
      position: { x, y },
      viewRadius,
    } = this;

    return [
      ...(((y - viewRadius) <= y0) ? ['top'] : []),
      ...(((x + viewRadius) >= x1) ? ['right'] : []),
      ...(((y + viewRadius) >= y1) ? ['bottom'] : []),
      ...(((x - viewRadius) <= x0) ? ['left'] : []),
    ];
  }

  makeStep(params) {
    const { day, distances } = params;
    const age = day - this.dayOfBirth;

    if (age >= this.lifetime) {
      if (this.isAlive) {
        this.die({
          day,
          reason: Animal.DEATH_REASON_OLDNESS,
        });
      }

      return;
    }

    this.lookAround(distances);
    this.move();
  }

  lookAround(distances) {
    console.log(this.vizibleWalls)
  }

  move() {
    const { direction, position: { x, y }, speed } = this;

    const nextX = x + speed * Math.sin(direction);
    const nextY = y + speed * Math.cos(direction);

    this.position = {
      x: nextX,
      y: nextY,
    };
  }

  die(params) {
    const { day, reason } = params;

    this.health = 0;
    this.dayOfDeath = day;
    this.deathReason = reason;

    this.say('I see a light... Goodbye... my friends...');
    this.onDie(this);
  }

  render(canvas) {
    const { position: { x, y } } = this;

    canvas.beginPath();
    canvas.arc(x, y, 3, 0, Math.PI * 2, true);
    canvas.fillStyle = this.color;
    canvas.fill();

    if (this.isAlive) {
      canvas.arc(x, y, this.viewRadius, 0, Math.PI * 2, true);
      canvas.fillStyle = 'rgba(139, 195, 74, .2)';
      canvas.fill();
    }

    canvas.font = '300 10px/18px Arial';
    canvas.fillStyle = this.color;
    canvas.fillText(`${this.name} (${this.gender})`, x + 2, y - 9);
  }
}

Animal.generateDirection = (from = -180, to = 180) => (
  (randomFloatInRange(from, to) * Math.PI) / 180
);

Animal.DEATH_REASON_ILLNESS = 'illness';
Animal.DEATH_REASON_KILLING = 'killing';
Animal.DEATH_REASON_OLDNESS = 'oldness';

Animal.GENDER_FEMALE = 'female';
Animal.GENDER_MALE = 'male';
