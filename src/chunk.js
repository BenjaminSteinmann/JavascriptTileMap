import { Config } from "./config.js";
import openSimplexNoise from "../lib/simplexNoise.js";
import Tile from "./tile.js";

export class Chunk {
  constructor(x, y, seed) {
    this.x = x;
    this.y = y;
    this.entities = [[]];
    this.tiles = [[]];
    this.renderedZoom = [];
    this.seed = seed;
    this.noise = openSimplexNoise(seed);
    this.generateTiles();
  }

  addEntity(entity) {
    if (!this.entities[entity.relX]) this.entities[entity.relX] = [];
    this.entities[entity.relX][entity.relY] = entity;
    this.rerenderRequired();
  }

  removeEntity(entity) {
    if (!this.entities[entity.relX]) return;
    this.entities[entity.relX][entity.relY] = undefined;
    this.rerenderRequired();
  }

  removeAllEntities() {
    this.entities = [[]];
    this.rerenderRequired();
  }

  getEntityAt(x, y) {
    if (!this.entities[x]) return;
    return this.entities[x][y];
  }

  getEntityAtAbs(x, y) {
    let relX = x - this.x * Config.CHUNK_SIZE;
    let relY = y - this.y * Config.CHUNK_SIZE;
    if (relX < 0) relX += Config.CHUNK_SIZE;
    if (relY < 0) relY += Config.CHUNK_SIZE;

    return this.getEntityAt(relX, relY);
  }

  /**
   * Renders the context
   * @param {CanvasRenderingContext2D} ctx - The rendering context.
   * @param {Camera} camera - The zoom level.
   */
  render(ctx, camera) {
    let canvas = this.renderedZoom[camera.zoom];
    if (!canvas) {
      canvas = new OffscreenCanvas(
        Config.CHUNK_SIZE * Config.TILE_SIZE * camera.zoom,
        Config.CHUNK_SIZE * Config.TILE_SIZE * camera.zoom
      );
      let context = canvas.getContext("2d");
      context.font = "10px sans-serif";
      for (let x = 0; x < Config.CHUNK_SIZE; x++) {
        for (let y = 0; y < Config.CHUNK_SIZE; y++) {
          const tile = this.tiles[x][y];
          if (tile) {
            context.fillStyle = tile.color;
            context.fillRect(
              x * Config.TILE_SIZE * camera.zoom,
              y * Config.TILE_SIZE * camera.zoom,
              Config.TILE_SIZE * camera.zoom,
              Config.TILE_SIZE * camera.zoom
            );
            if (tile.dirty && camera.zoom >= 1) {
              context.fillStyle = "white";
              context.textAlign = "center";
              context.fillText(
                tile.bitmask,
                x * Config.TILE_SIZE * camera.zoom +
                  (Config.TILE_SIZE * camera.zoom) / 2,
                y * Config.TILE_SIZE * camera.zoom +
                  (Config.TILE_SIZE * camera.zoom) / 2
              );
            }
          }
        }
      }
      for (let x = 0; x < Config.CHUNK_SIZE; x++) {
        for (let y = 0; y < Config.CHUNK_SIZE; y++) {
          if (this.entities[x] && this.entities[x][y]) {
            this.entities[x][y].render(context, camera);
          }
        }
      }
      this.renderedZoom[camera.zoom] = canvas;
      //console.log("Rerendered chunk", this.x, this.y, "zoom:", zoom);
    }
    let chunkBegin = {
      x: this.x * Config.CHUNK_SIZE,
      y: this.y * Config.CHUNK_SIZE,
    };
    let chunkEnd = {
      x: chunkBegin.x + Config.CHUNK_SIZE,
      y: chunkBegin.y + Config.CHUNK_SIZE,
    };
    let cutout = { x: 0, y: 0, width: canvas.width, height: canvas.height };
    if (chunkBegin.x < camera.topLeft.x) {
      cutout.x =
        (camera.topLeft.x - chunkBegin.x) * Config.TILE_SIZE * camera.zoom;
      cutout.width -= cutout.x;
    }
    if (chunkBegin.y < camera.topLeft.y) {
      cutout.y =
        (camera.topLeft.y - chunkBegin.y) * Config.TILE_SIZE * camera.zoom;
      cutout.height -= cutout.y;
    }
    if (chunkEnd.x > camera.bottomRight.x)
      cutout.width -=
        (chunkEnd.x - camera.bottomRight.x) * Config.TILE_SIZE * camera.zoom;
    if (chunkEnd.y > camera.bottomRight.y)
      cutout.height -=
        (chunkEnd.y - camera.bottomRight.y) * Config.TILE_SIZE * camera.zoom;
    ctx.drawImage(
      canvas,
      Math.floor(cutout.x),
      Math.floor(cutout.y),
      Math.ceil(cutout.width),
      Math.ceil(cutout.height),
      Math.floor(
        (this.x * Config.CHUNK_SIZE - camera.topLeft.x) *
          Config.TILE_SIZE *
          camera.zoom +
          cutout.x
      ),
      Math.floor(
        (this.y * Config.CHUNK_SIZE - camera.topLeft.y) *
          Config.TILE_SIZE *
          camera.zoom +
          cutout.y
      ),
      Math.ceil(cutout.width),
      Math.ceil(cutout.height)
    );
  }

  rerenderRequired() {
    this.renderedZoom = [];
  }

  generateTiles() {
    for (let i = 0; i < Config.CHUNK_SIZE; i++) {
      for (let j = 0; j < Config.CHUNK_SIZE; j++) {
        if (this.tiles[i] === undefined) this.tiles[i] = [];
        this.tiles[i][j] = new Tile(i, j, this.generateTerrain(i, j));
      }
    }

    for (let i = 0; i < Config.CHUNK_SIZE; i++) {
      for (let j = 0; j < Config.CHUNK_SIZE; j++) {
        const tile = this.tiles[i][j];
        const topleftTerrain = this.getTerrain(i - 1, j - 1);
        const topTerrain = this.getTerrain(i, j - 1);
        const toprightTerrain = this.getTerrain(i + 1, j - 1);
        const rightTerrain = this.getTerrain(i + 1, j);
        const bottomrightTerrain = this.getTerrain(i + 1, j + 1);
        const bottomTerrain = this.getTerrain(i, j + 1);
        const bottomleftTerrain = this.getTerrain(i - 1, j + 1);
        const leftTerrain = this.getTerrain(i - 1, j);

        let bitmask = 0;
        if (topleftTerrain !== tile.terrain) bitmask |= 1;
        if (topTerrain !== tile.terrain) bitmask |= 2;
        if (toprightTerrain !== tile.terrain) bitmask |= 4;
        if (rightTerrain !== tile.terrain) bitmask |= 8;
        if (bottomrightTerrain !== tile.terrain) bitmask |= 16;
        if (bottomTerrain !== tile.terrain) bitmask |= 32;
        if (bottomleftTerrain !== tile.terrain) bitmask |= 64;
        if (leftTerrain !== tile.terrain) bitmask |= 128;

        tile.setBitmask(bitmask);
      }
    }
  }

  generateTerrain(x, y) {
    let value = this.noise.noise2D(
      (this.x * Config.CHUNK_SIZE + x) / Config.NOISE_ZOOM,
      (this.y * Config.CHUNK_SIZE + y) / Config.NOISE_ZOOM
    );

    if (value < 0.3) {
      return "grass";
    }
    if (value < 0.45 && value >= 0.3) {
      return "sand";
    }
    if (value >= 0.45) {
      return "water";
    }
  }

  getTerrain(x, y) {
    if (this.tiles[x] && this.tiles[x][y]) {
      return this.tiles[x][y].terrain;
    } else {
      return this.generateTerrain(x, y);
    }
  }
}
export default Chunk;
