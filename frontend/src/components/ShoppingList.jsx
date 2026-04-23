import { useState } from 'react';
import ItemCard from './ItemCard';
import AddItemModal from './AddItemModal';
import { useItems } from '../hooks/useItems';
import { useFavorites } from '../hooks/useFavorites';

export default function ShoppingList({ username, onLogout }) {
  const { items, loading, error, reload, addItem, claimItem, doneItem, deleteItem } = useItems();
  const { favorites, addFavorite, deleteFavorite, reloadFavorites } = useFavorites();
  const [showModal, setShowModal] = useState(false);

  // Categorize items
  const myItems = items.filter(
    (i) => i.created_by_name === username && i.status !== 'done'
  );
  const othersOpen = items.filter(
    (i) => i.created_by_name !== username && i.status === 'open'
  );
  const claimedByMe = items.filter(
    (i) => i.claimed_by_name === username && i.created_by_name !== username && i.status === 'claimed'
  );
  const claimedByOthers = items.filter(
    (i) => i.claimed_by_name && i.claimed_by_name !== username && i.status === 'claimed'
  );
  const doneItems = items.filter((i) => i.status === 'done');

  const handleAdd = async (text, quantity, saveFavorite) => {
    await addItem(text, quantity, saveFavorite);
    if (saveFavorite) {
      // Force reload from server so the new favorite appears immediately
      await reloadFavorites();
    }
  };

  const openModal = () => {
    document.body.classList.add('modal-open');
    setShowModal(true);
  };

  const closeModal = () => {
    document.body.classList.remove('modal-open');
    setShowModal(false);
  };

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-green-600 text-white px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛒</span>
          <h1 className="font-bold text-lg">Einkaufsliste</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={reload} className="text-green-100 hover:text-white text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={onLogout}
            className="text-sm text-green-100 hover:text-white font-medium"
          >
            {username} ↩
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28 space-y-5">
        {loading && (
          <div className="text-center py-12 text-gray-400">Lade Liste...</div>
        )}
        {error && (
          <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        {/* My open items */}
        {myItems.length > 0 && (
          <Section title="Meine Artikel" color="blue">
            {myItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                currentUser={username}
                onClaim={claimItem}
                onDone={doneItem}
                onDelete={deleteItem}
              />
            ))}
          </Section>
        )}

        {/* Claimed by me (from others) */}
        {claimedByMe.length > 0 && (
          <Section title="Ich bringe mit" color="green">
            {claimedByMe.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                currentUser={username}
                onClaim={claimItem}
                onDone={doneItem}
                onDelete={deleteItem}
              />
            ))}
          </Section>
        )}

        {/* Others open items */}
        {othersOpen.length > 0 && (
          <Section title="Von anderen" color="gray">
            {othersOpen.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                currentUser={username}
                onClaim={claimItem}
                onDone={doneItem}
                onDelete={deleteItem}
              />
            ))}
          </Section>
        )}

        {/* Claimed by others */}
        {claimedByOthers.length > 0 && (
          <Section title="Jemand bringt mit" color="orange">
            {claimedByOthers.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                currentUser={username}
                onClaim={claimItem}
                onDone={doneItem}
                onDelete={deleteItem}
              />
            ))}
          </Section>
        )}

        {/* Done items */}
        {doneItems.length > 0 && (
          <Section title="Erledigt" color="done">
            {doneItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                currentUser={username}
                onClaim={claimItem}
                onDone={doneItem}
                onDelete={deleteItem}
              />
            ))}
          </Section>
        )}

        {/* Empty state */}
        {!loading && items.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🛍️</div>
            <p className="text-gray-500 font-medium">Liste ist leer</p>
            <p className="text-gray-400 text-sm mt-1">Füge den ersten Artikel hinzu!</p>
          </div>
        )}
      </div>

      {/* FAB - Add Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4">
        <button
          onClick={openModal}
          className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2 text-base"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Artikel hinzufügen
        </button>
      </div>

      {/* Add Modal */}
      {showModal && (
        <AddItemModal
          onClose={closeModal}
          onAdd={handleAdd}
          favorites={favorites}
          onDeleteFavorite={deleteFavorite}
        />
      )}
    </div>
  );
}

function Section({ title, color, children }) {
  const colors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    gray: 'text-gray-500',
    orange: 'text-orange-500',
    done: 'text-gray-400',
  };

  return (
    <div>
      <h2 className={`text-xs font-bold uppercase tracking-wider mb-2 px-1 ${colors[color]}`}>
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
