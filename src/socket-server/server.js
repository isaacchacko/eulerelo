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
      "https://eulerelo.up.railway.app",
      "https://www.eulerelo.com",
    ],
    methods: ["GET", "POST"]
  }
});

let queue = [];
const roundInfo = {};

const users = {};
const rooms = {};

const updateRoomInfo = (roomId) => {
  if (!roundInfo[roomId]) return;

  io.to(roomId).emit('updateRoomInfo', {
    opponents: getOpponents(roomId)
  });
}

const removeUserRoomAssignment = (username) => {
  const roomId = users[username];

  if (roomId && rooms[roomId]) {
    rooms[roomId] = rooms[roomId].filter(user => user.name !== username);
    updateRoomInfo(roomId);
    if (rooms[roomId].length === 0) delete rooms[roomId];
  } else {
    console.warn("removeUserRoomAssignment: roomId " + roomId + " not found.")
  }

  delete users[username];

  // TODO
  // current bug: the console warn above keeps triggering when i dont expect it.
}

const addUserRoomAssignment = (user, roomId) => {
  if (!user.name) throw new Error("User has no name member.");

  if (users[user.name]) {
    removeUserRoomAssignment(user.name);
  }

  users[user.name] = roomId;

  if (!rooms[roomId]) {
    rooms[roomId] = [];
  }

  rooms[roomId].push(user);
  updateRoomInfo(roomId);
}

const getOpponents = (roomId) => {
  return roundInfo[roomId].opponents.map(user => ({ ...user, active: rooms[roomId].some(_user => _user.name === user.name) }));
}

const isCompetitor = (roomId, username) => (
  roundInfo[roomId] && roundInfo[roomId].opponents.some(user => user.name === username)
);

io.on('connection', (socket) => {
  socket.on('joinMatchmaking', (username) => {

    socket.name = username;
    console.log("joinMatchmaking event detected: ", socket.name);
    addUserRoomAssignment({ id: socket.id, name: username }, "queue");

    if (!queue.some(user => user.name === socket.name)) {
      queue.push({ id: socket.id, name: username });
      console.log(`${username} has joined the queue`);
    }
    if (queue.length >= 2) {
      const roomId = uuidv4();
      const [player1, player2] = queue.splice(0, 2);
      io.to(player1.id).emit('matched', roomId);
      io.to(player2.id).emit('matched', roomId);
      roundInfo[roomId] = {
        opponents: [player1, player2],
        roundNumber: 1,
        results: []
      };
      console.log("roundInfo for roomId ", roomId, " have been made: ", roundInfo[roomId]);
    }

  });

  socket.on('joinRoom', (roomId, username) => {

    socket.name = username;
    socket.join(roomId);
    console.log("joinRoom event detected: ", socket.name);

    console.log(`User ${socket.id} (${username}) joined room ${roomId}`);

    socket.role = "Spectator";
    if (isCompetitor(roomId, username)) {
      addUserRoomAssignment({ id: socket.id, name: username }, roomId);
      socket.role = "Competitor";
    }

    io.to(socket.id).emit('updateRoomInfo', { opponents: getOpponents(roomId), role: socket.role, roundNumber: roundInfo[roomId].roundNumber });
    io.to(roomId).emit('message', 'system', `${socket.role} "${username}" has joined the room.`, "");
  });

  socket.on('message', ({ roomId, type, text, username, role }) => {

    console.log("message event detected: ", socket.name);

    io.to(roomId).emit('message', type, text, username, role);
    console.log(`Message of type ${type} sent by user ${username} with role ${role} to ${roomId}: ${text}`);
  });

  socket.on('disconnect', () => {

    console.log("disconnect event detected: ", socket.name);

    if (!socket.name) {
      console.warn("User disconnected but did not properly join.");
      return;
    }

    console.log(socket.name + ' disconnected');
    queue = queue.filter(user => user.name !== socket.name);
    removeUserRoomAssignment(socket.name);
  });

  socket.on('leaveRoom', (roomId) => {
    io.to(roomId).emit('message', 'system', `${socket.role} "${socket.name}" has left the room.`, "");
    removeUserRoomAssignment(socket.name);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Socket.IO server running on ${PORT}`));
