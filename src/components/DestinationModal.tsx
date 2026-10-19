import React from 'react';
import { X, Star, ExternalLink, Plus, Heart, Lock, Clock, JapaneseYen, Navigation as NavigationIcon, Sparkles } from 'lucide-react';
import type { Destination } from '../types';
import { useAuth } from '../context/AuthContext';

interface DestinationModalProps {
  destination: Destination | null;
  onClose: () => void;
  isWishlisted: boolean;
  onToggleWishlist: (dest: Destination) => void;
  onAddToItinerary: (dest: Destination) => void;
}

export const DestinationModal: React.FC<DestinationModalProps> = ({
  destination,
  onClose,
  isWishlisted,
  onToggleWishlist,
  onAddToItinerary,
}) => {
  const { isAuthenticated } = useAuth();
  if (!destination) return null;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${destination.coordinates.lat},${destination.coordinates.lng}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative aspect-[16/9] w-full bg-slate-900">
          <img
            src={destination.imageUrl}
            alt={destination.nameTh}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              target.src = 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/60 backdrop-blur-md text-white hover:bg-slate-900 transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Bottom Floating Info */}
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="bg-rose-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {destination.region}
              </span>
              <span className="bg-white/20 backdrop-blur-md text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                {destination.prefecture}
              </span>
              <div className="flex items-center gap-1 bg-amber-400 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-md">
                <Star className="w-3.5 h-3.5 fill-slate-900" />
                <span>{destination.rating}</span>
                <span className="text-slate-700 font-normal">({destination.reviewsCount.toLocaleString()})</span>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">{destination.nameTh}</h2>
            <p className="text-xs sm:text-sm text-slate-200">{destination.nameEn} • {destination.nameJa}</p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">เกี่ยวกับสถานที่นี้</h4>
            <p className="text-sm text-slate-700 leading-relaxed">{destination.descriptionTh}</p>
          </div>

          {/* Key Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-slate-900">เวลาเปิด-ปิด</div>
                <div className="text-xs text-slate-600">
                  {destination.operatingHours.openTime} - {destination.operatingHours.closeTime} น.
                </div>
                {destination.operatingHours.closedNote && (
                  <div className="text-[11px] text-amber-700 font-medium mt-0.5">
                    {destination.operatingHours.closedNote}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <JapaneseYen className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-slate-900">ค่าเข้าชม</div>
                <div className="text-xs text-slate-600">
                  {destination.admissionFeeYen === 0
                    ? 'ฟรี ไม่เสียค่าเข้าชม'
                    : `ประมาณ ¥${destination.admissionFeeYen.toLocaleString()} ต่อท่าน`}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:col-span-2">
              <NavigationIcon className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-slate-900">สถานีและการเดินทาง</div>
                <div className="text-xs text-slate-600">{destination.nearestStation}</div>
              </div>
            </div>
          </div>

          {/* Pro Tips */}
          {destination.tipsTh && (
            <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-amber-900">คำแนะนำและไฮไลต์ (Pro Tips)</div>
                <div className="text-xs text-amber-800 mt-1 leading-relaxed">{destination.tipsTh}</div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>เปิดดูพิกัดบน Google Maps</span>
            </a>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleWishlist(destination)}
                className={`p-2.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                  !isAuthenticated
                    ? 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
                title={!isAuthenticated ? 'กรุณาเข้าสู่ระบบเพื่อบันทึกลงรายการโปรด' : isWishlisted ? 'ลบออกจากรายการโปรด' : 'บันทึกลงรายการโปรด'}
              >
                {!isAuthenticated ? (
                  <>
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>บันทึก (ต้องล็อกอิน)</span>
                  </>
                ) : (
                  <>
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{isWishlisted ? 'บันทึกแล้ว' : 'บันทึก'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  onAddToItinerary(destination);
                  if (isAuthenticated) onClose();
                }}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer ${
                  !isAuthenticated
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                }`}
                title={!isAuthenticated ? 'กรุณาเข้าสู่ระบบก่อนเพิ่มลงในแผนทริป' : 'เพิ่มลงในแผนทริป'}
              >
                {!isAuthenticated ? (
                  <>
                    <Lock className="w-4 h-4 text-slate-500" />
                    <span>เพิ่มลงในแผนทริป</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>เพิ่มลงในแผนทริป</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
