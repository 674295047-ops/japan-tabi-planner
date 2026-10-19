import React, { useState } from 'react';
import { 
  Calendar, Clock, Trash2, ArrowUp, ArrowDown, AlertTriangle, 
  Printer, Plus, CheckCircle2, Copy, Lock, LogIn, Edit2, Check, ArrowRightLeft, StickyNote, X
} from 'lucide-react';
import type { ItineraryDay, ItineraryItem } from '../types';
import { useAuth } from '../context/AuthContext';

interface ItineraryPlannerProps {
  days: ItineraryDay[];
  setDays: React.Dispatch<React.SetStateAction<ItineraryDay[]>>;
  items: ItineraryItem[];
  setItems: React.Dispatch<React.SetStateAction<ItineraryItem[]>>;
  onOpenDiscover: () => void;
  onOpenLoginModal?: () => void;
}

export const ItineraryPlanner: React.FC<ItineraryPlannerProps> = ({
  days,
  setDays,
  items,
  setItems,
  onOpenDiscover,
  onOpenLoginModal,
}) => {
  const { isAuthenticated } = useAuth();
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [editTitleText, setEditTitleText] = useState<string>('');

  // Filter items for currently selected day
  const currentDayItems = items
    .filter((it) => it.dayNumber === selectedDayNumber)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const currentDayObj = days.find((d) => d.dayNumber === selectedDayNumber);

  // Add a new day
  const handleAddDay = () => {
    const nextDayNum = days.length + 1;
    setDays((prev) => [
      ...prev,
      {
        dayNumber: nextDayNum,
        dateStr: `วันที่ ${nextDayNum}`,
        title: `Day ${nextDayNum}: แผนเที่ยววันที่ ${nextDayNum}`,
      },
    ]);
    setSelectedDayNumber(nextDayNum);
  };

  // Remove a day and re-index sequentially
  const handleRemoveDay = (dayNum: number) => {
    if (days.length <= 1) return;

    // Filter out the day and items
    const remainingDays = days.filter((d) => d.dayNumber !== dayNum);
    const remainingItems = items.filter((it) => it.dayNumber !== dayNum);

    // Re-index days 1, 2, 3...
    const dayMap = new Map<number, number>();
    const reindexedDays: ItineraryDay[] = remainingDays.map((d, idx) => {
      const newDayNum = idx + 1;
      dayMap.set(d.dayNumber, newDayNum);
      return {
        ...d,
        dayNumber: newDayNum,
        dateStr: `วันที่ ${newDayNum}`,
        title: d.title.replace(/Day \d+/, `Day ${newDayNum}`).replace(/วันที่ \d+/, `วันที่ ${newDayNum}`),
      };
    });

    // Re-index dayNumber on items
    const reindexedItems = remainingItems.map((it) => ({
      ...it,
      dayNumber: dayMap.get(it.dayNumber) || 1,
    }));

    setDays(reindexedDays);
    setItems(reindexedItems);

    if (selectedDayNumber === dayNum || selectedDayNumber > reindexedDays.length) {
      setSelectedDayNumber(Math.min(selectedDayNumber, reindexedDays.length));
    }
  };

  // Move item up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const targetItem = currentDayItems[index];
    const prevItem = currentDayItems[index - 1];

    setItems((prev) =>
      prev.map((it) => {
        if (it.id === targetItem.id) return { ...it, orderIndex: prevItem.orderIndex };
        if (it.id === prevItem.id) return { ...it, orderIndex: targetItem.orderIndex };
        return it;
      })
    );
  };

  // Move item down
  const handleMoveDown = (index: number) => {
    if (index === currentDayItems.length - 1) return;
    const targetItem = currentDayItems[index];
    const nextItem = currentDayItems[index + 1];

    setItems((prev) =>
      prev.map((it) => {
        if (it.id === targetItem.id) return { ...it, orderIndex: nextItem.orderIndex };
        if (it.id === nextItem.id) return { ...it, orderIndex: targetItem.orderIndex };
        return it;
      })
    );
  };

  // Move item to another day
  const handleMoveItemToDay = (itemId: string, targetDay: number) => {
    if (targetDay === selectedDayNumber) return;
    const targetDayItems = items.filter((it) => it.dayNumber === targetDay);
    const newOrderIndex = targetDayItems.length;

    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? {
              ...it,
              dayNumber: targetDay,
              orderIndex: newOrderIndex,
            }
          : it
      )
    );
  };

  // Delete item from itinerary
  const handleDeleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  // Update item planned time or note
  const handleUpdateItemTime = (itemId: string, time: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, plannedTime: time } : it))
    );
  };

  const handleUpdateItemNotes = (itemId: string, note: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, notes: note } : it))
    );
  };

  // Save edited day title
  const handleSaveDayTitle = () => {
    if (!editTitleText.trim()) {
      setIsEditingTitle(false);
      return;
    }
    setDays((prev) =>
      prev.map((d) =>
        d.dayNumber === selectedDayNumber
          ? { ...d, title: editTitleText.trim() }
          : d
      )
    );
    setIsEditingTitle(false);
  };

  // Calculate totals
  const totalAdmissionFee = items.reduce(
    (sum, it) => sum + (it.destination.admissionFeeYen || 0),
    0
  );

  // Copy plan summary to clipboard
  const handleCopySummary = () => {
    let summaryText = `🇯🇵 แผนการท่องเที่ยวประเทศญี่ปุ่น (Japan Itinerary)\n`;
    summaryText += `══════════════════════════════════════════\n\n`;

    days.forEach((day) => {
      summaryText += `📌 ${day.title}\n`;
      const dayItems = items
        .filter((it) => it.dayNumber === day.dayNumber)
        .sort((a, b) => a.orderIndex - b.orderIndex);

      if (dayItems.length === 0) {
        summaryText += `  (ยังไม่มีสถานที่ในวันนี้)\n`;
      } else {
        dayItems.forEach((it, idx) => {
          summaryText += `  ${idx + 1}. [${it.plannedTime || '--:--'}] ${it.destination.nameTh} (${it.destination.prefecture})\n`;
          summaryText += `     • ค่าเข้า: ¥${it.destination.admissionFeeYen.toLocaleString()} | สถานี: ${it.destination.nearestStation}\n`;
          if (it.notes) summaryText += `     • บันทึก: ${it.notes}\n`;
        });
      }
      summaryText += `\n`;
    });

    summaryText += `💰 ค่าเข้าชมรวมทั้งทริป: ¥${totalAdmissionFee.toLocaleString()} ต่อท่าน\n`;
    summaryText += `สร้างโดยระบบ Japan Tabi Planner`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isAuthenticated) {
    return (
      <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
          กรุณาเข้าสู่ระบบเพื่อใช้งานแผนทริป
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
          เข้าสู่ระบบหรือสมัครสมาชิกเพื่อสร้างแผนการท่องเที่ยว จัดลำดับเวลา และคำนวณงบประมาณการเดินทางของคุณ
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
            ค้นหาสถานที่ท่องเที่ยวก่อน
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Banner */}
      <div className="bg-gradient-to-r from-rose-500 to-red-600 rounded-3xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="bg-white/20 backdrop-blur-md text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Smart Itinerary Builder
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold mt-2">แผนการเดินทางท่องเที่ยวญี่ปุ่น</h2>
            <p className="text-xs sm:text-sm text-rose-100 mt-1">
              จัดลำดับสถานที่รายวัน ตรวจสอบเวลาเปิดปิดอัตโนมัติ และคำนวณงบประมาณ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-4 py-2 rounded-xl bg-white text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'คัดลอกสำเร็จ!' : 'คัดลอกสรุปแผน'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/20 text-center">
          <div className="bg-white/10 rounded-2xl p-2.5">
            <div className="text-[11px] text-rose-100 font-medium">จำนวนวันในทริป</div>
            <div className="text-lg sm:text-xl font-bold">{days.length} วัน</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-2.5">
            <div className="text-[11px] text-rose-100 font-medium">สถานที่ทั้งหมด</div>
            <div className="text-lg sm:text-xl font-bold">{items.length} จุดแวะ</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-2.5">
            <div className="text-[11px] text-rose-100 font-medium">ค่าเข้าชมรวม</div>
            <div className="text-lg sm:text-xl font-bold">¥{totalAdmissionFee.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {days.map((day) => (
          <button
            key={day.dayNumber}
            onClick={() => setSelectedDayNumber(day.dayNumber)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedDayNumber === day.dayNumber
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{day.title}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedDayNumber === day.dayNumber ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {items.filter((it) => it.dayNumber === day.dayNumber).length}
            </span>
          </button>
        ))}

        <button
          onClick={handleAddDay}
          className="px-3.5 py-2.5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-rose-400 text-slate-500 hover:text-rose-600 text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>เพิ่มวัน</span>
        </button>
      </div>

      {/* Main Itinerary Content Area */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
            <Calendar className="w-5 h-5 text-rose-500 shrink-0" />
            {isEditingTitle ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={editTitleText}
                  onChange={(e) => setEditTitleText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveDayTitle();
                    if (e.key === 'Escape') setIsEditingTitle(false);
                  }}
                  autoFocus
                  placeholder="เช่น Day 1: ช้อปปิ้งและวัดอาซากุสะ"
                  className="py-1 px-3 rounded-xl border border-rose-400 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
                <button
                  onClick={handleSaveDayTitle}
                  className="p-1.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                  title="บันทึกชื่อวัน"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsEditingTitle(false)}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
                  title="ยกเลิก"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  {currentDayObj?.title || `วันที่ ${selectedDayNumber}`}
                </h3>
                <button
                  onClick={() => {
                    setEditTitleText(currentDayObj?.title || `Day ${selectedDayNumber}: แผนเที่ยววันที่ ${selectedDayNumber}`);
                    setIsEditingTitle(true);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="แก้ไขชื่อหัวข้อวัน"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-slate-400 font-medium">({currentDayItems.length} จุดแวะ)</span>
              </div>
            )}
          </div>

          {days.length > 1 && (
            <button
              onClick={() => handleRemoveDay(selectedDayNumber)}
              className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ลบวันนี้</span>
            </button>
          )}
        </div>

        {/* Empty State */}
        {currentDayItems.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border-2 border-dashed border-slate-200 p-6">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-700 text-sm">ยังไม่มีสถานที่ในวันที่ {selectedDayNumber}</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              เลือกดูสถานที่ท่องเที่ยวที่น่าสนใจจากหน้าค้นหา แล้วกด "ใส่ในทริป" เพื่อนำมาจัดลงตาราง
            </p>
            <button
              onClick={onOpenDiscover}
              className="mt-4 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-xs"
            >
              ค้นหาสถานที่ท่องเที่ยว
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {currentDayItems.map((item, index) => {
              const dest = item.destination;
              // Check for operating hour conflict warning
              const hasClosedWarning = dest.operatingHours.closedDays.length > 0;

              return (
                <div
                  key={item.id}
                  className="group relative bg-slate-50/70 hover:bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  {/* Left: Index & Time & Thumbnail */}
                  <div className="flex items-start gap-3 w-full sm:w-auto">
                    {/* Index Number */}
                    <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                      {index + 1}
                    </div>

                    {/* Image */}
                    <img
                      src={dest.imageUrl}
                      alt={dest.nameTh}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-xs"
                    />

                    {/* Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">{dest.nameTh}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.2 rounded-md">
                          {dest.prefecture}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate max-w-xs">{dest.nameEn}</p>

                      <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{dest.operatingHours.openTime} - {dest.operatingHours.closeTime}</span>
                        </span>
                        <span className="font-semibold text-slate-700">
                          {dest.admissionFeeYen === 0 ? 'ฟรี' : `¥${dest.admissionFeeYen.toLocaleString()}`}
                        </span>
                      </div>

                      {/* Conflict Alert Warning Badge */}
                      {hasClosedWarning && (
                        <div className="inline-flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-lg font-medium mt-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{dest.operatingHours.closedNote || 'มีกำหนดวันปิดทำการประจำสัปดาห์'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Planned Time, Notes, Move-To-Day, and Ordering Actions */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                    {/* Time Input */}
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="time"
                        value={item.plannedTime || '09:00'}
                        onChange={(e) => handleUpdateItemTime(item.id, e.target.value)}
                        className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
                        title="เวลาที่วางแผนจะไปถึง"
                      />
                    </div>

                    {/* Move to another Day selector */}
                    {days.length > 1 && (
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                        <ArrowRightLeft className="w-3 h-3 text-slate-400" />
                        <select
                          value={selectedDayNumber}
                          onChange={(e) => handleMoveItemToDay(item.id, Number(e.target.value))}
                          className="text-[11px] font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                          title="ย้ายสถานที่นี้ไปวันอื่น"
                        >
                          {days.map((d) => (
                            <option key={d.dayNumber} value={d.dayNumber}>
                              {d.dayNumber === selectedDayNumber ? `อยู่ที่ Day ${d.dayNumber}` : `ย้ายไป Day ${d.dayNumber}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Order & Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 transition-colors cursor-pointer"
                        title="เลื่อนขึ้น"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === currentDayItems.length - 1}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 transition-colors cursor-pointer"
                        title="เลื่อนลง"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors ml-1 cursor-pointer"
                        title="ลบออกจากทริป"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
