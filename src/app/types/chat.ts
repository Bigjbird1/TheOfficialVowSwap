export interface UserBase {
  id: string;
  name: string | null;
  image: string | null;
}
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isRead: boolean;
  attachmentUrl?: string;
  sender?: UserBase;
  receiver?: UserBase;
}

export interface Conversation {
  id: string;
  initiatorId: string;
  receiverId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
  status: ConversationStatus;
  initiator?: UserBase;
  receiver?: UserBase;
}

export enum ConversationStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  BLOCKED = 'BLOCKED',
}

export interface ChatParticipant {
  id: string;
  name: string | null;
  image: string | null;
}

// WebSocket message types
export type WebSocketEventType = 
  | 'message.new'
  | 'message.read'
  | 'user.typing'
  | 'conversation.created'
  | 'conversation.updated';

export interface WebSocketEvent {
  type: WebSocketEventType;
  payload: WebSocketPayload;
}

export type WebSocketPayload = 
  | NewMessagePayload
  | MessageReadPayload
  | UserTypingPayload
  | ConversationPayload;

export interface NewMessagePayload {
  message: Message;
}

export interface MessageReadPayload {
  conversationId: string;
  userId: string;
  messageIds: string[];
}

export interface UserTypingPayload {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface ConversationPayload {
  conversation: Conversation;
}

// API Request/Response types
export interface CreateConversationRequest {
  receiverId: string;
  initialMessage: string;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  attachmentUrl?: string;
}

export interface GetConversationsResponse {
  conversations: Conversation[];
  unreadCount: number;
}

export interface GetMessagesRequest {
  conversationId: string;
  cursor?: string;
  limit?: number;
}

export interface GetMessagesResponse {
  messages: Message[];
  nextCursor?: string;
  hasMore: boolean;
}
