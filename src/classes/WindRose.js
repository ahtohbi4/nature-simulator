import randomFloatInRange from '../utils/randomFloatInRange';
import randomItemFromList from '../utils/randomItemFromList';

export default class WindRose {
  constructor() {
    this.directions = {
      n: {
        name: 'North',
        sector: -90,
      },
      ne: {
        name: 'North-East',
        sector: [0, -90],
      },
      e: {
        name: 'East',
        sector: 0,
      },
      se: {
        name: 'South-East',
        sector: [0, 90],
      },
      s: {
        name: 'South',
        sector: 90,
      },
      sw: {
        name: 'South-West',
        sector: [180, 90],
      },
      w: {
        name: 'West',
        sector: 180,
      },
      nw: {
        name: 'North-West',
        sector: [-90, -180],
      },
    };

    this.isModified = false;
  }

  /**
   * Gets all available sectors.
   *
   * @returns {Array<Array<number>|number>}
   */
  get sectors() {
    return Object.keys(this.directions)
      .map((alias) => this.directions[alias].sector);
  }

  /**
   * Gets from all available sectors range ones (is array).
   *
   * @returns {Array<number>}
   */
  get rangeSectors() {
    return this.sectors
      .filter((sector) => Array.isArray(sector));
  }

  get randomDirection() {
    const rangeSectors = this.rangeSectors;
    let direction;

    if (rangeSectors.length > 0) {
      direction = randomItemFromList(this.rangeSectors);
    } else {
      direction = randomItemFromList(this.sectors);
    }

    if (Array.isArray(direction)) {
      return WindRose.convertToRadians(randomFloatInRange.apply(null, direction));
    }

    return WindRose.convertToRadians(direction);
  }

  checkDirection(directionInRadians) {
    const direction = WindRose.convertToDegrees(directionInRadians);

    return this.sectors.some((sector) => {
      if (Array.isArray(sector)) {
        const [min, max] = sector;

        return (direction >= min && direction <= max);
      }

      return (direction === sector);
    });
  }

  subtract(directions) {
    const directionsArray = Array.isArray(directions) ?
      directions : [directions];
    
    directionsArray.forEach((direction) => {
      delete this.directions[direction];
    });

    if (!this.isModified) {
      this.isModified = true;
    }
  }
}

WindRose.convertToDegrees = (value) => ((value * 180) / Math.PI);
WindRose.convertToRadians = (value) => ((value * Math.PI) / 180);
