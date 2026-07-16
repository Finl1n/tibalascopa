import http from "node:http";
import { appendFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const port = 4173;
const host = "127.0.0.1";
const logFile = path.join(rootDir, "preview-server.log");

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "application/javascript; charset=utf-8"],
  [".mjs", "application/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
]);

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url ?? "/", `http://${host}:${port}`);
  const pathname = requestUrl.pathname === "/" ? "/preview/index.html" : requestUrl.pathname;
  const safePath = path.normalize(path.join(rootDir, pathname));

  if (!safePath.startsWith(rootDir)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  try {
    const file = await readFile(safePath);
    const ext = path.extname(safePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": contentTypes.get(ext) ?? "application/octet-stream",
    });
    res.end(file);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

const log = async (message) => {
  await appendFile(logFile, `${new Date().toISOString()} ${message}\n`, "utf8");
};

server.on("error", async (error) => {
  await log(`error: ${error.code ?? error.name} ${error.message}`);
  process.exitCode = 1;
});

process.on("uncaughtException", async (error) => {
  await log(`uncaughtException: ${error.name} ${error.message}`);
  process.exitCode = 1;
});

process.on("unhandledRejection", async (error) => {
  const message = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  await log(`unhandledRejection: ${message}`);
  process.exitCode = 1;
});

server.listen(port, host, () => {
  log(`listening on http://${host}:${port}`);
});
