import React, { useState, useEffect, useMemo } from 'react';
import { api } from './api';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Search,
  Plus,
  Tag as TagIcon,
  Mail,
  Server,
  MapPin,
  Boxes,
  Edit2,
  ListChecks,
  Check,
  X,
  CheckCircle2,
  Copy,
  AlertCircle,
  Save,
} from 'lucide-react';

interface TagItem {
  id: number;
  name: string;
  color?: string;
}

interface LoteItem {
  id: number;
  name: string;
  fecha_compra?: string;
  proveedor?: string;
}

interface ProxyItem {
  id: number;
  ip: string;
  port: string;
}

interface LocationItem {
  id: number;
  state: string;
  location: string;
}

interface ProfileItem {
  id: number;
  name: string;
  lastname: string;
  gmail?: string;
  profile_email?: string;
  img?: string;
  tag_id?: number | null;
  lote_id?: number | null;
  proxy_id?: number | null;
  location_id?: number | null;
  status?: number;
  tag?: TagItem;
  lote?: LoteItem;
  proxy?: ProxyItem;
  location?: LocationItem;
  _count?: {
    google_activities?: number;
    youtube_activities?: number;
    gmaps_activities?: number;
    browser_activities?: number;
    quora_activities?: number;
    medium_activities?: number;
  };
}

const getStatusBadge = (status?: number) => {
  switch (Number(status)) {
    case 1:
      return {
        label: 'Nuevo',
        bg: 'rgba(14, 165, 233, 0.15)',
        color: '#0284c7',
        border: 'rgba(14, 165, 233, 0.35)',
      };
    case 2:
      return {
        label: 'En Prep.',
        bg: 'rgba(245, 158, 11, 0.15)',
        color: '#d97706',
        border: 'rgba(245, 158, 11, 0.35)',
      };
    case 3:
      return {
        label: 'Listo',
        bg: 'rgba(16, 185, 129, 0.15)',
        color: '#059669',
        border: 'rgba(16, 185, 129, 0.35)',
      };
    case 4:
    default:
      return {
        label: 'Trabajando',
        bg: 'rgba(139, 92, 246, 0.15)',
        color: '#7c3aed',
        border: 'rgba(139, 92, 246, 0.35)',
      };
  }
};

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

const ProfilesBoard: React.FC = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [lotes, setLotes] = useState<LoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<number | 'all' | 'none'>('all');
  const [selectedLoteId, setSelectedLoteId] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<number | 'all'>('all');

  // Inline feedback for tag updates
  const [updatingProfileId, setUpdatingProfileId] = useState<number | null>(null);
  const [updatingLoteProfileId, setUpdatingLoteProfileId] = useState<number | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Dynamic Tag Creation Modal State
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');
  const [tagError, setTagError] = useState('');
  const [savingTag, setSavingTag] = useState(false);
  const [assignToProfileId, setAssignToProfileId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resProfiles, resTags, resLotes] = await Promise.all([
        api.get('/profiles?archived=false'),
        api.get('/tags'),
        api.get('/lotes'),
      ]);
      setProfiles(resProfiles.data);
      setTags(resTags.data);
      setLotes(resLotes.data);
    } catch (err) {
      console.error('Error fetching board data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update profile tag directly from card
  const handleTagChange = async (profileId: number, newTagIdStr: string) => {
    const newTagId = newTagIdStr ? Number(newTagIdStr) : null;
    setUpdatingProfileId(profileId);

    // Optimistic update
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === profileId) {
          const matchingTag = tags.find((t) => t.id === newTagId);
          return {
            ...p,
            tag_id: newTagId,
            tag: matchingTag || undefined,
          };
        }
        return p;
      })
    );

    try {
      await api.patch(`/profiles/${profileId}`, { tag_id: newTagId });
    } catch (err) {
      console.error('Error al actualizar etiqueta del perfil:', err);
      // Revert upon error
      fetchData();
    } finally {
      setTimeout(() => {
        setUpdatingProfileId(null);
      }, 700);
    }
  };

  // Update profile lote directly from card
  const handleLoteChange = async (profileId: number, newLoteIdStr: string) => {
    const newLoteId = newLoteIdStr ? Number(newLoteIdStr) : null;
    setUpdatingLoteProfileId(profileId);

    // Optimistic update
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === profileId) {
          const matchingLote = lotes.find((l) => l.id === newLoteId);
          return {
            ...p,
            lote_id: newLoteId,
            lote: matchingLote || undefined,
          };
        }
        return p;
      })
    );

    try {
      await api.patch(`/profiles/${profileId}`, { lote_id: newLoteId });
    } catch (err) {
      console.error('Error al actualizar lote del perfil:', err);
      fetchData();
    } finally {
      setTimeout(() => {
        setUpdatingLoteProfileId(null);
      }, 700);
    }
  };

  const openCreateTagModal = (profileId?: number) => {
    setNewTagName('');
    setNewTagColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    setTagError('');
    setAssignToProfileId(profileId || null);
    setIsTagModalOpen(true);
  };

  const closeCreateTagModal = () => {
    setIsTagModalOpen(false);
    setAssignToProfileId(null);
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) {
      setTagError('El nombre de la etiqueta es obligatorio.');
      return;
    }

    setSavingTag(true);
    setTagError('');

    try {
      const res = await api.post('/tags', {
        name: newTagName.trim(),
        color: newTagColor,
      });
      const createdTag: TagItem = res.data;

      // Actualizar tags disponibles localmente
      setTags((prev) => [...prev, createdTag]);

      // Si se invocó desde una card específica, asignar la nueva etiqueta directamente a ese perfil
      if (assignToProfileId) {
        await handleTagChange(assignToProfileId, String(createdTag.id));
      }

      closeCreateTagModal();
    } catch (err: any) {
      console.error(err);
      setTagError(err.response?.data?.message || 'Error al crear la etiqueta.');
    } finally {
      setSavingTag(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Filtered profiles
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      // Search filter: name, lastname, gmail, profile_email
      if (search.trim()) {
        const query = search.toLowerCase();
        const fullName = `${p.name || ''} ${p.lastname || ''}`.toLowerCase();
        const gmail = (p.gmail || '').toLowerCase();
        const profEmail = (p.profile_email || '').toLowerCase();
        const matchesSearch = fullName.includes(query) || gmail.includes(query) || profEmail.includes(query);
        if (!matchesSearch) return false;
      }

      // Tag filter
      if (selectedTagId === 'none') {
        if (p.tag_id) return false;
      } else if (selectedTagId !== 'all') {
        if (p.tag_id !== selectedTagId) return false;
      }

      // Lote filter
      if (selectedLoteId !== 'all') {
        if (p.lote_id !== selectedLoteId) return false;
      }

      // Status filter
      if (selectedStatus !== 'all') {
        if (Number(p.status) !== selectedStatus) return false;
      }

      return true;
    });
  }, [profiles, search, selectedTagId, selectedLoteId, selectedStatus]);

  // Tag counts calculation
  const tagCounts = useMemo(() => {
    const counts: Record<number | string, number> = {
      all: profiles.length,
      none: profiles.filter((p) => !p.tag_id).length,
    };
    tags.forEach((t) => {
      counts[t.id] = profiles.filter((p) => p.tag_id === t.id).length;
    });
    return counts;
  }, [profiles, tags]);

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            <LayoutGrid style={{ color: 'var(--primary)' }} size={28} />
            Tablero de Perfiles
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Vista interactiva en tarjetas. Filtra y asigna etiquetas directamente a tus perfiles.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('/profiles/new')}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '0.5rem', fontWeight: 600 }}
          >
            <Plus size={18} />
            Nuevo Perfil
          </button>
        </div>
      </div>

      {/* Search and Secondary Filter Controls */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Buscar por nombre o correo (Gmail / Perfil)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.4rem', width: '100%' }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Lote filter */}
          <div style={{ minWidth: '180px' }}>
            <select
              className="input-field"
              value={selectedLoteId}
              onChange={(e) => setSelectedLoteId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              style={{ width: '100%' }}
            >
              <option value="all">📦 Todos los Lotes</option>
              {lotes.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div style={{ minWidth: '160px' }}>
            <select
              className="input-field"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              style={{ width: '100%' }}
            >
              <option value="all">🚦 Todos los Estados</option>
              <option value={1}>Nuevo</option>
              <option value={2}>En Preparación</option>
              <option value={3}>Listo</option>
              <option value={4}>Trabajando</option>
            </select>
          </div>
        </div>

        {/* Tag Filter Pills Bar */}
        <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <TagIcon size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Filtrar por Etiqueta:
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            {/* Pill: Todas */}
            <button
              type="button"
              onClick={() => setSelectedTagId('all')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: selectedTagId === 'all' ? 700 : 500,
                border: selectedTagId === 'all' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                background: selectedTagId === 'all' ? 'rgba(249, 115, 22, 0.15)' : 'var(--card-bg)',
                color: selectedTagId === 'all' ? 'var(--primary)' : 'var(--text-main)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span>Todas</span>
              <span style={{ background: selectedTagId === 'all' ? 'var(--primary)' : 'rgba(0,0,0,0.08)', color: selectedTagId === 'all' ? '#fff' : 'var(--text-muted)', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '9999px', fontWeight: 600 }}>
                {tagCounts.all || 0}
              </span>
            </button>

            {/* Pill: Sin Etiqueta */}
            <button
              type="button"
              onClick={() => setSelectedTagId('none')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: selectedTagId === 'none' ? 700 : 500,
                border: selectedTagId === 'none' ? '1px solid #64748b' : '1px solid var(--border-color)',
                background: selectedTagId === 'none' ? 'rgba(100, 116, 139, 0.15)' : 'var(--card-bg)',
                color: selectedTagId === 'none' ? '#334155' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span>Sin Etiqueta</span>
              <span style={{ background: 'rgba(0,0,0,0.08)', color: 'var(--text-muted)', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '9999px', fontWeight: 600 }}>
                {tagCounts.none || 0}
              </span>
            </button>

            {/* Individual Tags */}
            {tags.map((tag) => {
              const isSelected = selectedTagId === tag.id;
              const count = tagCounts[tag.id] || 0;
              const tagColor = tag.color || '#3b82f6';

              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setSelectedTagId(isSelected ? 'all' : tag.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? 700 : 500,
                    border: isSelected ? `2px solid ${tagColor}` : `1px solid var(--border-color)`,
                    background: isSelected ? `${tagColor}22` : 'var(--card-bg)',
                    color: isSelected ? tagColor : 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: tagColor,
                    }}
                  />
                  <span>{tag.name}</span>
                  <span
                    style={{
                      background: isSelected ? tagColor : 'rgba(0,0,0,0.08)',
                      color: isSelected ? '#ffffff' : 'var(--text-muted)',
                      fontSize: '0.7rem',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '9999px',
                      fontWeight: 600,
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Botón dinámico: Crear Nueva Etiqueta */}
            <button
              type="button"
              onClick={() => openCreateTagModal()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: '1px dashed var(--primary)',
                background: 'rgba(249, 115, 22, 0.08)',
                color: 'var(--primary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Crear nueva etiqueta"
            >
              <Plus size={14} />
              <span>Nueva Etiqueta</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <div>
          Mostrando <strong>{filteredProfiles.length}</strong> de <strong>{profiles.length}</strong> perfiles
        </div>
        {(selectedTagId !== 'all' || selectedLoteId !== 'all' || selectedStatus !== 'all' || search) && (
          <button
            onClick={() => {
              setSelectedTagId('all');
              setSelectedLoteId('all');
              setSelectedStatus('all');
              setSearch('');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              textDecoration: 'underline',
            }}
          >
            Limpiar todos los filtros
          </button>
        )}
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Cargando tablero de perfiles...</div>
      ) : filteredProfiles.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <LayoutGrid size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto', opacity: 0.4 }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>No se encontraron perfiles</h3>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 1.5rem 0', fontSize: '0.9rem' }}>
            Intenta cambiar los filtros seleccionados o el término de búsqueda.
          </p>
          <button
            onClick={() => {
              setSelectedTagId('all');
              setSelectedLoteId('all');
              setSelectedStatus('all');
              setSearch('');
            }}
            className="btn-secondary"
          >
            Restablecer Filtros
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredProfiles.map((p) => {
            const statusBadge = getStatusBadge(p.status);
            const totalActivities =
              (p._count?.google_activities || 0) +
              (p._count?.youtube_activities || 0) +
              (p._count?.gmaps_activities || 0) +
              (p._count?.browser_activities || 0) +
              (p._count?.quora_activities || 0) +
              (p._count?.medium_activities || 0);

            const isUpdatingThis = updatingProfileId === p.id;
            const loteItem = p.lote || (p.lote_id ? lotes.find((l) => l.id === p.lote_id) : undefined);

            return (
              <div
                key={p.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1.25rem',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--border-color)',
                  position: 'relative',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  background: 'var(--card-bg)',
                }}
              >
                {/* Card Top: ID, Status, Avatar, Full Name */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', marginBottom: '1rem' }}>
                  {/* Avatar */}
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: 'rgba(249, 115, 22, 0.15)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      flexShrink: 0,
                      overflow: 'hidden',
                      border: '2px solid rgba(249, 115, 22, 0.2)',
                    }}
                  >
                    {p.img ? (
                      <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      `${(p.name || 'P')[0]}${(p.lastname || '')[0] || ''}`.toUpperCase()
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        #{p.id}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {loteItem && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              padding: '0.12rem 0.45rem',
                              borderRadius: '9999px',
                              background: 'rgba(249, 115, 22, 0.12)',
                              color: 'var(--primary)',
                              border: '1px solid rgba(249, 115, 22, 0.3)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                            title={`Lote: ${loteItem.name}${loteItem.proveedor ? ` (${loteItem.proveedor})` : ''}`}
                          >
                            <Boxes size={11} />
                            <span>{loteItem.name}</span>
                          </span>
                        )}
                        {/* Status badge */}
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px',
                            background: statusBadge.bg,
                            color: statusBadge.color,
                            border: `1px solid ${statusBadge.border}`,
                          }}
                        >
                          {statusBadge.label}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/profiles/${p.id}/edit`}
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        textDecoration: 'none',
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={`${p.name} ${p.lastname}`}
                    >
                      {p.name} {p.lastname}
                    </Link>
                  </div>
                </div>

                {/* Card Body: Emails */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem', background: 'rgba(0,0,0,0.02)', padding: '0.65rem 0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(0,0,0,0.04)' }}>
                  {/* Gmail */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                      <Mail size={14} style={{ color: '#ea4335', flexShrink: 0 }} />
                      <span
                        style={{
                          color: p.gmail ? 'var(--text-main)' : 'var(--text-muted)',
                          fontFamily: 'monospace',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={p.gmail || 'Sin Gmail'}
                      >
                        {p.gmail || 'Sin Gmail'}
                      </span>
                    </div>
                    {p.gmail && (
                      <button
                        onClick={() => copyToClipboard(p.gmail || '')}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.1rem', color: copiedEmail === p.gmail ? '#10b981' : 'var(--text-muted)' }}
                        title="Copiar Gmail"
                      >
                        {copiedEmail === p.gmail ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    )}
                  </div>

                  {/* Profile Email if different */}
                  {p.profile_email && p.profile_email !== p.gmail && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                        <Mail size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <span
                          style={{
                            color: 'var(--text-muted)',
                            fontFamily: 'monospace',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={p.profile_email}
                        >
                          {p.profile_email}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(p.profile_email || '')}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.1rem', color: copiedEmail === p.profile_email ? '#10b981' : 'var(--text-muted)' }}
                        title="Copiar Correo Perfil"
                      >
                        {copiedEmail === p.profile_email ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Lote Block */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.65rem',
                    borderRadius: '0.5rem',
                    background: loteItem ? 'rgba(249, 115, 22, 0.08)' : 'rgba(0,0,0,0.02)',
                    border: loteItem ? '1px solid rgba(249, 115, 22, 0.25)' : '1px solid var(--border-color)',
                    marginBottom: '0.75rem',
                  }}
                >
                  <Boxes size={16} style={{ color: loteItem ? 'var(--primary)' : 'var(--text-muted)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: loteItem ? 'var(--primary)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        Lote {loteItem?.proveedor ? `(${loteItem.proveedor})` : ''}
                      </span>
                      {updatingLoteProfileId === p.id && (
                        <span style={{ fontSize: '0.68rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
                          <CheckCircle2 size={11} /> Guardado
                        </span>
                      )}
                    </div>
                    <select
                      className="input-field"
                      value={p.lote_id || ''}
                      onChange={(e) => handleLoteChange(p.id, e.target.value)}
                      style={{
                        padding: '0.25rem 0.45rem',
                        fontSize: '0.82rem',
                        borderRadius: '0.35rem',
                        width: '100%',
                        fontWeight: loteItem ? 600 : 400,
                        color: loteItem ? 'var(--text-main)' : 'var(--text-muted)',
                        borderColor: loteItem ? 'rgba(249, 115, 22, 0.35)' : 'var(--border-color)',
                        background: 'var(--card-bg)',
                      }}
                    >
                      <option value="">-- Sin Lote Asignado --</option>
                      {lotes.map((l) => (
                        <option key={l.id} value={l.id}>
                          📦 {l.name} {l.proveedor ? `(${l.proveedor})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Proxy & Location */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem', fontSize: '0.8rem' }}>
                  {/* Proxy */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Server size={14} style={{ color: '#0ea5e9', flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-muted)' }}>Proxy:</span>
                    {p.proxy ? (
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-main)' }}>
                        {p.proxy.ip}:{p.proxy.port}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin Proxy</span>
                    )}
                  </div>

                  {/* Location */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={14} style={{ color: '#ec4899', flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-muted)' }}>Ubicación:</span>
                    {p.location ? (
                      <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                        {p.location.location}, {p.location.state}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin Ubicación</span>
                    )}
                  </div>
                </div>

                {/* Direct Interactive Tag Picker on Card */}
                <div
                  style={{
                    marginTop: 'auto',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    background: p.tag ? `${p.tag.color || '#3b82f6'}12` : 'rgba(0,0,0,0.03)',
                    border: p.tag ? `1px solid ${p.tag.color || '#3b82f6'}33` : '1px solid var(--border-color)',
                    marginBottom: '0.85rem',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      <TagIcon size={12} style={{ color: p.tag?.color || 'var(--text-muted)' }} />
                      <span>Etiqueta</span>
                    </label>
                    {isUpdatingThis && (
                      <span style={{ fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
                        <CheckCircle2 size={12} /> Guardado
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <select
                      className="input-field"
                      value={p.tag_id || ''}
                      onChange={(e) => {
                        if (e.target.value === '__NEW__') {
                          openCreateTagModal(p.id);
                        } else {
                          handleTagChange(p.id, e.target.value);
                        }
                      }}
                      style={{
                        padding: '0.35rem 0.6rem',
                        fontSize: '0.82rem',
                        borderRadius: '0.375rem',
                        flex: 1,
                        fontWeight: p.tag ? 600 : 400,
                        color: p.tag ? (p.tag.color || 'var(--text-main)') : 'var(--text-muted)',
                        borderColor: p.tag ? (p.tag.color || 'var(--border-color)') : 'var(--border-color)',
                        background: 'var(--card-bg)',
                      }}
                    >
                      <option value="">-- Sin Etiqueta --</option>
                      {tags.map((t) => (
                        <option key={t.id} value={t.id}>
                          🏷️ {t.name}
                        </option>
                      ))}
                      <option value="__NEW__">➕ Crear nueva etiqueta...</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => openCreateTagModal(p.id)}
                      style={{
                        padding: '0.4rem 0.55rem',
                        borderRadius: '0.375rem',
                        border: '1px solid var(--border-color)',
                        background: 'var(--card-bg)',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                      title="Crear y asignar nueva etiqueta"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>

                {/* Actions Footer */}
                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                  <Link
                    to={`/profiles/${p.id}/edit`}
                    className="btn-secondary"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem',
                      fontSize: '0.8rem',
                      textDecoration: 'none',
                      borderRadius: '0.375rem',
                    }}
                  >
                    <Edit2 size={14} />
                    <span>Editar</span>
                  </Link>

                  <Link
                    to={`/profiles/${p.id}/activities`}
                    className="btn-secondary"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem',
                      fontSize: '0.8rem',
                      textDecoration: 'none',
                      borderRadius: '0.375rem',
                    }}
                    title="Ver actividades programadas"
                  >
                    <ListChecks size={14} />
                    <span>Actividades</span>
                    {totalActivities > 0 && (
                      <span
                        style={{
                          background: 'rgba(249, 115, 22, 0.15)',
                          color: 'var(--primary)',
                          padding: '0.1rem 0.35rem',
                          borderRadius: '9999px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                        }}
                      >
                        {totalActivities}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dinámico para Crear Etiqueta */}
      {isTagModalOpen && (
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
              maxWidth: '440px',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
              borderRadius: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TagIcon size={22} style={{ color: newTagColor }} />
                {assignToProfileId ? 'Crear y Asignar Etiqueta' : 'Nueva Etiqueta'}
              </h2>
              <button
                type="button"
                onClick={closeCreateTagModal}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {assignToProfileId && (
              <div
                style={{
                  background: 'rgba(249, 115, 22, 0.1)',
                  border: '1px solid rgba(249, 115, 22, 0.25)',
                  color: 'var(--primary)',
                  padding: '0.55rem 0.85rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.8rem',
                  marginBottom: '1rem',
                  fontWeight: 500,
                }}
              >
                Esta etiqueta se asignará automáticamente al perfil #{assignToProfileId} al crearse.
              </div>
            )}

            {tagError && (
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
                <span>{tagError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTag} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Nombre de la Etiqueta *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej. USA Prioritarios, Warm Up, Calentamiento, Lote A..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  Color Identificador
                </label>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewTagColor(c)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: c,
                        border: newTagColor === c ? '3px solid var(--text-main)' : '2px solid transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: newTagColor === c ? '0 0 0 2px var(--card-bg)' : 'none',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      {newTagColor === c && <Check size={16} color="#ffffff" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vista previa de la etiqueta */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Vista previa
                </label>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    border: `1.5px solid ${newTagColor}`,
                    background: `${newTagColor}22`,
                    color: newTagColor,
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: newTagColor }} />
                  <span>{newTagName.trim() || 'Nombre de etiqueta'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={closeCreateTagModal}
                  className="btn-secondary"
                  disabled={savingTag}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={savingTag}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Save size={16} />
                  {savingTag ? 'Creando...' : 'Crear Etiqueta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilesBoard;
