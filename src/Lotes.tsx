import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Boxes, Plus, Edit2, Trash2, X, Save, AlertCircle, Search, Calendar, Building2, Users } from 'lucide-react';

export interface LoteItem {
  id: number;
  name: string;
  fecha_compra: string;
  proveedor: string;
  created_at?: string;
  _count?: {
    profiles: number;
  };
}

const Lotes: React.FC = () => {
  const [lotes, setLotes] = useState<LoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLote, setEditingLote] = useState<LoteItem | null>(null);
  const [name, setName] = useState('');
  const [fechaCompra, setFechaCompra] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchLotes = async (q = '') => {
    try {
      setLoading(true);
      const res = await api.get(`/lotes${q ? `?search=${encodeURIComponent(q)}` : ''}`);
      setLotes(res.data);
    } catch (err) {
      console.error('Error fetching lotes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLotes();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLotes(search);
  };

  const openCreateModal = () => {
    setEditingLote(null);
    setName('');
    // Default to today's date YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    setFechaCompra(today);
    setProveedor('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (l: LoteItem) => {
    setEditingLote(l);
    setName(l.name);
    setFechaCompra(l.fecha_compra || '');
    setProveedor(l.proveedor || '');
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLote(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre del lote es obligatorio.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        name: name.trim(),
        fecha_compra: fechaCompra.trim(),
        proveedor: proveedor.trim(),
      };

      if (editingLote) {
        await api.patch(`/lotes/${editingLote.id}`, payload);
      } else {
        await api.post('/lotes', payload);
      }
      closeModal();
      fetchLotes(search);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar el lote.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este lote? Los perfiles asignados a este lote quedarán sin lote asociado.')) {
      return;
    }

    try {
      await api.delete(`/lotes/${id}`);
      fetchLotes(search);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar el lote.');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            <Boxes style={{ color: 'var(--primary)' }} size={28} />
            Gestión de Lotes
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Agrupa y administra tus perfiles por fecha de compra y proveedor.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '0.5rem', fontWeight: 600 }}
        >
          <Plus size={18} />
          Nuevo Lote
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Buscar lote por nombre o proveedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.4rem', width: '100%' }}
            />
          </div>
          <button type="submit" className="btn-secondary" style={{ padding: '0.6rem 1rem' }}>
            Buscar
          </button>
          {search && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setSearch('');
                fetchLotes('');
              }}
              style={{ padding: '0.6rem 0.8rem' }}
              title="Limpiar búsqueda"
            >
              <X size={16} />
            </button>
          )}
        </form>
      </div>

      {/* Content / Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Cargando lotes...</div>
      ) : lotes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <Boxes size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>No se encontraron lotes</h3>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 1.5rem 0', fontSize: '0.9rem' }}>
            {search ? 'No hay lotes que coincidan con la búsqueda.' : 'Crea tu primer lote para organizar las compras de tus perfiles.'}
          </p>
          <button onClick={openCreateModal} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} />
            Crear Primer Lote
          </button>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <div className="table-responsive">
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(0, 0, 0, 0.02)' }}>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ID</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Nombre del Lote</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fecha de Compra</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Proveedor</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Perfiles Asignados</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lotes.map((lote) => (
                  <tr key={lote.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s ease' }}>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      #{lote.id}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'rgba(249, 115, 22, 0.12)',
                          color: 'var(--primary)',
                        }}>
                          <Boxes size={18} />
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>{lote.name}</div>
                          {lote.created_at && (
                            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                              Registrado: {new Date(lote.created_at).toLocaleDateString()}
                            </small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {lote.fecha_compra ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,0,0,0.04)', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                          <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                          {lote.fecha_compra}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No especificada</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {lote.proveedor ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Building2 size={15} style={{ color: 'var(--primary)', opacity: 0.8 }} />
                          <span style={{ fontWeight: 500 }}>{lote.proveedor}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: (lote._count?.profiles || 0) > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(100, 116, 139, 0.1)',
                          color: (lote._count?.profiles || 0) > 0 ? '#10b981' : 'var(--text-muted)',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '9999px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}
                      >
                        <Users size={13} />
                        {lote._count?.profiles || 0} perfiles
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => openEditModal(lote)}
                          className="btn-secondary"
                          style={{ padding: '0.4rem 0.6rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          title="Editar Lote"
                        >
                          <Edit2 size={15} />
                          <span style={{ fontSize: '0.8rem' }}>Editar</span>
                        </button>
                        <button
                          onClick={() => handleDelete(lote.id)}
                          style={{
                            padding: '0.4rem 0.6rem',
                            borderRadius: '4px',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            background: 'rgba(239, 68, 68, 0.08)',
                            color: '#ef4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                          title="Eliminar Lote"
                        >
                          <Trash2 size={15} />
                          <span style={{ fontSize: '0.8rem' }}>Eliminar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Crear/Editar */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
              borderRadius: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Boxes size={22} style={{ color: 'var(--primary)' }} />
                {editingLote ? 'Editar Lote' : 'Nuevo Lote'}
              </h2>
              <button
                onClick={closeModal}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                }}
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Nombre del Lote *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej. Lote USA Noviembre #1, Compra Gmails Bulk..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Fecha de Compra
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={fechaCompra}
                  onChange={(e) => setFechaCompra(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Proveedor
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej. AccsMarket, BuyAccs, PVACodes, Particular..."
                  value={proveedor}
                  onChange={(e) => setProveedor(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Save size={16} />
                  {saving ? 'Guardando...' : editingLote ? 'Guardar Cambios' : 'Crear Lote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lotes;
