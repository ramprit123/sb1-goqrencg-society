"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useRealtime } from '@/lib/realtime';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, LogOut, UserPlus, Bell, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Visitor } from '@/lib/types';
import { format } from 'date-fns';

export default function SecurityDashboardPage() {
  const { user, logout } = useAuth();
  const { visitors, notifications } = useRealtime();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('visitors');

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/security/login');
    } else if (user.role !== 'security') {
      router.push('/');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const pendingVisitors = visitors.filter(visitor => visitor.status === 'pending');
  const approvedVisitors = visitors.filter(visitor => visitor.status === 'approved');
  const deniedVisitors = visitors.filter(visitor => visitor.status === 'denied');
  
  const unreadNotifications = notifications.filter(notification => !notification.read);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/security/dashboard" className="flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <h1 className="text-xl font-bold">Security Dashboard</h1>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link href="/security/notifications">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications.length}
                  </span>
                )}
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Welcome, {user.name}</h2>
          <Link href="/security/new-visitor">
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              New Visitor
            </Button>
          </Link>
        </div>
        
        <Tabs defaultValue="visitors" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="visitors" className="relative">
              Visitors
              {pendingVisitors.length > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                  {pendingVisitors.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="denied">Denied</TabsTrigger>
          </TabsList>
          
          <TabsContent value="visitors" className="space-y-4">
            {pendingVisitors.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No pending visitors at the moment.
                </CardContent>
              </Card>
            ) : (
              pendingVisitors.map(visitor => (
                <VisitorCard key={visitor.id} visitor={visitor} status="pending" />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="approved" className="space-y-4">
            {approvedVisitors.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No approved visitors.
                </CardContent>
              </Card>
            ) : (
              approvedVisitors.map(visitor => (
                <VisitorCard key={visitor.id} visitor={visitor} status="approved" />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="denied" className="space-y-4">
            {deniedVisitors.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No denied visitors.
                </CardContent>
              </Card>
            ) : (
              deniedVisitors.map(visitor => (
                <VisitorCard key={visitor.id} visitor={visitor} status="denied" />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function VisitorCard({ visitor, status }: { visitor: Visitor; status: 'pending' | 'approved' | 'denied' }) {
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
          </div>
        </div>
        
        {status === 'pending' && (
          <div className="mt-4 flex justify-end space-x-2">
            <Badge variant="outline" className="px-3 py-1">Waiting for resident</Badge>
          </div>
        )}
        
        {status === 'approved' && (
          <div className="mt-4 flex items-center text-green-600">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span>Approved by resident</span>
          </div>
        )}
        
        {status === 'denied' && (
          <div className="mt-4 flex items-center text-red-600">
            <XCircle className="h-4 w-4 mr-2" />
            <span>Denied by resident</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}