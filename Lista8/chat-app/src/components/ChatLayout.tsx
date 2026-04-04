import { useState, useCallback, useEffect } from 'react';
import { socket } from '@/socket';
import { useChat } from '@/hooks/useChat';
import { useRooms } from '@/hooks/useRooms';
import { useSocket } from '@/hooks/useSocket';
import { Sidebar } from './Sidebar';
import { ChatArea } from './ChatArea';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Menu, Moon, Sun } from 'lucide-react';
import type { Message } from '@/types';

interface ChatLayoutProps {
  nickname: string;
}

export function ChatLayout({ nickname }: ChatLayoutProps) {
  const { rooms, currentRoom, roomUsers, joinRoom, createRoom, fetchRooms } = useRooms();
  const { messages, typingUsers, sendMessage, handleTyping, setInitialMessages } = useChat(currentRoom);
  const [unreadRooms, setUnreadRooms] = useState<Set<string>>(new Set());
  const [dark, setDark] = useState(() => {
    return document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Track unread for non-active rooms
  useSocket('message:new', (msg) => {
    const message = msg as Message;
    if (message.room !== currentRoom && message.type !== 'system') {
      setUnreadRooms(prev => new Set(prev).add(message.room));
    }
  });

  const handleJoinRoom = useCallback((roomName: string) => {
    if (roomName === currentRoom) return;
    joinRoom(roomName, (data) => {
      setInitialMessages(data.messages);
      setUnreadRooms(prev => {
        const next = new Set(prev);
        next.delete(roomName);
        return next;
      });
    });
    setSidebarOpen(false);
  }, [currentRoom, joinRoom, setInitialMessages]);

  const sidebarContent = (
    <Sidebar
      rooms={rooms}
      currentRoom={currentRoom}
      roomUsers={roomUsers}
      unreadRooms={unreadRooms}
      onJoinRoom={handleJoinRoom}
      onCreateRoom={createRoom}
    />
  );

  return (
    <div className="flex h-screen">
      {/* Desktop sidebar */}
      <div className="hidden md:block w-[280px] border-r bg-card shrink-0">
        {sidebarContent}
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-2 border-b px-3 py-2">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              {sidebarContent}
            </SheetContent>
          </Sheet>
          <span className="font-semibold truncate">{nickname}</span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setDark(d => !d)}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        {/* Desktop dark mode toggle */}
        <div className="hidden md:flex justify-end px-3 py-1 border-b">
          <span className="text-sm text-muted-foreground mr-2">{nickname}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setDark(d => !d)}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        <ChatArea
          currentRoom={currentRoom}
          messages={messages}
          mySocketId={socket.id || ''}
          typingUsers={typingUsers}
          onSend={sendMessage}
          onTyping={handleTyping}
        />
      </div>
    </div>
  );
}
