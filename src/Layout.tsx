import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { Home, UserCheck, Server, User, LogOut, Bot, Globe, Users, Menu, X, Link as LinkIcon, PlayCircle, Languages, MapPin, Archive, Tag, Layers } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, isAdmin } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="layout">
      {/* Mobile menu button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar overlay for mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
      />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          <Bot size={24} style={{ color: 'var(--primary)' }} />
          <span>MoshiAdmin</span>
        </div>

        {/* Language Switcher */}
        <div style={{ padding: '0 1rem 1rem 1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => setLanguage('es')}
            style={{
              flex: 1,
              padding: '0.35rem 0.5rem',
              borderRadius: '0.375rem',
              border: '1px solid var(--border-color, #333)',
              background: language === 'es' ? 'var(--primary, #6366f1)' : 'transparent',
              color: language === 'es' ? 'white' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
            }}
          >
            <Languages size={14} /> ES
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            style={{
              flex: 1,
              padding: '0.35rem 0.5rem',
              borderRadius: '0.375rem',
              border: '1px solid var(--border-color, #333)',
              background: language === 'en' ? 'var(--primary, #6366f1)' : 'transparent',
              color: language === 'en' ? 'white' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
            }}
          >
            <Languages size={14} /> EN
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeSidebar} end>
            <Home size={18} /> {t('nav_dashboard')}
          </NavLink>
          <NavLink to="/profiles" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <UserCheck size={18} /> {t('nav_profiles')}
          </NavLink>
          <NavLink to="/profiles/archived" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <Archive size={18} /> {t('nav_archived_profiles')}
          </NavLink>
          <NavLink to="/tags" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <Tag size={18} /> {t('nav_tags')}
          </NavLink>
          <NavLink to="/proxies" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <Server size={18} /> {t('nav_proxies')}
          </NavLink>
          <NavLink to="/locations" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <MapPin size={18} /> {t('nav_locations') || 'Ubicaciones'}
          </NavLink>
          <NavLink to="/bulk-operations" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <Layers size={18} /> {t('nav_bulk_operations')}
          </NavLink>
          <NavLink to="/linked-profiles" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <LinkIcon size={18} /> {t('nav_linked')}
          </NavLink>
          <NavLink to="/automations" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <PlayCircle size={18} /> {t('nav_automations')}
          </NavLink>
          {isAdmin && (
            <NavLink to="/websites" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
              <Globe size={18} /> {t('nav_websites')}
            </NavLink>
          )}
          <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <User size={18} /> {t('tab_basic').replace(' *', '')}
          </NavLink>

          {isAdmin && (
            <NavLink to="/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
              <Users size={18} /> Usuarios
            </NavLink>
          )}
        </nav>
        <button className="sidebar-link logout-btn" onClick={handleLogout} style={{ border: 'none', background: 'transparent', cursor: 'pointer', width: '100%', textAlign: 'left', color: 'var(--error)' }}>
          <LogOut size={18} /> {t('logout')}
        </button>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
