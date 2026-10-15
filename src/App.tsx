import { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { DestinationCard } from './components/DestinationCard';
import { DestinationModal } from './components/DestinationModal';
import { AuthModal } from './components/AuthModal';
import { ItineraryPlanner } from './components/ItineraryPlanner';
import { WishlistTab } from './components/WishlistTab';
import { AdminConsole } from './components/AdminConsole';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { useDestinations } from './context/DestinationContext';
import { useAuth } from './context/AuthContext';
import type { Category, Destination, ItineraryDay, ItineraryItem, Region, Season } from './types';
import { Compass, Sparkles } from 'lucide-react';

export function App() {
  const { destinations } = useDestinations();
  const [activeTab, setActiveTab] = useState<'discover' | 'planner' | 'wishlist' | 'admin'>('discover');

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedRegion, setSelectedRegion] = useState<Region>('All');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [selectedSeason, setSelectedSeason] = useState<Season | 'All'>('All');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  // Wishlist state (persisted in localStorage)
  const [wishlist, setWishlist] = useState<Destination[]>(() => {
    try {
      const saved = localStorage.getItem('japan_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Itinerary days state (persisted in localStorage)
  const [days, setDays] = useState<ItineraryDay[]>(() => {
    try {
      const saved = localStorage.getItem('japan_itinerary_days');
      return saved
        ? JSON.parse(saved)
        : [
            { dayNumber: 1, dateStr: 'วันที่ 1', title: 'Day 1: จุดไฮไลท์และวัฒนธรรม' },
            { dayNumber: 2, dateStr: 'วันที่ 2', title: 'Day 2: ชมธรรมชาติและประวัติศาสตร์' },
            { dayNumber: 3, dateStr: 'วันที่ 3', title: 'Day 3: ช้อปปิ้งและอาหารเลิศรส' },
          ];
    } catch {
      return [
        { dayNumber: 1, dateStr: 'วันที่ 1', title: 'Day 1: จุดไฮไลท์และวัฒนธรรม' },
        { dayNumber: 2, dateStr: 'วันที่ 2', title: 'Day 2: ชมธรรมชาติและประวัติศาสตร์' },
        { dayNumber: 3, dateStr: 'วันที่ 3', title: 'Day 3: ช้อปปิ้งและอาหารเลิศรส' },
      ];
    }
  });

  // Itinerary items state (persisted in localStorage)
  const [items, setItems] = useState<ItineraryItem[]>(() => {
    try {
      const saved = localStorage.getItem('japan_itinerary_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('japan_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('japan_itinerary_days', JSON.stringify(days));
    } catch (e) {
      console.error(e);
    }
  }, [days]);

  useEffect(() => {
    try {
      localStorage.setItem('japan_itinerary_items', JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  }, [items]);

  const { isAuthenticated } = useAuth();

  // Wishlist toggler
  const handleToggleWishlist = (dest: Destination) => {
    if (!isAuthenticated) {
      showToast('🔒 กรุณาเข้าสู่ระบบหรือสมัครสมาชิกก่อนบันทึกรายการโปรด');
      setIsLoginModalOpen(true);
      return;
    }

    setWishlist((prev) => {
      const exists = prev.some((d) => d.id === dest.id);
      if (exists) {
        showToast(`ลบ "${dest.nameTh}" ออกจากรายการโปรดแล้ว`);
        return prev.filter((d) => d.id !== dest.id);
      } else {
        showToast(`บันทึก "${dest.nameTh}" ลงรายการโปรดแล้ว ❤️`);
        return [...prev, dest];
      }
    });
  };

  // Add to itinerary (default to current day 1 or next empty slot)
  const handleAddToItinerary = (dest: Destination) => {
    if (!isAuthenticated) {
      showToast('🔒 กรุณาเข้าสู่ระบบหรือสมัครสมาชิกก่อนจัดแผนทริป');
      setIsLoginModalOpen(true);
      return;
    }

    const targetDay = 1;
    const existingInDay = items.filter((it) => it.dayNumber === targetDay);
    const nextOrder = existingInDay.length;

    const newItem: ItineraryItem = {
      id: `${dest.id}-${Date.now()}`,
      destination: dest,
      dayNumber: targetDay,
      orderIndex: nextOrder,
      plannedTime: nextOrder === 0 ? '09:00' : '13:00',
    };

    setItems((prev) => [...prev, newItem]);
    showToast(`เพิ่ม "${dest.nameTh}" ลงใน Day ${targetDay} แล้ว!`);
  };

  // Filter destinations
  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      // Region filter
      if (selectedRegion !== 'All' && dest.region !== selectedRegion) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'All' && dest.category !== selectedCategory) {
        return false;
      }
      // Season filter
      if (selectedSeason !== 'All' && !dest.recommendedSeasons.includes(selectedSeason)) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchNameTh = dest.nameTh.toLowerCase().includes(query);
        const matchNameEn = dest.nameEn.toLowerCase().includes(query);
        const matchNameJa = dest.nameJa.toLowerCase().includes(query);
        const matchPrefecture = dest.prefecture.toLowerCase().includes(query);
        const matchDesc = dest.descriptionTh.toLowerCase().includes(query);
        return matchNameTh || matchNameEn || matchNameJa || matchPrefecture || matchDesc;
      }
      return true;
    });
  }, [destinations, searchQuery, selectedRegion, selectedCategory, selectedSeason]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2 border border-slate-800 animate-in slide-in-from-bottom duration-200">
          <Sparkles className="w-4 h-4 text-rose-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wishlistCount={wishlist.length}
        itineraryTotalItems={items.length}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />


      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* TAB 1: DISCOVER / CATALOG */}
        {activeTab === 'discover' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-rose-900 via-rose-700 to-amber-700 text-white p-6 sm:p-10 shadow-lg">
              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Discover Japan Across All 47 Prefectures</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  จัดทริปเที่ยวญี่ปุ่นในฝัน <br />
                  <span className="text-rose-200">ครบทุกแลนด์มาร์ก ทุกฤดูกาล</span>
                </h1>
                <p className="text-xs sm:text-sm text-rose-100 max-w-xl leading-relaxed">
                  สำรวจสถานที่ท่องเที่ยวยอดนิยมทั่ว 8 ภูมิภาค วางแผนตารางการเดินทางรายวันอย่างลงตัว
                  พร้อมระบบตรวจจับวันปิดทำการและประมาณการค่าเข้าชมอัตโนมัติ
                </p>
              </div>

              {/* Decorative Circle Background */}
              <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            </div>

            {/* Announcement Banner */}
            <AnnouncementBanner />

            {/* Filter Bar Component */}
            <FilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedSeason={selectedSeason}
              setSelectedSeason={setSelectedSeason}
            />

            {/* Results Count & Status */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
              <span>
                พบสถานที่ท่องเที่ยว <strong className="text-slate-900">{filteredDestinations.length}</strong> แห่ง
                {selectedRegion !== 'All' && ` ใน ${selectedRegion}`}
              </span>
              {(searchQuery || selectedRegion !== 'All' || selectedCategory !== 'All' || selectedSeason !== 'All') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedRegion('All');
                    setSelectedCategory('All');
                    setSelectedSeason('All');
                  }}
                  className="text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              )}
            </div>

            {/* Destinations Grid */}
            {filteredDestinations.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80 p-8">
                <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-700 text-base">ไม่พบสถานที่ท่องเที่ยวตามเงื่อนไขที่เลือก</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  ลองเปลี่ยนคำค้นหา หรือเลือกตัวกรองภูมิภาคและหมวดหมู่อื่นดูใหม่อีกครั้ง
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {filteredDestinations.map((dest) => (
                  <DestinationCard
                    key={dest.id}
                    destination={dest}
                    isWishlisted={wishlist.some((d) => d.id === dest.id)}
                    onToggleWishlist={handleToggleWishlist}
                    onAddToItinerary={handleAddToItinerary}
                    onViewDetails={setSelectedDestination}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ITINERARY PLANNER */}
        {activeTab === 'planner' && (
          <ItineraryPlanner
            days={days}
            setDays={setDays}
            items={items}
            setItems={setItems}
            onOpenDiscover={() => setActiveTab('discover')}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />
        )}

        {/* TAB 3: WISHLIST */}
        {activeTab === 'wishlist' && (
          <WishlistTab
            wishlist={wishlist}
            onRemoveFromWishlist={handleToggleWishlist}
            onAddToItinerary={handleAddToItinerary}
            onViewDetails={setSelectedDestination}
            onOpenDiscover={() => setActiveTab('discover')}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />
        )}

        {/* TAB 4: ADMIN CONSOLE */}
        {activeTab === 'admin' && (
          <AdminConsole />
        )}
      </main>


      {/* Modal for Destination Details */}
      <DestinationModal
        destination={selectedDestination}
        onClose={() => setSelectedDestination(null)}
        isWishlisted={selectedDestination ? wishlist.some((d) => d.id === selectedDestination.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onAddToItinerary={handleAddToItinerary}
      />

      {/* Modal for Authentication (Sign In / Sign Up / Google OAuth) */}
      <AuthModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />



      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Japan Tabi Planner • Phase 1 MVP Release</p>
          <p className="text-[11px] text-slate-400">
            Deployed on Cloudflare Pages • Built with React, Vite & Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
