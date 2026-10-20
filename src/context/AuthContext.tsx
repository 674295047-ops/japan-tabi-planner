import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import type {
  UserProfile, GoogleJwtPayload, RegisteredAccount,
  UserRole, UserStatus, SystemAnnouncement, ActivityLogEntry
} from '../types/auth';
import { getUserRoleByEmail } from '../config/roles';
import { firestore } from '../services/firebase';

interface AuthContextType {
  user: UserProfile | null;
  accounts: RegisteredAccount[];
  announcements: SystemAnnouncement[];
  activityLog: ActivityLogEntry[];
  loginWithGoogleCredential: (credential: string) => void;
  loginWithEmailPassword: (email: string, password: string) => { success: boolean; message?: string };
  registerUser: (name: string, email: string, password: string) => { success: boolean; message?: string };
  loginDemoUser: (role?: UserRole) => void;
  logout: () => void;
  // User management (Super Admin only)
  updateUserRole: (userId: string, newRole: UserRole) => void;
  updateUserStatus: (userId: string, status: UserStatus) => void;
  deleteUser: (userId: string) => void;
  // Announcements (Admin & Super Admin)
  addAnnouncement: (title: string, content: string, pinned: boolean) => void;
  deleteAnnouncement: (id: string) => void;
  togglePinAnnouncement: (id: string) => void;
  logSystemActivity: (action: string, targetType: ActivityLogEntry['targetType'], targetLabel: string) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function logActivity(
  log: ActivityLogEntry[],
  actor: UserProfile,
  action: string,
  targetType: ActivityLogEntry['targetType'],
  targetLabel: string
): ActivityLogEntry[] {
  const entry: ActivityLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    actorEmail: actor.email,
    actorName: actor.name,
    action,
    targetType,
    targetLabel,
    createdAt: new Date().toISOString(),
  };
  return [entry, ...log].slice(0, 100); // keep last 100 entries
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('japan_tabi_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.role = getUserRoleByEmail(parsed.email);
        return parsed;
      }
      return null;
    } catch { return null; }
  });

  const [accounts, setAccounts] = useState<RegisteredAccount[]>(() => {
    try {
      const saved = localStorage.getItem('japan_tabi_accounts');
      if (saved) {
        const parsed: RegisteredAccount[] = JSON.parse(saved);
        return parsed.map(acc => ({ ...acc, role: getUserRoleByEmail(acc.email), status: acc.status || 'active' }));
      }
      return [
        { id: 'sa-001', name: 'Muhammad Rokib (Super Admin)', email: 'muhammadrokibchemat@gmail.com', passwordHash: 'Admin@123456', role: 'super_admin', status: 'active', createdAt: new Date().toISOString() },
        { id: 'adm-002', name: 'Seree (Admin)', email: 'seree999@gmail.com', passwordHash: 'Admin@123456', role: 'admin', status: 'active', createdAt: new Date().toISOString() },
        { id: 'usr-001', name: 'Somchai Travel (สมชาย)', email: 'somchai@japan.com', passwordHash: 'password123', role: 'user', status: 'active', createdAt: new Date().toISOString() },
      ];
    } catch { return []; }
  });

  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>(() => {
    try {
      const saved = localStorage.getItem('japan_tabi_announcements');
      return saved ? JSON.parse(saved) : [
        {
          id: 'ann-001',
          title: '🇯🇵 ยินดีต้อนรับสู่ระบบ Japan Tabi Planner!',
          content: 'เปิดให้บริการระบบวางแผนท่องเที่ยวญี่ปุ่น Phase 1 แล้ว รองรับ 22 สถานที่ยอดนิยมทั่วทั้ง 9 ภูมิภาค พร้อมผู้ช่วย AI Chatbot วางแผนเที่ยว',
          authorEmail: 'muhammadrokibchemat@gmail.com',
          authorName: 'Muhammad Rokib',
          createdAt: new Date().toISOString(),
          pinned: true,
        }
      ];
    } catch { return []; }
  });

  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('japan_tabi_activity_log');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // ─── Real-time Firestore Sync (Announcements, Accounts, Activity Log) ────────
  useEffect(() => {
    if (!firestore) return;
    let isMounted = true;

    const syncCloudData = async () => {
      try {
        const [cloudAnnouncements, cloudAccounts, cloudLogs] = await Promise.all([
          firestore.getCollection<SystemAnnouncement>('announcements'),
          firestore.getCollection<RegisteredAccount>('accounts'),
          firestore.getCollection<ActivityLogEntry>('activity_log'),
        ]);

        if (!isMounted) return;

        if (cloudAnnouncements && cloudAnnouncements.length > 0) {
          // Sort by createdAt descending
          setAnnouncements(cloudAnnouncements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
        if (cloudAccounts && cloudAccounts.length > 0) {
          setAccounts(cloudAccounts.map(a => ({ ...a, role: getUserRoleByEmail(a.email) })));
        }
        if (cloudLogs && cloudLogs.length > 0) {
          setActivityLog(cloudLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      } catch (e) {
        console.warn('Sync Cloud Data error:', e);
      }
    };

    syncCloudData();
    const interval = setInterval(syncCloudData, 8000); // Auto-sync across all machines every 8 seconds

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Persist to localStorage
  useEffect(() => { try { if (user) localStorage.setItem('japan_tabi_user', JSON.stringify(user)); else localStorage.removeItem('japan_tabi_user'); } catch { } }, [user]);
  useEffect(() => { try { localStorage.setItem('japan_tabi_accounts', JSON.stringify(accounts)); } catch { } }, [accounts]);
  useEffect(() => { try { localStorage.setItem('japan_tabi_announcements', JSON.stringify(announcements)); } catch { } }, [announcements]);
  useEffect(() => { try { localStorage.setItem('japan_tabi_activity_log', JSON.stringify(activityLog)); } catch { } }, [activityLog]);

  const buildProfile = (id: string, email: string, name: string, picture: string): UserProfile => ({
    id, email, name, picture,
    role: getUserRoleByEmail(email),
    status: 'active',
  });

  // ─── Auth Methods ─────────────────────────────────────────────
  const loginWithGoogleCredential = (credential: string) => {
    try {
      const decoded = jwtDecode<GoogleJwtPayload>(credential);
      const profile = buildProfile(decoded.sub, decoded.email, decoded.name, decoded.picture);
      setUser(profile);
      setAccounts(prev => {
        const exists = prev.some(a => a.email.toLowerCase() === decoded.email.toLowerCase());
        if (!exists) return [...prev, { id: decoded.sub, email: decoded.email, name: decoded.name, passwordHash: '[GOOGLE]', role: profile.role, status: 'active', createdAt: new Date().toISOString() }];
        return prev;
      });
      setActivityLog(prev => logActivity(prev, profile, 'เข้าสู่ระบบ (Google OAuth)', 'system', 'Google Login'));
    } catch (e) { console.error(e); }
  };

  const loginWithEmailPassword = (email: string, password: string): { success: boolean; message?: string } => {
    const acc = accounts.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
    if (!acc) return { success: false, message: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบอีเมลหรือสมัครสมาชิก' };
    if (acc.status === 'suspended') return { success: false, message: 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' };
    if (acc.passwordHash !== password) return { success: false, message: 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' };
    const profile = buildProfile(acc.id, acc.email, acc.name, `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(acc.name)}&backgroundColor=e11d48`);
    setUser(profile);
    setActivityLog(prev => logActivity(prev, profile, 'เข้าสู่ระบบ (Email)', 'system', 'Email Login'));
    return { success: true };
  };

  const registerUser = (name: string, email: string, password: string): { success: boolean; message?: string } => {
    const trimEmail = email.trim().toLowerCase();
    const trimName = name.trim();
    if (!trimName) return { success: false, message: 'กรุณากรอกชื่อ-นามสกุล' };
    if (!trimEmail.includes('@')) return { success: false, message: 'รูปแบบอีเมลไม่ถูกต้อง' };
    if (password.length < 6) return { success: false, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' };
    if (accounts.some(a => a.email.toLowerCase() === trimEmail)) return { success: false, message: 'อีเมลนี้ถูกใช้งานแล้ว' };
    const assignedRole = getUserRoleByEmail(trimEmail);
    const newAcc: RegisteredAccount = { id: `user-${Date.now()}`, name: trimName, email: trimEmail, passwordHash: password, role: assignedRole, status: 'active', createdAt: new Date().toISOString() };
    setAccounts(prev => [...prev, newAcc]);
    if (firestore) firestore.setDocument('accounts', newAcc.id, newAcc);
    const profile = buildProfile(newAcc.id, newAcc.email, newAcc.name, `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(trimName)}&backgroundColor=e11d48`);
    setUser(profile);
    setActivityLog(prev => logActivity(prev, profile, 'สมัครสมาชิกใหม่', 'user', trimEmail));
    return { success: true };
  };

  const loginDemoUser = (role: UserRole = 'super_admin') => {
    const demoProfiles: Record<UserRole, UserProfile> = {
      super_admin: { id: 'sa-001', email: 'muhammadrokibchemat@gmail.com', name: 'Muhammad Rokib (Super Admin)', picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', role: 'super_admin', status: 'active' },
      admin: { id: 'adm-002', email: 'seree999@gmail.com', name: 'Seree (Admin)', picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', role: 'admin', status: 'active' },
      user: { id: 'usr-001', email: 'somchai@japan.com', name: 'Somchai (Traveler)', picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80', role: 'user', status: 'active' },
    };
    setUser(demoProfiles[role]);
  };

  const logout = () => setUser(null);

  // ─── Super Admin: User Management ─────────────────────────────
  const updateUserRole = (userId: string, newRole: UserRole) => {
    setAccounts(prev => prev.map(a => {
      if (a.id === userId) {
        const updated = { ...a, role: newRole };
        if (firestore) firestore.setDocument('accounts', userId, updated);
        return updated;
      }
      return a;
    }));
    if (user?.id === userId) setUser(prev => prev ? { ...prev, role: newRole } : null);
    const target = accounts.find(a => a.id === userId);
    if (user && target) setActivityLog(prev => logActivity(prev, user, `เปลี่ยนสิทธิ์เป็น ${newRole}`, 'user', target.email));
  };

  const updateUserStatus = (userId: string, status: UserStatus) => {
    setAccounts(prev => prev.map(a => {
      if (a.id === userId) {
        const updated = { ...a, status };
        if (firestore) firestore.setDocument('accounts', userId, updated);
        return updated;
      }
      return a;
    }));
    const target = accounts.find(a => a.id === userId);
    if (user && target) setActivityLog(prev => logActivity(prev, user, status === 'suspended' ? 'ระงับบัญชี' : 'ปลดระงับบัญชี', 'user', target.email));
  };

  const deleteUser = (userId: string) => {
    const target = accounts.find(a => a.id === userId);
    setAccounts(prev => prev.filter(a => a.id !== userId));
    if (firestore) firestore.deleteDocument('accounts', userId);
    if (user && target) setActivityLog(prev => logActivity(prev, user, 'ลบบัญชีผู้ใช้', 'user', target.email));
  };

  // ─── Admin & Super Admin: Announcements ───────────────────────
  const addAnnouncement = (title: string, content: string, pinned: boolean) => {
    if (!user) return;
    const ann: SystemAnnouncement = {
      id: `ann-${Date.now()}`,
      title,
      content,
      authorEmail: user.email,
      authorName: user.name,
      createdAt: new Date().toISOString(),
      pinned,
    };
    setAnnouncements(prev => [ann, ...prev]);
    if (firestore) firestore.setDocument('announcements', ann.id, ann);
    setActivityLog(prev => logActivity(prev, user, 'สร้างประกาศ', 'announcement', title));
  };

  const deleteAnnouncement = (id: string) => {
    const target = announcements.find(a => a.id === id);
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    if (firestore) firestore.deleteDocument('announcements', id);
    if (user && target) setActivityLog(prev => logActivity(prev, user, 'ลบประกาศ', 'announcement', target.title));
  };

  const togglePinAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.map(a => {
      if (a.id === id) {
        const updated = { ...a, pinned: !a.pinned };
        if (firestore) firestore.setDocument('announcements', id, updated);
        return updated;
      }
      return a;
    }));
  };

  const logSystemActivity = (action: string, targetType: ActivityLogEntry['targetType'], targetLabel: string) => {
    if (!user) return;
    const entry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      actorEmail: user.email,
      actorName: user.name,
      action,
      targetType,
      targetLabel,
      createdAt: new Date().toISOString(),
    };
    setActivityLog(prev => [entry, ...prev].slice(0, 100));
    if (firestore) firestore.setDocument('activity_log', entry.id, entry);
  };

  return (
    <AuthContext.Provider value={{
      user, accounts, announcements, activityLog,
      loginWithGoogleCredential, loginWithEmailPassword, registerUser, loginDemoUser, logout,
      updateUserRole, updateUserStatus, deleteUser,
      addAnnouncement, deleteAnnouncement, togglePinAnnouncement,
      logSystemActivity,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
