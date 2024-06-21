import Config from "./config.js";

export default class Entity {
  constructor(x, y, chunk, type, isGhost = false) {
    this.relX = x % Config.CHUNK_SIZE;
    this.relY = y % Config.CHUNK_SIZE;
    if (this.relX < 0) this.relX += Config.CHUNK_SIZE;
    if (this.relY < 0) this.relY += Config.CHUNK_SIZE;
    this.x = x;
    this.y = y;
    this.chunk = chunk;
    this.type = type;
    this.size = 1;
    this.rotation = 0;
    this.isGhost = isGhost;
  }

  onTick() {}

  /**
   * @param {CanvasRenderingContext2D} ctx - The 2D rendering context for the canvas
   * @param {Camera} camera - The camera object
   */
  render(ctx, camera) {
    if (this.type === 1) {
      ctx.fillStyle = "red";
    } else if (this.type === 2) {
      ctx.fillStyle = "yellow";
    } else {
      ctx.fillStyle = "purple";
    }
    ctx.fillRect(
      this.relX * Config.TILE_SIZE * camera.zoom,
      this.relY * Config.TILE_SIZE * camera.zoom,
      Config.TILE_SIZE * camera.zoom,
      Config.TILE_SIZE * camera.zoom
    );
  }

  /**
   * @param {CanvasRenderingContext2D} ctx - The 2D rendering context for the canvas
   * @param {Camera} camera - The camera object
   */
  renderGhost(ctx, camera) {
    if (camera.isInCamera(this.x, this.y)) {
      ctx.fillStyle = "rgb(255,255,0,0.5)";
      ctx.fillRect(
        (this.x - camera.topLeft.x) * Config.TILE_SIZE * camera.zoom,
        (this.y - camera.topLeft.y) * Config.TILE_SIZE * camera.zoom,
        Config.TILE_SIZE * camera.zoom,
        Config.TILE_SIZE * camera.zoom
      );
      console.log("test");
    }
  }

  onClick(event) {}

  onMouseOver(event) {}

  onBuilt() {}

  onDestroy() {}
}
