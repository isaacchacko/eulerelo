import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import RoomAssigner from './RoomAssigner';
import logger from './logger';
import type { CreateRoomFunction, RoomId, UserId, EmitFunction, SocketId } from './types';


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://eulerelo.up.railway.app",
      "https://www.eulerelo.com"
    ],
    methods: ["GET", "POST"]
  }
});

const emitFunction: EmitFunction = async (roomId: RoomId, competitors: UserId[]) => {
  const socketIds = competitors.map(userId => ra.getSocketId(userId));
  if (socketIds.some(socketId => typeof socketId !== "string")) {
    logger.error("Emit function failed because at least one socket id was not returned.");
    return false;
  }
  io.to(socketIds as SocketId[]).emit('matched', roomId)
};

const createRoomFunction: CreateRoomFunction = async (roomId, competitors) => {
  logger.info("create room function called for roomId", roomId, "and competitors", competitors);
  // for (const userId of competitors) {
  //   await ra.leaveRoom(userId, 'matchmaking');
  // }
  return ra.makeRoom(roomId, competitors);
}

const ra = new RoomAssigner();
ra.makeQueue(
  emitFunction, // give Queue access to io.to(<socket>).emit function
  createRoomFunction // give Queue access to ra.makeRoom function
);

io.on('connection', (socket) => {
  socket.on('joinMatchmaking', async (user) => {
    logger.info("joinMatchmaking event detected")

    // if (!socket.user) socket.user = user;
    await ra.makeUser(user, socket);
    await ra.joinRoom(user.id, 'matchmaking');

  });

  socket.on('joinRoom', async (roomId, user) => {

    logger.info("joinRoom event detected: ", user);

    // if (!socket.user) socket.user = user;
    await ra.makeUser(user, socket);
    const result = await ra.joinRoom(user.id, roomId);
    if (!result) {
      logger.info('User', user, 'failed to join room', roomId, '.');
      return;
    }

    socket.join(roomId);
    io.to(socket.id).emit('updateRoomInfo', result);
    io.to(roomId).emit('message', 'system', `${result.role} "${user.name}" has joined the room.`, "");
  });

  socket.on('message', ({ roomId, type, text, username, role }) => {

    logger.info("message event detected: ", username);

    io.to(roomId).emit('message', type, text, username, role);
    logger.info(`Message of type ${type} sent by user ${username} with role ${role} to ${roomId}: ${text}`);
  });

  socket.on('disconnect', () => {

    logger.info("disconnect event detected");

    const roomId = ra.whereIs(socket);
    if (roomId === null) {
      logger.error("User cannot be disconnected because user is not in a room.");
      return;
    }

    if (roomId === false) {
      logger.error("User cannot be disconnected because user is not defined.");
      return;
    }

    const userId = ra.getUserId(socket);
    if (!userId) {
      logger.warn("User disconnected but did not properly join.");
      return;
    }

    logger.info(userId + ' disconnected');
    ra.leaveRoom(userId, roomId);
  });

  socket.on('leaveRoom', (roomId) => {
    const userRoomInfo = ra.getUserRoomInfo(socket);
    const user = ra.getUser(socket);
    if (!userRoomInfo || !user) return;
    io.to(roomId).emit('message', 'system', `${userRoomInfo.role} "${user.name}" has left the room.`, "");
    ra.leaveRoom(user.id, roomId);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => logger.info(`Socket.IO server running on ${PORT}`));
