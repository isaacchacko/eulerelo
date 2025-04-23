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

  socket.on('message', ({ roomId, message }) => {
    io.to(roomId).emit('message', message);
    console.log(`Message to ${roomId}: ${message}`);
  });

  socket.on('disconnect', () => {
    queue = queue.filter(id => id !== socket.id);
  });
});

httpServer.listen(3001, () => console.log('Socket.IO server running on 3001'));
