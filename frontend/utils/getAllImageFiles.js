const fs = require("fs");
const path = require("path");

function getAllImageFiles(dir, basePath = dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllImageFiles(fullPath, basePath));
    } else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
      results.push(path.relative(basePath, fullPath));
    }
  });

  return results;
}
module.exports = getAllImageFiles;
