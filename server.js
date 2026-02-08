const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
    res.send("Okey server ayakta");
});


const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let tables = [];

io.on("connection", (socket) => {
  console.log("Bağlandı:", socket.id);

  socket.on("tables:list", () => {
    socket.emit("tables:list", tables);
  });

  socket.on("tables:create", (data) => {
    const table = {
      id: Date.now(),
      name: data.name,
      rounds: data.rounds,
      players: 1,
      owner: data.owner
    };
    tables.push(table);
    io.emit("tables:created", table);
  });

  socket.on("tables:join", (data) => {
    const table = tables.find(t => t.id === data.tableId);
    if (!table) return;
    if (table.players < 4) {
      table.players++;
      io.emit("tables:updated", table);
    }
  });

  socket.on("chat:message", (msg) => io.emit("chat:message", msg));
  socket.on("game:discard", (data) => io.emit("game:discard", data));
});

server.listen(3000, () => {
  console.log("Sunucu çalışıyor: http://localhost:3000");
});
