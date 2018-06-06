const { floor, random } = Math;

export default (min, max) => floor(random() * (max - min + 1)) + min;
