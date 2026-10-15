import React from 'react';
import { Search, MapPin, Filter, SunMedium, Snowflake, Flower2, Leaf } from 'lucide-react';
import type { Category, Region, Season } from '../types';
import { CATEGORIES, REGIONS } from '../data/japanData';


interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedRegion: Region;
  setSelectedRegion: (region: Region) => void;
  selectedCategory: Category;
  setSelectedCategory: (category: Category) => void;
  selectedSeason: Season | 'All';
  setSelectedSeason: (season: Season | 'All') => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedRegion,
  setSelectedRegion,
  selectedCategory,
  setSelectedCategory,
  selectedSeason,
  setSelectedSeason,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
      {/* Search Input & Region Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อสถานที่, จังหวัด, เมือง (ไทย / อังกฤษ / ญี่ปุ่น)..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-full w-5 h-5 flex items-center justify-center"
            >
              ✕
            </button>
          )}
        </div>

        {/* Region Dropdown */}
        <div className="sm:col-span-4 relative">
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value as Region)}
            className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 appearance-none font-medium cursor-pointer"
          >
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nameTh}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
            ▼
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
          <Filter className="w-3.5 h-3.5" />
          <span>หมวดหมู่สถานที่:</span>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.nameTh}
            </button>
          ))}
        </div>
      </div>

      {/* Season Filters */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">ฤดูกาลแนะนำ:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedSeason('All')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedSeason === 'All' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setSelectedSeason('spring')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedSeason === 'spring' ? 'bg-pink-500 text-white' : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
              }`}
            >
              <Flower2 className="w-3 h-3" />
              <span>ซากุระ (ใบไม้ผลิ)</span>
            </button>
            <button
              onClick={() => setSelectedSeason('autumn')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedSeason === 'autumn' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <Leaf className="w-3 h-3" />
              <span>ใบไม้เปลี่ยนสี</span>
            </button>
            <button
              onClick={() => setSelectedSeason('winter')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedSeason === 'winter' ? 'bg-cyan-600 text-white' : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100'
              }`}
            >
              <Snowflake className="w-3 h-3" />
              <span>หิมะ (ฤดูหนาว)</span>
            </button>
            <button
              onClick={() => setSelectedSeason('summer')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedSeason === 'summer' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <SunMedium className="w-3 h-3" />
              <span>ฤดูร้อน</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
