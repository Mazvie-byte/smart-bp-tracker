import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import LoginPage from './components/LoginPage'
import Navbar from './components/Navbar'
import DashboardPage from './pages/DashboardPage'
import CoachingPage from './pages/CoachingPage'
import ChatCoachPage from './pages/ChatCoachPage'

function App() {
  const [user, setUser] = useState(null);
  const [showLanding, setShowLanding] = useState(true);

  // Check localStorage for saved session on mount
  useEffect(() => {
    const saved = localStorage.getItem('bp_username');
    if (saved) {
      setUser(saved);
      setShowLanding(false);
    }
  }, []);

  const handleLogin = (name) => {
    setUser(name);
    setShowLanding(false);
  };

  const handleLogout = () => {
    setUser(null);
    setShowLanding(false);
    localStorage.removeItem('bp_username');
  };

  if (showLanding && !user) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="app-layout">
      <Navbar user={user} onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<DashboardPage user={user} />} />
          <Route path="/coaching" element={<CoachingPage user={user} />} />
          <Route path="/ai-coach" element={<ChatCoachPage user={user} />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
