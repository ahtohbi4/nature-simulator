const { pow, sqrt } = Math;

const pow2 = (value) => pow(value, 2);

export default ({ x, y }, { x: x1, y: y1 }) => sqrt(pow2(x - x1) + pow2(y - y1));
