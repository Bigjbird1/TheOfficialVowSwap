import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Conversation } from '@/app/types/chat';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  selectedConversationId,
}) => {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('/api/conversations');
        const data = await response.json();
        if (response.ok) {
          setConversations(data.conversations);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter((conversation) => {
    const otherParticipant =
      conversation.initiatorId === session?.user?.id
        ? conversation.receiver
        : conversation.initiator;

    return (
      otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.messages[0]?.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.initiatorId === session?.user?.id
      ? conversation.receiver
      : conversation.initiator;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search conversations..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No conversations found
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation);
            const lastMessage = conversation.messages[0];

            return (
              <div
                key={conversation.id}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversationId === conversation.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="flex items-center space-x-4">
                  <div className="relative w-12 h-12">
                    <Image
                      src={otherParticipant?.image || '/default-avatar.png'}
                      alt={otherParticipant?.name || 'User'}
                      className="rounded-full"
                      fill
                      sizes="48px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {otherParticipant?.name}
                      </h3>
                      {lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(lastMessage.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                    </div>
                    {lastMessage && (
                      <p className="mt-1 text-sm text-gray-500 truncate">
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
