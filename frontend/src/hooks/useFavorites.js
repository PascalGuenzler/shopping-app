import { useState, useEffect } from 'react';
import { api } from '../api';

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    api.getFavorites().then(setFavorites).catch(() => {});
  }, []);

  const addFavorite = async (text) => {
    const fav = await api.addFavorite(text);
    setFavorites((prev) => [...prev, fav].sort((a, b) => a.text.localeCompare(b.text)));
    return fav;
  };

  const deleteFavorite = async (id) => {
    await api.deleteFavorite(id);
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  return { favorites, addFavorite, deleteFavorite };
}
