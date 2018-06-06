const { random } = Math;

export default (min, max) => random() * (max - min) + min;
