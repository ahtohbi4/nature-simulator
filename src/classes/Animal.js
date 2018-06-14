import generate from "nanoid/generate";

import WindRose from "./WindRose";

import randomFloatAroundValue from "../utils/randomFloatAroundValue";
import randomIntegerInRange from "../utils/randomIntegerInRange";
import randomIntegerAroundValue from "../utils/randomIntegerAroundValue";
import randomItemFromList from "../utils/randomItemFromList";

const ACTION_RADIUS_DEFAULT = 10;
const VIEW_RADIUS_DEFAULT = 30;

export default class Animal {
  constructor(params, options = {}) {
    const {
      color = '#000',
      habitat,
      lifetime,
      parents = {},
      reproductiveAge: [reproductiveAgeFrom, reproductiveAgeTo],
      speed,

      actionRadius = ACTION_RADIUS_DEFAULT,
      viewRadius = VIEW_RADIUS_DEFAULT,
    } = params;

    // Окраска вида.
    this.color = color;
    // Эмоция особи.
    this.emotion = Animal.EMOTION_NORMAL;
    // Уровень здоровьяю. Значение в процентах от 0 до 100.
    this.health = 100;
    // Уровень голода. Значение в процентах от 0 до 100.
    this.hunger = 0;

    // Ссылки на объекты родителей { father: <...>, mother: <...> }.
    this.parents = parents;
    // Среда обитания - прямоугольник.
    this.habitat = habitat;

    const { mother } = this.parents;

    if (mother) {
      const { direction, position } = mother;

      this.direction = direction;
      this.position = position;
    } else {
      // Direction will be generated at first step.
      this.direction = null;
      // Положение особи в его среде обитания { x: <...>, y: <...> }.
      this.position = {
        x: randomIntegerInRange(this.habitat.x0, this.habitat.x1),
        y: randomIntegerInRange(this.habitat.y0, this.habitat.y1)
      };
    }

    // Кличка особи.
    this.name = generate('abcdefghijklmnopqrstuvwxyz', 5).replace(
      /^\w/g,
      char => char.toUpperCase()
    );

    // Пол особи.
    this.gender = randomItemFromList([
      Animal.GENDER_FEMALE,
      Animal.GENDER_MALE
    ]);
    // Продолжительность жизни в днях.
    this.lifetime = randomFloatAroundValue(lifetime);

    if (speed > viewRadius) {
      throw new Error('The value of the parameter "viewRadius" must be greater than the value of the parameter "speed".');
    }

    // Скорость передвижения.
    this.speed = randomFloatAroundValue(speed);
    // Радиус действия - расстояние, на котором особь может взаимодействовать с другими особями.
    this.actionRadius = randomFloatAroundValue(actionRadius);
    // Радиус обзора - расстояние, на котором особь может увидеть других особей.
    this.viewRadius = randomFloatAroundValue(viewRadius);

    // Рапродуктивный возраст [<от>, <до>].
    this.reproductiveAge = [
      randomIntegerAroundValue(reproductiveAgeFrom),
      randomIntegerAroundValue(reproductiveAgeTo)
    ];
    // Период восстановления особи перед следующим пометом.
    this.postnatalPeriodDuration = 10 * (this.viewRadius / this.speed);
    // День последнего помета.
    this.dayOfLastChildbirth = undefined;

    const {
      environment,
      notifications,

      onBurn = () => null,
      onDie = () => null,
      onChildbirth = () => null,
    } = options;

    this.environment = environment;
    this.notifications = notifications;

    // День рождения.
    this.dayOfBirth = this.environment.day;
    // День смерти или гибели.
    this.dayOfDeath = null;

    this.onBurn = onBurn;
    this.onChildbirth = onChildbirth;
    this.onDie = onDie;

    this.onBurn(this);
    this.say(`Hi everyone! I am a ${this.fullName}. Today I was born.`);
  }

  get age() {
    const { dayOfBirth, environment: { day } } = this;

    return (day - dayOfBirth);
  }

  get isAlive() {
    return this.health > 10;
  }

  get isReadyToReproduction() {
    const {
      age,
      dayOfLastChildbirth,
      emotion,
      environment: { day },
      gender,
      postnatalPeriodDuration,
      reproductiveAge: [
        reproductiveAgeFrom,
        reproductiveAgeTo,
      ],
    } = this;

    return (
      age >= reproductiveAgeFrom && age <= reproductiveAgeTo &&
      emotion !== Animal.EMOTION_SCARED &&
      (
        (
          gender === Animal.GENDER_FEMALE &&
          (
            dayOfLastChildbirth === undefined ||
            (day - dayOfLastChildbirth) >= postnatalPeriodDuration
          )
        ) ||
        gender === Animal.GENDER_MALE
      )
    );
  }

  get type() {
    return this.constructor.name.toLowerCase();
  }

  get fullName() {
    return `${this.type} ${this.name}`;
  }

  checkСompatibility(partner) {
    const {
      gender,
      isReadyToReproduction,
      parents: {
        father,
        mother,
      },
    } = partner;

    return (
      this.gender !== gender &&
      this.isReadyToReproduction &&
      isReadyToReproduction &&
      this !== father && this !== mother &&
      this.parents.father !== partner && this.parents.mother !== partner
    );
  }

  // Роды.
  giveBirth(father) {
    this.dayOfLastChildbirth = this.environment.day;

    return new this.constructor({
      parents: {
        father,
        mother: this,
      },
    }, {
      environment: this.environment,
      notifications: this.notifications,

      onChildbirth: this.onChildbirth,
      onDie: this.onDie,
    });
  }

  say(message) {
    this.notifications.push({
      author: this.fullName,
      message,
    });
  }

  makeStep(params) {
    if (this.age >= this.lifetime) {
      if (this.isAlive) {
        this.die({
          reason: Animal.DEATH_REASON_OLDNESS
        });
      }

      return;
    }

    this.lookAround(params);
    this.move();
  }

  lookAround(params) {
    const { distances } = params;

    distances.forEach(({ distance, target }) => {
      if (distance <= this.viewRadius && this.checkСompatibility(target)) {
        if (distance <= this.actionRadius && distance <= target.actionRadius) {
          // Обе особи в радиусах действия друг-друга.
          if (this.gender === Animal.GENDER_FEMALE) {
            // Особь женского пола приносит потомство.
            this.onChildbirth(this.giveBirth(target));
            // Особь мужского пола идет по своим делам.
            target.recalculateDirection({ isForced: true });
          }
        } else {
          this.directTo(target);
        } 
      } else {
        // Особь бежит дальше, смотря, чтобы не выбежать за границы своей среды обитания.
        this.recalculateDirection();
      }
    });
  }

  directTo(target) {
    const { position: { x, y } } = this;
    const { position: { x: xt, y: yt } } = target;

    this.direction = Math.atan2(yt - y, xt - x);
  }

  recalculateDirection(params = {}) {
    const { isForced = false } = params;
    const {
      habitat: { x0, x1, y0, y1 },
      position: { x, y },
      viewRadius
    } = this;
    const availableDirections = new WindRose();

    if (y - viewRadius <= y0) {
      availableDirections.subtract(['n', 'ne', 'nw']);
    }

    if (x + viewRadius >= x1) {
      availableDirections.subtract(['ne', 'e', 'se']);
    }

    if (y + viewRadius >= y1) {
      availableDirections.subtract(['se', 's', 'sw']);
    }

    if (x - viewRadius <= x0) {
      availableDirections.subtract(['sw', 'w', 'nw']);
    }

    const shouldRecalculate = (() => {
      if (isForced) {
        return true;
      }

      if (this.direction === null) {
        return true;
      }

      if (availableDirections.isModified && !availableDirections.checkDirection(this.direction)) {
        return true;
      }

      return false;
    })();

    if (shouldRecalculate) {
      this.direction = availableDirections.randomDirection;
    }
  }

  move() {
    const { direction, position: { x, y }, speed } = this;

    const nextX = x + speed * Math.cos(direction);
    const nextY = y + speed * Math.sin(direction);

    this.position = {
      x: nextX,
      y: nextY
    };
  }

  die(params) {
    const { reason } = params;

    this.health = 0;
    this.dayOfDeath = this.environment.day;
    this.deathReason = reason;

    this.say('I see a light... Goodbye... my friends...');
    this.onDie(this);
  }

  render(canvas) {
    const { position: { x, y } } = this;

    if (this.isAlive) {
      canvas.beginPath();
      canvas.arc(x, y, this.actionRadius, 0, Math.PI * 2, true);
      canvas.fillStyle = 'rgba(139, 195, 74, .7)';
      canvas.fill();

      canvas.beginPath();
      canvas.arc(x, y, this.viewRadius, 0, Math.PI * 2, true);
      canvas.fillStyle = 'rgba(139, 195, 74, .2)';
      canvas.fill();
    }

    canvas.beginPath();
    canvas.arc(x, y, 2, 0, Math.PI * 2, true);
    canvas.fillStyle = this.color;
    canvas.fill();

    canvas.font = '300 10px/18px Arial';
    canvas.fillStyle = this.color;
    canvas.fillText(`${this.fullName} (${this.gender})`, x + 2, y - 9);
  }
}

Animal.EMOTION_IN_LOVE = 'in love';
Animal.EMOTION_NORMAL = 'normal';
Animal.EMOTION_SCARED = 'scared';

Animal.DEATH_REASON_ILLNESS = 'illness';
Animal.DEATH_REASON_KILLING = 'killing';
Animal.DEATH_REASON_OLDNESS = 'oldness';

Animal.GENDER_FEMALE = 'female';
Animal.GENDER_MALE = 'male';
