import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Bell } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <h1 className="text-xl font-bold">SecureGate</h1>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Society Security System</h2>
            <p className="text-muted-foreground mt-2">
              Real-time visitor management and resident notifications
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Security Guard Portal</CardTitle>
              <CardDescription>
                Manage visitors and send notifications to residents
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Shield className="h-16 w-16 text-primary" />
            </CardContent>
            <CardFooter>
              <Link href="/security/login" className="w-full">
                <Button className="w-full">Access Guard Dashboard</Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Resident Portal</CardTitle>
              <CardDescription>
                Receive notifications and manage visitor access
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Users className="h-16 w-16 text-primary" />
            </CardContent>
            <CardFooter>
              <Link href="/resident/login" className="w-full">
                <Button className="w-full">Access Resident Portal</Button>
              </Link>
            </CardFooter>
          </Card>
          
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              © 2025 SecureGate. All rights reserved.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}