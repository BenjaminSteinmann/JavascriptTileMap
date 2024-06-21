import { Config } from "./config.js";

export default class Tile {
  constructor(x, y, terrain) {
    this.x = x;
    this.y = y;
    this.terrain = terrain;
    this.dirty = false;
    this.color = Config.terrainColor[terrain];
  }

  setBitmask(bitmask) {
    if (bitmask !== 0) this.dirty = true;
    this.bitmask = bitmask;
    
  }
}
