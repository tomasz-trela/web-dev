export interface User {
  id: string;          // socket.id
  nickname: string;
  currentRoom: string;
}

export interface Message {
  id: string;
  type: 'text' | 'image' | 'system';
  content: string;     // tekst lub base64 data URL
  sender: string;      // nickname
  senderId: string;    // socket.id
  room: string;
  timestamp: number;   // Date.now()
}

export interface Room {
  name: string;
  users: Map<string, User>;
  messages: Message[];
}

export interface RoomInfo {
  name: string;
  userCount: number;
}
