export type UserRole = 'super_admin' | 'admin' | 'user';
export type UserStatus = 'active' | 'suspended';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
  role: UserRole;
  status?: UserStatus;
}

export interface RegisteredAccount {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface GoogleJwtPayload {
  sub: string;
  email: string;
  name: string;
  picture: string;
  email_verified?: boolean;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  content: string;
  authorEmail: string;
  authorName: string;
  createdAt: string;
  pinned: boolean;
}

export interface ActivityLogEntry {
  id: string;
  actorEmail: string;
  actorName: string;
  action: string;
  targetType: 'user' | 'destination' | 'announcement' | 'system';
  targetLabel: string;
  createdAt: string;
}
