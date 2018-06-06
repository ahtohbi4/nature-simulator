export default class Habitat {
  constructor(params) {
    const { container, name } = params;

    this.container = container;
    this.name = name;
  }

  get x0() {
    return this.container[0].x;
  }

  get x1() {
    return this.container[1].x;
  }

  get y0() {
    return this.container[0].y;
  }

  get y1() {
    return this.container[1].y;
  }

  checkInclusion({ x, y }) {
    const [{ x: x0, y: y0 }, { x: x1, y: y1 }] = this.container;

    return (x >= x0 && x <= x1 && y >= y0 && y <= y1);
  }
}
