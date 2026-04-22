import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

export function useItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await api.getItems();
      setItems(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Poll every 15 seconds for updates from other users
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  const addItem = async (text, quantity, saveFavorite) => {
    const item = await api.addItem(text, quantity, saveFavorite);
    setItems((prev) => [item, ...prev]);
    return item;
  };

  const claimItem = async (id) => {
    const updated = await api.claimItem(id);
    setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
  };

  const doneItem = async (id) => {
    const updated = await api.doneItem(id);
    setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
  };

  const deleteItem = async (id) => {
    await api.deleteItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return { items, loading, error, reload: load, addItem, claimItem, doneItem, deleteItem };
}
