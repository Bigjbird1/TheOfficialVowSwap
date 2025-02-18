import { useEffect, useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';

type NotificationPreferences = {
  messages: boolean;
  orderUpdates: boolean;
  promotions: boolean;
};

export function usePushNotifications() {
  const { data: session } = useSession();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    messages: true,
    orderUpdates: true,
    promotions: true,
  });

  useEffect(() => {
    // Check if the browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    // Get current permission status
    setPermission(Notification.permission);

    // Load saved preferences from localStorage
    const savedPrefs = localStorage.getItem('notificationPreferences');
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied' as NotificationPermission;
    }
  }, []);

  const updatePreferences = useCallback((newPreferences: Partial<NotificationPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPreferences };
      localStorage.setItem('notificationPreferences', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const showNotification = useCallback(
    async ({ title, body, icon, data }: { title: string; body: string; icon?: string; data?: any }) => {
      // Check if notifications are enabled for this type
      const type = data?.type || 'messages';
      if (!preferences[type as keyof NotificationPreferences]) {
        return;
      }

      // Request permission if not granted
      if (permission === 'default') {
        const newPermission = await requestPermission();
        if (newPermission !== 'granted') return;
      }

      if (permission !== 'granted') return;

      try {
        const notification = new Notification(title, {
          body,
          icon: icon || '/notification-icon.png',
          data,
        });

        notification.onclick = function(event) {
          event.preventDefault();
          if (data?.url) {
            window.open(data.url, '_blank');
          }
          notification.close();
        };
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    },
    [permission, preferences, requestPermission]
  );

  const registerServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('ServiceWorker registration successful');
        return registration;
      } catch (error) {
        console.error('ServiceWorker registration failed:', error);
        return null;
      }
    }
    return null;
  }, []);

  useEffect(() => {
    registerServiceWorker();
  }, [registerServiceWorker]);

  return {
    permission,
    preferences,
    requestPermission,
    updatePreferences,
    showNotification,
  };
}
