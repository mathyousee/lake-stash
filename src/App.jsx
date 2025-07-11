import React, { useState, useEffect } from 'react';
import './App.css'
import InventoryApp from './components/InventoryApp';
import LoginPrompt from './components/LoginPrompt';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/user');
      const data = await response.json();
      
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {user ? (
        <InventoryApp user={user} onLogout={() => setUser(null)} />
      ) : (
        <LoginPrompt onLogin={checkAuthStatus} />
      )}
    </div>
  );
}

export default App
