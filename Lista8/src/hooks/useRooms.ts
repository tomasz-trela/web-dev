import { useState, useCallback } from 'react';
import { socket } from '@/socket';
import { useSocket } from './useSocket';
import type { RoomInfo, User, RoomData } from '@/types';

export function useRooms() {
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string>('Ogólny');
  const [roomUsers, setRoomUsers] = useState<User[]>([]);

  useSocket('room:list', (data) => {
    setRooms(data as RoomInfo[]);
  });

  useSocket('room:users', (data) => {
    setRoomUsers(data as User[]);
  });

  const joinRoom = useCallback((roomName: string, onJoined: (data: RoomData) => void) => {
    socket.emit('room:join', { room: roomName }, (response: { success: boolean; room: RoomData }) => {
      if (response.success) {
        setCurrentRoom(roomName);
        setRoomUsers(response.room.users);
        onJoined(response.room);
      }
    });
  }, []);

  const createRoom = useCallback((name: string, callback: (result: { success: boolean; error?: string }) => void) => {
    socket.emit('room:create', { name }, callback);
  }, []);

  const fetchRooms = useCallback(() => {
    socket.emit('room:list', (data: RoomInfo[]) => {
      setRooms(data);
    });
  }, []);

  return {
    rooms,
    currentRoom,
    roomUsers,
    joinRoom,
    createRoom,
    fetchRooms,
  };
}
