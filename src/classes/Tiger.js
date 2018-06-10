import Animal from "./Animal";
import Habitat from "./Habitat";

const LIFETIME_AVERAGE = 100;
const REPRODUCTIVE_AGE = [14, 90]; // from 14% to 90% from LIFETIME_AVERAGE
const SPEED_AVERAGE = 10;
const VIEW_RADIUS_AVERAGE = 40;

export default class Tiger extends Animal {
  constructor(params = {}, options = {}) {
    super(
      Object.assign(params, {
        habitat: new Habitat({
          container: [{ x: 0, y: 0 }, { x: 500, y: 300 }],
          name: "Forest"
        }),
        lifetime: LIFETIME_AVERAGE,
        reproductiveAge: REPRODUCTIVE_AGE,
        speed: SPEED_AVERAGE,
        viewRadius: VIEW_RADIUS_AVERAGE
      }),
      options
    );
  }
}
