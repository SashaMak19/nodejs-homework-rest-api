const Jimp = require("jimp");

async function resizeImage(path, width, height) {
  const image = await Jimp.read(path);
  await image.resize(width, height);
  await image.writeAsync(path);
}

module.exports = { resizeImage };
