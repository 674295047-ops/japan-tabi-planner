import React from 'react';
import { Star, MapPin, Clock, Heart, Plus, Lock } from 'lucide-react';
import type { Destination } from '../types';
import { useAuth } from '../context/AuthContext';

interface DestinationCardProps {
  destination: Destination;
  isWishlisted: boolean;
  onToggleWishlist: (dest: Destination) => void;
  onAddToItinerary: (dest: Destination) => void;
  onViewDetails: (dest: Destination) => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  isWishlisted,
  onToggleWishlist,
  onAddToItinerary,
  onViewDetails,
}) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Thumbnail Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 cursor-pointer" onClick={() => onViewDetails(destination)}>
        <img
          src={destination.imageUrl}
          alt={destination.nameTh}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget;
            target.src = 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80';
          }}
        />
        
        {/* Region & Prefecture Badge */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
            {destination.prefecture}
          </span>
          <span className="bg-rose-600/90 backdrop-blur-md text-white text-[11px] font-semibold px-2 py-1 rounded-full">
            {destination.region}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(destination);
          }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-sm ${
            !isAuthenticated
              ? 'bg-white/80 text-slate-400 hover:bg-white hover:text-slate-600 cursor-pointer'
              : 'bg-white/90 text-slate-700 hover:text-rose-600 hover:bg-white cursor-pointer'
          }`}
          title={
            !isAuthenticated
              ? 'กรุณาเข้าสู่ระบบเพื่อบันทึกลงรายการโปรด'
              : isWishlisted
              ? 'ลบออกจากรายการโปรด'
              : 'บันทึกลงรายการโปรด'
          }
        >
          {!isAuthenticated ? (
            <Lock className="w-4 h-4 text-slate-400" />
          ) : (
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          )}
        </button>

        {/* Rating Floating Tag */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-xs text-xs font-bold text-slate-800">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{destination.rating}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider mb-1">
            {destination.nameJa}
          </div>
          <h3 
            onClick={() => onViewDetails(destination)}
            className="font-bold text-slate-900 text-base sm:text-lg line-clamp-1 hover:text-rose-600 cursor-pointer transition-colors"
          >
            {destination.nameTh}
          </h3>
          <p className="text-xs text-slate-500 font-medium mb-2">{destination.nameEn}</p>
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {destination.descriptionTh}
          </p>
        </div>

        {/* Info Tags */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{destination.operatingHours.openTime} - {destination.operatingHours.closeTime}</span>
            </span>
            <span className="font-semibold text-slate-800">
              {destination.admissionFeeYen === 0 ? (
                <span className="text-emerald-600">เข้าชมฟรี</span>
              ) : (
                `¥${destination.admissionFeeYen.toLocaleString()}`
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{destination.nearestStation}</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => onViewDetails(destination)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>รายละเอียด</span>
            </button>
            <button
              onClick={() => onAddToItinerary(destination)}
              className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer ${
                !isAuthenticated
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                  : 'bg-rose-500 hover:bg-rose-600 text-white'
              }`}
              title={!isAuthenticated ? 'กรุณาเข้าสู่ระบบก่อนเพิ่มลงในแผนทริป' : 'เพิ่มสถานที่นี้ลงในแผนทริป'}
            >
              {!isAuthenticated ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>ใส่ในทริป</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>ใส่ในทริป</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
