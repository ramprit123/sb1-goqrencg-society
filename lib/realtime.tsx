"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { Visitor, Notification } from '@/lib/types';
import { toast } from 'sonner';

interface RealtimeContextType {
  visitors: Visitor[];
  notifications: Notification[];
  addVisitor: (visitor: Visitor) => void;
  updateVisitorStatus: (visitorId: string, status: 'approved' | 'denied') => void;
  sendNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

// Mock data for demo purposes
const MOCK_VISITORS: Visitor[] = [
  {
    id: '1',
    name: 'John Doe',
    purpose: 'Delivery',
    apartmentNumber: '101',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces&q=80',
    notificationType: 'standard',
    notes: 'Has a package for you',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    visitorId: '1',
    residentId: '2',
    type: 'visitor_arrival',
    message: 'John Doe has arrived with a delivery',
    read: false,
    createdAt: new Date(),
  },
];

export const RealtimeProvider = ({ children }: { children: React.ReactNode }) => {
  const [visitors, setVisitors] = useState<Visitor[]>(MOCK_VISITORS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  // Simulate WebSocket connection
  useEffect(() => {
    console.log('Establishing realtime connection...');
    
    // Simulate receiving a new visitor after 5 seconds
    const timer = setTimeout(() => {
      const newVisitor: Visitor = {
        id: '2',
        name: 'Jane Smith',
        purpose: 'Guest Visit',
        apartmentNumber: '101',
        photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces&q=80',
        notificationType: 'standard',
        notes: 'Friend visiting',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setVisitors(prev => [...prev, newVisitor]);
      
      const newNotification: Notification = {
        id: '2',
        visitorId: '2',
        residentId: '2',
        type: 'visitor_arrival',
        message: 'Jane Smith has arrived for a visit',
        read: false,
        createdAt: new Date(),
      };
      
      setNotifications(prev => [...prev, newNotification]);
      
      toast.info('New visitor has arrived', {
        description: 'Jane Smith is waiting at reception',
      });
    }, 5000);
    
    return () => {
      clearTimeout(timer);
      console.log('Closing realtime connection...');
    };
  }, []);

  const addVisitor = (visitor: Visitor) => {
    setVisitors(prev => [...prev, visitor]);
    
    // Create a notification for the resident
    const notification: Notification = {
      id: Date.now().toString(),
      visitorId: visitor.id,
      residentId: '2', // Mock resident ID
      type: 'visitor_arrival',
      message: `${visitor.name} has arrived for ${visitor.purpose}`,
      read: false,
      createdAt: new Date(),
    };
    
    setNotifications(prev => [...prev, notification]);
  };

  const updateVisitorStatus = (visitorId: string, status: 'approved' | 'denied') => {
    setVisitors(prev => 
      prev.map(visitor => 
        visitor.id === visitorId 
          ? { ...visitor, status, updatedAt: new Date() } 
          : visitor
      )
    );
    
    // Create a notification for the security guard
    const notification: Notification = {
      id: Date.now().toString(),
      visitorId: visitorId,
      residentId: '2', // Mock resident ID
      type: status === 'approved' ? 'entry_approved' : 'entry_denied',
      message: status === 'approved' 
        ? 'Resident has approved entry' 
        : 'Resident has denied entry',
      read: false,
      createdAt: new Date(),
    };
    
    setNotifications(prev => [...prev, notification]);
  };

  const sendNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date(),
    };
    
    setNotifications(prev => [...prev, newNotification]);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  return (
    <RealtimeContext.Provider 
      value={{ 
        visitors, 
        notifications, 
        addVisitor, 
        updateVisitorStatus, 
        sendNotification,
        markNotificationAsRead,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};