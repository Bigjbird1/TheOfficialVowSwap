import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

interface UseWebSocketOptions {
  onMessage?: (message: any) => void;
  onTypingUpdate?: (data: { userId: string; isTyping: boolean }) => void;
}

export function useWebSocket({ onMessage, onTypingUpdate }: UseWebSocketOptions = {}) {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;

    // Initialize socket connection
    socketRef.current = io({
      path: '/api/socket',
    });

    const socket = socketRef.current;

    // Join user's room for private messages
    socket.emit('join', userId);

    // Set up event listeners
    socket.on('message-received', (message) => {
      onMessage?.(message);
    });

    socket.on('typing-update', (data) => {
      onTypingUpdate?.(data);
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, onMessage, onTypingUpdate]);

  const sendMessage = useCallback((message: any) => {
    if (socketRef.current) {
      socketRef.current.emit('new-message', message);
    }
  }, []);

  const updateTypingStatus = useCallback((receiverId: string, isTyping: boolean) => {
    if (socketRef.current && userId) {
      socketRef.current.emit('typing', {
        senderId: userId,
        receiverId,
        isTyping,
      });
    }
  }, [userId]);

  return {
    sendMessage,
    updateTypingStatus,
  };
}
