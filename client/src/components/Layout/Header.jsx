import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineSearch, HiOutlineBell, HiOutlineCog } from 'react-icons/hi';

export default function Header() {
  const { user } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <header className="header">
      <div className="header-left">
        <span className="header-logo">Ethara AI</span>
        <div className="search-box">
          <HiOutlineSearch style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search projects or team members..." />
        </div>
      </div>
      <div className="header-right" style={{ position: 'relative' }} onMouseLeave={() => { setShowNotif(false); setShowSettings(false); }}>
        <button className="icon-btn" onMouseEnter={() => { setShowNotif(true); setShowSettings(false); }}>
          <HiOutlineBell />
        </button>
        {showNotif && (
          <div style={{ position: 'absolute', top: 50, right: 80, width: 280, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8, padding: 16, zIndex: 100, boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem' }}>Notifications</h4>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '12px 0', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
              You're all caught up!
            </div>
          </div>
        )}

        <button className="icon-btn" onMouseEnter={() => { setShowSettings(true); setShowNotif(false); }}>
          <HiOutlineCog />
        </button>
        {showSettings && (
          <div style={{ position: 'absolute', top: 50, right: 40, width: 200, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8, padding: 8, zIndex: 100, boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer', borderRadius: 4, transition: '0.2s' }} className="hover-bg">Profile Settings</div>
            <div style={{ padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer', borderRadius: 4, transition: '0.2s' }} className="hover-bg">Workspace Preferences</div>
            <div style={{ padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer', borderRadius: 4, transition: '0.2s', color: 'var(--text-muted)' }} className="hover-bg">Billing (Enterprise)</div>
          </div>
        )}

        <div className="user-avatar" title={user?.name}>{initials}</div>
      </div>
    </header>
  );
}
