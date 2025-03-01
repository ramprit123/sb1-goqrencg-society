'use client';

import { createContext, useContext, useState, useRef, useEffect } from 'react';

interface WebRTCContextType {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callStatus: 'idle' | 'calling' | 'connected' | 'ended';
  error: string | null;
  startCall: (type: 'audio' | 'video') => Promise<void>;
  answerCall: () => Promise<void>;
  endCall: () => void;
}

const WebRTCContext = createContext<WebRTCContextType | undefined>(undefined);

export const WebRTCProvider = ({ children }: { children: React.ReactNode }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callStatus, setCallStatus] = useState<
    'idle' | 'calling' | 'connected' | 'ended'
  >('idle');
  const [error, setError] = useState<string | null>(null);

  const peerConnection = useRef<RTCPeerConnection | null>(null);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
    };
  }, [localStream]);

  const initializePeerConnection = () => {
    // Create a new RTCPeerConnection
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    // Set up remote stream
    const remoteMediaStream = new MediaStream();
    setRemoteStream(remoteMediaStream);

    // Add tracks from local stream to peer connection
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, localStream);
      });
    }

    // Set up event handlers
    peerConnection.current.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteMediaStream.addTrack(track);
      });
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        // In a real app, you would send this candidate to the other peer
        console.log('New ICE candidate:', event.candidate);
      }
    };

    peerConnection.current.oniceconnectionstatechange = () => {
      console.log(
        'ICE connection state:',
        peerConnection.current?.iceConnectionState
      );

      if (peerConnection.current?.iceConnectionState === 'connected') {
        setCallStatus('connected');
      } else if (
        peerConnection.current?.iceConnectionState === 'disconnected'
      ) {
        setCallStatus('ended');
      }
    };
  };

  const startCall = async (type: 'audio' | 'video') => {
    try {
      setError(null);
      setCallStatus('calling');

      // Get user media
      const constraints = {
        audio: true,
        video: type === 'video',
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      // Initialize peer connection
      initializePeerConnection();

      // Create and send offer
      if (peerConnection.current) {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        // In a real app, you would send this offer to the other peer
        console.log('Created offer:', offer);

        // Simulate receiving an answer after a delay
        setTimeout(async () => {
          if (peerConnection.current) {
            // This is a mock answer - in a real app, this would come from the other peer
            const mockAnswer = {
              type: 'answer',
              sdp: offer.sdp,
            };

            await peerConnection.current.setRemoteDescription(
              new RTCSessionDescription(mockAnswer)
            );
            setCallStatus('connected');
          }
        }, 2000);
      }
    } catch (err) {
      console.error('Error starting call:', err);
      setError(err instanceof Error ? err.message : 'Failed to start call');
      setCallStatus('idle');

      // Clean up
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }
    }
  };

  const answerCall = async () => {
    try {
      setError(null);

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      setLocalStream(stream);

      // Initialize peer connection
      initializePeerConnection();

      // In a real app, you would receive an offer from the other peer
      // and create an answer

      // Simulate receiving an offer and creating an answer
      if (peerConnection.current) {
        // This is a mock offer - in a real app, this would come from the other peer
        const mockOffer = {
          type: 'offer',
          sdp: 'mock sdp data',
        };

        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(mockOffer)
        );
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);

        // In a real app, you would send this answer to the other peer
        console.log('Created answer:', answer);

        setCallStatus('connected');
      }
    } catch (err) {
      console.error('Error answering call:', err);
      setError(err instanceof Error ? err.message : 'Failed to answer call');

      // Clean up
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }
    }
  };

  const endCall = () => {
    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    // Close peer connection
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    setRemoteStream(null);
    setCallStatus('ended');
  };

  return (
    <WebRTCContext.Provider
      value={{
        localStream,
        remoteStream,
        callStatus,
        error,
        startCall,
        answerCall,
        endCall,
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
};

export const useWebRTC = () => {
  const context = useContext(WebRTCContext);
  if (context === undefined) {
    throw new Error('useWebRTC must be used within a WebRTCProvider');
  }
  return context;
};
