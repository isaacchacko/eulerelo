import { Server } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";

const SocketHandler = (req: NextApiRequest, res: NextApiResponse) => {

  // optional chaining because res.socket can be null

  // type assertion as any because res.socket is derived from the
  // net library which doesn't come base with the server member. the
  // code only works because NextJS attaches the server property at runtime

  const server = (res.socket as any)?.server;

  if (!server.io) {
    const io = new Server(server, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      cors: { origin: "*" } // Tighten for production
    });

    // Room storage
    const rooms = new Map<string, Set<string>>();

    io.on("connection", (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Matchmaking logic
      socket.on("find-match", async () => {
        let availableRoom: string | null = null;
        
        // Find room with 1 player
        rooms.forEach((users, roomId) => {
          if (users.size === 1) availableRoom = roomId;
        });

        if (availableRoom) {
          socket.join(availableRoom);
          rooms.get(availableRoom)?.add(socket.id);
          io.to(availableRoom).emit("match-found", availableRoom);
        } else {
          const newRoom = `room_${Math.random().toString(36).substr(2, 9)}`;
          socket.join(newRoom);
          rooms.set(newRoom, new Set([socket.id]));
        }

        socket.emit("room-joined", Array.from(socket.rooms)[1]);
      });

      // Chat handling
      socket.on("send-message", ({ room, message }) => {
        io.to(room).emit("receive-message", {
          sender: socket.id,
          message,
          timestamp: new Date().toISOString()
        });
      });

      socket.on("disconnect", () => {
        rooms.forEach((users, roomId) => {
          if (users.delete(socket.id) && users.size === 0) {
            rooms.delete(roomId);
          }
        });
      });
    });

    server.io = io;
  }
  res.end();
};

export default SocketHandler;
