// server.js
const { Server } = require('socket.io');
const { createServer } = require('http');
const { v4: uuidv4 } = require('uuid');
const express = require('express');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://eulerelo.up.railway.app"
    ],
    methods: ["GET", "POST"]
  }
});

let queue = [];
const assignments = {};

io.on('connection', (socket) => {
  socket.on('joinMatchmaking', (username) => {
    if (!queue.some(player => player.id === socket.id)) {
      queue.push({ 'id': socket.id, 'username': username });
      console.log(`${username} has joined the queue`);
    }
    if (queue.length >= 2) {
      const roomId = uuidv4();
      const [player1, player2] = queue.splice(0, 2);
      io.to(player1.id).emit('matched', roomId);
      io.to(player2.id).emit('matched', roomId);
      assignments[roomId] = [player1, player2];
      console.log(assignments[roomId]);
    }

  });

  socket.on('joinRoom', (roomId, username) => {
    socket.join(roomId);
    console.log(`User ${socket.id} (${username}) joined room ${roomId}`);
    if (assignments[roomId].some(player => player.username === username)) {

      io.to(socket.id).emit('recall', { 'opponents': assignments[roomId], 'role': "Competitor" });
      io.to(roomId).emit('message', 'system', `Competitor "${username}" has joined the room.`, "");

    } else {

      io.to(socket.id).emit('recall', { 'opponents': assignments[roomId], 'role': "Spectator" });
      io.to(roomId).emit('message', 'system', `Spectator "${username}" has joined the room.`, "");

    }
  });

  socket.on('message', ({ roomId, type, text, username, role }) => {
    io.to(roomId).emit('message', type, text, username, role);
    console.log(`Message of type ${type} sent by user ${username} with role ${role} to ${roomId}: ${text}`);
  });

  socket.on('disconnect', () => {
    console.log('disconnected');
    queue = queue.filter(player => player['id'] !== socket.id);
  });

  socket.on('leaveRoom', (roomId, username) => {
    if (assignments[roomId] && assignments[roomId].some(player => player.username === username)) {
      io.to(roomId).emit('message', 'system', `Competitor "${username}" has left the room.`, "");
    } else {
      io.to(roomId).emit('message', 'system', `Spectator "${username}" has left the room.`, "");
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Socket.IO server running on ${PORT}`));
