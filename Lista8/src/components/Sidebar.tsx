import { Separator } from '@/components/ui/separator';
import { RoomList } from './RoomList';
import { UserList } from './UserList';
import type { RoomInfo, User } from '@/types';

interface SidebarProps {
  rooms: RoomInfo[];
  currentRoom: string;
  roomUsers: User[];
  unreadRooms: Set<string>;
  onJoinRoom: (room: string) => void;
  onCreateRoom: (name: string, cb: (result: { success: boolean; error?: string }) => void) => void;
}

export function Sidebar({ rooms, currentRoom, roomUsers, unreadRooms, onJoinRoom, onCreateRoom }: SidebarProps) {
  return (
    <div className="flex flex-col h-full p-3 gap-3">
      <div className="font-semibold text-lg px-2">💬 Czat</div>
      <RoomList
        rooms={rooms}
        currentRoom={currentRoom}
        unreadRooms={unreadRooms}
        onJoinRoom={onJoinRoom}
        onCreateRoom={onCreateRoom}
      />
      <Separator />
      <UserList users={roomUsers} />
    </div>
  );
}
