import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

interface SavedContextType {
  savedIds: number[];
  isSaved: (id: number) => boolean;
  toggleSave: (id: number) => Promise<void>;
  loading: boolean;
}

const SavedContext = createContext<SavedContextType | null>(null);

export const SavedProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingIds, setProcessingIds] = useState<number[]>([]); 

  useEffect(() => {
    if (isAuthenticated) {
      const fetchSavedIds = async () => {
        try {
          const res = await api.get('/saved-doctors/');
          // Map response to just IDs (adjust based on your actual API response structure)
          const ids = res.data.map((item: any) => item.doctor || item.id);
          setSavedIds(ids);
        } catch (err) {
          console.error("Failed to fetch saved list", err);
        }
      };
      fetchSavedIds();
    } else {
      setSavedIds([]);
    }
  }, [isAuthenticated]);

  const isSaved = (id: number) => savedIds.includes(id);

  const toggleSave = async (doctorId: number) => {
    if (!isAuthenticated) return;

    if (processingIds.includes(doctorId)) return;
    setProcessingIds(prev => [...prev, doctorId]);

    // Optimistic Update
    const wasSaved = savedIds.includes(doctorId);
    setSavedIds(prev => 
      wasSaved ? prev.filter(id => id !== doctorId) : [...prev, doctorId]
    );

    try {
      // --- THE FIX IS HERE: USE THE TOGGLE ENDPOINT ---
      await api.post('/saved-doctors/toggle/', { doctor_id: doctorId });
    } catch (err) {
      console.error("Save failed", err);
      // Revert if failed
      setSavedIds(prev => 
        wasSaved ? [...prev, doctorId] : prev.filter(id => id !== doctorId)
      );
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== doctorId));
    }
  };

  return (
    <SavedContext.Provider value={{ savedIds, isSaved, toggleSave, loading }}>
      {children}
    </SavedContext.Provider>
  );
};

export const useSaved = () => {
  const context = useContext(SavedContext);
  if (!context) throw new Error('useSaved must be used within SavedProvider');
  return context;
};