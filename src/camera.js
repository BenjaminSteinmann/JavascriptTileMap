import Config from "./config.js";

export class Camera {
  constructor(centerX, centerY, width, height, zoom) {
    this.center = { x: centerX, y: centerY };
    this.width = width;
    this.height = height;
    this.zoom = zoom;
    this.recalculateCorners();
    this.redrawRequired = true;
  }

  zoomIn() {
    this.setZoom(this.zoom * 2);
  }

  zoomOut() {
    this.setZoom(this.zoom / 2);
  }

  setZoom(zoom) {
    if (zoom > Config.MAX_ZOOM) return;
    if (zoom < Config.MIN_ZOOM) return;
    this.zoom = zoom;
    this.recalculateCorners();
    console.log("zoom: " + zoom);
    this.redrawRequired = true;
  }

  recalculateCorners() {
    this.topLeft = {
      x: this.center.x - this.width / 2 / (Config.TILE_SIZE * this.zoom),
      y: this.center.y - this.height / 2 / (Config.TILE_SIZE * this.zoom),
    };
    this.bottomRight = {
      x: this.center.x + this.width / 2 / (Config.TILE_SIZE * this.zoom),
      y: this.center.y + this.height / 2 / (Config.TILE_SIZE * this.zoom),
    };
  }

  moveSmooth(duration, xPos, yPos) {
    let start;
    requestAnimationFrame(animate);
    function animate(timestamp) {
      if (start === undefined) start = timestamp;
      requestAnimationFrame(animate);
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = Util.easeInOutQuad(progress);
      this.center.x += xPos * easedProgress;
      this.center.y += yPos * easedProgress;
      this.recalculateCorners();
      this.redrawRequired = true;
    }
  }

  move(deltaT, dirX, dirY) {
    const moveX = Math.floor((dirX * Config.MOVE_SPEED * deltaT * 32) / this.zoom) / 32;
    const moveY = Math.floor((dirY * Config.MOVE_SPEED * deltaT * 32) / this.zoom) / 32;
    if (moveX === 0 && moveY === 0) return;
    this.center.x += moveX;
    this.center.y += moveY;
    this.topLeft.x += moveX;
    this.topLeft.y += moveY;
    this.bottomRight.x += moveX;
    this.bottomRight.y += moveY;
    this.redrawRequired = true;
  }

  jumpTo(x, y) {
    this.center.x = x;
    this.center.y = y;
    this.recalculateCorners();
    this.redrawRequired = true;
  }

  changeSize(width, height) {
    this.width = width;
    this.height = height;
    this.recalculateCorners();
    this.redrawRequired = true;
  }

  getTileByMouseCoords(mouseX, mouseY) {
    return {
      x: Math.floor(this.topLeft.x + mouseX / (Config.TILE_SIZE * this.zoom)),
      y: Math.floor(this.topLeft.y + mouseY / (Config.TILE_SIZE * this.zoom)),
    };
  }

  isInCamera(x, y) {
    if (
      x >= Math.floor(this.topLeft.x) &&
      x <= Math.ceil(this.bottomRight.x) &&
      y >= Math.floor(this.topLeft.y) &&
      y <= Math.ceil(this.bottomRight.y)
    ) {
      return true;
    }
    return false;
  }
}
export default Camera;
