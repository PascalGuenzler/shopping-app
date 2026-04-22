import { useState, useEffect } from 'react'
import LoginForm from './components/LoginForm'
import ShoppingList from './components/ShoppingList'
import { api } from './api'

function App() {
  const [username, setUsername] = useState(null);
  const [checking, setChecking] = useState(true); // checking existing session

  // On mount: check if a valid cookie session exists
  useEffect(() => {
    api.me()
      .then((data) => setUsername(data.username))
      .catch(() => {}) // no session → stay on login
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = (name) => {
    setUsername(name);
  };

  const handleLogout = async () => {
    try { await api.logout(); } catch {}
    setUsername(null);
  };

  // Show nothing while checking session to avoid flash of login screen
  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-4xl">🛒</div>
      </div>
    );
  }

  if (!username) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <ShoppingList username={username} onLogout={handleLogout} />;
}

export default App
