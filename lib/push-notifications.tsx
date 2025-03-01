'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface PushNotificationContextType {
  permission: NotificationPermission;
  supported: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
}

const PushNotificationContext = createContext<
  PushNotificationContextType | undefined
>(undefined);

export const PushNotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [permission, setPermission] =
    useState<NotificationPermission>('default');
  const [supported, setSupported] = useState<boolean>(false);

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window) {
      setSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!supported) {
      throw new Error('Notifications not supported');
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied' as NotificationPermission;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!supported || permission !== 'granted') {
      console.warn('Notifications not supported or permission not granted');
      return;
    }

    try {
      const notification = new Notification(title, options);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  return (
    <PushNotificationContext.Provider
      value={{
        permission,
        supported,
        requestPermission,
        sendNotification,
      }}
    >
      {children}
    </PushNotificationContext.Provider>
  );
};

export const usePushNotifications = () => {
  const context = useContext(PushNotificationContext);
  if (context === undefined) {
    throw new Error(
      'usePushNotifications must be used within a PushNotificationProvider'
    );
  }
  return context;
};
