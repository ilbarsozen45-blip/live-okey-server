const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

// Railway'in HTTP isteğine cevap verecek basit route
app.get("/", (req, res) => {
  res.status(200).send("Okey server ayakta ✔");
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("Oyuncu bağlandı:", socket.id);
});

// Railway'in verdiği portu kullan
const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("Sunucu çalışıyor:", PORT);
});
