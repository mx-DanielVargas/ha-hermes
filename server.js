const WebSocket = require("ws");
const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(404);
  res.end();
});

const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(message) {
    const msg = JSON.parse(message);

    if (msg.processName === "GetParametersConfigurationLogin") {
      const data = require("./data.json");

      const response = {
        status: 2000,
        message: null,
        processName: "GetParametersConfigurationLogin",
        data,
      };

      ws.send(JSON.stringify(response));
    }

    if (msg.processName === "GetVersion") {
      const jsonFile = require("./data.json");
      const version = jsonFile.version;

      const response = {
        status: 2000,
        message: null,
        processName: "GetVersion",
        data: {
          version,
        },
      };

      ws.send(JSON.stringify(response));
    }
  });
});

server.on("upgrade", function upgrade(request, socket, head) {
  const pathname = new URL(request.url, `http://${request.headers.host}`)
    .pathname;

  if (
    pathname === "/Configuration" ||
    pathname === "/Connection" ||
    pathname === "/Terminal" ||
    pathname === "/Printer"
  ) {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

server.listen(7890, () => {
  console.log("Servidor escuchando en el puerto 7890");
});
