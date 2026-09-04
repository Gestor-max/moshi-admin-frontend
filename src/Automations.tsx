import React, { useState, useEffect } from 'react';
import { api } from './api';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { PlayCircle, Plus, Search, Trash2, Edit2, X, Save, AlertCircle, FileCode } from 'lucide-react';

interface AutomationItem {
  id: number;
  name: string;
  description?: string;
  filename?: string;
  status: number;
}

const Automations: React.FC = () => {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();
  
  // Data states
  const [automations, setAutomations] = useState<AutomationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<AutomationItem | null>(null);

  // Form states for create/edit
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [filename, setFilename] = useState('');

  const fetchAutomations = async (query = '') => {
    try {
      const res = await api.get(`/automations${query ? `?search=${query}` : ''}`);
      setAutomations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchAutomations();
      setLoading(false);
    };
    init();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await api.post('/automations', { name, description, filename });
      setName('');
      setDescription('');
      setFilename('');
      setIsNewModalOpen(false);
      fetchAutomations(searchQuery);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Error');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAutomation) return;
    setErrorMessage('');
    try {
      await api.patch(`/automations/${editingAutomation.id}`, {
        name: editingAutomation.name,
        description: editingAutomation.description,
        filename: editingAutomation.filename,
      });
      setEditingAutomation(null);
      fetchAutomations(searchQuery);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar?')) return;
    try {
      await api.delete(`/automations/${id}`);
      fetchAutomations(searchQuery);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1>{t('automations_title')}</h1>
            {isAdmin && (
              <span className="badge" style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.75rem' }}>
                Admin Mode
              </span>
            )}
          </div>
          <p className="subtitle" style={{ textAlign: 'left', margin: '0.25rem 0 0' }}>
            {t('automations_subtitle')}
          </p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setErrorMessage(''); setIsNewModalOpen(true); }}>
            <Plus size={18} /> {t('create')}
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
            placeholder={`${t('search')}...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              fetchAutomations(e.target.value);
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          {t('loading')}
        </div>
      ) : automations.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <PlayCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3>{t('automations_empty_title')}</h3>
        </div>
      ) : (
        /* Vista en Cards */
        <div className="grid-cards">
          {automations.map((item) => (
            <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(249, 115, 22, 0.12)', padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--primary)' }}>
                  <PlayCircle size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text)' }}>{item.name}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID #{item.id}</span>
                </div>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.4', margin: 0, flex: 1 }}>
                {item.description}
              </p>

              {/* Si es Admin, muestra el campo confidencial filename */}
              {isAdmin && item.filename && (
                <div style={{ background: 'var(--background)', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileCode size={15} style={{ color: 'var(--primary)' }} />
                  <span style={{ color: 'var(--text-muted)' }}>Script:</span>
                  <code style={{ color: 'var(--text)', fontWeight: 600 }}>{item.filename}</code>
                </div>
              )}

              {/* Botones de acción solo para Admin */}
              {isAdmin && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} onClick={() => setEditingAutomation(item)}>
                    <Edit2 size={14} /> {t('edit')}
                  </button>
                  <button className="btn btn-danger" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} onClick={() => handleDelete(item.id)}>
                    <Trash2 size={14} /> {t('delete')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal para Crear Automatización (Admin Only) */}
      {isNewModalOpen && isAdmin && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Registrar Automatización</h2>
              <button className="modal-close" onClick={() => setIsNewModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            {errorMessage && (
              <div className="error-message" style={{ margin: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} /> {errorMessage}
              </div>
            )}
            <form onSubmit={handleCreate} className="modal-body">
              <div className="form-group">
                <label>Nombre de la Automatización</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="ej. Auto-Posting Medium & Quora"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  className="input-field"
                  placeholder="Describe las tareas que ejecuta esta automatización..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label>Nombre de Archivo de Script (.js / .py)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="ej. medium_poster_v1.js"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  required
                />
                <small style={{ color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  Nota: El campo Filename solo es visible por administradores.
                </small>
              </div>

              <div className="modal-footer" style={{ padding: 0, marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsNewModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} /> Guardar Automatización
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Editar Automatización (Admin Only) */}
      {editingAutomation && isAdmin && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Editar Automatización</h2>
              <button className="modal-close" onClick={() => setEditingAutomation(null)}>
                <X size={20} />
              </button>
            </div>
            {errorMessage && (
              <div className="error-message" style={{ margin: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} /> {errorMessage}
              </div>
            )}
            <form onSubmit={handleUpdate} className="modal-body">
              <div className="form-group">
                <label>Nombre de la Automatización</label>
                <input
                  type="text"
                  className="input-field"
                  value={editingAutomation.name}
                  onChange={(e) => setEditingAutomation({ ...editingAutomation, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  className="input-field"
                  value={editingAutomation.description}
                  onChange={(e) => setEditingAutomation({ ...editingAutomation, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label>Nombre de Archivo (Script)</label>
                <input
                  type="text"
                  className="input-field"
                  value={editingAutomation.filename || ''}
                  onChange={(e) => setEditingAutomation({ ...editingAutomation, filename: e.target.value })}
                  required
                />
              </div>

              <div className="modal-footer" style={{ padding: 0, marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingAutomation(null)}>
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

export default Automations;
