import randomIntegerInRange from './randomIntegerInRange';

const { round } = Math;
const DEFAULT_SCATTER = 20; // @units %

export default (value, scatter = DEFAULT_SCATTER) => {
  const min = round(value * (1 - scatter / 100));
  const max = round(value * (1 + scatter / 100));

  return randomIntegerInRange(min, max);
};
