import { Room, User, Message, RoomInfo } from './types.js';

const DEFAULT_ROOMS = ['Ogólny', 'Technologia', 'Random'];
const MAX_HISTORY = 100;

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private users: Map<string, User> = new Map();

  constructor() {
    for (const name of DEFAULT_ROOMS) {
      this.createRoom(name);
    }
  }

  createRoom(name: string): Room {
    if (this.rooms.has(name)) {
      return this.rooms.get(name)!;
    }
    const room: Room = { name, users: new Map(), messages: [] };
    this.rooms.set(name, room);
    return room;
  }

  addUser(socketId: string, nickname: string): User {
    const user: User = { id: socketId, nickname, currentRoom: DEFAULT_ROOMS[0] };
    this.users.set(socketId, user);
    return user;
  }

  removeUser(socketId: string): User | undefined {
    const user = this.users.get(socketId);
    if (user) {
      // Remove from all rooms
      for (const room of this.rooms.values()) {
        room.users.delete(socketId);
      }
      this.users.delete(socketId);
    }
    return user;
  }

  getUser(socketId: string): User | undefined {
    return this.users.get(socketId);
  }

  joinRoom(socketId: string, roomName: string): Room | undefined {
    const user = this.users.get(socketId);
    const room = this.rooms.get(roomName);
    if (!user || !room) return undefined;

    room.users.set(socketId, user);
    user.currentRoom = roomName;
    return room;
  }

  leaveRoom(socketId: string, roomName: string): boolean {
    const room = this.rooms.get(roomName);
    if (!room) return false;
    return room.users.delete(socketId);
  }

  getRoom(name: string): Room | undefined {
    return this.rooms.get(name);
  }

  getRoomList(): RoomInfo[] {
    return Array.from(this.rooms.values()).map(r => ({
      name: r.name,
      userCount: r.users.size,
    }));
  }

  getRoomUsers(roomName: string): User[] {
    const room = this.rooms.get(roomName);
    if (!room) return [];
    return Array.from(room.users.values());
  }

  addMessage(roomName: string, message: Message): void {
    const room = this.rooms.get(roomName);
    if (!room) return;
    room.messages.push(message);
    if (room.messages.length > MAX_HISTORY) {
      room.messages = room.messages.slice(-MAX_HISTORY);
    }
  }

  getUserRooms(socketId: string): string[] {
    const rooms: string[] = [];
    for (const room of this.rooms.values()) {
      if (room.users.has(socketId)) {
        rooms.push(room.name);
      }
    }
    return rooms;
  }
}
