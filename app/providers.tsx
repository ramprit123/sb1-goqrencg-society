"use client";

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';
import { RealtimeProvider } from '@/lib/realtime';
import { WebRTCProvider } from '@/lib/webrtc';
import { PushNotificationProvider } from '@/lib/push-notifications';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <RealtimeProvider>
        <WebRTCProvider>
          <PushNotificationProvider>
            {children}
          </PushNotificationProvider>
        </WebRTCProvider>
      </RealtimeProvider>
    </AuthProvider>
  );
}