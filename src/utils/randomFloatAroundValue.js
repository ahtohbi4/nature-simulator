import randomFloatInRange from './randomFloatInRange';

const DEFAULT_SCATTER = 20; // @units %

export default (value, scatter = DEFAULT_SCATTER) => {
  const min = value * (1 - (scatter / 100));
  const max = value * (1 + (scatter / 100));

  return randomFloatInRange(min, max);
};
