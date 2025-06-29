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
    if (!queue.some(player => player.id === socket.id)) queue.push({ 'id': socket.id, 'username': username });

    if (queue.length >= 2) {
      const roomId = uuidv4();
      const [player1, player2] = queue.splice(0, 2);
      io.to(player1.id).emit('matched', roomId);
      io.to(player2.id).emit('matched', roomId);
      assignments[roomId] = [player1, player2];
    }

  });

  socket.on('joinRoom', (roomId, username) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    if (assignments[roomId].some(player => player.username === username)) {
      io.to(socket.id).emit('recall', {
        'opponents': assignments[roomId]
      });
    }
  });

  socket.on('chat', ({ roomId, text, username }) => {
    io.to(roomId).emit('chat', text, username);
    console.log(`Chat message by user ${username} to ${roomId}: ${text}`);
  });

  socket.on('buzz', ({ roomId, answer, username }) => {
    io.to(roomId).emit('buzz', answer, username);
    console.log(`Buzz by user ${username} to ${roomId}: ${answer}`);
  });

  socket.on('buzzCorrect', ({ roomId, answer, username }) => {
    io.to(roomId).emit('buzzCorrect', answer, username);
    console.log(`Buzz by user ${username} to ${roomId}: ${answer}`);
  });

  socket.on('disconnect', () => {
    queue = queue.filter(player => player['id'] !== socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Socket.IO server running on ${PORT}`));
