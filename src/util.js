export function easeInOutQuad(x) {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

export function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function getPointsInLLineBetween(x1, y1, x2, y2, rotation) {
  let points = [];
  if (rotation % 2 === 0) {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
      points.push({ x: x1, y: y });
    }
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      points.push({ x: x, y: y2 });
    }
  } else {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      points.push({ x: x, y: y1 });
    }
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
      points.push({ x: x2, y: y });
    }
  }
  return points;
}
