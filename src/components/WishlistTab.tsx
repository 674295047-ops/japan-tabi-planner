import React, { useState } from 'react';
import { Heart, Plus, Trash2, Lock, LogIn } from 'lucide-react';
import type { Destination } from '../types';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from './ConfirmModal';

interface WishlistTabProps {
  wishlist: Destination[];
  onRemoveFromWishlist: (dest: Destination) => void;
  onAddToItinerary: (dest: Destination) => void;
  onViewDetails: (dest: Destination) => void;
  onOpenDiscover: () => void;
  onOpenLoginModal?: () => void;
}

export const WishlistTab: React.FC<WishlistTabProps> = ({
  wishlist,
  onRemoveFromWishlist,
  onAddToItinerary,
  onViewDetails,
  onOpenDiscover,
  onOpenLoginModal,
}) => {
  const { isAuthenticated } = useAuth();
  const [destToRemove, setDestToRemove] = useState<Destination | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
          กรุณาเข้าสู่ระบบเพื่อใช้งานรายการโปรด
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
          เข้าสู่ระบบหรือสมัครสมาชิกเพื่อบันทึกสถานที่ท่องเที่ยวที่คุณชื่นชอบ และเข้าถึงข้อมูลได้จากทุกอุปกรณ์
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onOpenLoginModal}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-rose-400" />
            <span>เข้าสู่ระบบ / สมัครสมาชิก</span>
          </button>
          <button
            onClick={onOpenDiscover}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            สำรวจสถานที่ท่องเที่ยวก่อน
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider">
            <Heart className="w-4 h-4 fill-rose-500" />
            <span>Saved Places</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">สถานที่ท่องเที่ยวที่บันทึกไว้</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            รวบรวมจุดหมายปลายทางที่คุณชื่นชอบเพื่อนำไปจัดใส่ทริป ({wishlist.length} รายการ)
          </p>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-700 text-base">ยังไม่มีสถานที่ในรายการโปรด</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            กดไอคอนรูปหัวใจที่การ์ดสถานที่ท่องเที่ยวในหน้าค้นหาเพื่อเก็บไว้ดูภายหลัง
          </p>
          <button
            onClick={onOpenDiscover}
            className="mt-5 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-sm"
          >
            ไปหน้าค้นหาสถานที่
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {wishlist.map((dest) => (
            <div
              key={dest.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/10] bg-slate-100 cursor-pointer" onClick={() => onViewDetails(dest)}>
                  <img src={dest.imageUrl} alt={dest.nameTh} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                    {dest.prefecture}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDestToRemove(dest);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors shadow-xs z-10"
                    title="ลบออกจากรายการโปรด"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4">
                  <h4 
                    onClick={() => onViewDetails(dest)} 
                    className="font-bold text-slate-900 text-base hover:text-rose-600 cursor-pointer transition-colors line-clamp-1"
                  >
                    {dest.nameTh}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{dest.nameEn}</p>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                    {dest.descriptionTh}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-slate-100 flex items-center gap-2 mt-3">
                <button
                  onClick={() => onViewDetails(dest)}
                  className="w-1/2 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  รายละเอียด
                </button>
                <button
                  onClick={() => onAddToItinerary(dest)}
                  className="w-1/2 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ใส่ในทริป</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal for removing from Wishlist */}
      <ConfirmModal
        isOpen={destToRemove !== null}
        title="ลบออกจากรายการโปรด?"
        confirmLabel="ยืนยันการลบ"
        cancelLabel="ยกเลิก"
        onConfirm={() => {
          if (destToRemove) {
            onRemoveFromWishlist(destToRemove);
            setDestToRemove(null);
          }
        }}
        onCancel={() => setDestToRemove(null)}
      />
    </div>
  );
};
