import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Tag as TagIcon, Plus, Edit2, Trash2, X, Save, AlertCircle, Check, Lock } from 'lucide-react';

interface TagItem {
  id: number;
  name: string;
  color?: string;
  is_system?: boolean;
  slug?: string;
  _count?: {
    profiles?: number;
    profile_tags?: number;
  };
}

const PRESET_COLORS = [
  '#3b82f6', // Azul
  '#10b981', // Verde
  '#f59e0b', // Ámbar
  '#ef4444', // Rojo
  '#8b5cf6', // Violeta
  '#ec4899', // Rosa
  '#06b6d4', // Cyan
  '#64748b', // Slate
];

const Tags: React.FC = () => {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchTags = async (q = '') => {
    try {
      const res = await api.get(`/tags${q ? `?search=${encodeURIComponent(q)}` : ''}`);
      setTags(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const openCreateModal = () => {
    setEditingTag(null);
    setName('');
    setColor('#3b82f6');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (t: TagItem) => {
    if (t.is_system) return;
    setEditingTag(t);
    setName(t.name);
    setColor(t.color || '#3b82f6');
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTag(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre de la etiqueta es obligatorio.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingTag) {
        if (editingTag.is_system) {
          setError('Las etiquetas de sistema no se pueden editar.');
          setSaving(false);
          return;
        }
        await api.patch(`/tags/${editingTag.id}`, { name: name.trim(), color });
      } else {
        await api.post('/tags', { name: name.trim(), color });
      }
      closeModal();
      fetchTags(search);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar la etiqueta.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const t = tags.find((x) => x.id === id);
    if (t?.is_system) {
      alert('Las etiquetas de sistema no se pueden eliminar.');
      return;
    }

    if (!window.confirm('¿Seguro que deseas eliminar esta etiqueta? Los perfiles asociados quedarán sin etiqueta.')) {
      return;
    }

    try {
      await api.delete(`/tags/${id}`);
      fetchTags(search);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar etiqueta.');
    }
  };

  return (
    <div className="dashboard" style={{ width: '100%', maxWidth: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
            <TagIcon size={26} color="var(--primary)" /> Módulo de Etiquetas (Tags)
          </h1>
          <p className="subtitle" style={{ textAlign: 'left', margin: '0.3rem 0 0 0' }}>
            Crea y administra etiquetas para clasificar y organizar tus perfiles.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} /> Nueva Etiqueta
        </button>
      </div>

      {/* Buscador */}
      <div style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
        <input
          type="text"
          className="input-field"
          placeholder="Buscar etiqueta..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            fetchTags(e.target.value);
          }}
        />
      </div>

      {/* Listado de Tags */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Cargando etiquetas...
        </div>
      ) : tags.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <TagIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3>No hay etiquetas creadas</h3>
          <p style={{ margin: '0.5rem 0 1.5rem' }}>Crea tu primera etiqueta para categorizar perfiles.</p>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={18} /> Nueva Etiqueta
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--surface-hover)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Etiqueta</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Color Hex</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Perfiles Asignados</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((t) => {
                const tagColor = t.color || '#3b82f6';
                const countProfiles = t._count?.profile_tags ?? t._count?.profiles ?? 0;
                return (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>#{t.id}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          className="badge"
                          style={{
                            background: `${tagColor}22`,
                            color: tagColor,
                            border: `1px solid ${tagColor}66`,
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            padding: '0.3rem 0.65rem',
                            borderRadius: '9999px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                          }}
                        >
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: tagColor }} />
                          {t.name}
                        </span>
                        {t.is_system && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              background: 'rgba(100, 116, 139, 0.15)',
                              color: 'var(--text-muted)',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <Lock size={10} /> Sistema
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                      {tagColor}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      <span className="badge" style={{ background: 'var(--surface-hover)', color: 'var(--text)' }}>
                        {countProfiles} perfiles
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {t.is_system ? (
                          <span
                            style={{
                              fontSize: '0.78rem',
                              color: 'var(--text-muted)',
                              fontStyle: 'italic',
                              padding: '0.35rem 0.6rem',
                            }}
                          >
                            Protegida
                          </span>
                        ) : (
                          <>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                              onClick={() => openEditModal(t)}
                            >
                              <Edit2 size={14} /> Editar
                            </button>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', color: '#ef4444' }}
                              onClick={() => handleDelete(t.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Crear / Editar Tag */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
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
              maxWidth: '460px',
              padding: '1.75rem',
              position: 'relative',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
          >
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}>
              <TagIcon size={22} color={color} /> {editingTag ? 'Editar Etiqueta' : 'Nueva Etiqueta'}
            </h2>

            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--danger)',
                  color: 'var(--danger)',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  marginBottom: '1rem',
                }}
              >
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Nombre de la Etiqueta *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej: Clientes VIP, Warm Up..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Color Identificador
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: c,
                        border: color === c ? '2px solid white' : '2px solid transparent',
                        outline: color === c ? `2px solid ${c}` : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                      }}
                    >
                      {color === c && <Check size={16} />}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    style={{
                      width: '40px',
                      height: '36px',
                      padding: 0,
                      borderRadius: '4px',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      background: 'none',
                    }}
                  />
                  <input
                    type="text"
                    className="input-field"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#3b82f6"
                    style={{ flex: 1, fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              {/* Vista previa de cómo lucirá */}
              <div
                style={{
                  background: 'var(--surface-hover)',
                  padding: '1rem',
                  borderRadius: '6px',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Vista previa:</span>
                <span
                  className="badge"
                  style={{
                    background: `${color}22`,
                    color: color,
                    border: `1px solid ${color}66`,
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  {name.trim() || 'Nombre de la etiqueta'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <Save size={16} /> {saving ? 'Guardando...' : editingTag ? 'Actualizar' : 'Crear Etiqueta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tags;
