import Animal from './Animal';
import Habitat from './Habitat';

const LIFETIME_AVERAGE = 50;
const SPEED_AVERAGE = 10;
const VIEW_RADIUS_AVERAGE = 40;

export default class Tiger extends Animal {
  constructor(params = {}, options = {}) {
    super(
      Object.assign(params, {
        habitat: new Habitat({
          container: [
            { x: 0, y: 0 },
            { x: 500, y: 300 },
          ],
          name: 'Forest',
        }),
        lifetime: LIFETIME_AVERAGE,
        speed: SPEED_AVERAGE,
        viewRadius: VIEW_RADIUS_AVERAGE,
      }),
      options,
    );
  }
}
