const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("Okey server ayakta ✔");
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let tables = [];

io.on("connection", (socket) => {
  console.log("Oyuncu bağlandı:", socket.id);

  // Masa listesini gönder
  socket.on("tables:list", () => {
    socket.emit("tables:list", tables);
  });

  // Masa oluştur
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

  // Masaya katıl
  socket.on("tables:join", ({ tableId, player }) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    if (table.players < 4) {
      table.players++;
      io.emit("tables:updated", table);
    }
  });

  // Sohbet
  socket.on("chat:message", (msg) => {
    io.emit("chat:message", msg);
  });

  // Taş atma
  socket.on("game:discard", (payload) => {
    io.emit("game:discard", payload);
  });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log("Sunucu çalışıyor:", PORT);
});
