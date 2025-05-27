const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // permitir CORS para tu frontend GitHub Pages
  },
});

let objects = [];

io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);
  socket.emit("loadObjects", objects);

  socket.on("createObject", (obj) => {
    objects.push(obj);
    io.emit("createObject", obj);
  });

  socket.on("moveObject", ({ id, x, y }) => {
    const obj = objects.find((o) => o.id === id);
    if (obj) {
      obj.x = x;
      obj.y = y;
      io.emit("moveObject", { id, x, y });
    }
  });

  socket.on("removeObject", (id) => {
    objects = objects.filter((o) => o.id !== id);
    io.emit("removeObject", id);
  });

  socket.on("resize-element", ({ id, width, height }) => {
    const obj = objects.find((o) => o.id === id);
    if (obj) {
      obj.width = width;
      obj.height = height;
      io.emit("resize-element", { id, width, height });
    }
  });

  socket.on("media-action", (data) => {
    console.log("Broadcasting media action:", data);
    io.emit("media-action", data);
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
