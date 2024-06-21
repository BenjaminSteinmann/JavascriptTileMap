export const Config = {};
Config.CHUNK_SIZE = 32;
Config.TILE_SIZE = 32;
Config.MOVEMENT_ENABLED = true;
Config.MOVE_SPEED = 10;
Config.keybindings = {
  moveUp: [38, 87],
  moveRight: [39, 68],
  moveDown: [40, 83],
  moveLeft: [37, 65],
  openInventory: 69,
  closeAll: 27,
  copyObject: 81,
  confirm: 13,
  cancel: 27,
  shift: 16,
  ctrl: 17,
  alt: 18,
  zoomIn: 107,
  zoomOut: 109,
  rotate: 82,
};
Config.moveSpeed = 1; // tiles per second
Config.MIN_ZOOM = 0.0625;
Config.MAX_ZOOM = 4;
Config.NOISE_ZOOM = 32;

Config.terrain = {
  grass: { id: 0, name: "grass", color: "#009900", texture: "grass", limit: 0.3 },
  sand: { id: 1, name: "sand", color: "#ffff00", texture: "sand", limit: 0.45 },
  water: { id: 2, name: "water", color: "#0000ff", texture: "water", limit: 1 },
};
Config.terrainColor = {
  grass: "#009900",
  sand: "#ffff00",
  water: "#0000ff",
};

export default Config;
