import { useRef, useState, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowDown, Hash } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { SystemMessage } from './SystemMessage';
import { TypingIndicator } from './TypingIndicator';
import { MessageInput } from './MessageInput';
import type { Message } from '@/types';

interface ChatAreaProps {
  currentRoom: string;
  messages: Message[];
  mySocketId: string;
  typingUsers: string[];
  onSend: (content: string, type: 'text' | 'image') => void;
  onTyping: () => void;
}

export function ChatArea({ currentRoom, messages, mySocketId, typingUsers, onSend, onTyping }: ChatAreaProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showNewMsg, setShowNewMsg] = useState(false);
  const [nearBottom, setNearBottom] = useState(true);
  const [prevRoom, setPrevRoom] = useState(currentRoom);
  const [prevMsgCount, setPrevMsgCount] = useState(messages.length);

  // Use a callback ref on the bottom sentinel to scroll into view
  const bottomCallbackRef = useCallback((node: HTMLDivElement | null) => {
    node?.scrollIntoView();
  }, []);

  // Track room changes and new messages via state derivation
  if (currentRoom !== prevRoom) {
    setPrevRoom(currentRoom);
    setPrevMsgCount(messages.length);
    setShowNewMsg(false);
    setNearBottom(true);
  } else if (messages.length > prevMsgCount) {
    setPrevMsgCount(messages.length);
    if (!nearBottom) {
      if (!showNewMsg) setShowNewMsg(true);
    }
  }

  // Key changes on room switch to force re-mount & scroll via callback ref
  const scrollKey = currentRoom;

  const scrollToBottom = useCallback(() => {
    scrollContainerRef.current?.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
    setShowNewMsg(false);
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const isNear = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setNearBottom(isNear);
    if (isNear) setShowNewMsg(false);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center gap-2 shrink-0">
        <Hash className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-semibold">{currentRoom}</h2>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 relative">
        <div
          key={scrollKey}
          ref={scrollContainerRef}
          className="p-4 h-full overflow-y-auto"
          onScroll={handleScroll}
          style={{ maxHeight: 'calc(100vh - 200px)' }}
        >
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm mt-8">
              Brak wiadomości. Rozpocznij rozmowę!
            </div>
          )}
          {messages.map((msg) =>
            msg.type === 'system' ? (
              <SystemMessage key={msg.id} message={msg} />
            ) : (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === mySocketId}
              />
            )
          )}
          <div ref={bottomCallbackRef} />
        </div>

        {/* New messages button */}
        {showNewMsg && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <Button
              variant="secondary"
              size="sm"
              className="shadow-lg"
              onClick={scrollToBottom}
            >
              <ArrowDown className="h-4 w-4 mr-1" />
              Nowe wiadomości
            </Button>
          </div>
        )}
      </ScrollArea>

      {/* Typing indicator + input */}
      <TypingIndicator typingUsers={typingUsers} />
      <MessageInput onSend={onSend} onTyping={onTyping} />
    </div>
  );
}
