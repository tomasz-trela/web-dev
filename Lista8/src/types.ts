export interface User {
  id: string;
  nickname: string;
  currentRoom: string;
}

export interface Message {
  id: string;
  type: 'text' | 'image' | 'system';
  content: string;
  sender: string;
  senderId: string;
  room: string;
  timestamp: number;
}

export interface RoomInfo {
  name: string;
  userCount: number;
}

export interface RoomData {
  name: string;
  messages: Message[];
  users: User[];
}
