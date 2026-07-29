const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

fs.copyFileSync(path.join(publicDir, "index.html"), path.join(root, "index.html"));
fs.copyFileSync(path.join(publicDir, "live-url.json"), path.join(root, "live-url.json"));
copyDir(path.join(publicDir, "css"), path.join(root, "css"));
copyDir(path.join(publicDir, "js"), path.join(root, "js"));
fs.writeFileSync(path.join(root, ".nojekyll"), "");

console.log("GitHub Pages files synced from public/");
