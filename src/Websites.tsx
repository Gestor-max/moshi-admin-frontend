import React, { useState, useEffect } from 'react';
import { api } from './api';
import { useAuth } from './AuthContext';
import { Globe, Plus, Search, Trash2, Edit2, X, Save, AlertCircle } from 'lucide-react';

interface WebsiteItem {
  id: number;
  name: string;
  url: string;
  _count?: {
    profile_websites: number;
  };
}

const Websites: React.FC = () => {
  const { isAdmin } = useAuth();
  
  // Data states
  const [websites, setWebsites] = useState<WebsiteItem[]>([]);
  
  // Search and loading states
  const [searchCatalog, setSearchCatalog] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Modals
  const [editingWebsite, setEditingWebsite] = useState<WebsiteItem | null>(null);
  const [isNewSiteModalOpen, setIsNewSiteModalOpen] = useState(false);

  // Form states for new website
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteUrl, setNewSiteUrl] = useState('');

  const fetchWebsites = async (query = '') => {
    try {
      const res = await api.get(`/websites${query ? `?search=${query}` : ''}`);
      setWebsites(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchWebsites();
      setLoading(false);
    };
    init();
  }, []);

  const handleCreateWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await api.post('/websites', { name: newSiteName, url: newSiteUrl });
      setNewSiteName('');
      setNewSiteUrl('');
      setIsNewSiteModalOpen(false);
      fetchWebsites(searchCatalog);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Error al crear sitio web');
    }
  };

  const handleUpdateWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWebsite) return;
    setErrorMessage('');
    try {
      await api.patch(`/websites/${editingWebsite.id}`, { name: editingWebsite.name, url: editingWebsite.url });
      setEditingWebsite(null);
      fetchWebsites(searchCatalog);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Error al actualizar sitio web');
    }
  };

  const handleDeleteWebsite = async (id: number) => {
    if (!window.confirm('¿Eliminar este sitio web del catálogo? Se borrarán también las cuentas asociadas.')) return;
    try {
      await api.delete(`/websites/${id}`);
      fetchWebsites(searchCatalog);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1>Catálogo de Sitios Web</h1>
            <span className="badge" style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.75rem' }}>
              Admin Only
            </span>
          </div>
          <p className="subtitle" style={{ textAlign: 'left', margin: '0.25rem 0 0' }}>
            Administra las plataformas disponibles (Medium, Reddit, Quora, etc.) en el sistema global.
          </p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setErrorMessage(''); setIsNewSiteModalOpen(true); }}>
            <Plus size={18} /> Registrar Nuevo Sitio Web
          </button>
        )}
      </div>

      {/* Buscador */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '2.75rem' }}
            placeholder="Buscar por nombre o URL..."
            value={searchCatalog}
            onChange={(e) => {
              setSearchCatalog(e.target.value);
              fetchWebsites(e.target.value);
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Cargando catálogo de sitios web...
        </div>
      ) : websites.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Globe size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3>No hay sitios web registrados</h3>
          <p style={{ margin: '0.5rem 0 1.5rem' }}>Agrega plataformas globales para que los usuarios puedan vincular sus perfiles.</p>
          <button className="btn btn-primary" onClick={() => { setErrorMessage(''); setIsNewSiteModalOpen(true); }}>
            <Plus size={18} /> Registrar Primer Sitio Web
          </button>
        </div>
      ) : (
        <div className="grid-cards">
          {websites.map((site) => (
            <div key={site.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: 'var(--surface-hover)', padding: '0.6rem', borderRadius: '0.5rem', color: 'var(--primary)' }}>
                    <Globe size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{site.name}</h3>
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none' }}
                    >
                      {site.url}
                    </a>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--background)', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Perfiles vinculados:</span>
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                  {site._count?.profile_websites || 0} cuentas
                </span>
              </div>

              {isAdmin && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} onClick={() => setEditingWebsite(site)}>
                    <Edit2 size={14} /> Editar
                  </button>
                  <button className="btn btn-danger" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} onClick={() => handleDeleteWebsite(site.id)}>
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal para Crear Sitio Web Global */}
      {isNewSiteModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2>Registrar Sitio Web Global</h2>
              <button className="modal-close" onClick={() => setIsNewSiteModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            {errorMessage && (
              <div className="error-message" style={{ margin: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} /> {errorMessage}
              </div>
            )}
            <form onSubmit={handleCreateWebsite} className="modal-body">
              <div className="form-group">
                <label>Nombre del Sitio Web</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="ej. Medium, Reddit, Quora"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>URL Principal</label>
                <input
                  type="url"
                  className="input-field"
                  placeholder="https://medium.com"
                  value={newSiteUrl}
                  onChange={(e) => setNewSiteUrl(e.target.value)}
                  required
                />
              </div>
              <div className="modal-footer" style={{ padding: 0, marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsNewSiteModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} /> Guardar Sitio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Editar Sitio Web */}
      {editingWebsite && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2>Editar Sitio Web</h2>
              <button className="modal-close" onClick={() => setEditingWebsite(null)}>
                <X size={20} />
              </button>
            </div>
            {errorMessage && (
              <div className="error-message" style={{ margin: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} /> {errorMessage}
              </div>
            )}
            <form onSubmit={handleUpdateWebsite} className="modal-body">
              <div className="form-group">
                <label>Nombre del Sitio Web</label>
                <input
                  type="text"
                  className="input-field"
                  value={editingWebsite.name}
                  onChange={(e) => setEditingWebsite({ ...editingWebsite, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>URL Principal</label>
                <input
                  type="url"
                  className="input-field"
                  value={editingWebsite.url}
                  onChange={(e) => setEditingWebsite({ ...editingWebsite, url: e.target.value })}
                  required
                />
              </div>
              <div className="modal-footer" style={{ padding: 0, marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingWebsite(null)}>
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

export default Websites;
