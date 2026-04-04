import { useState, useCallback } from 'react';
import { socket } from '@/socket';
import { NickDialog } from '@/components/NickDialog';
import { ChatLayout } from '@/components/ChatLayout';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { RoomData, User } from '@/types';

function App() {
  const [nickname, setNickname] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const handleJoin = useCallback((nick: string) => {
    socket.connect();
    socket.emit('user:join', { nickname: nick }, (response: { success: boolean; user: User; room: RoomData }) => {
      if (response.success) {
        setNickname(nick);
        setConnected(true);
      }
    });
  }, []);

  return (
    <TooltipProvider>
      {!connected || !nickname ? (
        <NickDialog onJoin={handleJoin} />
      ) : (
        <ChatLayout nickname={nickname} />
      )}
    </TooltipProvider>
  );
}

export default App;
