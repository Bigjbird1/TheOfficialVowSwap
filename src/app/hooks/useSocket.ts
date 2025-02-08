import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { Message } from '../types/chat';

interface ServerToClientEvents {
  'message.new': (payload: { message: Message }) => void;
  'message.read': (payload: { messageIds: string[]; userId: string; conversationId: string }) => void;
  'user.typing': (payload: { conversationId: string; userId: string; isTyping: boolean }) => void;
  'error': (payload: { message: string }) => void;
}

interface ClientToServerEvents {
  'message.new': (data: { conversationId: string; content: string }) => void;
  'message.read': (data: { messageIds: string[] }) => void;
  'user.typing': (data: { conversationId: string; isTyping: boolean }) => void;
}

interface UseSocketReturn {
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  markMessagesAsRead: (messageIds: string[]) => Promise<void>;
  setTypingStatus: (conversationId: string, isTyping: boolean) => Promise<void>;
  isConnected: boolean;
  error: string | null;
}

export const useSocket = (
  onNewMessage?: (message: Message) => void,
  onMessageRead?: (messageIds: string[], userId: string) => void,
  onUserTyping?: (conversationId: string, userId: string, isTyping: boolean) => void
): UseSocketReturn => {
  const { data: session } = useSession();
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    try {
      // Initialize socket connection
      socketRef.current = io(process.env.NEXT_PUBLIC_APP_URL || '', {
        path: '/api/socket',
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      const socket = socketRef.current;

      socket.on('connect', () => {
        setIsConnected(true);
        setError(null);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      socket.on('connect_error', (err) => {
        setError(`Connection error: ${err.message}`);
        setIsConnected(false);
      });

      // Set up event listeners
      socket.on('message.new', ({ message }) => {
        onNewMessage?.(message);
      });

      socket.on('message.read', ({ messageIds, userId, conversationId }) => {
        onMessageRead?.(messageIds, userId);
      });

      socket.on('user.typing', ({ conversationId, userId, isTyping }) => {
        onUserTyping?.(conversationId, userId, isTyping);
      });

      socket.on('error', ({ message }) => {
        setError(message);
        console.error('Socket error:', message);
      });

      // Cleanup on unmount
      return () => {
        socket.disconnect();
        socketRef.current = null;
        setIsConnected(false);
        setError(null);
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize socket connection');
      setIsConnected(false);
    }
  }, [session, onNewMessage, onMessageRead, onUserTyping]);

  // Message sending handler
  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!socketRef.current?.connected) {
      throw new Error('Socket not connected');
    }
    return new Promise<void>((resolve, reject) => {
      socketRef.current?.emit('message.new', { conversationId, content });
      resolve();
    });
  }, []);

  // Mark messages as read handler
  const markMessagesAsRead = useCallback(async (messageIds: string[]) => {
    if (!socketRef.current?.connected) {
      throw new Error('Socket not connected');
    }
    return new Promise<void>((resolve, reject) => {
      socketRef.current?.emit('message.read', { messageIds });
      resolve();
    });
  }, []);

  // Typing status handler
  const setTypingStatus = useCallback(async (conversationId: string, isTyping: boolean) => {
    if (!socketRef.current?.connected) {
      throw new Error('Socket not connected');
    }
    return new Promise<void>((resolve, reject) => {
      socketRef.current?.emit('user.typing', { conversationId, isTyping });
      resolve();
    });
  }, []);

  return {
    sendMessage,
    markMessagesAsRead,
    setTypingStatus,
    isConnected,
    error,
  };
};
