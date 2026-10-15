import type { UserRole } from '../types/auth';

// รายชื่ออีเมลที่ได้รับสิทธิ์ตามที่ระบุ
export const SUPER_ADMIN_EMAILS: string[] = [
  'muhammadrokibchemat@gmail.com',
];

export const ADMIN_EMAILS: string[] = [
  'seree999@gmail.com',
];

/**
 * คำนวณ Role สิทธิ์การใช้งานจากที่อยู่อีเมล
 */
export function getUserRoleByEmail(email: string): UserRole {
  const normalized = email.trim().toLowerCase();

  if (SUPER_ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalized)) {
    return 'super_admin';
  }

  if (ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalized)) {
    return 'admin';
  }

  return 'user';
}

/**
 * ตรวจสอบสิทธิ์ว่ามีสิทธิ์ระดับ Admin ขึ้นไปหรือไม่
 */
export function hasAdminAccess(role?: UserRole): boolean {
  return role === 'admin' || role === 'super_admin';
}

/**
 * ตรวจสอบว่าเป็น Super Admin หรือไม่
 */
export function isSuperAdmin(role?: UserRole): boolean {
  return role === 'super_admin';
}
