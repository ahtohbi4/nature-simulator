import randomIntegerInRange from './randomIntegerInRange';

export default (list) => list[randomIntegerInRange(0, list.length - 1)];
