import { useEffect, useRef } from 'react';
import { socket } from '@/socket';

export function useSocket(event: string, handler: (...args: unknown[]) => void) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    const listener = (...args: unknown[]) => handlerRef.current(...args);
    socket.on(event, listener);
    return () => {
      socket.off(event, listener);
    };
  }, [event]);
}
