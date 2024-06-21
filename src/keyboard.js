import Config from "./config.js";

const keyCodeSet = new Set(Object.values(Config.keybindings).flat());
const keysPressed = new Set();
let keysPressedPrevious = new Set();

export function addEventListeners() {
  window.addEventListener("keydown", _onKeyDown);
  window.addEventListener("keyup", _onKeyUp);
}

function _onKeyDown(event) {
  const keyCode = event.keyCode;

  if (keyCodeSet.has(keyCode)) {
    event.preventDefault();

    keysPressed.add(keyCode);
  }
}

function _onKeyUp(event) {
  const keyCode = event.keyCode;

  if (keyCodeSet.has(keyCode)) {
    event.preventDefault();

    keysPressed.delete(keyCode);
    keysPressedPrevious.add(keyCode);
  }
}

export function isDown(keyCode, reset = false) {
  if (Array.isArray(keyCode)) {
    return keyCode.some((k) => isDown(k, reset));
  }

  if (!keyCodeSet.has(keyCode)) {
    throw new Error("Keycode " + keyCode + " is not being listened to");
  }

  let isPressed = keysPressed.has(keyCode);

  if (reset && isPressed) keysPressed.delete(keyCode);

  return isPressed;
}

export function wasDown(keyCode) {
  if (Array.isArray(keyCode)) {
    return keyCode.some((k) => wasDown(k));
  }
  if (!keyCodeSet.has(keyCode)) {
    throw new Error("Keycode " + keyCode + " is not being listened to");
  }

  return keysPressedPrevious.has(keyCode);
}
export function update() {
  keysPressedPrevious = new Set(keysPressed);
}
