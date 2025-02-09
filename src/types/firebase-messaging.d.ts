import { MessagePayload } from 'firebase/messaging';

declare global {
  interface NotificationPayload extends MessagePayload {
    notification?: {
      title?: string;
      body?: string;
      image?: string;
    };
    data?: {
      [key: string]: string;
    };
  }
}

export {};
