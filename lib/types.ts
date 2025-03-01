export interface User {
  id: string;
  name: string;
  email: string;
  role: 'security' | 'resident';
  apartmentNumber?: string;
  profileImage?: string;
  createdAt: Date;
}

export interface Visitor {
  id: string;
  name: string;
  purpose: string;
  apartmentNumber: string;
  photoUrl?: string;
  notificationType: 'standard' | 'urgent';
  notes?: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  visitorId: string;
  residentId: string;
  type: 'visitor_arrival' | 'entry_approved' | 'entry_denied' | 'message';
  message?: string;
  read: boolean;
  createdAt: Date;
}

export interface Call {
  id: string;
  visitorId: string;
  residentId: string;
  securityId: string;
  type: 'audio' | 'video';
  status: 'requested' | 'ongoing' | 'completed' | 'missed';
  startTime?: Date;
  endTime?: Date;
}

export interface NotificationPreference {
  residentId: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}