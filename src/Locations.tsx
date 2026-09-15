import React, { useState, useEffect } from 'react';
import { api } from './api';
import { useLanguage } from './LanguageContext';
import { MapPin, Plus, Search, Trash2, Edit2, X, Save, Building2 } from 'lucide-react';

interface LocationItem {
  id: number;
  state: string;
  location: string;
  user_id: number;
  _count?: {
    profiles: number;
  };
}

const Locations: React.FC = () => {
  const { t } = useLanguage();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newState, setNewState] = useState('');
  const [newLocationStr, setNewLocationStr] = useState('');

  const fetchLocations = async (searchQuery = '') => {
    try {
      const res = await api.get(`/locations${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`);
      setLocations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLocations(search);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta ubicación?')) return;
    try {
      await api.delete(`/locations/${id}`);
      setLocations(locations.filter((loc) => loc.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newState.trim() || !newLocationStr.trim()) return;
    try {
      await api.post('/locations', {
        state: newState.trim(),
        location: newLocationStr.trim(),
      });
      setShowCreateModal(false);
      setNewState('');
      setNewLocationStr('');
      fetchLocations(search);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation) return;
    try {
      await api.patch(`/locations/${editingLocation.id}`, {
        state: editingLocation.state,
        location: editingLocation.location,
      });
      setEditingLocation(null);
      fetchLocations(search);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>{t('locations_title') || 'Gestión de Ubicaciones'}</h1>
          <p className="subtitle" style={{ textAlign: 'left', margin: 0 }}>
            {t('locations_subtitle') || 'Administra estados y ubicaciones para asignar a tus perfiles.'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{ width: 'auto', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} /> {t('new_location') || 'Nueva Ubicación'}
        </button>
      </div>

      <form onSubmit={handleSearch} className="search-bar" style={{ marginBottom: '1.5rem' }}>
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder={`${t('search') || 'Buscar'} por Estado o Ubicación...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      {loading ? (
        <div>{t('loading') || 'Cargando...'}</div>
      ) : locations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No hay ubicaciones registradas.{' '}
          <button
            onClick={() => setShowCreateModal(true)}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {t('new_location') || 'Nueva Ubicación'}
          </button>
        </div>
      ) : (
        <div className="list-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="card"
              style={{
                background: 'var(--card-bg, #1e293b)',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                border: '1px solid var(--border-color, #334155)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div
                    style={{
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: 'var(--primary, #6366f1)',
                      padding: '0.6rem',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main, #f8fafc)' }}>
                      {loc.location}
                    </h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Building2 size={14} /> {loc.state}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', marginTop: '0.5rem' }}>
                  ID #{loc.id} • {loc._count?.profiles || 0} perfiles asignados
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color, #334155)' }}>
                <button
                  type="button"
                  onClick={() => setEditingLocation(loc)}
                  style={{
                    flex: 1,
                    padding: '0.4rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-color, #334155)',
                    borderRadius: '0.375rem',
                    color: 'var(--text-main, #f8fafc)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    fontSize: '0.85rem',
                  }}
                >
                  <Edit2 size={15} /> {t('edit') || 'Editar'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(loc.id)}
                  style={{
                    padding: '0.4rem 0.6rem',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '0.375rem',
                    color: '#ef4444',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear Ubicación */}
      {showCreateModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: 'var(--card-bg, #1e293b)', padding: '2rem', borderRadius: '0.75rem', width: '100%', maxWidth: '450px', border: '1px solid var(--border-color, #334155)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{t('new_location') || 'Nueva Ubicación'}</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
                  {t('state_label') || 'Estado / Provincia'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. California, Texas, CDMX"
                  value={newState}
                  onChange={(e) => setNewState(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid var(--border-color, #334155)', background: 'var(--bg-main, #0f172a)', color: 'white' }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
                  {t('location_label') || 'Ciudad / Ubicación'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Los Angeles, Austin, Polanco"
                  value={newLocationStr}
                  onChange={(e) => setNewLocationStr(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid var(--border-color, #334155)', background: 'var(--bg-main, #0f172a)', color: 'white' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ width: 'auto', background: 'transparent', border: '1px solid var(--border-color, #334155)', color: 'var(--text-muted)' }}
                >
                  {t('cancel') || 'Cancelar'}
                </button>
                <button type="submit" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Save size={16} /> {t('save') || 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Ubicación */}
      {editingLocation && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: 'var(--card-bg, #1e293b)', padding: '2rem', borderRadius: '0.75rem', width: '100%', maxWidth: '450px', border: '1px solid var(--border-color, #334155)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{t('edit_location') || 'Editar Ubicación'}</h2>
              <button onClick={() => setEditingLocation(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
                  {t('state_label') || 'Estado / Provincia'}
                </label>
                <input
                  type="text"
                  required
                  value={editingLocation.state}
                  onChange={(e) => setEditingLocation({ ...editingLocation, state: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid var(--border-color, #334155)', background: 'var(--bg-main, #0f172a)', color: 'white' }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
                  {t('location_label') || 'Ciudad / Ubicación'}
                </label>
                <input
                  type="text"
                  required
                  value={editingLocation.location}
                  onChange={(e) => setEditingLocation({ ...editingLocation, location: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid var(--border-color, #334155)', background: 'var(--bg-main, #0f172a)', color: 'white' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEditingLocation(null)}
                  style={{ width: 'auto', background: 'transparent', border: '1px solid var(--border-color, #334155)', color: 'var(--text-muted)' }}
                >
                  {t('cancel') || 'Cancelar'}
                </button>
                <button type="submit" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Save size={16} /> {t('saveChanges') || 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Locations;
