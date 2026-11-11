// Minimal static server for the Alive Dreams Holidays site — no dependencies.
// Start: node server.js
// Stop:  taskkill /PID <pid> /F  (pid is also written to .server.pid)
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const envPort = Number(process.env.PORT);
const ports = (envPort ? [envPort] : []).concat([5174, 5500, 8787, 3000, 8080]).filter((port, index, all) => all.indexOf(port) === index);

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

function resolveFile(urlPath) {
  const clean = path.normalize(path.join(root, urlPath));
  if (!clean.startsWith(root + path.sep) && clean !== root) return null;

  const candidates = [];
  if (urlPath.endsWith("/") || urlPath === "") {
    candidates.push(path.join(clean, "index.html"));
  } else {
    candidates.push(clean);
    if (!path.extname(clean)) {
      candidates.push(clean + ".html");
      candidates.push(path.join(clean, "index.html"));
    }
  }
  for (const file of candidates) {
    try {
      if (fs.statSync(file).isFile()) return file;
    } catch {
      /* try next */
    }
  }
  return null;
}

function start(port) {
  const server = http.createServer((req, res) => {
    let urlPath;
    try {
      urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    } catch {
      res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Bad request");
    }

    const filePath = resolveFile(urlPath);
    if (!filePath) {
      const notFound = path.join(root, "404.html");
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      return fs.existsSync(notFound)
        ? res.end(fs.readFileSync(notFound))
        : res.end("Not found");
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        return res.end("Not found");
      }
      res.writeHead(200, {
        "Content-Type": mime[path.extname(filePath).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      res.end(data);
    });
  });

  server.on("error", () => {
    const next = ports[ports.indexOf(port) + 1];
    if (next) start(next);
    else {
      console.error("SERVING_FAILED: all preferred ports are busy");
      process.exit(1);
    }
  });

  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    fs.writeFileSync(path.join(root, ".server.pid"), String(process.pid));
    console.log("SERVING_AT " + url);
    console.log("PID " + process.pid);
  });
}

start(ports[0]);
