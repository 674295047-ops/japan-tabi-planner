export type Region = 
  | 'All' 
  | 'Hokkaido' 
  | 'Tohoku' 
  | 'Kanto' 
  | 'Chubu' 
  | 'Kansai' 
  | 'Chugoku' 
  | 'Shikoku' 
  | 'Kyushu' 
  | 'Okinawa';

export type Category = 
  | 'All'
  | 'temple' 
  | 'nature' 
  | 'city' 
  | 'food' 
  | 'onsen' 
  | 'history' 
  | 'themepark';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface Destination {
  id: string;
  nameEn: string;
  nameTh: string;
  nameJa: string;
  region: Region;
  prefecture: string;
  category: Category;
  descriptionTh: string;
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  admissionFeeYen: number;
  nearestStation: string;
  recommendedSeasons: Season[];
  operatingHours: {
    openTime: string;
    closeTime: string;
    closedDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
    closedNote?: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  tipsTh?: string;
}

export interface ItineraryItem {
  id: string;
  destination: Destination;
  dayNumber: number;
  orderIndex: number;
  plannedTime?: string;
  notes?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  dateStr: string;
  title: string;
}
