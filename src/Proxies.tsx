import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { Server, Plus, Search, Trash2, Edit2, X, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProxyItem {
  id: number;
  ip: string;
  port: string;
  username: string;
  password: string;
}

const Proxies: React.FC = () => {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [proxies, setProxies] = useState<ProxyItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingProxy, setEditingProxy] = useState<ProxyItem | null>(null);

  const fetchProxies = async (searchQuery = '') => {
    try {
      const res = await axios.get(
        `http://localhost:3001/proxies${searchQuery ? `?search=${searchQuery}` : ''}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProxies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProxies();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProxies(search);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este proxy?')) return;
    try {
      await axios.delete(`http://localhost:3001/proxies/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProxies(proxies.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProxy) return;
    try {
      await axios.patch(
        `http://localhost:3001/proxies/${editingProxy.id}`,
        {
          ip: editingProxy.ip,
          port: editingProxy.port,
          username: editingProxy.username,
          password: editingProxy.password,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingProxy(null);
      fetchProxies(search);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>{t('proxies_title')}</h1>
          <p className="subtitle" style={{ textAlign: 'left', margin: 0 }}>{t('proxies_subtitle')}</p>
        </div>
        <Link to="/proxies/new" style={{ textDecoration: 'none' }}>
          <button style={{ width: 'auto', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> {t('new_proxy')}
          </button>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="search-bar">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder={`${t('search')}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      {loading ? (
        <div>{t('loading')}</div>
      ) : proxies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          {t('proxies_empty_title')}. <Link to="/proxies/new">{t('new_proxy')}</Link>
        </div>
      ) : (
        <div className="list-container">
          {proxies.map((proxy) => (
            <div key={proxy.id} className="item-card">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <Server size={22} color="var(--primary)" />
                  <h3 style={{ margin: 0 }}>{proxy.ip}:{proxy.port}</h3>
                </div>
                <p style={{ margin: '0.5rem 0' }}>
                  <strong>{t('user_label')}:</strong> {proxy.username || t('no_user')}
                </p>
              </div>
              <div className="card-actions">
                <button className="edit-btn" onClick={() => setEditingProxy(proxy)}>
                  <Edit2 size={16} /> Editar
                </button>
                <button className="delete-btn" onClick={() => handleDelete(proxy.id)}>
                  <Trash2 size={16} /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingProxy && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Editar Proxy #{editingProxy.id}</h2>
              <X size={24} style={{ cursor: 'pointer' }} onClick={() => setEditingProxy(null)} />
            </div>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>IP</label>
                <input
                  type="text"
                  value={editingProxy.ip}
                  onChange={(e) => setEditingProxy({ ...editingProxy, ip: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Puerto</label>
                <input
                  type="text"
                  value={editingProxy.port}
                  onChange={(e) => setEditingProxy({ ...editingProxy, port: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={editingProxy.username}
                  onChange={(e) => setEditingProxy({ ...editingProxy, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={editingProxy.password}
                  onChange={(e) => setEditingProxy({ ...editingProxy, password: e.target.value })}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setEditingProxy(null)}>
                  Cancelar
                </button>
                <button type="submit" style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Save size={18} /> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Proxies;
