
export type RoomId = string;
export type UserId = string;
export type SocketId = string;

export interface User {
  id: UserId;
  name: string;
  email: string;
  elo: number;
}

export interface Competitor extends User {
  active: boolean;
  score: number;
}

import { Socket } from 'socket.io';

export interface UserInfo {
  user: User;
  socket: Socket;
  room: RoomId | null;
  info: UserRoomInfo | QueueInfo | null;
}

export type Competitors = Record<UserId, Competitor>;

export interface RoomInfo {
  competitors: Competitors;
  roundNumber: number;
  matchStatus: string;
  roomId: RoomId;  // must be shared with QueueInfo
}

export interface QueueInfo {
  roomId: string;  // must be shared with QueueInfo
  status: string;
  role: string;
} // TODO: add queue info feature

export interface UserRoomInfo extends RoomInfo {
  role: string;
}

export type EmitFunction = (roomId: RoomId, competitors: UserId[]) => Promise<void | false>;
export type CreateRoomFunction = (roomId: RoomId, competitors: UserId[]) => Promise<boolean>;
