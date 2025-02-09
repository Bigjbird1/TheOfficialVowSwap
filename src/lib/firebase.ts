import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
export const initFirebase = () => {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApps()[0];
};

// Get Firebase Messaging
export const getFirebaseMessaging = () => {
  const app = initFirebase();
  try {
    return getMessaging(app);
  } catch (error) {
    console.error('Failed to get messaging:', error);
    return null;
  }
};

// Request notification permission
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const messaging = getFirebaseMessaging();
      if (messaging) {
        // Get FCM token
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });
        return token;
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to get notification permission:', error);
    return null;
  }
};

// Handle foreground messages
export const onMessageListener = () => {
  const messaging = getFirebaseMessaging();
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    console.log('Received foreground message:', payload);
    // You can handle the message here, e.g., show a toast notification
    if (payload.notification) {
      new Notification(payload.notification.title || 'New Message', {
        body: payload.notification.body,
        icon: '/icons/icon-192x192.png',
      });
    }
  });
};
