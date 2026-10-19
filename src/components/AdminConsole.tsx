import React, { useState } from 'react';
import {
  Crown, ShieldCheck, Users, MapPin, Megaphone, Activity,
  Search, Trash2, PinOff, Pin, ChevronDown, ChevronUp,
  BarChart3, UserCheck, UserX, PlusCircle, X,
  AlertTriangle, CheckCircle2, Clock, RotateCcw, Edit3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDestinations } from '../context/DestinationContext';
import { isSuperAdmin } from '../config/roles';
import { REGIONS, CATEGORIES } from '../data/japanData';
import type { UserRole, UserStatus } from '../types/auth';
import type { Category, Destination, Region, Season } from '../types';
import { ConfirmModal } from './ConfirmModal';

type AdminTab = 'dashboard' | 'users' | 'destinations' | 'announcements' | 'activitylog';

export const AdminConsole: React.FC = () => {
  const {
    user, accounts, announcements, activityLog,
    updateUserRole, updateUserStatus, deleteUser,
    addAnnouncement, deleteAnnouncement, togglePinAnnouncement,
  } = useAuth();

  const {
    destinations,
    addDestination,
    updateDestination,
    deleteDestination,
    resetDestinations,
  } = useDestinations();

  const isSuper = isSuperAdmin(user?.role);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // User Management State
  const [userSearch, setUserSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Announcement State
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPinned, setAnnPinned] = useState(false);
  const [confirmDeleteAnnId, setConfirmDeleteAnnId] = useState<string | null>(null);

  // Destination CRUD State
  const [destSearch, setDestSearch] = useState('');
  const [showAddDest, setShowAddDest] = useState(false);
  const [editingDestinationId, setEditingDestinationId] = useState<string | null>(null);
  const [confirmDeleteDestId, setConfirmDeleteDestId] = useState<string | null>(null);

  // Destination Form Fields
  const [destNameTh, setDestNameTh] = useState('');
  const [destNameEn, setDestNameEn] = useState('');
  const [destNameJa, setDestNameJa] = useState('');
  const [destRegion, setDestRegion] = useState<Region>('Kanto');
  const [destPrefecture, setDestPrefecture] = useState('');
  const [destCategory, setDestCategory] = useState<Category>('temple');
  const [destImageUrl, setDestImageUrl] = useState('');
  const [destFee, setDestFee] = useState<number>(0);
  const [destStation, setDestStation] = useState('');
  const [destOpenTime, setDestOpenTime] = useState('09:00');
  const [destCloseTime, setDestCloseTime] = useState('17:00');
  const [destClosedNote, setDestClosedNote] = useState('เปิดทุกวัน');
  const [destDescription, setDestDescription] = useState('');
  const [destTips, setDestTips] = useState('');
  const [destSeasons, setDestSeasons] = useState<Season[]>(['spring', 'autumn']);

  // Reset Form
  const resetDestForm = () => {
    setEditingDestinationId(null);
    setDestNameTh('');
    setDestNameEn('');
    setDestNameJa('');
    setDestRegion('Kanto');
    setDestPrefecture('');
    setDestCategory('temple');
    setDestImageUrl('');
    setDestFee(0);
    setDestStation('');
    setDestOpenTime('09:00');
    setDestCloseTime('17:00');
    setDestClosedNote('เปิดทุกวัน');
    setDestDescription('');
    setDestTips('');
    setDestSeasons(['spring', 'autumn']);
    setShowAddDest(false);
  };

  // Open Edit Form
  const handleStartEditDestination = (dest: Destination) => {
    setEditingDestinationId(dest.id);
    setDestNameTh(dest.nameTh);
    setDestNameEn(dest.nameEn);
    setDestNameJa(dest.nameJa);
    setDestRegion(dest.region);
    setDestPrefecture(dest.prefecture);
    setDestCategory(dest.category);
    setDestImageUrl(dest.imageUrl);
    setDestFee(dest.admissionFeeYen);
    setDestStation(dest.nearestStation);
    setDestOpenTime(dest.operatingHours.openTime || '09:00');
    setDestCloseTime(dest.operatingHours.closeTime || '17:00');
    setDestClosedNote(dest.operatingHours.closedNote || 'เปิดทุกวัน');
    setDestDescription(dest.descriptionTh);
    setDestTips(dest.tipsTh || '');
    setDestSeasons(dest.recommendedSeasons || ['spring', 'autumn']);
    setShowAddDest(true);
    // Scroll to form smoothly
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  // Save (Add or Update) Destination
  const handleSaveDestination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destNameTh.trim() || !destPrefecture.trim()) return;

    if (editingDestinationId) {
      // Update existing destination
      updateDestination(editingDestinationId, {
        nameTh: destNameTh.trim(),
        nameEn: destNameEn.trim() || destNameTh.trim(),
        nameJa: destNameJa.trim() || destNameTh.trim(),
        region: destRegion,
        prefecture: destPrefecture.trim(),
        category: destCategory,
        descriptionTh: destDescription.trim() || 'สถานที่ท่องเที่ยวอันงดงามในประเทศญี่ปุ่น',
        imageUrl: destImageUrl.trim() || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
        admissionFeeYen: Number(destFee) || 0,
        nearestStation: destStation.trim() || 'สถานีหลักประจำเมือง',
        recommendedSeasons: destSeasons.length > 0 ? destSeasons : ['spring', 'autumn', 'summer', 'winter'],
        operatingHours: {
          openTime: destOpenTime || '09:00',
          closeTime: destCloseTime || '17:00',
          closedDays: [],
          closedNote: destClosedNote || 'เปิดทุกวัน',
        },
        tipsTh: destTips.trim() || 'แนะนำให้วางแผนการเดินทางล่วงหน้าและใช้ขนส่งสาธารณะ',
      });
      resetDestForm();
    } else {
      // Add new destination
      const newDest: Destination = {
        id: `dest-${Date.now()}`,
        nameTh: destNameTh.trim(),
        nameEn: destNameEn.trim() || destNameTh.trim(),
        nameJa: destNameJa.trim() || destNameTh.trim(),
        region: destRegion,
        prefecture: destPrefecture.trim(),
        category: destCategory,
        descriptionTh: destDescription.trim() || 'สถานที่ท่องเที่ยวอันงดงามในประเทศญี่ปุ่น',
        imageUrl: destImageUrl.trim() || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
        rating: 5.0,
        reviewsCount: 1,
        admissionFeeYen: Number(destFee) || 0,
        nearestStation: destStation.trim() || 'สถานีหลักประจำเมือง',
        recommendedSeasons: destSeasons.length > 0 ? destSeasons : ['spring', 'autumn', 'summer', 'winter'],
        operatingHours: {
          openTime: destOpenTime || '09:00',
          closeTime: destCloseTime || '17:00',
          closedDays: [],
          closedNote: destClosedNote || 'เปิดทุกวัน',
        },
        coordinates: { lat: 35.6762, lng: 139.6503 },
        tipsTh: destTips.trim() || 'แนะนำให้วางแผนการเดินทางล่วงหน้าและใช้ขนส่งสาธารณะ',
      };

      addDestination(newDest);
      resetDestForm();
    }
  };

  const toggleSeasonSelect = (s: Season) => {
    setDestSeasons(prev =>
      prev.includes(s) ? prev.filter(item => item !== s) : [...prev, s]
    );
  };

  // ─── Dashboard Metrics ─────────────────────────────────────
  const totalUsers = accounts.length;
  const totalAdmins = accounts.filter(a => a.role === 'admin' || a.role === 'super_admin').length;
  const suspendedUsers = accounts.filter(a => a.status === 'suspended').length;
  const totalDest = destinations.length;
  const pinnedAnn = announcements.filter(a => a.pinned).length;
  const todayLogs = activityLog.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length;

  const filteredAccounts = accounts.filter(a =>
    a.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    a.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredDest = destinations.filter(d =>
    d.nameTh.toLowerCase().includes(destSearch.toLowerCase()) ||
    d.nameEn.toLowerCase().includes(destSearch.toLowerCase()) ||
    d.prefecture.toLowerCase().includes(destSearch.toLowerCase())
  );

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    addAnnouncement(annTitle.trim(), annContent.trim(), annPinned);
    setAnnTitle(''); setAnnContent(''); setAnnPinned(false); setShowAnnForm(false);
  };

  const roleBadge = (role: UserRole, status: UserStatus) => {
    if (status === 'suspended') return (
      <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full text-[11px]">
        <UserX className="w-3 h-3" /> ระงับแล้ว
      </span>
    );
    if (role === 'super_admin') return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full text-[11px]"><Crown className="w-3 h-3 text-amber-600" /> Super Admin</span>;
    if (role === 'admin') return <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-900 font-bold px-2 py-0.5 rounded-full text-[11px]"><ShieldCheck className="w-3 h-3 text-indigo-600" /> Admin</span>;
    return <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full text-[11px]">Traveler</span>;
  };

  const TABS: { id: AdminTab; label: string; icon: React.ReactNode; superOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'users', label: 'จัดการผู้ใช้', icon: <Users className="w-4 h-4" /> },
    { id: 'destinations', label: 'สถานที่ท่องเที่ยว', icon: <MapPin className="w-4 h-4" /> },
    { id: 'announcements', label: 'ประกาศระบบ', icon: <Megaphone className="w-4 h-4" /> },
    { id: 'activitylog', label: 'Activity Log', icon: <Activity className="w-4 h-4" />, superOnly: true },
  ];

  return (
    <div className="space-y-5 text-left">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {isSuper
                ? <span className="bg-amber-400 text-slate-900 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5"><Crown className="w-3.5 h-3.5" />Super Admin Portal</span>
                : <span className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" />Admin Dashboard</span>
              }
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">ศูนย์บริหารจัดการระบบ</h2>
            <p className="text-sm text-slate-300 mt-1 max-w-lg">จัดการผู้ใช้งาน สถานที่ท่องเที่ยว ประกาศระบบ และตรวจสอบกิจกรรมทั้งหมด</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-1">
            <div className="grid grid-cols-3 gap-0 text-center divide-x divide-white/10">
              <div className="px-4 py-2"><div className="text-[11px] text-slate-400">ผู้ใช้</div><div className="text-xl font-black">{totalUsers}</div></div>
              <div className="px-4 py-2"><div className="text-[11px] text-slate-400">สถานที่</div><div className="text-xl font-black text-rose-400">{totalDest}</div></div>
              <div className="px-4 py-2"><div className="text-[11px] text-slate-400">วันนี้</div><div className="text-xl font-black text-emerald-400">{todayLogs}</div></div>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="relative z-10 flex items-center gap-1.5 mt-6 flex-wrap">
          {TABS.filter(t => !t.superOnly || isSuper).map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === t.id
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════ TAB: DASHBOARD ═══════════ */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'ผู้ใช้งานทั้งหมด', value: totalUsers, icon: <Users className="w-5 h-5 text-indigo-600" />, color: 'bg-indigo-50 border-indigo-200', textColor: 'text-indigo-900' },
            { label: 'Admin + Super Admin', value: totalAdmins, icon: <ShieldCheck className="w-5 h-5 text-amber-600" />, color: 'bg-amber-50 border-amber-200', textColor: 'text-amber-900' },
            { label: 'ถูกระงับบัญชี', value: suspendedUsers, icon: <UserX className="w-5 h-5 text-red-600" />, color: 'bg-red-50 border-red-200', textColor: 'text-red-900' },
            { label: 'สถานที่ท่องเที่ยว', value: totalDest, icon: <MapPin className="w-5 h-5 text-rose-600" />, color: 'bg-rose-50 border-rose-200', textColor: 'text-rose-900' },
            { label: 'ประกาศที่ปักหมุด', value: pinnedAnn, icon: <Pin className="w-5 h-5 text-purple-600" />, color: 'bg-purple-50 border-purple-200', textColor: 'text-purple-900' },
            { label: 'กิจกรรมทั้งหมด', value: activityLog.length, icon: <Activity className="w-5 h-5 text-emerald-600" />, color: 'bg-emerald-50 border-emerald-200', textColor: 'text-emerald-900' },
          ].map(card => (
            <div key={card.label} className={`rounded-2xl p-5 border ${card.color} flex items-center justify-between`}>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">{card.label}</p>
                <p className={`text-3xl font-extrabold ${card.textColor}`}>{card.value}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/70 flex items-center justify-center shadow-sm">
                {card.icon}
              </div>
            </div>
          ))}

          {/* Permission Table */}
          <div className="sm:col-span-2 lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-500" /> ตารางสิทธิ์การใช้งานระบบ (Permission Matrix)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 font-bold uppercase text-[11px] border-b border-slate-100">
                    <th className="py-2 pr-4">ฟีเจอร์</th>
                    <th className="py-2 px-3 text-center">Traveler</th>
                    <th className="py-2 px-3 text-center">Admin 🛡️</th>
                    <th className="py-2 px-3 text-center">Super Admin 👑</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    ['ค้นหาและดูสถานที่ท่องเที่ยว', '✅', '✅', '✅'],
                    ['จัดแผนการเดินทาง (Itinerary)', '✅', '✅', '✅'],
                    ['บันทึกรายการโปรด (Wishlist)', '✅', '✅', '✅'],
                    ['เข้าถึง Admin Console', '❌', '✅', '✅'],
                    ['ดูรายชื่อผู้ใช้ทั้งหมด', '❌', '✅ (อ่านอย่างเดียว)', '✅'],
                    ['ปรับเปลี่ยนสิทธิ์ผู้ใช้', '❌', '❌', '✅'],
                    ['ระงับ/ปลดระงับบัญชี', '❌', '❌', '✅'],
                    ['ลบบัญชีผู้ใช้', '❌', '❌', '✅'],
                    ['เพิ่ม/แก้ไขสถานที่', '❌', '✅', '✅'],
                    ['ลบสถานที่ท่องเที่ยว', '❌', '❌', '✅'],
                    ['สร้าง/ลบประกาศระบบ', '❌', '✅', '✅'],
                    ['ดู Activity Log', '❌', '❌', '✅'],
                  ].map(([feat, traveler, admin, superAdmin]) => (
                    <tr key={feat} className="hover:bg-slate-50/70">
                      <td className="py-2 pr-4 font-medium text-slate-700">{feat}</td>
                      <td className="py-2 px-3 text-center">{traveler}</td>
                      <td className="py-2 px-3 text-center">{admin}</td>
                      <td className="py-2 px-3 text-center">{superAdmin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ TAB: USER MANAGEMENT ═══════════ */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900">จัดการบัญชีผู้ใช้งาน</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isSuper ? 'สามารถเปลี่ยนสิทธิ์ ระงับ หรือลบบัญชีได้' : 'ดูรายชื่อผู้ใช้งานในระบบ (อ่านอย่างเดียว)'}
              </p>
            </div>
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="ค้นหาชื่อหรืออีเมล..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[11px] font-bold">
                  <th className="py-3 px-3">ผู้ใช้งาน</th>
                  <th className="py-3 px-3">อีเมล</th>
                  <th className="py-3 px-3">สถานะ / สิทธิ์</th>
                  <th className="py-3 px-3">สมัครเมื่อ</th>
                  {isSuper && <th className="py-3 px-3 text-right">การจัดการ</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAccounts.map(acc => (
                  <tr key={acc.id} className={`hover:bg-slate-50/70 transition-colors ${acc.status === 'suspended' ? 'opacity-60' : ''}`}>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-400 to-indigo-500 flex items-center justify-center text-white font-bold text-[11px] shrink-0">
                          {acc.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-900">{acc.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">{acc.email}</td>
                    <td className="py-3 px-3">{roleBadge(acc.role, acc.status)}</td>
                    <td className="py-3 px-3 text-slate-400">{new Date(acc.createdAt).toLocaleDateString('th-TH')}</td>
                    {isSuper && (
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {acc.email === 'muhammadrokibchemat@gmail.com' ? (
                            <span className="text-[11px] text-slate-400 italic">เจ้าของระบบ</span>
                          ) : (
                            <>
                              {/* Role Selector */}
                              <select
                                value={acc.role}
                                onChange={e => updateUserRole(acc.id, e.target.value as UserRole)}
                                className="px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                              </select>

                              {/* Suspend / Restore */}
                              {acc.status === 'suspended' ? (
                                <button
                                  onClick={() => updateUserStatus(acc.id, 'active')}
                                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 transition-colors cursor-pointer"
                                  title="ปลดระงับบัญชี"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => updateUserStatus(acc.id, 'suspended')}
                                  className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 transition-colors cursor-pointer"
                                  title="ระงับบัญชี"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Delete User */}
                              {confirmDeleteId === acc.id ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] text-red-600 font-semibold">ยืนยัน?</span>
                                  <button onClick={() => { deleteUser(acc.id); setConfirmDeleteId(null); }}
                                    className="px-2 py-1 rounded-md bg-red-500 text-white text-[10px] font-bold cursor-pointer">ใช่</button>
                                  <button onClick={() => setConfirmDeleteId(null)}
                                    className="px-2 py-1 rounded-md bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer">ไม่</button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteId(acc.id)}
                                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                                  title="ลบบัญชี"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════ TAB: DESTINATIONS (CRUD) ═══════════ */}
      {activeTab === 'destinations' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900">ฐานข้อมูลสถานที่ท่องเที่ยว ({destinations.length} แห่ง)</h3>
              <p className="text-xs text-slate-500 mt-0.5">ผู้ดูแลระบบสามารถเพิ่มสถานที่ท่องเที่ยวใหม่ได้ทันที</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={destSearch}
                  onChange={e => setDestSearch(e.target.value)}
                  placeholder="ค้นหาสถานที่..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              {/* Add Destination Button (Admin & Super Admin) */}
              <button
                onClick={() => {
                  if (showAddDest) {
                    resetDestForm();
                  } else {
                    setShowAddDest(true);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {showAddDest ? <X className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
                <span>{showAddDest ? 'ปิดฟอร์ม' : 'เพิ่มสถานที่ใหม่'}</span>
              </button>

              {/* Reset to Default Data Button (Super Admin Only) */}
              {isSuper && (
                <button
                  onClick={() => {
                    if (window.confirm('คุณต้องการรีเซ็ตฐานข้อมูลสถานที่ท่องเที่ยวกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
                      resetDestinations();
                    }
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
                  title="รีเซ็ตเป็นค่าเริ่มต้น"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden md:inline">รีเซ็ต</span>
                </button>
              )}
            </div>
          </div>

          {/* Add / Edit Destination Form */}
          {showAddDest && (
            <form onSubmit={handleSaveDestination} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  {editingDestinationId ? (
                    <>
                      <Edit3 className="w-4 h-4 text-indigo-600" />
                      <span>แก้ไขข้อมูลสถานที่ท่องเที่ยว</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4 text-rose-500" />
                      <span>เพิ่มสถานที่ท่องเที่ยวใหม่</span>
                    </>
                  )}
                </h4>
                <button type="button" onClick={resetDestForm} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">ชื่อภาษาไทย *</label>
                  <input
                    value={destNameTh}
                    onChange={e => setDestNameTh(e.target.value)}
                    placeholder="เช่น ศาลเจ้าเมจิ"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">ชื่อภาษาอังกฤษ</label>
                  <input
                    value={destNameEn}
                    onChange={e => setDestNameEn(e.target.value)}
                    placeholder="เช่น Meiji Jingu"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">ชื่อภาษาญี่ปุ่น (Kanji/Kana)</label>
                  <input
                    value={destNameJa}
                    onChange={e => setDestNameJa(e.target.value)}
                    placeholder="เช่น 明治神宮"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">ภูมิภาค (Region) *</label>
                  <select
                    value={destRegion}
                    onChange={e => setDestRegion(e.target.value as Region)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  >
                    {REGIONS.filter(r => r.id !== 'All').map(r => (
                      <option key={r.id} value={r.id}>{r.nameTh}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">จังหวัด (Prefecture) *</label>
                  <input
                    value={destPrefecture}
                    onChange={e => setDestPrefecture(e.target.value)}
                    placeholder="เช่น Tokyo, Kyoto"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">หมวดหมู่ *</label>
                  <select
                    value={destCategory}
                    onChange={e => setDestCategory(e.target.value as Category)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  >
                    {CATEGORIES.filter(c => c.id !== 'All').map(c => (
                      <option key={c.id} value={c.id}>{c.nameTh}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">ค่าเข้าชม (เยน)</label>
                  <input
                    type="number"
                    min="0"
                    value={destFee}
                    onChange={e => setDestFee(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">รูปภาพ URL (Unsplash หรือลิงก์ตรง)</label>
                  <input
                    type="url"
                    value={destImageUrl}
                    onChange={e => setDestImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">สถานีรถไฟที่ใกล้ที่สุด</label>
                  <input
                    value={destStation}
                    onChange={e => setDestStation(e.target.value)}
                    placeholder="เช่น Harajuku Station (เดิน 3 นาที)"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">เวลาเปิด</label>
                  <input
                    type="time"
                    value={destOpenTime}
                    onChange={e => setDestOpenTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">เวลาปิด</label>
                  <input
                    type="time"
                    value={destCloseTime}
                    onChange={e => setDestCloseTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">หมายเหตุวันปิด</label>
                  <input
                    value={destClosedNote}
                    onChange={e => setDestClosedNote(e.target.value)}
                    placeholder="เปิดทุกวัน หรือ ปิดวันจันทร์"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Seasons Checkboxes */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">ฤดูกาลที่แนะนำ</label>
                <div className="flex items-center gap-3 flex-wrap">
                  {[
                    { id: 'spring', label: '🌸 ฤดูใบไม้ผลิ (Spring)' },
                    { id: 'summer', label: '🌻 ฤดูร้อน (Summer)' },
                    { id: 'autumn', label: '🍁 ฤดูใบไม้ร่วง (Autumn)' },
                    { id: 'winter', label: '❄️ ฤดูหนาว (Winter)' },
                  ].map(s => (
                    <label key={s.id} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={destSeasons.includes(s.id as Season)}
                        onChange={() => toggleSeasonSelect(s.id as Season)}
                        className="rounded"
                      />
                      <span>{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">คำอธิบายสถานที่</label>
                <textarea
                  value={destDescription}
                  onChange={e => setDestDescription(e.target.value)}
                  rows={2}
                  placeholder="รายละเอียดและความน่าสนใจของสถานที่..."
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">คำแนะนำพิเศษ (Tips)</label>
                <input
                  value={destTips}
                  onChange={e => setDestTips(e.target.value)}
                  placeholder="เช่น ควรไปถึงก่อนช่วงเช้าตรู่เพื่อถ่ายรูปสวย"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={resetDestForm}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  {editingDestinationId ? (
                    <>
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>อัปเดตข้อมูลสถานที่</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>บันทึกสถานที่</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[11px] font-bold">
                  <th className="py-3 px-3">สถานที่</th>
                  <th className="py-3 px-3">จังหวัด / ภูมิภาค</th>
                  <th className="py-3 px-3">หมวดหมู่</th>
                  <th className="py-3 px-3">เวลาทำการ</th>
                  <th className="py-3 px-3">ค่าเข้าชม</th>
                  <th className="py-3 px-3">สถานะ</th>
                  <th className="py-3 px-3 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredDest.map(dest => {
                  const hasClosedDays = dest.operatingHours.closedDays.length > 0;
                  return (
                    <tr key={dest.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <img src={dest.imageUrl} alt={dest.nameTh} className="w-9 h-9 rounded-xl object-cover shrink-0" />
                          <div>
                            <div className="font-semibold text-slate-900 truncate max-w-[180px]">{dest.nameTh}</div>
                            <div className="text-slate-400 truncate max-w-[180px]">{dest.nameJa}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{dest.prefecture}<br /><span className="text-slate-400">{dest.region}</span></td>
                      <td className="py-2.5 px-3">
                        <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md font-semibold">{dest.category}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono">
                        {dest.operatingHours.openTime} - {dest.operatingHours.closeTime}
                      </td>
                      <td className="py-2.5 px-3 font-semibold">
                        {dest.admissionFeeYen === 0
                          ? <span className="text-emerald-600">ฟรี</span>
                          : <span className="text-slate-700">¥{dest.admissionFeeYen.toLocaleString()}</span>}
                      </td>
                      <td className="py-2.5 px-3">
                        {hasClosedDays
                          ? <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-semibold"><AlertTriangle className="w-3 h-3" /> มีวันปิด</span>
                          : <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-semibold"><CheckCircle2 className="w-3 h-3" /> เปิดทุกวัน</span>}
                      </td>
                      {/* Action Column for Admin and Super Admin */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit button: available for Admin & Super Admin */}
                          <button
                            onClick={() => handleStartEditDestination(dest)}
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 transition-colors cursor-pointer"
                            title="แก้ไขข้อมูลสถานที่"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button: Super Admin only */}
                          {isSuper && (
                            confirmDeleteDestId === dest.id ? (
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-[10px] text-red-600 font-semibold">ลบ?</span>
                                <button
                                  onClick={() => {
                                    deleteDestination(dest.id);
                                    setConfirmDeleteDestId(null);
                                  }}
                                  className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold cursor-pointer"
                                >
                                  ยืนยัน
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteDestId(null)}
                                  className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                                >
                                  ยกเลิก
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteDestId(dest.id)}
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                                title="ลบสถานที่"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════ TAB: ANNOUNCEMENTS ═══════════ */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900">ประกาศระบบ (System Announcements)</h3>
                <p className="text-xs text-slate-500 mt-0.5">ประกาศที่ถูกปักหมุดจะแสดงในหน้าหลักของผู้ใช้งาน</p>
              </div>
              <button
                onClick={() => setShowAnnForm(!showAnnForm)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  showAnnForm ? 'bg-slate-200 text-slate-700' : 'bg-slate-900 text-white'
                }`}
              >
                {showAnnForm ? <X className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
                <span>{showAnnForm ? 'ยกเลิก' : 'สร้างประกาศใหม่'}</span>
              </button>
            </div>

            {/* Add Announcement Form */}
            {showAnnForm && (
              <form onSubmit={handleAddAnnouncement} className="mb-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-150">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">สร้างประกาศใหม่</h4>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">หัวข้อประกาศ</label>
                  <input
                    value={annTitle}
                    onChange={e => setAnnTitle(e.target.value)}
                    placeholder="เช่น 🎌 อัปเดตข้อมูลสถานที่ท่องเที่ยวประจำเดือน"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">รายละเอียด</label>
                  <textarea
                    value={annContent}
                    onChange={e => setAnnContent(e.target.value)}
                    rows={3}
                    placeholder="รายละเอียดประกาศ..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={annPinned} onChange={e => setAnnPinned(e.target.checked)} className="rounded" />
                    <span className="text-xs font-semibold text-slate-700">ปักหมุด (แสดงในหน้าหลัก)</span>
                  </label>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer">
                    สร้างประกาศ
                  </button>
                </div>
              </form>
            )}

            {/* Announcement List */}
            <div className="space-y-3">
              {announcements.length === 0 && (
                <p className="text-center text-slate-400 text-sm py-8">ยังไม่มีประกาศในระบบ</p>
              )}
              {announcements.map(ann => (
                <div key={ann.id} className={`p-4 rounded-2xl border flex items-start gap-3 ${ann.pinned ? 'bg-indigo-50/60 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="shrink-0 mt-0.5">
                    {ann.pinned ? <Pin className="w-4 h-4 text-indigo-500" /> : <Megaphone className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{ann.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{ann.content}</p>
                        <p className="text-[10px] text-slate-400 mt-1.5 font-mono">
                          โดย {ann.authorName} • {new Date(ann.createdAt).toLocaleString('th-TH')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => togglePinAnnouncement(ann.id)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${ann.pinned ? 'bg-indigo-100 text-indigo-600 border-indigo-200 hover:bg-indigo-200' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}
                          title={ann.pinned ? 'เอาออกจากหมุด' : 'ปักหมุด'}
                        >
                          {ann.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteAnnId(ann.id)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
                          title="ลบประกาศ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Confirm Modal for Announcement Deletion */}
          <ConfirmModal
            isOpen={confirmDeleteAnnId !== null}
            title="ยืนยันการลบประกาศ?"
            message="คุณต้องการลบประกาศนี้ออกจากระบบใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้"
            confirmLabel="ยืนยันการลบ"
            cancelLabel="ยกเลิก"
            onConfirm={() => {
              if (confirmDeleteAnnId) {
                deleteAnnouncement(confirmDeleteAnnId);
                setConfirmDeleteAnnId(null);
              }
            }}
            onCancel={() => setConfirmDeleteAnnId(null)}
          />
        </div>
      )}

      {/* ═══════════ TAB: ACTIVITY LOG (Super Admin Only) ═══════════ */}
      {activeTab === 'activitylog' && isSuper && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">บันทึกกิจกรรมระบบ (Activity Log)</h3>
              <p className="text-xs text-slate-500 mt-0.5">รายการกิจกรรมทั้งหมด 100 รายการล่าสุด</p>
            </div>
            <span className="bg-amber-100 text-amber-900 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-amber-300">
              <Crown className="w-3 h-3 text-amber-600" /> Super Admin Only
            </span>
          </div>

          {activityLog.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Activity className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">ยังไม่มีกิจกรรมในระบบ</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {activityLog.map(entry => (
                <div key={entry.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5 ${
                    entry.targetType === 'user' ? 'bg-indigo-100 text-indigo-700' :
                    entry.targetType === 'announcement' ? 'bg-purple-100 text-purple-700' :
                    entry.targetType === 'destination' ? 'bg-rose-100 text-rose-700' :
                    'bg-slate-200 text-slate-600'
                  }`}>
                    {entry.actorName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-800">
                        <span className="font-bold">{entry.actorName}</span>
                        {' '}
                        <span className="text-slate-600">{entry.action}</span>
                        {' '}
                        <span className="font-semibold text-slate-800">"{entry.targetLabel}"</span>
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(entry.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{entry.actorEmail} • {new Date(entry.createdAt).toLocaleDateString('th-TH')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
