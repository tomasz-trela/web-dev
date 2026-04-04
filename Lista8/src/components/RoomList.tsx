import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Hash } from 'lucide-react';
import type { RoomInfo } from '@/types';

interface RoomListProps {
  rooms: RoomInfo[];
  currentRoom: string;
  unreadRooms: Set<string>;
  onJoinRoom: (room: string) => void;
  onCreateRoom: (name: string, cb: (result: { success: boolean; error?: string }) => void) => void;
}

export function RoomList({ rooms, currentRoom, unreadRooms, onJoinRoom, onCreateRoom }: RoomListProps) {
  const [newRoomName, setNewRoomName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = () => {
    const trimmed = newRoomName.trim();
    if (!trimmed) return;
    onCreateRoom(trimmed, (result) => {
      if (result.success) {
        setNewRoomName('');
        setDialogOpen(false);
        setError('');
      } else {
        setError(result.error || 'Błąd');
      }
    });
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-2 mb-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Pokoje
        </h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Nowy pokój</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Nazwa pokoju..."
                value={newRoomName}
                onChange={(e) => { setNewRoomName(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={handleCreate} className="w-full">Utwórz</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {rooms.map((room) => (
        <Button
          key={room.name}
          variant={room.name === currentRoom ? 'secondary' : 'ghost'}
          className="w-full justify-start gap-2 h-9"
          onClick={() => onJoinRoom(room.name)}
        >
          <Hash className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{room.name}</span>
          <Badge variant="secondary" className="ml-auto text-[10px] h-5">
            {room.userCount}
          </Badge>
          {unreadRooms.has(room.name) && room.name !== currentRoom && (
            <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
          )}
        </Button>
      ))}
    </div>
  );
}
