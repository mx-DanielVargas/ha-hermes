const WebSocket = require("ws");
const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {
  res.writeHead(404);
  res.end();
});

const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", function connection(ws) {
  ws.on("message", async function incoming(message) {
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
      const token = msg.tokenAppId;

      const versionResponse = await fetch(
        "https://hermes-api-dev.mylabs.mx/api/settings/hardware_agent_version",
        {
          headers: {
            authorizer: token,
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            Referer: "https://hermes-dev.mylabs.mx/",
            "Referrer-Policy": "strict-origin-when-cross-origin",
          },
          body: null,
          method: "GET",
        }
      );
      const versionJson = await versionResponse.json();
      const version = versionJson.data.version;

      const jsonFile = require("./data.json");
      jsonFile.version = version;
      fs.writeFileSync("./data.json", JSON.stringify(jsonFile));


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