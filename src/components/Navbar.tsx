import React, { useState } from 'react';
import { Compass, CalendarDays, Heart, LogIn, LogOut, ShieldCheck, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { hasAdminAccess, isSuperAdmin } from '../config/roles';

interface NavbarProps {
  activeTab: 'discover' | 'planner' | 'wishlist' | 'admin';
  setActiveTab: (tab: 'discover' | 'planner' | 'wishlist' | 'admin') => void;
  wishlistCount: number;
  itineraryTotalItems: number;
  onOpenLoginModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  wishlistCount,
  itineraryTotalItems,
  onOpenLoginModal,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const canAccessAdmin = hasAdminAccess(user?.role);
  const isSuper = isSuperAdmin(user?.role);

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('discover')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">JAPAN TABI</span>
                <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Phase 1</span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">ระบบค้นหาและจัดแผนท่องเที่ยวญี่ปุ่น</p>
            </div>
          </div>

          {/* Center: Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'discover'
                  ? 'bg-rose-50 text-rose-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>ค้นหา</span>
            </button>

            <button
              onClick={() => setActiveTab('planner')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'planner'
                  ? 'bg-rose-50 text-rose-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>แผนทริป</span>
              {!isAuthenticated ? (
                <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                  🔒
                </span>
              ) : (
                itineraryTotalItems > 0 && (
                  <span className="bg-rose-500 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full min-w-5 text-center">
                    {itineraryTotalItems}
                  </span>
                )
              )}
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'wishlist'
                  ? 'bg-rose-50 text-rose-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${wishlistCount > 0 && isAuthenticated ? 'text-rose-500 fill-rose-500' : ''}`} />
              <span className="hidden sm:inline">รายการโปรด</span>
              {!isAuthenticated ? (
                <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                  🔒
                </span>
              ) : (
                wishlistCount > 0 && (
                  <span className="bg-rose-100 text-rose-700 text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                    {wishlistCount}
                  </span>
                )
              )}
            </button>

            {/* Special Admin Tab (Visible only to Admin & Super Admin) */}
            {canAccessAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'admin'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                {isSuper ? <Crown className="w-4 h-4 text-amber-400" /> : <ShieldCheck className="w-4 h-4 text-indigo-600" />}
                <span>จัดการระบบ</span>
              </button>
            )}
          </nav>

          {/* Right: Google OAuth / Email Auth State */}
          <div className="relative">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white transition-all shadow-xs cursor-pointer"
                >
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-rose-500/20"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 hidden md:inline max-w-[120px] truncate leading-tight">
                      {user.name}
                    </span>
                    {/* Role Tag */}
                    <span className="text-[10px] hidden md:inline font-bold">
                      {isSuper ? (
                        <span className="text-amber-600">👑 Super Admin</span>
                      ) : user.role === 'admin' ? (
                        <span className="text-indigo-600">🛡️ Admin</span>
                      ) : (
                        <span className="text-slate-400">นักเดินทาง</span>
                      )}
                    </span>
                  </div>
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left"
                    onMouseLeave={() => setShowProfileMenu(false)}
                  >
                    <div className="px-3 py-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        {isSuper ? (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Crown className="w-3 h-3 text-amber-600" />
                            <span>Super Admin</span>
                          </span>
                        ) : user.role === 'admin' ? (
                          <span className="bg-indigo-100 text-indigo-900 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-indigo-600" />
                            <span>Admin</span>
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                            Traveler
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900 truncate">{user.name}</div>
                      <div className="text-[11px] text-slate-500 truncate font-mono">{user.email}</div>
                    </div>

                    {canAccessAdmin && (
                      <button
                        onClick={() => {
                          setActiveTab('admin');
                          setShowProfileMenu(false);
                        }}
                        className="w-full mt-1 px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors flex items-center gap-2"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>เปิดหน้าจัดการระบบ (Admin)</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full mt-1 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">เข้าสู่ระบบ / สมัครสมาชิก</span>
                <span className="sm:hidden">เข้าสู่ระบบ</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
