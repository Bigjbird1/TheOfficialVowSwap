import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { Message, WebSocketEvent } from '../types/chat';

interface UseSocketReturn {
  sendMessage: (conversationId: string, content: string) => void;
  markMessagesAsRead: (messageIds: string[]) => void;
  setTypingStatus: (conversationId: string, isTyping: boolean) => void;
}

export const useSocket = (
  onNewMessage?: (message: Message) => void,
  onMessageRead?: (messageIds: string[], userId: string) => void,
  onUserTyping?: (conversationId: string, userId: string, isTyping: boolean) => void
): UseSocketReturn => {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    // Initialize socket connection
    socketRef.current = io(process.env.NEXT_PUBLIC_APP_URL || '', {
      path: '/api/socket',
      withCredentials: true,
    });

    const socket = socketRef.current;

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
      console.error('Socket error:', message);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [session, onNewMessage, onMessageRead, onUserTyping]);

  // Message sending handler
  const sendMessage = useCallback((conversationId: string, content: string) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('message.new', { conversationId, content });
  }, []);

  // Mark messages as read handler
  const markMessagesAsRead = useCallback((messageIds: string[]) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('message.read', { messageIds });
  }, []);

  // Typing status handler
  const setTypingStatus = useCallback((conversationId: string, isTyping: boolean) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('user.typing', { conversationId, isTyping });
  }, []);

  return {
    sendMessage,
    markMessagesAsRead,
    setTypingStatus,
  };
};
