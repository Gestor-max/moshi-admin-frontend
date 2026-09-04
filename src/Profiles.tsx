import React, { useState, useEffect } from 'react';
import { api } from './api';
import { useLanguage } from './LanguageContext';
import { UserCheck, Plus, Search, Trash2, Edit2, X, Save, AlertCircle, Link as LinkIcon, Briefcase, GraduationCap, MapPin, Key, User } from 'lucide-react';
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
  empleo?: string;
  educacion?: string;
  ubicacion?: string;
  proxy?: ProxyItem;
  profile_websites?: ProfileWebsiteAccount[];
}

type TabType = 'basica' | 'credenciales' | 'empleo' | 'educacion' | 'ubicacion';

const Profiles: React.FC = () => {
  const { t } = useLanguage();
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [proxies, setProxies] = useState<ProxyItem[]>([]);
  const [websites, setWebsites] = useState<WebsiteItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState<ProfileItem | null>(null);
  const [editTab, setEditTab] = useState<TabType>('basica');

  // Json edit states
  const [editEmpleo, setEditEmpleo] = useState({ position: '', company: '', start_year: '', end_year: '', currently_work_here: true });
  const [editEducacion, setEditEducacion] = useState({ school: '', primary_major: '', secondary_major: '', degree_type: '', graduation_year: '' });
  const [editUbicacion, setEditUbicacion] = useState({ location: '', start_year: '', end_year: '', currently_live_here: true });

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

  const fetchProxies = async () => {
    try {
      const res = await api.get('/proxies');
      setProxies(res.data);
    } catch (err) {
      console.error(err);
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
    fetchProxies();
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

  const startEditProfile = (profile: ProfileItem) => {
    setEditingProfile(profile);
    setEditTab('basica');

    try {
      setEditEmpleo(profile.empleo ? JSON.parse(profile.empleo) : { position: '', company: '', start_year: '', end_year: '', currently_work_here: true });
    } catch {
      setEditEmpleo({ position: '', company: '', start_year: '', end_year: '', currently_work_here: true });
    }

    try {
      setEditEducacion(profile.educacion ? JSON.parse(profile.educacion) : { school: '', primary_major: '', secondary_major: '', degree_type: '', graduation_year: '' });
    } catch {
      setEditEducacion({ school: '', primary_major: '', secondary_major: '', degree_type: '', graduation_year: '' });
    }

    try {
      setEditUbicacion(profile.ubicacion ? JSON.parse(profile.ubicacion) : { location: '', start_year: '', end_year: '', currently_live_here: true });
    } catch {
      setEditUbicacion({ location: '', start_year: '', end_year: '', currently_live_here: true });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;

    if (!editingProfile.name?.trim() || !editingProfile.lastname?.trim()) {
      alert('Nombre y Apellido son requeridos');
      setEditTab('basica');
      return;
    }

    try {
      await api.patch(`/profiles/${editingProfile.id}`, {
          ...editingProfile,
          proxy_id: editingProfile.proxy_id ? Number(editingProfile.proxy_id) : null,
          empleo: JSON.stringify(editEmpleo),
          educacion: JSON.stringify(editEducacion),
          ubicacion: JSON.stringify(editUbicacion),
        });
      setEditingProfile(null);
      fetchProfiles(search);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al actualizar perfil');
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
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {p.pais_iso || '-'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                        title="Vincular Sitio Web"
                        onClick={() => openAddSiteModal(p)}
                      >
                        <LinkIcon size={14} /> Vincular
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                        title="Editar Perfil"
                        onClick={() => startEditProfile(p)}
                      >
                        <Edit2 size={14} /> Editar
                      </button>
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

      {/* MODAL PARA EDITAR PERFIL CON TABS */}
      {editingProfile && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2>Editar Perfil #{editingProfile.id}</h2>
              <button className="modal-close" onClick={() => setEditingProfile(null)}>
                <X size={20} />
              </button>
            </div>

            {/* TABS NAVEGACIÓN EN MODAL */}
            <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid var(--border)', padding: '0.75rem 1.5rem 0', overflowX: 'auto' }}>
              <button
                type="button"
                className={`btn ${editTab === 'basica' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                onClick={() => setEditTab('basica')}
              >
                <User size={14} /> Básica *
              </button>
              <button
                type="button"
                className={`btn ${editTab === 'credenciales' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                onClick={() => setEditTab('credenciales')}
              >
                <Key size={14} /> Credenciales
              </button>
              <button
                type="button"
                className={`btn ${editTab === 'empleo' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                onClick={() => setEditTab('empleo')}
              >
                <Briefcase size={14} /> Empleo
              </button>
              <button
                type="button"
                className={`btn ${editTab === 'educacion' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                onClick={() => setEditTab('educacion')}
              >
                <GraduationCap size={14} /> Educación
              </button>
              <button
                type="button"
                className={`btn ${editTab === 'ubicacion' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                onClick={() => setEditTab('ubicacion')}
              >
                <MapPin size={14} /> Ubicación
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="modal-body" style={{ paddingTop: '1.25rem' }}>
              {editTab === 'basica' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Nombre <span style={{ color: 'var(--error)' }}>*</span></label>
                    <input
                      type="text"
                      className="input-field"
                      value={editingProfile.name}
                      onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Apellido <span style={{ color: 'var(--error)' }}>*</span></label>
                    <input
                      type="text"
                      className="input-field"
                      value={editingProfile.lastname}
                      onChange={(e) => setEditingProfile({ ...editingProfile, lastname: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      className="input-field"
                      value={editingProfile.username || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, username: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Website</label>
                    <input
                      type="text"
                      className="input-field"
                      value={editingProfile.website || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, website: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Pronouns</label>
                    <select
                      className="input-field"
                      value={editingProfile.pronouns || "Don't specify"}
                      onChange={(e) => setEditingProfile({ ...editingProfile, pronouns: e.target.value })}
                    >
                      <option value="Don't specify">Don't specify</option>
                      <option value="they/them">they/them</option>
                      <option value="she/her">she/her</option>
                      <option value="he/him">he/him</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Company (Empresa Básica)</label>
                    <input
                      type="text"
                      className="input-field"
                      value={editingProfile.company_basic || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, company_basic: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Location (Ubicación Básica)</label>
                    <input
                      type="text"
                      className="input-field"
                      value={editingProfile.location_basic || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, location_basic: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Profile Credential</label>
                    <input
                      type="text"
                      className="input-field"
                      value={editingProfile.profile_credential || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, profile_credential: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Topic About You</label>
                    <input
                      type="text"
                      className="input-field"
                      value={editingProfile.topic_about_you || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, topic_about_you: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Social Accounts (JSON Format)</label>
                    <textarea
                      className="input-field"
                      rows={2}
                      value={editingProfile.social_accounts || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, social_accounts: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Description HTML</label>
                    <textarea
                      className="input-field"
                      rows={3}
                      value={editingProfile.description_html || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, description_html: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Género</label>
                    <select
                      className="input-field"
                      value={editingProfile.gender || 'M'}
                      onChange={(e) => setEditingProfile({ ...editingProfile, gender: e.target.value })}
                    >
                      <option value="M">Masculino (M)</option>
                      <option value="F">Femenino (F)</option>
                      <option value="O">Otro (O)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>País ISO</label>
                    <input
                      type="text"
                      className="input-field"
                      value={editingProfile.pais_iso || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, pais_iso: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Proxy Asociado</label>
                    <select
                      className="input-field"
                      value={editingProfile.proxy_id || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, proxy_id: e.target.value ? Number(e.target.value) : null })}
                    >
                      <option value="">-- Sin Proxy --</option>
                      {proxies.map((p) => (
                        <option key={p.id} value={p.id}>
                          Proxy #{p.id} ({p.ip}:{p.port})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Zona Horaria</label>
                    <input
                      type="text"
                      className="input-field"
                      value={editingProfile.time_zone || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, time_zone: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Biografía (Bio Simple)</label>
                    <textarea
                      className="input-field"
                      rows={2}
                      value={editingProfile.bio || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, bio: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {editTab === 'credenciales' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Gmail</label>
                    <input
                      type="email"
                      className="input-field"
                      value={editingProfile.gmail || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, gmail: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Password Gmail</label>
                    <input
                      type="password"
                      className="input-field"
                      value={editingProfile.gmail_password || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, gmail_password: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Correo de Recuperación (Gmail)</label>
                    <input
                      type="email"
                      className="input-field"
                      value={editingProfile.email_recovery || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, email_recovery: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Perfil</label>
                    <input
                      type="email"
                      className="input-field"
                      value={editingProfile.profile_email || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, profile_email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Password Email Perfil</label>
                    <input
                      type="password"
                      className="input-field"
                      value={editingProfile.profile_email_password || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, profile_email_password: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {editTab === 'empleo' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Position (Puesto / Cargo)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="ej. Full Stack Programmer"
                      value={editEmpleo.position}
                      onChange={(e) => setEditEmpleo({ ...editEmpleo, position: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Company / Organization (Empresa)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="ej. Coca Cola"
                      value={editEmpleo.company}
                      onChange={(e) => setEditEmpleo({ ...editEmpleo, company: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Start Year (Año Inicio)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="ej. 2021"
                      value={editEmpleo.start_year}
                      onChange={(e) => setEditEmpleo({ ...editEmpleo, start_year: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Year (Año Fin)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="ej. Present"
                      disabled={editEmpleo.currently_work_here}
                      value={editEmpleo.currently_work_here ? 'Present' : editEmpleo.end_year}
                      onChange={(e) => setEditEmpleo({ ...editEmpleo, end_year: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id="edit_currently_work_here"
                      checked={editEmpleo.currently_work_here}
                      onChange={(e) => setEditEmpleo({ ...editEmpleo, currently_work_here: e.target.checked })}
                    />
                    <label htmlFor="edit_currently_work_here" style={{ margin: 0, cursor: 'pointer' }}>I currently work here (Trabajo actualmente aquí)</label>
                  </div>
                </div>
              )}

              {editTab === 'educacion' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>School / Universidad</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="ej. University of Texas at Austin"
                      value={editEducacion.school}
                      onChange={(e) => setEditEducacion({ ...editEducacion, school: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Primary Major (Carrera Principal)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="ej. Computer Science"
                      value={editEducacion.primary_major}
                      onChange={(e) => setEditEducacion({ ...editEducacion, primary_major: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Secondary Major (Carrera Secundaria)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="ej. Business"
                      value={editEducacion.secondary_major}
                      onChange={(e) => setEditEducacion({ ...editEducacion, secondary_major: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Degree Type (Tipo de Grado)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="ej. Bachelor of Science"
                      value={editEducacion.degree_type}
                      onChange={(e) => setEditEducacion({ ...editEducacion, degree_type: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Graduation Year (Año de Graduación)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="ej. 2020"
                      value={editEducacion.graduation_year}
                      onChange={(e) => setEditEducacion({ ...editEducacion, graduation_year: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {editTab === 'ubicacion' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Location (Ubicación)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="ej. Austin, TX"
                      value={editUbicacion.location}
                      onChange={(e) => setEditUbicacion({ ...editUbicacion, location: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Start Year (Año Inicio)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="ej. 2015"
                      value={editUbicacion.start_year}
                      onChange={(e) => setEditUbicacion({ ...editUbicacion, start_year: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Year (Año Fin)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="ej. Present"
                      disabled={editUbicacion.currently_live_here}
                      value={editUbicacion.currently_live_here ? 'Present' : editUbicacion.end_year}
                      onChange={(e) => setEditUbicacion({ ...editUbicacion, end_year: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id="edit_currently_live_here"
                      checked={editUbicacion.currently_live_here}
                      onChange={(e) => setEditUbicacion({ ...editUbicacion, currently_live_here: e.target.checked })}
                    />
                    <label htmlFor="edit_currently_live_here" style={{ margin: 0, cursor: 'pointer' }}>I currently live here (Resido actualmente aquí)</label>
                  </div>
                </div>
              )}

              <div className="modal-footer" style={{ padding: 0, marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingProfile(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} /> Guardar Cambios
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
