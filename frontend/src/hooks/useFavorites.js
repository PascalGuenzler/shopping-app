import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);

  const load = useCallback(async () => {
    try {
      const data = await api.getFavorites();
      setFavorites(data);
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const addFavorite = async (text) => {
    try {
      const fav = await api.addFavorite(text);
      setFavorites((prev) => {
        if (prev.find(f => f.text === text)) return prev;
        return [...prev, fav].sort((a, b) => a.text.localeCompare(b.text));
      });
      return fav;
    } catch {
      // already exists or other error – reload from server
      load();
    }
  };

  const deleteFavorite = async (id) => {
    await api.deleteFavorite(id);
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  return { favorites, addFavorite, deleteFavorite, reloadFavorites: load };
}
