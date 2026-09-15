import React, { useState, useEffect } from 'react';
import { api } from './api';
import { useLanguage } from './LanguageContext';
import { UserCheck, Plus, Search, Trash2, Edit2, X, Save, Link as LinkIcon, ListChecks, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProxyItem {
  id: number;
  ip: string;
  port: string;
  username: string;
}

interface WebsiteItem {
  id: number;
  name: string;
  url: string;
}

interface LocationItem {
  id: number;
  state: string;
  location: string;
}

interface ProfileWebsiteAccount {
  id: number;
  website_id: number;
  email: string;
  password: string;
  cookie?: string;
  website?: WebsiteItem;
}

interface ProfileItem {
  id: number;
  name: string;
  lastname: string;
  username?: string;
  website?: string;
  pronouns?: string;
  company_basic?: string;
  location_basic?: string;
  social_accounts?: string;
  topic_about_you?: string;
  profile_credential?: string;
  description_html?: string;
  gmail?: string;
  gmail_password?: string;
  email_recovery?: string;
  profile_email?: string;
  profile_email_password?: string;
  bio?: string;
  img?: string;
  pais_iso?: string;
  mes_nac?: number;
  year_nac?: number;
  day_nac?: number;
  gender?: string;
  time_zone?: string;
  proxy_id?: number | null;
  location_id?: number | null;
  empleo?: string;
  educacion?: string;
  ubicacion?: string;
  two_fa?: string;
  telefono?: string;
  proxy?: ProxyItem;
  location?: LocationItem;
  profile_websites?: ProfileWebsiteAccount[];
}

const Profiles: React.FC = () => {
  const { t } = useLanguage();
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [websites, setWebsites] = useState<WebsiteItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Quick Modal for adding a website account to a specific profile
  const [addingSiteToProfile, setAddingSiteToProfile] = useState<ProfileItem | null>(null);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState('');
  const [siteEmail, setSiteEmail] = useState('');
  const [sitePassword, setSitePassword] = useState('');
  const [siteCookie, setSiteCookie] = useState('');
  const [modalError, setModalError] = useState('');

  const fetchProfiles = async (searchQuery = '') => {
    try {
      const res = await api.get(`/profiles${searchQuery ? `?search=${searchQuery}` : ''}`);
      setProfiles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWebsites = async () => {
    try {
      const res = await api.get('/websites');
      setWebsites(res.data);
      if (res.data.length > 0) {
        setSelectedWebsiteId(String(res.data[0].id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfiles();
    fetchWebsites();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProfiles(search);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este perfil?')) return;
    try {
      await api.delete(`/profiles/${id}`);
      fetchProfiles(search);
    } catch (err) {
      console.error(err);
    }
  };

  const openAddSiteModal = (profile: ProfileItem) => {
    setAddingSiteToProfile(profile);
    setSiteEmail(profile.profile_email || profile.gmail || '');
    setSitePassword('');
    setSiteCookie('');
    setModalError('');
  };

  const handleCreateProfileSiteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingSiteToProfile || !selectedWebsiteId) return;
    setModalError('');

    try {
      await api.post('/websites/accounts', {
          profile_id: addingSiteToProfile.id,
          website_id: Number(selectedWebsiteId),
          email: siteEmail,
          password: sitePassword,
          cookie: siteCookie,
        });

      setAddingSiteToProfile(null);
      fetchProfiles(search);
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Error al vincular sitio web al perfil.');
    }
  };



  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1>{t('profiles_title')}</h1>
          <p className="subtitle" style={{ textAlign: 'left', margin: 0 }}>
            {t('profiles_subtitle')}
          </p>
        </div>
        <Link to="/profiles/new" className="btn btn-primary">
          <Plus size={18} /> {t('new_profile')}
        </Link>
      </div>

      {/* Buscador */}
      <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '2.75rem' }}
            placeholder="Buscar por nombre, correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-secondary">
          Buscar
        </button>
      </form>

      {/* VISTA EN FORMATO DE TABLA */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          {t('loading')}
        </div>
      ) : profiles.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <UserCheck size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3>{t('profiles_empty_title')}</h3>
          <p style={{ margin: '0.5rem 0 1.5rem' }}>{t('profiles_empty_text')}</p>
          <Link to="/profiles/new" className="btn btn-primary">
            <Plus size={18} /> {t('new_profile')}
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--surface-hover)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nombre Completo</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Gmail</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Proxy Asignado</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ubicación</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>País</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>#{p.id}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                      {p.name} {p.lastname}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {p.gmail || '-'}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                    {p.proxy ? (
                      <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
                        {p.proxy.ip}:{p.proxy.port}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Sin Proxy</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                    {p.location ? (
                      <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                        {p.location.location} ({p.location.state})
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Sin Ubicación</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {p.pais_iso || '-'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <Link
                        to={`/profiles/${p.id}/activities`}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', background: '#2563eb', color: 'white', borderColor: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        title="Ver y Gestionar Actividades"
                      >
                        <ListChecks size={14} /> Actividades
                      </Link>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                        title="Vincular Sitio Web"
                        onClick={() => openAddSiteModal(p)}
                      >
                        <LinkIcon size={14} /> Vincular
                      </button>
                      <Link
                        to={`/profiles/${p.id}/edit`}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        title="Editar Perfil"
                      >
                        <Edit2 size={14} /> Editar
                      </Link>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                        title="Eliminar Perfil"
                        onClick={() => handleDelete(p.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para Vincular Sitio Web */}
      {addingSiteToProfile && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2>Vincular Sitio Web a {addingSiteToProfile.name}</h2>
              <button className="modal-close" onClick={() => setAddingSiteToProfile(null)}>
                <X size={20} />
              </button>
            </div>
            {modalError && (
              <div className="error-message" style={{ margin: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} /> {modalError}
              </div>
            )}
            <form onSubmit={handleCreateProfileSiteAccount} className="modal-body">
              <div className="form-group">
                <label>Selecciona Sitio Web</label>
                <select
                  className="input-field"
                  value={selectedWebsiteId}
                  onChange={(e) => setSelectedWebsiteId(e.target.value)}
                  required
                >
                  {websites.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.url})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Email o Usuario en Sitio Web</label>
                <input
                  type="email"
                  className="input-field"
                  value={siteEmail}
                  onChange={(e) => setSiteEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Contraseña en Sitio Web</label>
                <input
                  type="password"
                  className="input-field"
                  value={sitePassword}
                  onChange={(e) => setSitePassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Cookie (Opcional)</label>
                <textarea
                  className="input-field"
                  value={siteCookie}
                  onChange={(e) => setSiteCookie(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="modal-footer" style={{ padding: 0, marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setAddingSiteToProfile(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} /> Vincular Sitio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profiles;
