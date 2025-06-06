// server.js
const { Server } = require('socket.io');
const { createServer } = require('http');
const { v4: uuidv4 } = require('uuid');
const express = require('express');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

let queue = [];

io.on('connection', (socket) => {
  socket.on('joinMatchmaking', () => {
    if (!queue.includes(socket.id)) queue.push(socket.id);

    if (queue.length >= 2) {
      const roomId = uuidv4();
      const [user1, user2] = queue.splice(0, 2);
      io.to(user1).emit('matched', roomId);
      io.to(user2).emit('matched', roomId);
    }
  });

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
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
    queue = queue.filter(id => id !== socket.id);
  });
});

httpServer.listen(3001, () => console.log('Socket.IO server running on 3001'));
