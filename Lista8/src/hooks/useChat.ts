import { useState, useCallback, useRef } from 'react';
import { socket } from '@/socket';
import { useSocket } from './useSocket';
import type { Message } from '@/types';

export function useChat(currentRoom: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const typingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useSocket('message:new', (msg) => {
    const message = msg as Message;
    if (message.room === currentRoom) {
      setMessages(prev => [...prev, message]);
    }
  });

  useSocket('typing:update', (data) => {
    const { nickname, isTyping } = data as { nickname: string; isTyping: boolean };
    setTypingUsers(prev => {
      const next = new Set(prev);
      if (isTyping) {
        next.add(nickname);
        // Auto-clear after 3s in case stop event is lost
        const existing = typingTimeoutsRef.current.get(nickname);
        if (existing) clearTimeout(existing);
        typingTimeoutsRef.current.set(nickname, setTimeout(() => {
          setTypingUsers(p => {
            const n = new Set(p);
            n.delete(nickname);
            return n;
          });
          typingTimeoutsRef.current.delete(nickname);
        }, 3000));
      } else {
        next.delete(nickname);
        const existing = typingTimeoutsRef.current.get(nickname);
        if (existing) {
          clearTimeout(existing);
          typingTimeoutsRef.current.delete(nickname);
        }
      }
      return next;
    });
  });

  const sendMessage = useCallback((content: string, type: 'text' | 'image' = 'text') => {
    socket.emit('message:send', { room: currentRoom, content, type });
    // Stop typing when sending
    socket.emit('typing:stop', { room: currentRoom });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  }, [currentRoom]);

  const handleTyping = useCallback(() => {
    socket.emit('typing:start', { room: currentRoom });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', { room: currentRoom });
    }, 2000);
  }, [currentRoom]);

  const setInitialMessages = useCallback((msgs: Message[]) => {
    setMessages(msgs);
    setTypingUsers(new Set());
  }, []);

  return {
    messages,
    typingUsers: Array.from(typingUsers),
    sendMessage,
    handleTyping,
    setInitialMessages,
  };
}
