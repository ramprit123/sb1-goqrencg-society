"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useRealtime } from '@/lib/realtime';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, ArrowLeft, Bell, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export default function SecurityNotificationsPage() {
  const { user } = useAuth();
  const { notifications, markNotificationAsRead } = useRealtime();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/security/login');
    } else if (user.role !== 'security') {
      router.push('/');
    }
  }, [user, router]);

  // Mark all notifications as read when the page loads
  useEffect(() => {
    notifications.forEach(notification => {
      if (!notification.read) {
        markNotificationAsRead(notification.id);
      }
    });
  }, [notifications, markNotificationAsRead]);

  if (!user) {
    return null;
  }

  // Sort notifications by date (newest first)
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/security/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold">Notifications</h1>
          </div>
          
          <div className="flex items-center">
            <Shield className="h-5 w-5" />
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="space-y-4">
          {sortedNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
              <p className="mt-4 text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            sortedNotifications.map(notification => (
              <Card key={notification.id} className={notification.read ? 'opacity-75' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {notification.type === 'entry_approved' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {notification.type === 'entry_denied' && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      {notification.type === 'message' && (
                        <MessageSquare className="h-5 w-5 text-blue-500" />
                      )}
                      {notification.type === 'visitor_arrival' && (
                        <Bell className="h-5 w-5 text-amber-500" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p>{notification.message}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    
                    {!notification.read && (
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}