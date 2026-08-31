import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from './api';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { UserCheck, Server, PlusCircle, Globe, Users, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, token, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>{t('dashboard_loading_stats')}</div>;

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>{t('dashboard_title')}</h1>
          <p className="subtitle" style={{ textAlign: 'left', margin: 0 }}>{t('dashboard_welcome')}, {user?.name || user?.email}</p>
        </div>
      </div>

      <div className="stats-grid">
        {isAdmin && stats?.users !== undefined && (
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#f97316' }}>
              <Users size={22} />
            </div>
            <div className="stat-info">
              <h3>{stats.users}</h3>
              <p>{t('dashboard_users')}</p>
            </div>
          </div>
        )}

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#fb923c' }}>
            <UserCheck size={22} />
          </div>
          <div className="stat-info">
            <h3>{stats?.profiles || 0}</h3>
            <p>{t('dashboard_profiles')}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <Server size={22} />
          </div>
          <div className="stat-info">
            <h3>{stats?.proxies || 0}</h3>
            <p>{t('dashboard_proxies')}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
            <Globe size={22} />
          </div>
          <div className="stat-info">
            <h3>{stats?.websites || 0}</h3>
            <p>{t('dashboard_websites')} ({stats?.websiteAccounts || 0} {t('dashboard_accounts')})</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2.5rem' }}>
        <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: 'var(--text)' }}>{t('dashboard_quick_actions')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          <Link to="/profiles/new" className="btn btn-secondary" style={{ padding: '1rem', justifyContent: 'flex-start' }}>
            <PlusCircle size={18} style={{ color: 'var(--primary)' }} />
            <span>{t('dashboard_new_profile')}</span>
          </Link>
          <Link to="/proxies/new" className="btn btn-secondary" style={{ padding: '1rem', justifyContent: 'flex-start' }}>
            <PlusCircle size={18} style={{ color: '#a855f7' }} />
            <span>{t('dashboard_new_proxy')}</span>
          </Link>
          <Link to="/linked-profiles" className="btn btn-secondary" style={{ padding: '1rem', justifyContent: 'flex-start' }}>
            <LinkIcon size={18} style={{ color: 'var(--primary)' }} />
            <span>{t('dashboard_linked_profiles')}</span>
          </Link>
          {isAdmin && (
            <Link to="/websites" className="btn btn-secondary" style={{ padding: '1rem', justifyContent: 'flex-start' }}>
              <Globe size={18} style={{ color: '#22c55e' }} />
              <span>{t('dashboard_website_catalog')}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
