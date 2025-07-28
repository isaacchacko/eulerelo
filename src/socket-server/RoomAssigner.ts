import { v4 as uuidv4 } from 'uuid';
import { Mutex } from 'async-mutex';
import logger from './logger';   // assumes logger.ts uses `export default`
import { User, UserId, RoomId, UserInfo, RoomInfo, UserRoomInfo, QueueInfo, Competitor, Competitors, EmitFunction, CreateRoomFunction, SocketId } from './types';
import { Socket } from 'socket.io';

/**
 * Runs a callback while holding the provided mutex lock.
 * Ensures mutual exclusion for the critical section.
 *
 * @template T - return type of the callback
 * @param mutex - the mutex to acquire (from 'async-mutex')
 * @param fn - the function to execute inside the lock
 * @returns value returned by fn
 */
export async function withLock<T>(mutex: Mutex, fn: () => T | Promise<T>): Promise<T> {
  const release = await mutex.acquire();
  try {
    return await fn();
  } finally {
    release();
  }
}

/**
 * Manages user-room assignments, creation and deletion of rooms,
 * and safe concurrent operations for a socket-based multiplayer environment.
 *
 * This class coordinates user participation in rooms, tracks room memberships,
 * and manages critical sections using mutexes to prevent race conditions.
 *
 * generated wth ai
 */
class RoomAssigner {
  private rooms: Record<RoomId, Room | Queue> = {};
  private users: Record<UserId, UserInfo> = {};
  private mutex = new Mutex();

  /**
   * @template T - whatever type the original fn was meant to return
   * @param fn - the original function
   */
  private async withLock<T>(fn: () => T | Promise<T>): Promise<T> {
    return await withLock(this.mutex, fn);
  }

  /**
   * @param roomId
   * @returns whether the room has been defined
   */
  hasRoom(roomId: RoomId) { return Boolean(this.rooms[roomId]); }

  /**
   * @param userId
   * @returns - whether the userId is valid and if the user has been assigned
   */
  hasUserId(userId: UserId) {
    return userId && userId.length > 0 && Boolean(this.users[userId]);
  }

  /**
   * @param userId
   * @returns a boolean based on the following
   * false if the userId isn't assigned
   * false if the userId is assigned null (no room)
   * true otherwise
   */
  userInARoom(userId: UserId): Boolean {
    if (!this.hasUserId(userId)) return false;
    if (this.users[userId].room === null) return false;
    return true;
  }

  /**
   * @param roomId
   * @returns - room info object
   */
  roomInfo(roomId: RoomId): RoomInfo | false {
    if (!this.hasRoom(roomId)) {
      logger.error('Could not get room info for', roomId, 'because room does not exist.')
      return false;
    }

    return this.rooms[roomId].info;
  }

  async makeQueue(invokeEmit: EmitFunction, invokeCreateRoom: CreateRoomFunction) {
    this.rooms['matchmaking'] = new Queue(invokeEmit, invokeCreateRoom);
  }

  /**
   * @param user
   * @param socket
   * either creates a new user or rewrites the socket in the case of reconnections
   * @returns true regardless
   */
  async makeUser(user: User, socket: Socket): Promise<true> {
    if (this.hasUserId(user.id)) {
      const currentSocketId = this.users[user.id].socket.id;
      if (socket.id !== currentSocketId) {

        this.users[user.id].socket = socket;  // rewrite over the socket, for reconnections
        logger.info("user with userId", user.id, "has reconnected under a new socket. from", currentSocketId, "to", socket.id);
      }

      // TODO: create user comparision helper

      // TODO: update any user information that changed. example code for name change below

      // const currentUser = this.users[user.id].user;
      // if (user.name !== currentUser.name) {

      //   this.users[user.id].user.name = user.name;  // rewrite over the name
      //   logger.info("user with userId", user.id, "has reconnected under a new socket. from", currentSocketId, "to", socket.id);
      // }

      return true;
    }

    return this.withLock(() => {
      this.users[user.id] = {
        socket: { ...socket } as Socket,
        user: { ...user } as User,
        room: null,
        info: null
      };
      return true;
    });

  }
  async makeRoom(roomId: RoomId, competitors: UserId[]): Promise<boolean> {
    if (this.hasRoom(roomId)) {
      logger.error("Cannot make new room", roomId, "because it already exists. Room: ", this.rooms[roomId]);
      return false;
    }

    if (!Array.isArray(competitors)) {
      logger.error("Cannot make new room", roomId, "because competitors variable is not an array. competitors: ", competitors);
      return false;
    }

    if (competitors.some(otherUserId => !this.hasUserId(otherUserId))) {
      logger.error("Cannot make new room", roomId, "because at least one competitor has not been assigned.");
      return false;
    }

    const userCompetitors = competitors.map(otherUserId => this.users[otherUserId].user);


    await this.withLock(() => {
      this.rooms[roomId] = new Room(roomId, userCompetitors);
    });
    logger.info("created new room with roomId", roomId, "successfully.");
    return true;
  }

  // attempts to delete a room, setting it to undefined
  async deleteRoom(roomId: RoomId) {
    return this.withLock(() => {
      if (!this.hasRoom(roomId)) return;

      const room = this.rooms[roomId];

      if (room) {
        const deleteConditions = room.generateDeleteConditions();

        // for now, let's just check if the room is empty or not
        if (deleteConditions.emptyCompetitors && deleteConditions.emptySpectators) {
          delete this.rooms[roomId];
          return true;
        }
        logger.error("Failed to delete room", roomId, "because conditions were not met. Conditions: ", deleteConditions);
      }


      logger.error("Failed to delete room", roomId, "because room was not found.");
      return false;
    });
  }

  async joinRoom(userId: UserId, roomId: RoomId): Promise<UserRoomInfo | QueueInfo | false> {

    logger.info("join room called for userId", userId);
    // if the room doesnt exist
    if (!this.hasRoom(roomId)) {
      logger.error("User with userId", userId, "cannot be added to room", roomId, "because it does not exist.");
      return false;
    }

    // if the room has the user already
    // if (await this.#rooms[roomId].has(user)) {
    //   logger.error("User", user, "already in room", roomId);
    //   return false;
    // }

    // if the user is in another room (hasn't been disconnected)
    if (this.userInARoom(userId) && this.users[userId].room !== roomId) {
      logger.error("User with userId", userId, "is currently in room", this.users[userId].room, "and could not be added to room", roomId, ".");
      return false;
    }


    // define update that runs if result is good
    const updateCallback = (result: UserRoomInfo | QueueInfo) => {
      this.users[userId].room = roomId;
      this.users[userId].info = result;
    };

    const result = await this.rooms[roomId].joinRoom(userId, updateCallback);
    logger.info("User with userId", userId, "has attempted to join room", roomId, "with result", result, ".");
    return result; // return should be passed to user client
  }

  async leaveRoom(userId: UserId, roomId: RoomId) {

    if (!this.hasUserId(userId)) {
      logger.error("User with userId", userId, "does not exist and could not be removed from room", roomId, ".");
      return false;
    }

    if (!this.hasRoom(roomId)) {
      logger.error("User with userId", userId, "cannot be removed from room", roomId, "because it does not exist.");
      return false;
    }

    if (!(await this.rooms[roomId].has(userId))) {
      logger.error("User with userId", userId, "not in room", roomId, "and thus cannot be removed.");
      return false;
    }


    if (this.userInARoom(userId) && this.users[userId].room !== roomId) {
      logger.error("User with userId", userId, "is currently in room", this.users[userId], "and could not be removed from room", roomId, ".");
      return false;
    }

    // update fn that gets called if result is good
    const updateCallback = () => {
      this.users[userId].room = null;
    }

    const result = await this.rooms[roomId].leaveRoom(userId, updateCallback);
    logger.info("User with userId", userId, "has attempted to leave room", roomId, "with result", result, ".");
    return result
  }

  /**
   * @param identifier - something to iddentify the user with
   * this function just handles the typing and error-outs before identifying the user
   * this function is just a helper for the other get functions below
   */
  identifyUser(identifier: UserId | Socket): UserId | false {

    if (typeof identifier !== "string") { // if socket
      const userId = this.getUserId(identifier);  // returns either UserId | false
      if (!userId) {
        logger.error("Failed to get user id from socket", identifier.id, "while identifying user.");
        return false;
      }
      return userId as string;
    } else { // if the userId was provided
      return identifier;
    }
  }

  getUserId(socket: Socket): UserId | false {
    const userId = Object.keys(this.users).find(userId => this.users[userId].socket && this.users[userId].socket.id === socket.id);
    if (!userId) {
      console.error("Could not find the userId of the socket with socketId", socket.id, ".")
      return false
    }

    return userId;
  }

  getSocketId(userId: UserId): SocketId | false {
    if (!this.hasUserId(userId)) {
      console.error("User with userid", userId, "has not been assigned and thus the socket cannot be provided.");
      return false;
    }
    return this.users[userId].socket.id;
  }

  /**
   * @param identifier - passed to the identifier helper fn
   * @returns - the room where the user is
   * RoomId when user is in a Room
   * null when hasUser is true
   * false when failed
   */
  whereIs(identifier: UserId | Socket): RoomId | null | false {

    // identify user
    const userId = this.identifyUser(identifier);
    if (!userId) {
      logger.error("Failed to identify user while getting user info.");
      return false;
    }

    return this.users[userId].room;
  }

  /**
   * @param identifier - passed to the identifier helper fn
   * @returns the info of the user
   * UserRoomInfo if user is in a Room
   * QueueInfo if user is in queue
   * null if the user is assigned (hasUser is true)
   * false if failure
   */
  getUserRoomInfo(identifier: UserId | Socket): UserRoomInfo | QueueInfo | null | false {

    // identify user
    const userId = this.identifyUser(identifier);
    if (!userId) {
      logger.error("Failed to identify user while getting user info.");
      return false;
    }

    const info = this.users[userId].info;

    // make sure info is a shallow copy
    if (typeof info === "object") {
      return { ...info } as UserRoomInfo | QueueInfo;
    }

    return info;
  }

  /**
   * @param identifier - passed to the identifier helper fn
   * @returns the info of the user
   * User if user is in a Room
   * false if failure
   */
  getUser(identifier: UserId | Socket): User | false {

    // identify user
    const userId = this.identifyUser(identifier);
    if (!userId) {
      logger.error("Failed to identify user while getting user.");
      return false;
    }

    return { ...this.users[userId].user };
  }
}

class Room {
  protected roomId: RoomId;  // protected for Queue
  private competitors: Competitors;
  protected spectators: UserId[];  // protected for Queue
  private matchStatus;
  private roundNumber: number;
  private score: Record<UserId, number>;
  private mutex: Mutex;

  constructor(roomId: RoomId, competitors: User[]) {
    this.roomId = roomId;
    this.competitors = Object.fromEntries(competitors.map(user => [user.id, { ...user, active: false, score: 0 }]));
    this.spectators = [];
    this.matchStatus = "awaiting-competitors";
    this.roundNumber = 1;
    this.score = Object.fromEntries(competitors.map(user => [user.id, 0]));

    this.mutex = new Mutex();
  }

  /**
   * @template T - whatever type the original fn was meant to return
   * @param fn - the original function
   */
  private async withLock<T>(fn: () => T | Promise<T>): Promise<T> {
    return await withLock(this.mutex, fn);
  }

  get info() {
    return {
      competitors: this.competitors,
      roundNumber: this.roundNumber,
      matchStatus: this.matchStatus,
      roomId: this.roomId,
      score: this.score
    }
  }

  // return any relevant factors to think about before deleting.
  // conditionals/logic regarding factors should be done downstream
  generateDeleteConditions() {
    return {
      emptyCompetitors: Object.values(this.competitors).filter(user => user.active).length === 0,
      emptySpectators: this.spectators.length === 0,
      matchStatus: this.matchStatus,
      roundNumber: this.roundNumber
    }
  }

  async has(userId: UserId): Promise<boolean> {
    const asCompetitor = (await this.isCompetitor(userId) && await this.withLock(() => this.competitors[userId].active));
    const asSpectator = (await this.withLock(() => this.spectators.some(otherId => otherId === userId)));

    logger.info('Room with roomId', this.roomId, 'has determined that user with userId', userId, 'is', asCompetitor, 'attending as a competitor and is', asSpectator, 'attending as spectator');
    return asCompetitor || asSpectator;

  }

  async getCompetitor(userId: UserId): Promise<Competitor | false> {
    if (!(await this.isCompetitor(userId))) {
      logger.error("User with userId", userId, "is not a competitor of roomId", this.roomId, ".");
      return false;
    }
    return this.withLock(() => this.competitors[userId]);
  }

  /**
   * @param user
   * @returns whether user is specified as a competitor
   * they do not have to be connected! 
   */
  async isCompetitor(userId: UserId): Promise<boolean> {
    return this.withLock(() => userId in this.competitors);
  }

  /**
   * @param user
   * @returns - whether the user is currently connected as a spectator
   * different from isCompetitor because they have to be connected!
   */
  async isSpectator(userId: UserId) {
    return this.withLock(() =>
      this.spectators.some(otherId => otherId === userId)
    );
  }

  /**
   * @param user
   * @returns - information relevant to user who joined
   */
  /**
   * @param userId
   * @param updateCallback - fn that's called when join is successful,
   * meant to update values on RoomAssigner.users to prevent a race condition
   * @returns [TODO:return]
   */
  async joinRoom(userId: UserId, updateCallback: (result: UserRoomInfo | QueueInfo) => void): Promise<UserRoomInfo | QueueInfo | false> {
    if (await this.isCompetitor(userId)) {
      const competitor = await this.getCompetitor(userId);

      if (!competitor) return false;  // never happens

      if (competitor.active) {
        logger.error("User", userId, "is already in room", this.roomId, " as an active competitor and cannot join the room again.");
        return false;
      }

      await this.withLock(async () => {
        competitor.active = true;
      });

      return { ...this.info, role: 'competitor' };
    }

    if (await this.isSpectator(userId)) {
      logger.error("User with userId", userId, "is already in room", this.roomId, " as a spectator and cannot join the room again.");
      return false;
    }

    // default case: add as spectator
    await this.withLock(async () => {
      this.spectators.push(userId);
    });
    logger.info("spectator with userId", userId, "added to room", this.roomId, ".");

    const result = { ...this.info, role: 'spectator' };
    updateCallback(result);
    return result;

  }

  /**
   * @param userId
   * @param updateCallback - fn that's called when join is successful,
   * meant to update values on RoomAssigner.users to prevent a race condition
   * @returns pass/fail state
   */
  async leaveRoom(userId: UserId, updateCallback: () => void): Promise<boolean> {

    if (await this.isCompetitor(userId)) {
      const competitor = await this.getCompetitor(userId);

      if (!competitor) return false;
      if (!competitor.active) {
        logger.error("User with userId", userId, "is already in room", this.roomId, " as an inactive competitor and cannot leave the room again.");
        return false;
      }

      await this.withLock(async () => {
        competitor.active = false;
      });
      return true;
    }

    if (!(await this.isSpectator(userId))) {
      logger.error("User with userId", userId, "is not in room", this.roomId, " as a spectator and cannot leave the room again.");
      return false;
    }


    await this.withLock(async () => {
      this.spectators = this.spectators.filter(otherUser => otherUser !== userId);
    });

    logger.info("User with userId", userId, "has left room", this.roomId, " successfully.")
    updateCallback();
    return true;

  }
}

class Queue extends Room {
  public invokeEmit;
  public invokeCreateRoom;

  constructor(invokeEmit: EmitFunction, invokeCreateRoom: CreateRoomFunction) {
    super("matchmaking", [{ id: "", name: "", email: "", elo: 0 }, { id: "", name: "", email: "", elo: 0 }]);
    this.invokeEmit = invokeEmit;
    this.invokeCreateRoom = invokeCreateRoom;
  }

  /**
   * @param userId
   * @param updateCallback - fn that's called when join is successful,
   * meant to update values on RoomAssigner.users to prevent a race condition
   * @returns a QueueInfo object
   */
  async joinRoom(userId: UserId, updateCallback: (result: UserRoomInfo | QueueInfo) => void): Promise<UserRoomInfo | QueueInfo | false> {
    const result = await super.joinRoom(userId, updateCallback);

    if (!result) return result;  // pass error downstream

    logger.info('userId', userId, 'joined queue successfully. spectators length:', this.spectators.length);
    if (this.spectators.length >= 2) {
      logger.info('userId', userId, 'has tipped the queue');
      const roomId = uuidv4();
      const competitors = this.spectators.slice(0, 2);
      await this.invokeCreateRoom(roomId, competitors);
      await this.invokeEmit(roomId, competitors);
    }
    return { roomId: this.roomId, status: 'in-queue', role: 'queued' };

  }
}

export default RoomAssigner;
