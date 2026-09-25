// Gateway: un solo puerto publico. HTTP -> Next (puerto interno);
// el path de WebSocket va directo al backend Go.
const http = require("node:http");
const net = require("node:net");

const PORT = Number(process.env.PORT ?? 3000);
const NEXT_PORT = Number(process.env.NEXT_INTERNAL_PORT ?? 3001);
const WS_PATH = process.env.WS_PATH ?? "/ws";
const API = new URL(process.env.API_BASE_URL ?? "http://localhost:8080");

const isWs = (url = "") =>
  url === WS_PATH || url.startsWith(WS_PATH + "?") || url.startsWith(WS_PATH + "/");

const server = http.createServer((req, res) => {
  const proxy = http.request(
    {
      host: "127.0.0.1",
      port: NEXT_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers,
    },
    (up) => {
      res.writeHead(up.statusCode ?? 502, up.headers);
      up.pipe(res);
    },
  );
  proxy.on("error", () => {
    res.writeHead(502);
    res.end("Bad gateway");
  });
  req.pipe(proxy);
});

// Upgrade de WebSocket: /ws -> backend Go; el resto (HMR, etc.) -> Next.
server.on("upgrade", (req, socket, head) => {
  const toBackend = isWs(req.url);
  const host = toBackend ? API.hostname : "127.0.0.1";
  const port = toBackend ? Number(API.port || 80) : NEXT_PORT;

  const upstream = net.connect(port, host, () => {
    const lines = [req.method + " " + req.url + " HTTP/" + req.httpVersion];
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
      lines.push(req.rawHeaders[i] + ": " + req.rawHeaders[i + 1]);
    }
    upstream.write(lines.join("\r\n") + "\r\n\r\n");
    if (head && head.length) upstream.write(head);
    socket.pipe(upstream).pipe(socket);
  });
  upstream.on("error", () => socket.destroy());
  socket.on("error", () => upstream.destroy());
});

server.listen(PORT, () => {
  console.log(
    "gateway :" + PORT + " -> next :" + NEXT_PORT + ", ws " + WS_PATH + " -> " + API.origin,
  );
});
