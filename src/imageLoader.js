const images = [];

export function loadImage(key, src) {
  const img = new Image();

  const d = new Promise(function (resolve, reject) {
    img.onload = function () {
      images[key] = img;

      resolve(img);
    };

    img.onerror = function () {
      reject("Could not load image: " + src);
    };
  });

  img.src = src;

  return d;
}

export function getImage(key) {
  return images[key] || null;
}
