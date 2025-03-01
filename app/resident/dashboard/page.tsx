"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useRealtime } from '@/lib/realtime';
import { usePushNotifications } from '@/lib/push-notifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, LogOut, Bell, Clock, Settings } from 'lucide-react';
import { Visitor } from '@/lib/types';
import { format } from 'date-fns';

export default function ResidentDashboardPage() {
  const { user, logout } = useAuth();
  const { visitors, notifications, updateVisitorStatus } = useRealtime();
  const { permission, supported, requestPermission } = usePushNotifications();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('pending');

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/resident/login');
    } else if (user.role !== 'resident') {
      router.push('/');
    }
  }, [user, router]);

  // Request notification permission
  useEffect(() => {
    if (supported && permission === 'default') {
      requestPermission();
    }
  }, [supported, permission, requestPermission]);

  if (!user) {
    return null;
  }

  // Filter visitors for this resident's apartment
  const myVisitors = visitors.filter(visitor => visitor.apartmentNumber === user.apartmentNumber);
  const pendingVisitors = myVisitors.filter(visitor => visitor.status === 'pending');
  const historyVisitors = myVisitors.filter(visitor => visitor.status !== 'pending');
  
  const unreadNotifications = notifications.filter(
    notification => notification.residentId === user.id && !notification.read
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/resident/dashboard" className="flex items-center space-x-2">
            <Users className="h-6 w-6" />
            <h1 className="text-xl font-bold">Resident Portal</h1>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link href="/resident/notifications">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications.length}
                  </span>
                )}
              </Button>
            </Link>
            
            <Link href="/resident/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Welcome, {user.name}</h2>
          <p className="text-muted-foreground">Apartment {user.apartmentNumber}</p>
        </div>
        
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
            <TabsTrigger value="pending" className="relative">
              Pending Visitors
              {pendingVisitors.length > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                  {pendingVisitors.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="space-y-4">
            {pendingVisitors.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No pending visitors at the moment.
                </CardContent>
              </Card>
            ) : (
              pendingVisitors.map(visitor => (
                <VisitorActionCard 
                  key={visitor.id} 
                  visitor={visitor} 
                  onApprove={() => updateVisitorStatus(visitor.id, 'approved')}
                  onDeny={() => updateVisitorStatus(visitor.id, 'denied')}
                  onVideoCall={() => router.push(`/resident/call/${visitor.id}?type=video`)}
                  onAudioCall={() => router.push(`/resident/call/${visitor.id}?type=audio`)}
                />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            {historyVisitors.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No visitor history.
                </CardContent>
              </Card>
            ) : (
              historyVisitors.map(visitor => (
                <VisitorHistoryCard key={visitor.id} visitor={visitor} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function VisitorActionCard({ 
  visitor, 
  onApprove, 
  onDeny, 
  onVideoCall, 
  onAudioCall 
}: { 
  visitor: Visitor; 
  onApprove: () => void; 
  onDeny: () => void; 
  onVideoCall: () => void; 
  onAudioCall: () => void; 
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border">
            <AvatarImage src={visitor.photoUrl} alt={visitor.name} />
            <AvatarFallback>{visitor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{visitor.name}</h3>
                <p className="text-muted-foreground">Apt: {visitor.apartmentNumber}</p>
              </div>
              
              <Badge variant={
                visitor.notificationType === 'urgent' ? 'destructive' : 'outline'
              }>
                {visitor.notificationType === 'urgent' ? 'Urgent' : 'Standard'}
              </Badge>
            </div>
            
            <div className="mt-2">
              <p><span className="font-medium">Purpose:</span> {visitor.purpose}</p>
              {visitor.notes && <p><span className="font-medium">Notes:</span> {visitor.notes}</p>}
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {format(new Date(visitor.createdAt), 'MMM d, h:mm a')}
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button onClick={onApprove} className="w-full" variant="default">
                Approve Entry
              </Button>
              <Button onClick={onDeny} className="w-full" variant="outline">
                Deny Entry
              </Button>
            </div>
            
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button onClick={onVideoCall} className="w-full" variant="secondary">
                Video Call
              </Button>
              <Button onClick={onAudioCall} className="w-full" variant="secondary">
                Audio Call
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function VisitorHistoryCard({ visitor }: { visitor: Visitor }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border">
            <AvatarImage src={visitor.photoUrl} alt={visitor.name} />
            <AvatarFallback>{visitor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{visitor.name}</h3>
                <p className="text-sm">{visitor.purpose}</p>
              </div>
              
              <Badge variant={
                visitor.status === 'approved' ? 'default' : 'destructive'
              }>
                {visitor.status === 'approved' ? 'Approved' : 'Denied'}
              </Badge>
            </div>
            
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {format(new Date(visitor.createdAt), 'MMM d, h:mm a')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}