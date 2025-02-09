'use client';

import { useEffect, useState } from 'react';
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase';

export const usePushNotifications = () => {
  const [token, setToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationPayload | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if the browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    // Get current permission status
    setPermissionStatus(Notification.permission);

    // Request permission and get token if granted
    const setupNotifications = async () => {
      try {
        const fcmToken = await requestNotificationPermission();
        if (fcmToken) {
          setToken(fcmToken);
          // Here you would typically send this token to your backend
          // await sendTokenToServer(fcmToken);
        }
      } catch (error) {
        console.error('Failed to get notification token:', error);
      }
    };

    if (permissionStatus === 'granted') {
      setupNotifications();
    }
  }, [permissionStatus]);

  useEffect(() => {
    // Set up foreground message handler
    const unsubscribe = onMessageListener();

    return () => {
      unsubscribe();
    };
  }, []);

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        const fcmToken = await requestNotificationPermission();
        if (fcmToken) {
          setToken(fcmToken);
          // Here you would typically send this token to your backend
          // await sendTokenToServer(fcmToken);
        }
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  };

  return {
    token,
    notification,
    permissionStatus,
    requestPermission,
  };
};
