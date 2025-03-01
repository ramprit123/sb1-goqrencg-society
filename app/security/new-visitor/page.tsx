"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useRealtime } from '@/lib/realtime';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Camera, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Visitor } from '@/lib/types';

export default function NewVisitorPage() {
  const { user } = useAuth();
  const { addVisitor } = useRealtime();
  const router = useRouter();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notificationType, setNotificationType] = useState<'standard' | 'urgent'>('standard');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/security/login');
    } else if (user.role !== 'security') {
      router.push('/');
    }
  }, [user, router]);

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        variant: 'destructive',
        title: 'Camera Error',
        description: 'Could not access the camera. Please check permissions.',
      });
      setIsCapturing(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhotoUrl(dataUrl);
        
        // Stop camera stream
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        setIsCapturing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Create a new visitor
    const newVisitor: Visitor = {
      id: Date.now().toString(),
      name,
      apartmentNumber,
      purpose,
      notificationType,
      notes,
      photoUrl: photoUrl || undefined,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Add visitor to the system
    addVisitor(newVisitor);
    
    toast({
      title: 'Visitor Added',
      description: 'The resident has been notified.',
    });
    
    // Redirect back to dashboard
    setTimeout(() => {
      router.push('/security/dashboard');
    }, 1500);
  };

  if (!user) {
    return null;
  }

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
            <h1 className="text-xl font-bold">New Visitor</h1>
          </div>
          
          <div className="flex items-center">
            <Shield className="h-5 w-5" />
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Register New Visitor</CardTitle>
            <CardDescription>
              Fill in the visitor details and notify the resident
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Visitor Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apartment">Apartment Number</Label>
                <Input
                  id="apartment"
                  value={apartmentNumber}
                  onChange={(e) => setApartmentNumber(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose of Visit</Label>
                <Input
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Notification Type</Label>
                <RadioGroup 
                  value={notificationType} 
                  onValueChange={(value) => setNotificationType(value as 'standard' | 'urgent')}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard">Standard</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="urgent" id="urgent" />
                    <Label htmlFor="urgent">Urgent</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions or additional information"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Visitor Photo</Label>
                
                {!isCapturing && !photoUrl && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full h-32 flex flex-col items-center justify-center"
                    onClick={startCamera}
                  >
                    <Camera className="h-8 w-8 mb-2" />
                    <span>Capture Photo</span>
                  </Button>
                )}
                
                {isCapturing && (
                  <div className="space-y-2">
                    <div className="relative rounded-md overflow-hidden bg-muted">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full h-auto"
                      />
                    </div>
                    <Button 
                      type="button" 
                      onClick={capturePhoto}
                      className="w-full"
                    >
                      Take Photo
                    </Button>
                  </div>
                )}
                
                {photoUrl && (
                  <div className="space-y-2">
                    <div className="relative rounded-md overflow-hidden bg-muted">
                      <img 
                        src={photoUrl} 
                        alt="Captured visitor" 
                        className="w-full h-auto"
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setPhotoUrl(null);
                        startCamera();
                      }}
                      className="w-full"
                    >
                      Retake Photo
                    </Button>
                  </div>
                )}
                
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !name || !apartmentNumber || !purpose}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Notifying Resident...
                  </>
                ) : (
                  'Notify Resident'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}