import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Destination } from '../types';
import { JAPAN_DESTINATIONS } from '../data/japanData';
import { useAuth } from './AuthContext';
import { firestore } from '../services/firebase';

interface DestinationContextType {
  destinations: Destination[];
  addDestination: (destination: Destination) => void;
  updateDestination: (id: string, updated: Partial<Destination>) => void;
  deleteDestination: (id: string) => void;
  resetDestinations: () => void;
}

const DestinationContext = createContext<DestinationContextType | undefined>(undefined);

export const DestinationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logSystemActivity } = useAuth();

  const [destinations, setDestinations] = useState<Destination[]>(() => {
    try {
      const saved = localStorage.getItem('japan_destinations');
      const version = localStorage.getItem('japan_destinations_version');
      if (saved && version === 'v2') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } else if (saved) {
        // Upgrade from older version: update default destinations images while keeping custom added items
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const defaultMap = new Map(JAPAN_DESTINATIONS.map((d) => [d.id, d]));
          const upgraded = parsed.map((item) => {
            if (defaultMap.has(item.id)) {
              return { ...item, imageUrl: defaultMap.get(item.id)!.imageUrl };
            }
            return item;
          });
          localStorage.setItem('japan_destinations_version', 'v2');
          return upgraded;
        }
      }
    } catch (e) {
      console.error('Failed to load destinations from localStorage', e);
    }
    localStorage.setItem('japan_destinations_version', 'v2');
    return JAPAN_DESTINATIONS;
  });

  // Initial sync from Firestore if configured, plus periodic polling (every 10s)
  useEffect(() => {
    const db = firestore; // capture reference so TypeScript knows it's non-null inside async
    if (!db) return;
    let isMounted = true;

    const syncFromFirestore = async () => {
      try {
        const remoteDest = await db.getCollection<Destination>('destinations');
        if (isMounted && remoteDest && remoteDest.length > 0) {
          setDestinations(remoteDest);
        }
      } catch (e) {
        console.warn('Sync destinations error:', e);
      }
    };

    syncFromFirestore();
    const interval = setInterval(syncFromFirestore, 10000); // sync every 10 seconds across all devices

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('japan_destinations', JSON.stringify(destinations));
    } catch (e) {
      console.error('Failed to save destinations to localStorage', e);
    }
  }, [destinations]);

  const addDestination = (destination: Destination) => {
    setDestinations((prev) => [destination, ...prev]);
    if (firestore) {
      firestore.setDocument('destinations', destination.id, destination);
    }
    logSystemActivity('เพิ่มสถานที่ท่องเที่ยวใหม่', 'destination', destination.nameTh);
  };

  const updateDestination = (id: string, updated: Partial<Destination>) => {
    setDestinations((prev) =>
      prev.map((dest) => {
        if (dest.id === id) {
          const newDoc = { ...dest, ...updated };
          if (firestore) {
            firestore.setDocument('destinations', id, newDoc);
          }
          return newDoc;
        }
        return dest;
      })
    );
    const target = destinations.find((d) => d.id === id);
    if (target) {
      logSystemActivity('แก้ไขข้อมูลสถานที่ท่องเที่ยว', 'destination', target.nameTh);
    }
  };

  const deleteDestination = (id: string) => {
    const target = destinations.find((d) => d.id === id);
    setDestinations((prev) => prev.filter((dest) => dest.id !== id));
    if (firestore) {
      firestore.deleteDocument('destinations', id);
    }
    if (target) {
      logSystemActivity('ลบสถานที่ท่องเที่ยว', 'destination', target.nameTh);
    }
  };

  const resetDestinations = () => {
    setDestinations(JAPAN_DESTINATIONS);
    localStorage.removeItem('japan_destinations');
    logSystemActivity('คืนค่าฐานข้อมูลสถานที่ท่องเที่ยวเป็นค่าเริ่มต้น', 'destination', 'Default Data');
  };

  return (
    <DestinationContext.Provider
      value={{
        destinations,
        addDestination,
        updateDestination,
        deleteDestination,
        resetDestinations,
      }}
    >
      {children}
    </DestinationContext.Provider>
  );
};

export const useDestinations = () => {
  const ctx = useContext(DestinationContext);
  if (!ctx) {
    throw new Error('useDestinations must be used within DestinationProvider');
  }
  return ctx;
};
