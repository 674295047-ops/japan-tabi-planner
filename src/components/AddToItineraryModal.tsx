import React, { useState } from 'react';
import { X, Calendar, Clock, Plus, Check, AlertCircle } from 'lucide-react';
import type { Destination, ItineraryDay, ItineraryItem } from '../types';

interface AddToItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: Destination | null;
  days: ItineraryDay[];
  items: ItineraryItem[];
  onConfirmAdd: (dest: Destination, targetDay: number, plannedTime: string) => void;
  onAddNewDay?: () => number;
}

export const AddToItineraryModal: React.FC<AddToItineraryModalProps> = ({
  isOpen,
  onClose,
  destination,
  days,
  items,
  onConfirmAdd,
  onAddNewDay,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [customTime, setCustomTime] = useState<string>('09:00');

  if (!isOpen || !destination) return null;

  // Calculate smart default time based on selected day
  const existingInSelectedDay = items.filter((it) => it.dayNumber === selectedDay);
  const isAlreadyInDay = existingInSelectedDay.some((it) => it.destination.id === destination.id);

  const getSuggestedTime = (dayNum: number): string => {
    const dayItems = items.filter((it) => it.dayNumber === dayNum);
    if (dayItems.length === 0) return '09:00';
    if (dayItems.length === 1) return '11:30';
    if (dayItems.length === 2) return '14:00';
    if (dayItems.length === 3) return '16:30';
    if (dayItems.length === 4) return '18:30';
    return '20:00';
  };

  const handleDayChange = (dayNum: number) => {
    setSelectedDay(dayNum);
    setCustomTime(getSuggestedTime(dayNum));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmAdd(destination, selectedDay, customTime);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">เพิ่มสถานที่ลงในแผนทริป</h3>
            <p className="text-xs text-slate-500">เลือกวันที่และเวลาที่ต้องการไปเยือน</p>
          </div>
        </div>

        {/* Destination Brief Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 mb-5">
          <img
            src={destination.imageUrl}
            alt={destination.nameTh}
            className="w-12 h-12 rounded-xl object-cover shrink-0"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">{destination.nameTh}</h4>
            <p className="text-[11px] text-slate-500 truncate">
              {destination.region} • {destination.prefecture} • {destination.admissionFeeYen === 0 ? 'เข้าฟรี' : `¥${destination.admissionFeeYen.toLocaleString()}`}
            </p>
          </div>
        </div>

        {/* Warning if already in day */}
        {isAlreadyInDay && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>สถานที่นี้ถูกใส่ไว้ใน <b>วันที่ {selectedDay}</b> แล้ว (จะเพิ่มซ้ำอีกครั้ง)</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Day Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              เลือกวันที่ต้องการไป:
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1">
              {days.map((day) => {
                const dayCount = items.filter((it) => it.dayNumber === day.dayNumber).length;
                const isSelected = selectedDay === day.dayNumber;
                return (
                  <button
                    key={day.dayNumber}
                    type="button"
                    onClick={() => handleDayChange(day.dayNumber)}
                    className={`py-2 px-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/80 text-rose-700 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-750 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-extrabold flex items-center justify-between">
                      <span>Day {day.dayNumber}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-rose-600" />}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                      {dayCount} จุดแวะ
                    </div>
                  </button>
                );
              })}
            </div>

            {onAddNewDay && (
              <button
                type="button"
                onClick={() => {
                  const newDayNum = onAddNewDay();
                  setSelectedDay(newDayNum);
                  setCustomTime('09:00');
                }}
                className="mt-2 text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>+ เพิ่มวันใหม่ในทริป</span>
              </button>
            )}
          </div>

          {/* Planned Time Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-rose-500" />
              <span>เวลาที่วางแผนจะไป:</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                required
              />
              <div className="flex gap-1 shrink-0">
                {['09:00', '13:00', '16:00', '19:00'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCustomTime(preset)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold border cursor-pointer ${
                      customTime === preset
                        ? 'bg-rose-50 border-rose-300 text-rose-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              เวลาทำการของสถานที่นี้: {destination.operatingHours.openTime} - {destination.operatingHours.closeTime}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ยืนยันใส่ใน Day {selectedDay}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
