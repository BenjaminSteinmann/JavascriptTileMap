import * as Keyboard from "./keyboard.js";
import * as Mouse from "./mouse.js";
import * as ImageLoader from "./imageLoader.js";
import World from "./world.js";
import Entity from "./entity.js";
import Config from "./config.js";
import Camera from "./camera.js";
import PerformanceGraph from "./performanceGraph.js";

export class Game {
  constructor(canvas, seed) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.uiElements = [];
    this.seed = seed === undefined ? Math.random() * Number.MAX_SAFE_INTEGER : seed;
  }

  run() {
    let d = this.loadImages();
    Promise.all(d).then(
      function (loaded) {
        this.init();
        window.requestAnimationFrame(this.tick.bind(this));
      }.bind(this)
    );
  }

  init() {
    this.camera = new Camera(0, 0, this.canvas.width, this.canvas.height, 1);
    this.world = new World(this.camera, this.seed);
    this.uiElements.push(new PerformanceGraph(0, 0, 200, 100));
    Keyboard.addEventListeners();
    Mouse.addEventListeners(this);
    window.addEventListener(
      "resize",
      function () {
        this.camera.changeSize(window.innerWidth, window.innerHeight);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        console.log("resize");
      }.bind(this)
    );
  }

  loadImages() {
    return [ImageLoader.loadImage("background", "./images/background-tile.png")];
  }

  tick(elapsed) {
    window.requestAnimationFrame(this.tick.bind(this));
    let deltaT = (elapsed - this._previousElapsed) / 1000.0;
    deltaT = Math.min(deltaT, 0.25); // maximum delta of 250 ms
    this._previousElapsed = elapsed;
    this.update(deltaT);
    this.render(this.ctx);
  }

  update(deltaT) {
    this.world.update(deltaT);
    for (let uiElement of this.uiElements) {
      uiElement.update(deltaT, this.lastRenderTime);
    }
    Keyboard.update();
  }

  render(ctx) {
    const start = performance.now();
    if (this.world.redrawRequired || this.camera.redrawRequired) {
      this.world.redrawRequired = false;
      this.camera.redrawRequired = false;
      ctx.fillStyle = "black";
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.world.render(ctx);
    }
    for (let uiElement of this.uiElements) {
      uiElement.render(ctx);
    }
    this.lastRenderTime = performance.now() - start;
  }

  getUiElementAt(x, y) {
    for (let uiElement of this.uiElements) {
      if (
        x >= uiElement.x &&
        x <= uiElement.x + uiElement.width &&
        y >= uiElement.y &&
        y <= uiElement.y + uiElement.height
      ) {
        return uiElement;
      }
    }
    return this.world;
  }
}
export default Game;
