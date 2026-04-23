import { useState, useRef, useEffect } from 'react';

export default function AddItemModal({ onClose, onAdd, favorites, onDeleteFavorite }) {
  const [text, setText] = useState('');
  const [quantity, setQuantity] = useState('');
  const [saveFavorite, setSaveFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Focus input after mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const submit = async (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    setError('');
    setLoading(true);
    try {
      await onAdd(text.trim(), quantity.trim(), saveFavorite);
      onClose();
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  const quickAdd = async (favText) => {
    setLoading(true);
    try {
      await onAdd(favText, '', false);
      onClose();
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Sheet – sits just above keyboard thanks to interactive-widget=resizes-content in <meta viewport> */}
      <div className="relative w-full bg-white rounded-t-3xl shadow-2xl">
        {/* Scrollable content area */}
        <div className="overflow-y-auto max-h-[85vh] p-6 pb-8">
          {/* Handle */}
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />

          <h2 className="text-lg font-bold text-gray-800 mb-4">Was brauchst du?</h2>

          <form onSubmit={submit} className="space-y-3">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Artikel eingeben..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Menge (optional, z.B. 1L, 500g, 2x)"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            {/* Save as favorite */}
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={saveFavorite}
                onChange={(e) => setSaveFavorite(e.target.checked)}
                className="w-4 h-4 accent-green-600 rounded"
              />
              Als Favorit speichern
            </label>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-40"
            >
              {loading ? 'Wird hinzugefügt...' : 'Hinzufügen'}
            </button>
          </form>

          {/* Favorites */}
          {favorites.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Schnell hinzufügen
              </p>
              <div className="flex flex-wrap gap-2">
                {favorites.map((fav) => (
                  <div key={fav.id} className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-full">
                    <button
                      type="button"
                      onClick={() => quickAdd(fav.text)}
                      disabled={loading}
                      className="pl-3 pr-1 py-1.5 text-sm text-green-800 font-medium"
                    >
                      {fav.text}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteFavorite(fav.id)}
                      className="pr-2 text-green-400 hover:text-red-400 text-xs"
                      title="Favorit löschen"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
