import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './roomManager.js';
import { Message } from './types.js';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
  maxHttpBufferSize: 10 * 1024 * 1024, // 10MB for images
});

const roomManager = new RoomManager();

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('user:join', (data: { nickname: string }, callback) => {
    const user = roomManager.addUser(socket.id, data.nickname);
    const defaultRoom = 'Ogólny';

    // Join default room
    socket.join(defaultRoom);
    roomManager.joinRoom(socket.id, defaultRoom);

    // System message
    const sysMsg: Message = {
      id: generateId(),
      type: 'system',
      content: `${data.nickname} dołączył do pokoju`,
      sender: 'System',
      senderId: 'system',
      room: defaultRoom,
      timestamp: Date.now(),
    };
    roomManager.addMessage(defaultRoom, sysMsg);
    io.to(defaultRoom).emit('message:new', sysMsg);

    // Send room info
    const room = roomManager.getRoom(defaultRoom)!;
    callback({
      success: true,
      user,
      room: {
        name: defaultRoom,
        messages: room.messages,
        users: roomManager.getRoomUsers(defaultRoom),
      },
    });

    // Broadcast updated user list and room list
    io.to(defaultRoom).emit('room:users', roomManager.getRoomUsers(defaultRoom));
    io.emit('room:list', roomManager.getRoomList());
  });

  socket.on('room:join', (data: { room: string }, callback) => {
    const user = roomManager.getUser(socket.id);
    if (!user) return;

    // Leave current room
    const currentRoom = user.currentRoom;
    if (currentRoom) {
      socket.leave(currentRoom);
      roomManager.leaveRoom(socket.id, currentRoom);

      const leaveMsg: Message = {
        id: generateId(),
        type: 'system',
        content: `${user.nickname} opuścił pokój`,
        sender: 'System',
        senderId: 'system',
        room: currentRoom,
        timestamp: Date.now(),
      };
      roomManager.addMessage(currentRoom, leaveMsg);
      io.to(currentRoom).emit('message:new', leaveMsg);
      io.to(currentRoom).emit('room:users', roomManager.getRoomUsers(currentRoom));
    }

    // Join new room
    socket.join(data.room);
    roomManager.joinRoom(socket.id, data.room);

    const joinMsg: Message = {
      id: generateId(),
      type: 'system',
      content: `${user.nickname} dołączył do pokoju`,
      sender: 'System',
      senderId: 'system',
      room: data.room,
      timestamp: Date.now(),
    };
    roomManager.addMessage(data.room, joinMsg);
    io.to(data.room).emit('message:new', joinMsg);

    const room = roomManager.getRoom(data.room)!;
    callback({
      success: true,
      room: {
        name: data.room,
        messages: room.messages,
        users: roomManager.getRoomUsers(data.room),
      },
    });

    io.to(data.room).emit('room:users', roomManager.getRoomUsers(data.room));
    io.emit('room:list', roomManager.getRoomList());
  });

  socket.on('room:list', (callback) => {
    callback(roomManager.getRoomList());
  });

  socket.on('room:create', (data: { name: string }, callback) => {
    const trimmed = data.name.trim();
    if (!trimmed) {
      callback({ success: false, error: 'Nazwa pokoju nie może być pusta' });
      return;
    }
    if (roomManager.getRoom(trimmed)) {
      callback({ success: false, error: 'Pokój już istnieje' });
      return;
    }
    roomManager.createRoom(trimmed);
    io.emit('room:list', roomManager.getRoomList());
    callback({ success: true });
  });

  socket.on('message:send', (data: { room: string; content: string; type: 'text' | 'image' }) => {
    const user = roomManager.getUser(socket.id);
    if (!user) return;

    const message: Message = {
      id: generateId(),
      type: data.type,
      content: data.content,
      sender: user.nickname,
      senderId: socket.id,
      room: data.room,
      timestamp: Date.now(),
    };

    roomManager.addMessage(data.room, message);
    io.to(data.room).emit('message:new', message);
  });

  socket.on('typing:start', (data: { room: string }) => {
    const user = roomManager.getUser(socket.id);
    if (!user) return;
    socket.to(data.room).emit('typing:update', {
      nickname: user.nickname,
      isTyping: true,
    });
  });

  socket.on('typing:stop', (data: { room: string }) => {
    const user = roomManager.getUser(socket.id);
    if (!user) return;
    socket.to(data.room).emit('typing:update', {
      nickname: user.nickname,
      isTyping: false,
    });
  });

  socket.on('disconnect', () => {
    const user = roomManager.getUser(socket.id);
    if (!user) return;

    // Get all rooms user was in before removing
    const userRooms = roomManager.getUserRooms(socket.id);

    // Send leave messages
    for (const roomName of userRooms) {
      const leaveMsg: Message = {
        id: generateId(),
        type: 'system',
        content: `${user.nickname} opuścił czat`,
        sender: 'System',
        senderId: 'system',
        room: roomName,
        timestamp: Date.now(),
      };
      roomManager.addMessage(roomName, leaveMsg);
      io.to(roomName).emit('message:new', leaveMsg);
    }

    roomManager.removeUser(socket.id);

    // Update user lists and room list
    for (const roomName of userRooms) {
      io.to(roomName).emit('room:users', roomManager.getRoomUsers(roomName));
    }
    io.emit('room:list', roomManager.getRoomList());

    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
