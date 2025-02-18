'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useWebSocket } from '@/app/hooks/useWebSocket';
import { usePushNotifications } from '@/app/hooks/usePushNotifications';
import { Upload, MoreVertical, AlertTriangle, X } from 'lucide-react';

type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
  senderName: string;
  productId?: string;
  productName?: string;
  isReported?: boolean;
  isBlocked?: boolean;
  attachments?: {
    id: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
  }[];
};

type Conversation = {
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageDate: Date;
  unreadCount: number;
  productId?: string;
  productName?: string;
};

export default function MessagingSystem() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const router = useRouter();

  const { sendMessage, updateTypingStatus } = useWebSocket({
    onMessage: (message) => {
      if (message.receiverId === session?.user?.id) {
        setMessages(prev => [...prev, message]);
        showNotification({
          title: `New message from ${message.senderName}`,
          body: message.content,
          data: {
            type: 'messages',
            url: `/messages/${message.senderId}`,
          },
        });
      }
    },
    onTypingUpdate: ({ userId, isTyping }) => {
      setTypingUsers(prev => ({ ...prev, [userId]: isTyping }));
    },
  });

  const { showNotification } = usePushNotifications();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/seller/conversations');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      setConversations(data.conversations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const response = await fetch(`/api/seller/messages?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data.messages);
      // Mark messages as read
      markMessagesAsRead(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    }
  };

  const markMessagesAsRead = async (userId: string) => {
    try {
      await fetch(`/api/seller/messages/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      // Update conversation list to reflect read status
      setConversations(prevConversations =>
        prevConversations.map(conv =>
          conv.userId === userId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || (!newMessage.trim() && selectedFiles.length === 0)) return;

    try {
      const formData = new FormData();
      formData.append('receiverId', selectedConversation);
      formData.append('content', newMessage);
      selectedFiles.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await fetch('/api/seller/messages', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      setMessages(prev => [...prev, data.message]);
      setNewMessage('');
      setSelectedFiles([]);
      sendMessage(data.message);

      // Update conversation list
      setConversations(prev =>
        prev.map(conv =>
          conv.userId === selectedConversation
            ? {
                ...conv,
                lastMessage: newMessage || 'Sent attachments',
                lastMessageDate: new Date(),
              }
            : conv
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleReportMessage = async (message: Message) => {
    try {
      await fetch(`/api/seller/messages/${message.id}/report`, {
        method: 'POST',
      });
      setMessages(prev =>
        prev.map(m =>
          m.id === message.id ? { ...m, isReported: true } : m
        )
      );
      setShowReportModal(false);
    } catch (error) {
      console.error('Error reporting message:', error);
    }
  };

  const handleBlockUser = async (userId: string) => {
    try {
      await fetch(`/api/seller/users/${userId}/block`, {
        method: 'POST',
      });
      router.refresh();
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  let typingTimeout: NodeJS.Timeout;
  const handleTyping = () => {
    if (selectedConversation) {
      updateTypingStatus(selectedConversation, true);
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        updateTypingStatus(selectedConversation, false);
      }, 1000);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg shadow-gray-200/50 border border-gray-100">
      <div className="grid grid-cols-3 h-[600px]">
        {/* Conversations List */}
        <div className="border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          </div>
          <div className="overflow-y-auto h-[calc(600px-64px)]">
            {conversations.map(conversation => (
              <button
                key={conversation.userId}
                onClick={() => setSelectedConversation(conversation.userId)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedConversation === conversation.userId
                    ? 'bg-gray-50'
                    : ''
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-gray-900">
                    {conversation.userName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(conversation.lastMessageDate).toLocaleDateString()}
                  </span>
                </div>
                {conversation.productName && (
                  <div className="text-sm text-gray-500 mb-1">
                    Re: {conversation.productName}
                  </div>
                )}
                <div className="text-sm text-gray-600 truncate">
                  {conversation.lastMessage}
                </div>
                {conversation.unreadCount > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 mt-1">
                    {conversation.unreadCount} new
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

          {/* Messages */}
          <div className="col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {conversations.find(c => c.userId === selectedConversation)?.userName}
                      </h3>
                      {conversations.find(c => c.userId === selectedConversation)?.productName && (
                        <p className="text-sm text-gray-500">
                          Re: {conversations.find(c => c.userId === selectedConversation)?.productName}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleBlockUser(selectedConversation)}
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === selectedConversation
                          ? 'justify-start'
                          : 'justify-end'
                      }`}
                    >
                      <div
                        className={`rounded-lg px-4 py-2 max-w-[70%] relative group ${
                          message.senderId === selectedConversation
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {message.senderId === selectedConversation && !message.isReported && (
                          <button
                            onClick={() => {
                              setSelectedMessage(message);
                              setShowReportModal(true);
                            }}
                            className="absolute -left-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <AlertTriangle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                          </button>
                        )}
                        <p>{message.content}</p>
                        {message.attachments?.map(attachment => (
                          <div key={attachment.id} className="mt-2">
                            <a
                              href={attachment.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm underline"
                            >
                              {attachment.fileName}
                            </a>
                          </div>
                        ))}
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {typingUsers[selectedConversation] && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-4 py-2">
                        <span className="text-gray-500">Typing...</span>
                      </div>
                    </div>
                  )}
                </div>
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={handleTyping}
                      placeholder="Type your message..."
                      className="flex-1 rounded-lg border-gray-200 focus:border-rose-500 focus:ring focus:ring-rose-500/20"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      multiple
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                    >
                      Send
                    </button>
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                          <span>{file.name}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
