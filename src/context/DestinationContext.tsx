import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Destination } from '../types';
import { JAPAN_DESTINATIONS } from '../data/japanData';
import { useAuth } from './AuthContext';

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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load destinations from localStorage', e);
    }
    return JAPAN_DESTINATIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('japan_destinations', JSON.stringify(destinations));
    } catch (e) {
      console.error('Failed to save destinations to localStorage', e);
    }
  }, [destinations]);

  const addDestination = (destination: Destination) => {
    setDestinations((prev) => [destination, ...prev]);
    logSystemActivity('เพิ่มสถานที่ท่องเที่ยวใหม่', 'destination', destination.nameTh);
  };

  const updateDestination = (id: string, updated: Partial<Destination>) => {
    setDestinations((prev) =>
      prev.map((dest) => (dest.id === id ? { ...dest, ...updated } : dest))
    );
    const target = destinations.find((d) => d.id === id);
    if (target) {
      logSystemActivity('แก้ไขข้อมูลสถานที่ท่องเที่ยว', 'destination', target.nameTh);
    }
  };

  const deleteDestination = (id: string) => {
    const target = destinations.find((d) => d.id === id);
    setDestinations((prev) => prev.filter((dest) => dest.id !== id));
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
