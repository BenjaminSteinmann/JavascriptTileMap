import Game from "./src/game.js";

window.onload = () => {
  const canvas = document.querySelector("canvas");
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;

  const game = new Game(canvas, "testSeed");
  game.run();
};
