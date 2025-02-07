import React, { useState } from 'react';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { Conversation } from '@/app/types/chat';

export const Chat: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Left sidebar - Conversation list */}
      <div className={`w-96 p-4 border-r ${selectedConversation ? 'hidden md:block' : ''}`}>
        <ConversationList
          onSelectConversation={setSelectedConversation}
          selectedConversationId={selectedConversation?.id}
        />
      </div>

      {/* Right side - Chat window or placeholder */}
      <div className="flex-1 p-4">
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            onClose={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-700">
                Select a conversation
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Create a page component that uses the Chat component
export const ChatPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="py-6">
          <div className="px-4 sm:px-6 md:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
          </div>
          <div className="mt-6">
            <Chat />
          </div>
        </div>
      </div>
    </div>
  );
};
