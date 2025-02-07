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

export const ChatWindow = ({ conversation, onClose }: ChatWindowProps): React.ReactElement => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>(conversation.messages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
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
    (messageIds, userId) => {
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

    // Focus input on mount
    inputRef.current?.focus();
  }, [messages, session?.user?.id, markMessagesAsRead]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMessage) return;

    setSendingMessage(true);
    try {
      await sendMessage(conversation.id, newMessage.trim());
      setNewMessage('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
      // Could add toast notification here
    } finally {
      setSendingMessage(false);
    }
};

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);

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
    <div 
      className="flex flex-col h-full bg-white rounded-lg shadow-lg transition-all duration-200 ease-in-out"
      role="region"
      aria-label="Chat window"
    >
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="relative w-10 h-10">
            <Image
              src={otherParticipant?.image || '/default-avatar.png'}
              alt={`${otherParticipant?.name || 'User'}'s profile picture`}
              className="rounded-full ring-2 ring-gray-200"
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
              <p className="text-sm text-gray-500 animate-pulse" role="status">
                Typing...
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors duration-200"
          aria-label="Close chat"
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
      <div 
        className="flex-1 p-4 overflow-y-auto"
        role="log"
        aria-label="Chat messages"
      >
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isOwnMessage = message.senderId === session?.user?.id;
            const showAvatar = index === 0 || 
              messages[index - 1].senderId !== message.senderId;

            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} items-end space-x-2 group`}
                role="article"
                aria-label={`Message from ${isOwnMessage ? 'you' : otherParticipant?.name}`}
              >
                {!isOwnMessage && showAvatar && (
                  <div className="relative w-6 h-6 flex-shrink-0">
                    <Image
                      src={otherParticipant?.image || '/default-avatar.png'}
                      alt=""
                      className="rounded-full"
                      fill
                      sizes="24px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div
                  className={`max-w-[70%] transition-all duration-200 ${
                    isOwnMessage
                      ? 'bg-blue-500 text-white rounded-l-lg rounded-br-lg hover:bg-blue-600'
                      : 'bg-gray-100 text-gray-900 rounded-r-lg rounded-bl-lg hover:bg-gray-200'
                  } p-3 shadow-sm`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                  <div className="flex items-center justify-end mt-1 space-x-2">
                    <span className="text-xs opacity-75">
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    {isOwnMessage && (
                      <span className="transition-opacity duration-200" aria-hidden="true">
                        {message.isRead ? (
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
                        ) : (
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
                      </span>
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
      <form 
        onSubmit={handleSendMessage} 
        className="p-4 border-t bg-gray-50"
        role="form"
        aria-label="Message input form"
      >
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white transition-shadow duration-200"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  const form = e.currentTarget.form;
                  if (form) {
                    const submitEvent = new Event('submit', { cancelable: true });
                    form.dispatchEvent(submitEvent);
                  }
                }
              }}
              aria-label="Message input"
            />
            {isTyping && (
              <div className="absolute right-3 bottom-3 text-xs text-gray-500">
                Press Enter to send
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || sendingMessage}
            className={`px-6 py-3 font-medium text-white bg-blue-500 rounded-lg 
              transition-all duration-200 ease-in-out transform
              ${!newMessage.trim() || sendingMessage 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-blue-600 hover:shadow-md active:scale-95'
              }`}
            aria-label={sendingMessage ? 'Sending message...' : 'Send message'}
          >
            {sendingMessage ? (
              <svg 
                className="w-5 h-5 animate-spin" 
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
