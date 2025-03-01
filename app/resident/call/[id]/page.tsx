"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useRealtime } from '@/lib/realtime';
import { useWebRTC } from '@/lib/webrtc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, ArrowLeft, PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX } from 'lucide-react';
import { Visitor } from '@/lib/types';

export default function CallPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const { visitors } = useRealtime();
  const { 
    localStream, 
    remoteStream, 
    callStatus, 
    error, 
    startCall, 
    endCall 
  } = useWebRTC();
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callType = searchParams.get('type') as 'audio' | 'video' || 'video';
  
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/resident/login');
    } else if (user.role !== 'resident') {
      router.push('/');
    }
  }, [user, router]);

  // Find visitor by ID
  useEffect(() => {
    const foundVisitor = visitors.find(v => v.id === params.id);
    if (foundVisitor) {
      setVisitor(foundVisitor);
    } else {
      router.push('/resident/dashboard');
    }
  }, [visitors, params.id, router]);

  // Start call when component mounts
  useEffect(() => {
    if (user && visitor) {
      startCall(callType);
    }
    
    return () => {
      endCall();
    };
  }, [user, visitor, callType, startCall, endCall]);

  // Set local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Set remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  // Toggle speaker
  const toggleSpeaker = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = speakerEnabled;
      setSpeakerEnabled(!speakerEnabled);
    }
  };

  // Handle end call
  const handleEndCall = () => {
    endCall();
    router.push('/resident/dashboard');
  };

  if (!user || !visitor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/resident/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold">
              {callType === 'video' ? 'Video Call' : 'Audio Call'}
            </h1>
          </div>
          
          <div className="flex items-center">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center">
          {error && (
            <Card className="p-6 text-center">
              <p className="text-destructive">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => router.push('/resident/dashboard')}
              >
                Return to Dashboard
              </Button>
            </Card>
          )}
          
          {!error && (
            <>
              {callStatus === 'calling' && (
                <div className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={visitor.photoUrl} alt={visitor.name} />
                    <AvatarFallback>{visitor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold mb-2">{visitor.name}</h2>
                  <p className="text-muted-foreground mb-6">Connecting...</p>
                </div>
              )}
              
              {callStatus === 'connected' && callType === 'video' && (
                <div className="w-full max-w-2xl relative">
                  <div className="rounded-lg overflow-hidden bg-muted aspect-video">
                    <video 
                      ref={remoteVideoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="absolute bottom-4 right-4 w-1/4 rounded-lg overflow-hidden bg-muted border-2 border-background">
                    <video 
                      ref={localVideoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              
              {callStatus === 'connected' && callType === 'audio' && (
                <div className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={visitor.photoUrl} alt={visitor.name} />
                    <AvatarFallback>{visitor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold mb-2">{visitor.name}</h2>
                  <p className="text-muted-foreground mb-6">Call in progress</p>
                  
                  <audio ref={remoteVideoRef} autoPlay />
                </div>
              )}
              
              {callStatus === 'ended' && (
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">Call Ended</h2>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => router.push('/resident/dashboard')}
                  >
                    Return to Dashboard
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
        
        {(callStatus === 'calling' || callStatus === 'connected') && (
          <div className="mt-6 flex justify-center space-x-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-12 w-12 rounded-full"
              onClick={toggleAudio}
            >
              {audioEnabled ? (
                <Mic className="h-5 w-5" />
              ) : (
                <MicOff className="h-5 w-5 text-destructive" />
              )}
            </Button>
            
            {callType === 'video' && (
              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12 rounded-full"
                onClick={toggleVideo}
              >
                {videoEnabled ? (
                  <Video className="h-5 w-5" />
                ) : (
                  <VideoOff className="h-5 w-5 text-destructive" />
                )}
              </Button>
            )}
            
            <Button 
              variant="destructive" 
              size="icon" 
              className="h-12 w-12 rounded-full"
              onClick={handleEndCall}
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="h-12 w-12 rounded-full"
              onClick={toggleSpeaker}
            >
              {speakerEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5 text-destructive" />
              )}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}