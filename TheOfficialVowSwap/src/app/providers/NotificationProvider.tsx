'use client';

import { createContext, useContext, ReactNode } from 'react';
import { usePushNotifications } from '@/app/hooks/usePushNotifications';

interface NotificationContextType {
  token: string | null;
  notification: NotificationPayload | null;
  permissionStatus: NotificationPermission;
  requestPermission: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const {
    token,
    notification,
    permissionStatus,
    requestPermission,
  } = usePushNotifications();

  return (
    <NotificationContext.Provider
      value={{
        token,
        notification,
        permissionStatus,
        requestPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
