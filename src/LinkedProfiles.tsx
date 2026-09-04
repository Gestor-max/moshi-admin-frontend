import React, { useState, useEffect } from 'react';
import { api } from './api';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { Link as LinkIcon, Plus, Search, Trash2, Edit2, X, Save, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface WebsiteItem {
  id: number;
  name: string;
  url: string;
}

interface ProfileItem {
  id: number;
  name: string;
  lastname: string;
  gmail?: string;
  profile_email?: string;
  user_id?: number;
}

interface ProfileWebsiteAccount {
  id: number;
  profile_id: number;
  website_id: number;
  email: string;
  password: string;
  cookie?: string;
  profile?: ProfileItem;
  website?: WebsiteItem;
}

const LinkedProfiles: React.FC = () => {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();
  
  // Data states
  const [accounts, setAccounts] = useState<ProfileWebsiteAccount[]>([]);
  const [websites, setWebsites] = useState<WebsiteItem[]>([]);
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  
  // Search and loading states
  const [searchAccounts, setSearchAccounts] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Modals
  const [editingAccount, setEditingAccount] = useState<ProfileWebsiteAccount | null>(null);
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);

  // Form states for new profile website account
  const [accountProfileId, setAccountProfileId] = useState('');
  const [accountWebsiteId, setAccountWebsiteId] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [accountCookie, setAccountCookie] = useState('');

  // Toggle password visibility per account
  const [showPasswords, setShowPasswords] = useState<{ [key: number]: boolean }>({});

  const fetchAccounts = async (query = '') => {
    try {
      const res = await api.get(`/websites/accounts${query ? `?search=${query}` : ''}`);
      setAccounts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWebsites = async () => {
    try {
      const res = await api.get('/websites');
      setWebsites(res.data);
      if (res.data.length > 0 && !accountWebsiteId) {
        setAccountWebsiteId(String(res.data[0].id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProfiles = async () => {
    try {
      const res = await api.get('/profiles');
      setProfiles(res.data);
      if (res.data.length > 0 && !accountProfileId) {
        setAccountProfileId(String(res.data[0].id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchAccounts(), fetchWebsites(), fetchProfiles()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await api.post('/websites/accounts', {
        profile_id: Number(accountProfileId),
        website_id: Number(accountWebsiteId),
        email: accountEmail,
        password: accountPassword,
        cookie: accountCookie,
      });
      setAccountEmail('');
      setAccountPassword('');
      setAccountCookie('');
      setIsNewAccountModalOpen(false);
      fetchAccounts(searchAccounts);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Error');
    }
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    setErrorMessage('');
    try {
      await api.patch(`/websites/accounts/${editingAccount.id}`, {
        email: editingAccount.email,
        password: editingAccount.password,
        cookie: editingAccount.cookie,
      });
      setEditingAccount(null);
      fetchAccounts(searchAccounts);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Error');
    }
  };

  const handleDeleteAccount = async (id: number) => {
    if (!window.confirm('¿Deseas desvincular esta cuenta del perfil?')) return;
    try {
      await api.delete(`/websites/accounts/${id}`);
      fetchAccounts(searchAccounts);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleShowPassword = (id: number) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1>{t('linked_title')}</h1>
          <p className="subtitle" style={{ textAlign: 'left', margin: 0 }}>
            {isAdmin ? t('linked_subtitle_admin') : t('linked_subtitle_user')}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setErrorMessage(''); setIsNewAccountModalOpen(true); }}>
          <Plus size={18} /> {t('linked_link_account')}
        </button>
      </div>

      {/* Buscador */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '2.75rem' }}
            placeholder={t('linked_search_placeholder')}
            value={searchAccounts}
            onChange={(e) => {
              setSearchAccounts(e.target.value);
              fetchAccounts(e.target.value);
            }}
          />
        </div>
      </div>

      {/* VISTA EN FORMATO DE TABLA */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          {t('loading')}
        </div>
      ) : accounts.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <LinkIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3>{t('linked_empty_title')}</h3>
          <p style={{ margin: '0.5rem 0 1.5rem' }}>
            {t('linked_empty_text')}
          </p>
          <button className="btn btn-primary" onClick={() => { setErrorMessage(''); setIsNewAccountModalOpen(true); }}>
            <Plus size={18} /> {t('linked_new_link')}
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--surface-hover)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Perfil</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sitio Web</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email en Sitio</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Contraseña</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cookie</th>
                {isAdmin && <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Owner (User ID)</th>}
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc) => (
                <tr key={acc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>#{acc.id}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                      {acc.profile ? `${acc.profile.name} ${acc.profile.lastname}` : `Perfil #${acc.profile_id}`}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      {acc.website?.name || 'Sitio Web'}
                    </span>
                    {acc.website?.url && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {acc.website.url}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    {acc.email}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontFamily: showPasswords[acc.id] ? 'inherit' : 'monospace' }}>
                        {showPasswords[acc.id] ? acc.password : '••••••••'}
                      </span>
                      <button
                        onClick={() => toggleShowPassword(acc.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                        title="Ver/Ocultar contraseña"
                      >
                        {showPasswords[acc.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.8rem' }}>
                    {acc.cookie ? (
                      <span style={{ background: 'var(--surface-hover)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', maxWidth: '120px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {acc.cookie}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Sin Cookie</span>
                    )}
                  </td>
                  {isAdmin && (
                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                      <span className="badge" style={{ background: 'var(--surface-hover)', fontSize: '0.75rem' }}>
                        User #{acc.profile?.user_id || '-'}
                      </span>
                    </td>
                  )}
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                        onClick={() => setEditingAccount(acc)}
                      >
                        <Edit2 size={14} /> Editar
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                        onClick={() => handleDeleteAccount(acc.id)}
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

      {/* Modal para Vincular Nueva Cuenta a Perfil */}
      {isNewAccountModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>{t('linked_modal_title')}</h2>
              <button className="modal-close" onClick={() => setIsNewAccountModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            {errorMessage && (
              <div className="error-message" style={{ margin: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} /> {errorMessage}
              </div>
            )}
            <form onSubmit={handleCreateAccount} className="modal-body">
              <div className="form-group">
                <label>{t('linked_select_profile')}</label>
                <select
                  className="input-field"
                  value={accountProfileId}
                  onChange={(e) => setAccountProfileId(e.target.value)}
                  required
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.lastname} ({p.profile_email || 'Sin email'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t('linked_select_website')}</label>
                <select
                  className="input-field"
                  value={accountWebsiteId}
                  onChange={(e) => setAccountWebsiteId(e.target.value)}
                  required
                >
                  {websites.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.url})
                    </option>
                  ))}
                </select>
                <small style={{ color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  {t('linked_note_one_account')}
                </small>
              </div>

              <div className="form-group">
                <label>{t('linked_email_label')}</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="usuario@sitio.com"
                  value={accountEmail}
                  onChange={(e) => setAccountEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('linked_password_label')}</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('linked_cookie_label')}</label>
                <textarea
                  className="input-field"
                  placeholder="Pegar cookie..."
                  value={accountCookie}
                  onChange={(e) => setAccountCookie(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="modal-footer" style={{ padding: 0, marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsNewAccountModalOpen(false)}>
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} /> {t('linked_save_link')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Editar Cuenta Vinculada */}
      {editingAccount && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>{t('linked_modal_edit_title')}</h2>
              <button className="modal-close" onClick={() => setEditingAccount(null)}>
                <X size={20} />
              </button>
            </div>
            {errorMessage && (
              <div className="error-message" style={{ margin: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} /> {errorMessage}
              </div>
            )}
            <form onSubmit={handleUpdateAccount} className="modal-body">
              <div className="form-group">
                <label>{t('nav_profiles').slice(0, -1)}</label>
                <input
                  type="text"
                  className="input-field"
                  value={editingAccount.profile ? `${editingAccount.profile.name} ${editingAccount.profile.lastname}` : `Perfil #${editingAccount.profile_id}`}
                  disabled
                />
              </div>
              <div className="form-group">
                <label>{t('nav_websites').slice(0, -1)}</label>
                <input
                  type="text"
                  className="input-field"
                  value={editingAccount.website?.name || `Sitio #${editingAccount.website_id}`}
                  disabled
                />
              </div>
              <div className="form-group">
                <label>{t('linked_email_label')}</label>
                <input
                  type="email"
                  className="input-field"
                  value={editingAccount.email}
                  onChange={(e) => setEditingAccount({ ...editingAccount, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t('password')}</label>
                <input
                  type="text"
                  className="input-field"
                  value={editingAccount.password}
                  onChange={(e) => setEditingAccount({ ...editingAccount, password: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t('linked_cookie_label')}</label>
                <textarea
                  className="input-field"
                  value={editingAccount.cookie || ''}
                  onChange={(e) => setEditingAccount({ ...editingAccount, cookie: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="modal-footer" style={{ padding: 0, marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingAccount(null)}>
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} /> {t('linked_update_account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkedProfiles;
