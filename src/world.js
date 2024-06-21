import Config from "./config.js";
import Chunk from "./chunk.js";
import Entity from "./entity.js";
import * as ImageLoader from "./imageLoader.js";
import * as Keyboard from "./keyboard.js";
import * as Mouse from "./mouse.js";
import * as Util from "./util.js";

export class World {
  constructor(camera, seed) {
    this.camera = camera;
    this.seed = seed;
    this.chunks = [[]];
    this.renderedBackgrounds = [];
    this.redrawRequired = true;
    this.buildMode = 0;
    this.rotation = 0;
    this.tempEntities = [];

    //create dummy tile data
    for (let i = -5; i < 5; i++) {
      for (let j = -5; j < 5; j++) {
        let c = this.createChunk(i, j);
        if (c.tiles[0][0] != "blue") c.addEntity(new Entity(0, 0, c, 2));
        for (let k = 0; k < 10; k++) {
          let x = Math.floor(Math.random() * 32);
          let y = Math.floor(Math.random() * 32);
          if (c.tiles[x][y] != "blue") c.addEntity(new Entity(x, y, c, 1));
        }
      }
    }

    // let one = this.createChunk(0, 0);
    // let two = this.createChunk(0, 1);
    // for (let k = 0; k < 10; k++) {
    //   one.addEntity(new Entity(Math.floor(Math.random() * 32), Math.floor(Math.random() * 32), one, 1));
    //   two.addEntity(new Entity(Math.floor(Math.random() * 32), Math.floor(Math.random() * 32), two, 1));
    // }
    // this.getChunk(0, 0).addEntity(new Entity(0, 0, this.getChunk(0, 0), 3));
  }

  update(deltaT) {
    var dirx = 0;
    var diry = 0;

    if (Keyboard.isDown(Config.keybindings.moveLeft)) dirx -= 1;
    if (Keyboard.isDown(Config.keybindings.moveRight)) dirx += 1;
    if (Keyboard.isDown(Config.keybindings.moveUp)) diry -= 1;
    if (Keyboard.isDown(Config.keybindings.moveDown)) diry += 1;
    if (dirx || diry) {
      this.camera.move(deltaT, dirx, diry);
    }

    if (Mouse.scroll < 0 || Keyboard.isDown(Config.keybindings.zoomIn, true))
      this.camera.zoomIn();
    if (Mouse.scroll > 0 || Keyboard.isDown(Config.keybindings.zoomOut, true))
      this.camera.zoomOut();

    if (Keyboard.isDown(Config.keybindings.rotate, true)) {
      this.rotation += 1;
      if (Mouse.leftIsDown || Mouse.rightIsDown) {
        this.onDragging(
          Mouse.startTile,
          Mouse.tile,
          Mouse.leftIsDown ? 0 : 2,
          Mouse.draggedOverTiles
        );
      }
    }
    if (this.rotation > 3) this.rotation = 0;

    if (Keyboard.isDown(Config.keybindings.cancel, true)) {
      this.tempEntities = [];
      Mouse.cancelDragging();
      this.redrawRequired = true;
    }

    if (Keyboard.isDown(Config.keybindings.shift)) {
      if (Mouse.leftIsDown || Mouse.rightIsDown) {
        this.onDragging(
          Mouse.startTile,
          Mouse.tile,
          Mouse.leftIsDown ? 0 : 2,
          Mouse.draggedOverTiles
        );
      }
    }

    Mouse.reset();
  }

  render(ctx) {
    //console.time("render");

    const startChunkX = Math.floor(this.camera.topLeft.x / Config.CHUNK_SIZE);
    const startChunkY = Math.floor(this.camera.topLeft.y / Config.CHUNK_SIZE);
    const endChunkX = Math.ceil(this.camera.bottomRight.x / Config.CHUNK_SIZE);
    const endChunkY = Math.ceil(this.camera.bottomRight.y / Config.CHUNK_SIZE);

    for (let i = startChunkX; i <= endChunkX; i++) {
      for (let j = startChunkY; j <= endChunkY; j++) {
        const chunk = this.getChunk(i, j);
        chunk.render(ctx, this.camera);
      }
    }

    if (this.tempEntities.size !== 0) {
      for (let entity of this.tempEntities) {
        entity.renderGhost(ctx, this.camera);
      }
    }
    if (this.camera.zoom >= 0.5) this.renderGrid(ctx);
    //console.timeEnd("render");
  }

  renderGrid(ctx) {
    let offsetX = Math.floor(
      (0 - (this.camera.topLeft.x % 1)) * Config.TILE_SIZE * this.camera.zoom
    );
    let offsetY = Math.floor(
      (0 - (this.camera.topLeft.y % 1)) * Config.TILE_SIZE * this.camera.zoom
    );

    // Draw vertical lines
    ctx.beginPath();
    for (
      let x = offsetX;
      x < this.camera.width;
      x += Config.TILE_SIZE * this.camera.zoom
    ) {
      ctx.moveTo(0.5 + x, 0);
      ctx.lineTo(0.5 + x, ctx.canvas.height);
    }

    // Draw horizontal lines
    for (
      let y = offsetY;
      y < this.camera.height;
      y += Config.TILE_SIZE * this.camera.zoom
    ) {
      ctx.moveTo(0, 0.5 + y);
      ctx.lineTo(this.camera.width, 0.5 + y);
    }
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.stroke();
  }

  // renderBackgroundPattern(ctx, zoom) {
  //   if (renderedBackground[zoom] === undefined) {
  //     let bgimg = ImageLoader.getImage("background");
  //     const tempCanvas = new OffscreenCanvas(bgimg.width * zoom, bgimg.height * zoom);
  //     const tempCtx = tempCanvas.getContext("2d");
  //     tempCtx.drawImage(bgimg, 0, 0, bgimg.width, bgimg.height, 0, 0, bgimg.width * zoom, bgimg.height * zoom);
  //     ctx.fillStyle = ctx.createPattern(tempCanvas, "repeat");
  //   }

  //   ctx.save();
  //   ctx.translate((-1 + (-this.x % 1)) * Config.TILE_SIZE * zoom, (-1 + (-this.y % 1)) * Config.TILE_SIZE * zoom);
  //   ctx.fillRect(0, 0, canvas.width + Config.TILE_SIZE * 2 * zoom, canvas.height + Config.TILE_SIZE * 2 * zoom);
  //   ctx.restore();
  // }

  onClick(tile, button) {
    let chunk = this.getChunkByTilePos(tile.x, tile.y);
    let entity = chunk.getEntityAtAbs(tile.x, tile.y);

    if (!entity && button === 0) {
      chunk.addEntity(new Entity(tile.x, tile.y, chunk, 2));
    }

    if (entity && button === 2) {
      chunk.removeEntity(entity);
    }

    this.redrawRequired = true;
  }

  onDragged(startTile, tile, button, draggedOverTiles) {
    if (Keyboard.isDown(Config.keybindings.shift) && button === 0) {
      let tiles = Util.getPointsInLLineBetween(
        startTile.x,
        startTile.y,
        tile.x,
        tile.y,
        this.rotation
      );

      for (let tile of tiles) {
        let entity = this.getEntityAtAbs(tile.x, tile.y);
        if (!entity) {
          this.addEntity(
            new Entity(
              tile.x,
              tile.y,
              this.getChunkByTilePos(tile.x, tile.y),
              2
            )
          );
        }
      }
    } else {
      for (let dtile of draggedOverTiles) {
        const [x, y] = dtile.split("|").map(Number);
        let entity = this.getEntityAtAbs(x, y);

        if (!entity && button === 0) {
          this.addEntity(new Entity(x, y, this.getChunkByTilePos(x, y), 2));
        }

        if (entity && button === 2) {
          this.removeEntityAt(x, y);
        }
      }
    }
    this.tempEntities = [];
    this.redrawRequired = true;
  }

  onDragging(startTile, tile, button, draggedOverTiles) {
    let entities = [];
    if (Keyboard.isDown(Config.keybindings.shift) && button === 0) {
      let tiles = Util.getPointsInLLineBetween(
        startTile.x,
        startTile.y,
        tile.x,
        tile.y,
        this.rotation
      );
      for (let tile of tiles) {
        let entity = this.getEntityAtAbs(tile.x, tile.y);
        if (!entity) {
          entities.push(
            new Entity(
              tile.x,
              tile.y,
              this.getChunkByTilePos(tile.x, tile.y),
              2,
              true
            )
          );
        }
      }
    } else {
      for (let dtile of draggedOverTiles) {
        const [x, y] = dtile.split("|").map(Number);
        let entity = this.getEntityAtAbs(x, y);

        if (!entity && button === 0) {
          entities.push(new Entity(x, y, this.getChunkByTilePos(x, y), 2));
        }

        if (entity && button === 2) {
          this.removeEntityAt(x, y);
        }
      }
    }

    this.tempEntities = entities;
    this.redrawRequired = true;
  }

  createChunk(x, y) {
    const chunk = new Chunk(x, y, this.seed);

    if (this.chunks[x] === undefined) this.chunks[x] = [];
    this.chunks[x][y] = chunk;
    return chunk;
  }

  getChunk(x, y) {
    if (this.chunks[x] && this.chunks[x][y]) return this.chunks[x][y];
    return this.createChunk(x, y);
  }

  getChunkByTilePos(x, y) {
    return this.getChunk(
      Math.floor(x / Config.CHUNK_SIZE),
      Math.floor(y / Config.CHUNK_SIZE)
    );
  }

  removeChunk(chunk) {
    this.redrawRequired = true;
    this.chunks[chunk.x][chunk.y] = undefined;
  }

  removeChunkAt(x, y) {
    removeChunk(getChunk(x, y));
  }

  addEntity(entity) {
    this.getChunkByTilePos(entity.x, entity.y).addEntity(entity);
  }

  removeEntity(entity) {
    if (!entity) return;
    entity.chunk.removeEntity(entity);
  }

  removeEntityAt(x, y) {
    this.removeEntity(this.getEntityAtAbs(x, y));
  }

  getEntityAtAbs(x, y) {
    return this.getChunkByTilePos(x, y).getEntityAtAbs(x, y);
  }
}
export default World;
