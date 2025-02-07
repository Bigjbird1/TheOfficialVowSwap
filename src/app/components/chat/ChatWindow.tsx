import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Message, Conversation } from '@/app/types/chat';
import { useSocket } from '@/app/hooks/useSocket';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface ChatWindowProps {
  conversation: Conversation;
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onClose }) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>(conversation.messages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    sendMessage,
    markMessagesAsRead,
    setTypingStatus
  } = useSocket(
    // New message handler
    (message) => {
      if (message.conversationId === conversation.id) {
        setMessages((prev) => [...prev, message]);
        if (message.senderId !== session?.user?.id) {
          markMessagesAsRead([message.id]);
        }
      }
    },
    // Message read handler
    (messageIds) => {
      setMessages((prev) =>
        prev.map((msg) =>
          messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
        )
      );
    },
    // Typing status handler
    (conversationId, userId, typing) => {
      if (conversationId === conversation.id && userId !== session?.user?.id) {
        setIsTyping(typing);
      }
    }
  );

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Mark unread messages as read when opening the chat
    const unreadMessages = messages
      .filter((msg) => !msg.isRead && msg.senderId !== session?.user?.id)
      .map((msg) => msg.id);

    if (unreadMessages.length > 0) {
      markMessagesAsRead(unreadMessages);
    }
  }, [messages, session?.user?.id, markMessagesAsRead]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendMessage(conversation.id, newMessage.trim());
    setNewMessage('');
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);

    // Handle typing status
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setTypingStatus(conversation.id, true);
    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus(conversation.id, false);
    }, 2000);
  };

  const otherParticipant = conversation.initiatorId === session?.user?.id
    ? conversation.receiver
    : conversation.initiator;

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="relative w-10 h-10">
            <Image
              src={otherParticipant?.image || '/default-avatar.png'}
              alt={otherParticipant?.name || 'User'}
              className="rounded-full"
              fill
              sizes="40px"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {otherParticipant?.name}
            </h3>
            {isTyping && (
              <p className="text-sm text-gray-500">Typing...</p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwnMessage = message.senderId === session?.user?.id;

            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] ${
                    isOwnMessage
                      ? 'bg-blue-500 text-white rounded-l-lg rounded-br-lg'
                      : 'bg-gray-100 text-gray-900 rounded-r-lg rounded-bl-lg'
                  } p-3 shadow-sm`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-end mt-1 space-x-2">
                    <span className="text-xs opacity-75">
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    {isOwnMessage && message.isRead && (
                      <svg
                        className="w-4 h-4 text-blue-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-4">
          <textarea
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};
