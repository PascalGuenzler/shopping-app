const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include', // always send cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Fehler');
  return data;
}

export const api = {
  // Auth
  register: (username, password) =>
    request('/auth/register', { method: 'POST', body: { username, password } }),
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: { username, password } }),
  logout: () =>
    request('/auth/logout', { method: 'POST' }),
  me: () =>
    request('/auth/me'),

  // Items
  getItems: () => request('/items'),
  addItem: (text, quantity, saveFavorite) =>
    request('/items', { method: 'POST', body: { text, quantity, saveFavorite } }),
  claimItem: (id) => request(`/items/${id}/claim`, { method: 'PATCH' }),
  doneItem: (id) => request(`/items/${id}/done`, { method: 'PATCH' }),
  deleteItem: (id) => request(`/items/${id}`, { method: 'DELETE' }),

  // Favorites
  getFavorites: () => request('/favorites'),
  addFavorite: (text) => request('/favorites', { method: 'POST', body: { text } }),
  deleteFavorite: (id) => request(`/favorites/${id}`, { method: 'DELETE' }),

  // Push
  getVapidKey: () => request('/push/vapid-key'),
  subscribePush: (subscription) =>
    request('/push/subscribe', { method: 'POST', body: { subscription } }),
  unsubscribePush: (subscription) =>
    request('/push/unsubscribe', { method: 'POST', body: { subscription } }),
};
