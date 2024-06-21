import { Config } from "./config.js";
import * as Util from "./util.js";
import World from "./world.js";

let startX;
let startY;
export let startTile;
let startUiElement;
let x;
let y;
export let tile;
let uiElement;
export let rightIsDown = false;
export let leftIsDown = false;
export let scroll = 0;
let draggedOver = new Set();
export let draggedOverTiles = new Set();
let dragging = false;
let game;

export function addEventListeners(g) {
  game = g;
  window.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mouseup", onMouseUp);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("wheel", onScrollWheel);
  //disable contextmenu when right click
  window.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
}

function onMouseDown(event) {
  x = startX = event.clientX;
  y = startY = event.clientY;
  tile = startTile = game.camera.getTileByMouseCoords(x, y);
  uiElement = startUiElement = game.getUiElementAt(x, y) || game.world;
  leftIsDown = event.button === 0;
  rightIsDown = event.button === 2;
  draggedOver = new Set();
  draggedOverTiles = new Set();

  if (startUiElement instanceof World) {
    uiElement.onMouseDown?.(tile, event.button);
  } else {
    uiElement.onMouseDown?.(x - uiElement.x, y - uiElement.y, event.button);
  }
  event.preventDefault();
}

function onMouseUp(event) {
  x = event.clientX;
  y = event.clientY;
  tile = game.camera.getTileByMouseCoords(x, y);
  uiElement = game.getUiElementAt(x, y) || game.world;

  if (!leftIsDown && !rightIsDown) return;
  leftIsDown = rightIsDown = false;

  if (!draggedOver.has(x + "|" + y)) draggedOver.add(x + "|" + y);
  if (!draggedOverTiles.has(tile.x + "|" + tile.y)) draggedOverTiles.add(tile.x + "|" + tile.y);

  if (uiElement === startUiElement) {
    if (uiElement instanceof World) {
      if (tile.x === startTile.x && tile.y === startTile.y) {
        uiElement.onClick(tile, event.button);
      } else {
        uiElement.onDragged(startTile, tile, event.button, draggedOverTiles);
      }
    } else {
      if (Util.calculateDistance(x, y, startX, startY) < 5) {
        uiElement.onDragged?.(
          startX - uiElement.x,
          startY - uiElement.y,
          x - uiElement.x,
          y - uiElement.y,
          event.button,
          draggedOver
        );
      } else {
        uiElement.onClick?.(x - uiElement.x, y - uiElement.y, event.button);
      }
    }
  }
  event.preventDefault();
  draggedOver = [];
}

function onMouseMove(event) {
  x = event.clientX;
  y = event.clientY;
  tile = game.camera.getTileByMouseCoords(x, y);
  uiElement = game.getUiElementAt(x, y) || game.world;
  uiElement.onMouseOver?.(x, y);

  if (!leftIsDown && !rightIsDown) return;

  if (!draggedOver.has(x + "|" + y)) draggedOver.add(x + "|" + y);
  if (!draggedOverTiles.has(tile.x + "|" + tile.y)) draggedOverTiles.add(tile.x + "|" + tile.y);

  if (uiElement instanceof World) {
    startUiElement.onDragging?.(startTile, tile, event.button, draggedOverTiles);
  } else {
    game.onDragging?.(
      startX - uiElement.x,
      startY - uiElement.y,
      x - uiElement.x,
      y - uiElement.y,
      leftIsDown ? 0 : 2,
      draggedOver
    );
  }
}

function onScrollWheel(event) {
  if (event.deltaY > 0) scroll = 1;
  if (event.deltaY < 0) scroll = -1;
}

export function reset() {
  scroll = 0;
}

export function cancelDragging() {
  rightIsDown = false;
  leftIsDown = false;
  draggedOver = new Set();
  draggedOverTiles = new Set();
}
