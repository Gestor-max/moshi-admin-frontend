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
  Clock,
  FileText,
  Activity,
  Bot,
  User,
  Video,
  Globe,
  History,
  Calendar,
  Eye,
} from 'lucide-react';

interface TagItem {
  id: number;
  name: string;
  color?: string;
  is_system?: boolean;
  slug?: string;
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

interface ProfileTagItem {
  profile_id: number;
  tag_id: number;
  tag: TagItem;
}

interface TagHistoryItem {
  id: number;
  profile_id: number;
  tag_id: number;
  action: 'added' | 'removed';
  source: 'manual' | 'automatic';
  created_at: string;
  tag?: {
    id: number;
    name: string;
    color?: string;
    slug?: string;
    is_system?: boolean;
  };
}

interface ActivityLogItem {
  id: number;
  profile_id: number;
  activity_name: string;
  platform?: string;
  status: string;
  message?: string;
  created_at: string;
}

interface ProfileActivitiesData {
  youtube: any[];
  quora: any[];
  medium: any[];
  browser: any[];
  google: any[];
  gmaps: any[];
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
  profile_tags?: ProfileTagItem[];
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
      return {
        label: 'Trabajando',
        bg: 'rgba(139, 92, 246, 0.15)',
        color: '#7c3aed',
        border: 'rgba(139, 92, 246, 0.35)',
      };
    case 5:
      return {
        label: 'En Pausa',
        bg: 'rgba(239, 68, 68, 0.15)',
        color: '#ef4444',
        border: 'rgba(239, 68, 68, 0.35)',
      };
    case 6:
      return {
        label: 'En Observación',
        bg: 'rgba(249, 115, 22, 0.15)',
        color: '#ea580c',
        border: 'rgba(249, 115, 22, 0.35)',
      };
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

const getProfileTags = (p: ProfileItem, allTags: TagItem[]): TagItem[] => {
  if (p.profile_tags && p.profile_tags.length > 0) {
    return p.profile_tags.map((pt) => pt.tag).filter(Boolean);
  }
  if (p.tag) return [p.tag];
  if (p.tag_id) {
    const found = allTags.find((t) => t.id === p.tag_id);
    if (found) return [found];
  }
  return [];
};

interface ProfilesBoardProps {
  isObservation?: boolean;
}

const ProfilesBoard: React.FC<ProfilesBoardProps> = ({ isObservation = false }) => {
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
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | 'all' | 'none'>('all');

  // Inline feedback for tag updates
  const [updatingProfileId, setUpdatingProfileId] = useState<number | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Offcanvas Drawer State (Actividades, Logs, Tags history)
  const [selectedProfileForOffcanvas, setSelectedProfileForOffcanvas] = useState<ProfileItem | null>(null);
  const [offcanvasTab, setOffcanvasTab] = useState<'activities' | 'logs' | 'tags'>('activities');
  const [offcanvasLoading, setOffcanvasLoading] = useState(false);
  const [offcanvasActivities, setOffcanvasActivities] = useState<ProfileActivitiesData | null>(null);
  const [offcanvasLogs, setOffcanvasLogs] = useState<ActivityLogItem[]>([]);
  const [offcanvasTagHistory, setOffcanvasTagHistory] = useState<TagHistoryItem[]>([]);

  // Dynamic Tag Creation Modal State
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');
  const [tagError, setTagError] = useState('');
  const [savingTag, setSavingTag] = useState(false);
  const [assignToProfileId, setAssignToProfileId] = useState<number | null>(null);

  const handleOpenOffcanvas = async (p: ProfileItem) => {
    setSelectedProfileForOffcanvas(p);
    setOffcanvasLoading(true);
    setOffcanvasTab('activities');
    try {
      const [resActs, resLogs, resTagHist] = await Promise.all([
        api.get(`/activities/profile/${p.id}`).catch(() => ({ data: { youtube: [], quora: [], medium: [], browser: [], google: [], gmaps: [] } })),
        api.get(`/activities/log/profile/${p.id}`).catch(() => ({ data: [] })),
        api.get(`/profiles/${p.id}/tag-history`).catch(() => ({ data: [] })),
      ]);
      setOffcanvasActivities(resActs.data);
      setOffcanvasLogs(resLogs.data || []);
      setOffcanvasTagHistory(resTagHist.data || []);
    } catch (err) {
      console.error('Error fetching offcanvas data:', err);
    } finally {
      setOffcanvasLoading(false);
    }
  };

  const handleCloseOffcanvas = () => {
    setSelectedProfileForOffcanvas(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedProfileForOffcanvas(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const profilesUrl = isObservation
        ? '/profiles?observation=true&archived=false'
        : '/profiles?archived=false';
      const [resProfiles, resTags, resLotes, resLocations] = await Promise.all([
        api.get(profilesUrl),
        api.get('/tags'),
        api.get('/lotes'),
        api.get('/locations'),
      ]);
      const sortedProfiles = Array.isArray(resProfiles.data) ? [...resProfiles.data].sort((a, b) => b.id - a.id) : resProfiles.data;
      setProfiles(sortedProfiles);
      setTags(resTags.data);
      setLotes(resLotes.data);
      setLocations(resLocations.data);
    } catch (err) {
      console.error('Error fetching board data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isObservation]);

  // Assign a tag to profile (Many-to-Many)
  const handleAddTagToProfile = async (profileId: number, tagId: number) => {
    const tagObj = tags.find((t) => t.id === tagId);
    if (!tagObj) return;

    setUpdatingProfileId(profileId);

    // Optimistic update
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === profileId) {
          const current = getProfileTags(p, tags);
          if (current.some((t) => t.id === tagId)) return p;
          const newProfileTags: ProfileTagItem[] = [
            ...(p.profile_tags || current.map((t) => ({ profile_id: profileId, tag_id: t.id, tag: t }))),
            { profile_id: profileId, tag_id: tagId, tag: tagObj },
          ];
          return {
            ...p,
            tag_id: tagId,
            tag: tagObj,
            profile_tags: newProfileTags,
          };
        }
        return p;
      })
    );

    try {
      await api.post(`/profiles/${profileId}/tags/${tagId}?source=manual`);
      if (selectedProfileForOffcanvas?.id === profileId) {
        api.get(`/profiles/${profileId}/tag-history`).then((res) => setOffcanvasTagHistory(res.data || []));
      }
    } catch (err) {
      console.error('Error al asociar etiqueta:', err);
      fetchData();
    } finally {
      setTimeout(() => setUpdatingProfileId(null), 600);
    }
  };

  // Remove a tag from profile
  const handleRemoveTagFromProfile = async (profileId: number, tagId: number) => {
    setUpdatingProfileId(profileId);

    // Optimistic update
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === profileId) {
          const current = getProfileTags(p, tags);
          const filtered = current.filter((t) => t.id !== tagId);
          const newProfileTags: ProfileTagItem[] = filtered.map((t) => ({
            profile_id: profileId,
            tag_id: t.id,
            tag: t,
          }));
          return {
            ...p,
            tag_id: filtered[0]?.id || null,
            tag: filtered[0] || undefined,
            profile_tags: newProfileTags,
          };
        }
        return p;
      })
    );

    try {
      await api.delete(`/profiles/${profileId}/tags/${tagId}?source=manual`);
      if (selectedProfileForOffcanvas?.id === profileId) {
        api.get(`/profiles/${profileId}/tag-history`).then((res) => setOffcanvasTagHistory(res.data || []));
      }
    } catch (err) {
      console.error('Error al remover etiqueta:', err);
      fetchData();
    } finally {
      setTimeout(() => setUpdatingProfileId(null), 600);
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
        await handleAddTagToProfile(assignToProfileId, createdTag.id);
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
      // Regla de vista de observación vs tablero estándar
      if (isObservation) {
        if (Number(p.status) !== 6) return false;
      } else {
        if (Number(p.status) === 6) return false;
      }

      // Search filter: name, lastname, gmail, profile_email
      if (search.trim()) {
        const query = search.toLowerCase();
        const fullName = `${p.name || ''} ${p.lastname || ''}`.toLowerCase();
        const gmail = (p.gmail || '').toLowerCase();
        const profEmail = (p.profile_email || '').toLowerCase();
        const matchesSearch = fullName.includes(query) || gmail.includes(query) || profEmail.includes(query);
        if (!matchesSearch) return false;
      }

      const pTags = getProfileTags(p, tags);

      // Tag filter
      if (selectedTagId === 'none') {
        if (pTags.length > 0) return false;
      } else if (selectedTagId !== 'all') {
        if (!pTags.some((t) => t.id === selectedTagId)) return false;
      }

      // Lote filter
      if (selectedLoteId !== 'all') {
        if (p.lote_id !== selectedLoteId) return false;
      }

      // Status filter
      if (selectedStatus !== 'all') {
        if (Number(p.status) !== selectedStatus) return false;
      }

      // Location filter
      if (selectedLocationId === 'none') {
        if (p.location_id) return false;
      } else if (selectedLocationId !== 'all') {
        if (p.location_id !== selectedLocationId) return false;
      }

      return true;
    }).sort((a, b) => b.id - a.id);
  }, [profiles, search, selectedTagId, selectedLoteId, selectedStatus, selectedLocationId, tags, isObservation]);

  // Tag counts calculation
  const tagCounts = useMemo(() => {
    const relevantProfiles = profiles.filter((p) => isObservation ? Number(p.status) === 6 : Number(p.status) !== 6);
    const counts: Record<number | string, number> = {
      all: relevantProfiles.length,
      none: relevantProfiles.filter((p) => getProfileTags(p, tags).length === 0).length,
    };
    tags.forEach((t) => {
      counts[t.id] = relevantProfiles.filter((p) => getProfileTags(p, tags).some((pt) => pt.id === t.id)).length;
    });
    return counts;
  }, [profiles, tags, isObservation]);

  return (
    <div style={{ padding: '1.5rem 2rem', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            {isObservation ? (
              <>
                <Eye style={{ color: '#f97316' }} size={28} />
                Perfiles en Observación
              </>
            ) : (
              <>
                <LayoutGrid style={{ color: 'var(--primary)' }} size={28} />
                Tablero de Perfiles
              </>
            )}
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isObservation
              ? 'Supervisa y gestiona los perfiles que se encuentran en estado de observación.'
              : 'Vista interactiva en tarjetas. Filtra y asigna etiquetas directamente a tus perfiles.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => openCreateTagModal()}
            className="btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.15rem',
              borderRadius: '0.5rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <TagIcon size={17} style={{ color: 'var(--primary)' }} />
            Nueva Etiqueta
          </button>
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
          {!isObservation && (
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
                <option value={5}>En Pausa</option>
              </select>
            </div>
          )}

          {/* Location filter */}
          <div style={{ minWidth: '190px' }}>
            <select
              className="input-field"
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value === 'all' ? 'all' : e.target.value === 'none' ? 'none' : Number(e.target.value))}
              style={{ width: '100%' }}
            >
              <option value="all">📍 Todas las Ubicaciones</option>
              <option value="none">🚫 Sin Ubicación</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.location ? `${loc.location}, ${loc.state}` : loc.state}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tag Filter Pills Bar (Inline) */}
        <div style={{
          marginTop: '1rem',
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginRight: '0.25rem', whiteSpace: 'nowrap' }}>
            <TagIcon size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Filtrar por Etiqueta:
            </span>
          </div>

          {/* Pill: Todas */}
          <button
            type="button"
            onClick={() => setSelectedTagId('all')}
            style={{
              width: 'auto',
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
              width: 'auto',
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
                  width: 'auto',
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
              width: 'auto',
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
          {isObservation ? (
            <Eye size={48} style={{ color: '#f97316', margin: '0 auto 1rem auto', opacity: 0.5 }} />
          ) : (
            <LayoutGrid size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto', opacity: 0.4 }} />
          )}
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
            {isObservation ? 'No hay perfiles en observación' : 'No se encontraron perfiles'}
          </h3>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 1.5rem 0', fontSize: '0.9rem' }}>
            {isObservation
              ? 'Actualmente no hay ningún perfil con estado "En Observación".'
              : 'Intenta cambiar los filtros seleccionados o el término de búsqueda.'}
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: '0.85rem',
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
            const profileTags = getProfileTags(p, tags);
            const profileTagIds = new Set(profileTags.map((t) => t.id));
            const availableTagsForProfile = tags.filter((t) => !t.is_system && !profileTagIds.has(t.id));

            return (
              <div
                key={p.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '0.65rem',
                  border: '1px solid var(--border-color)',
                  position: 'relative',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  background: 'var(--card-bg)',
                }}
              >
                {/* Card Top: ID, Status, Avatar, Full Name */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', marginBottom: '0.45rem' }}>
                  {/* Avatar */}
                  <div
                    onClick={() => handleOpenOffcanvas(p)}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: 'rgba(249, 115, 22, 0.15)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      flexShrink: 0,
                      overflow: 'hidden',
                      border: '2px solid rgba(249, 115, 22, 0.2)',
                      cursor: 'pointer',
                    }}
                    title={`Ver historial de ${p.name} ${p.lastname}`}
                  >
                    {p.img ? (
                      <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      `${(p.name || 'P')[0]}${(p.lastname || '')[0] || ''}`.toUpperCase()
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.35rem', marginBottom: '0.15rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        #{p.id}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {loteItem && (
                          <span
                            style={{
                              fontSize: '0.66rem',
                              fontWeight: 600,
                              padding: '0.1rem 0.4rem',
                              borderRadius: '9999px',
                              background: 'rgba(249, 115, 22, 0.12)',
                              color: 'var(--primary)',
                              border: '1px solid rgba(249, 115, 22, 0.3)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                            }}
                            title={`Lote: ${loteItem.name}${loteItem.proveedor ? ` (${loteItem.proveedor})` : ''}`}
                          >
                            <Boxes size={10} />
                            <span>{loteItem.name}</span>
                          </span>
                        )}
                        {/* Status badge */}
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.45rem',
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

                    <button
                      type="button"
                      onClick={() => handleOpenOffcanvas(p)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        margin: 0,
                        width: 'auto',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        textDecoration: 'none',
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        transition: 'color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
                      title={`Ver historial de ${p.name} ${p.lastname}`}
                    >
                      {p.name} {p.lastname}
                    </button>
                  </div>
                </div>

                {/* Card Body: Emails */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '0.45rem', background: 'rgba(0,0,0,0.02)', padding: '0.35rem 0.55rem', borderRadius: '0.45rem', border: '1px solid rgba(0,0,0,0.04)' }}>
                  {/* Gmail */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: 0 }}>
                      <Mail size={13} style={{ color: '#ea4335', flexShrink: 0 }} />
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
                        {copiedEmail === p.gmail ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>

                  {/* Profile Email if different */}
                  {p.profile_email && p.profile_email !== p.gmail && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: 0 }}>
                        <Mail size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
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
                        {copiedEmail === p.profile_email ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Proxy & Location */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '0.45rem', fontSize: '0.76rem' }}>
                  {/* Proxy */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Server size={13} style={{ color: '#0ea5e9', flexShrink: 0 }} />
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={13} style={{ color: '#ec4899', flexShrink: 0 }} />
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

                {/* Panel de Actividades por Plataforma */}
                <div
                  style={{
                    padding: '0.35rem 0.55rem',
                    borderRadius: '0.45rem',
                    background: 'rgba(0,0,0,0.02)',
                    border: '1px solid var(--border-color)',
                    marginBottom: '0.45rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      ⚡ Actividades ({totalActivities})
                    </span>
                    {totalActivities === 0 && (
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin tareas</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', alignItems: 'center' }}>
                    <span
                      className="badge"
                      style={{
                        background: '#3b82f615',
                        color: '#3b82f6',
                        border: '1px solid #3b82f630',
                        fontSize: '0.7rem',
                        padding: '0.1rem 0.35rem',
                        borderRadius: '4px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                      }}
                      title="Búsquedas Google"
                    >
                      <span>🔍</span>
                      <span>{p._count?.google_activities || 0}</span>
                    </span>

                    <span
                      className="badge"
                      style={{
                        background: '#ef444415',
                        color: '#ef4444',
                        border: '1px solid #ef444430',
                        fontSize: '0.7rem',
                        padding: '0.1rem 0.35rem',
                        borderRadius: '4px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                      }}
                      title="YouTube"
                    >
                      <span>🔴</span>
                      <span>{p._count?.youtube_activities || 0}</span>
                    </span>

                    <span
                      className="badge"
                      style={{
                        background: '#10b98115',
                        color: '#10b981',
                        border: '1px solid #10b98130',
                        fontSize: '0.7rem',
                        padding: '0.1rem 0.35rem',
                        borderRadius: '4px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                      }}
                      title="Google Maps"
                    >
                      <span>🗺️</span>
                      <span>{p._count?.gmaps_activities || 0}</span>
                    </span>

                    <span
                      className="badge"
                      style={{
                        background: 'rgba(249, 115, 22, 0.12)',
                        color: '#f97316',
                        border: '1px solid rgba(249, 115, 22, 0.3)',
                        fontSize: '0.7rem',
                        padding: '0.1rem 0.35rem',
                        borderRadius: '4px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                      }}
                      title="Sitios Web (Browser)"
                    >
                      <span>🌐</span>
                      <span>{p._count?.browser_activities || 0}</span>
                    </span>

                    {(p._count?.quora_activities || 0) > 0 && (
                      <span
                        className="badge"
                        style={{
                          background: 'rgba(185, 43, 39, 0.12)',
                          color: '#b92b27',
                          border: '1px solid rgba(185, 43, 39, 0.3)',
                          fontSize: '0.7rem',
                          padding: '0.1rem 0.35rem',
                          borderRadius: '4px',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                        }}
                        title="Quora"
                      >
                        <span>❓</span>
                        <span>{p._count?.quora_activities || 0}</span>
                      </span>
                    )}

                    {(p._count?.medium_activities || 0) > 0 && (
                      <span
                        className="badge"
                        style={{
                          background: 'rgba(30, 41, 59, 0.12)',
                          color: 'var(--text-main)',
                          border: '1px solid var(--border-color)',
                          fontSize: '0.7rem',
                          padding: '0.1rem 0.35rem',
                          borderRadius: '4px',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                        }}
                        title="Medium"
                      >
                        <span>Ⓜ️</span>
                        <span>{p._count?.medium_activities || 0}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Sección de Etiquetas INLINE */}
                <div
                  style={{
                    marginTop: 'auto',
                    marginBottom: '0.45rem',
                    padding: '0.35rem 0.55rem',
                    borderRadius: '0.45rem',
                    background: 'rgba(0,0,0,0.02)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      <TagIcon size={11} style={{ color: 'var(--primary)' }} />
                      <span>Etiquetas ({profileTags.length})</span>
                    </div>
                    {isUpdatingThis && (
                      <span style={{ fontSize: '0.66rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
                        <CheckCircle2 size={10} /> Guardado
                      </span>
                    )}
                  </div>

                  {/* Tags list INLINE + Selector para agregar */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', alignItems: 'center' }}>
                    {profileTags.map((tag) => {
                      const tagColor = tag.color || '#3b82f6';
                      return (
                        <span
                          key={tag.id}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.12rem 0.45rem',
                            borderRadius: '9999px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            background: `${tagColor}18`,
                            color: tagColor,
                            border: `1px solid ${tagColor}40`,
                            lineHeight: 1.2,
                          }}
                        >
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: tagColor }} />
                          <span>{tag.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTagFromProfile(p.id, tag.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: tagColor,
                              padding: 0,
                              marginLeft: '0.1rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: 0.8,
                            }}
                            title={`Quitar etiqueta "${tag.name}"`}
                          >
                            <X size={11} />
                          </button>
                        </span>
                      );
                    })}

                    {/* Selector compacto para agregar etiquetas disponibles */}
                    {availableTagsForProfile.length > 0 ? (
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddTagToProfile(p.id, Number(e.target.value));
                          }
                        }}
                        style={{
                          padding: '0.12rem 0.4rem',
                          fontSize: '0.72rem',
                          borderRadius: '9999px',
                          border: '1px dashed var(--border-color)',
                          background: 'var(--card-bg)',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                        title="Asignar otra etiqueta a este perfil"
                      >
                        <option value="">+ Etiqueta</option>
                        {availableTagsForProfile.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    ) : profileTags.length === 0 ? (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Sin etiquetas asignadas
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Actions Footer */}
                <div style={{ display: 'flex', gap: '0.4rem', paddingTop: '0.45rem', borderTop: '1px solid var(--border-color)' }}>
                  <Link
                    to={`/profiles/${p.id}/edit`}
                    className="btn-secondary"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem',
                      padding: '0.35rem 0.5rem',
                      fontSize: '0.78rem',
                      textDecoration: 'none',
                      borderRadius: '0.375rem',
                    }}
                  >
                    <Edit2 size={13} />
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
                      gap: '0.3rem',
                      padding: '0.35rem 0.5rem',
                      fontSize: '0.78rem',
                      textDecoration: 'none',
                      borderRadius: '0.375rem',
                    }}
                    title="Ver actividades programadas"
                  >
                    <ListChecks size={13} />
                    <span>Actividades</span>
                    {totalActivities > 0 && (
                      <span
                        style={{
                          background: 'rgba(249, 115, 22, 0.15)',
                          color: 'var(--primary)',
                          padding: '0.08rem 0.3rem',
                          borderRadius: '9999px',
                          fontSize: '0.68rem',
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

      {/* ======================================================== */}
      {/* OFFCANVAS LATERAL IZQUIERDO: DETALLES, HISTORIAL Y LOGS */}
      {/* ======================================================== */}
      {selectedProfileForOffcanvas && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            display: 'flex',
          }}
        >
          {/* Backdrop con blur */}
          <div
            onClick={handleCloseOffcanvas}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(3px)',
              cursor: 'pointer',
            }}
          />

          {/* Drawer Lateral Izquierdo */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '640px',
              height: '100vh',
              background: 'var(--card-bg)',
              borderRight: '1px solid var(--border-color)',
              boxShadow: '12px 0 35px rgba(0, 0, 0, 0.45)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 10,
              overflow: 'hidden',
            }}
          >
            {/* Header del Offcanvas */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                background: 'rgba(0, 0, 0, 0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
                {/* Avatar */}
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(249, 115, 22, 0.15)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    flexShrink: 0,
                    overflow: 'hidden',
                    border: '2px solid rgba(249, 115, 22, 0.3)',
                  }}
                >
                  {selectedProfileForOffcanvas.img ? (
                    <img src={selectedProfileForOffcanvas.img} alt={selectedProfileForOffcanvas.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    `${(selectedProfileForOffcanvas.name || 'P')[0]}${(selectedProfileForOffcanvas.lastname || '')[0] || ''}`.toUpperCase()
                  )}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {selectedProfileForOffcanvas.name} {selectedProfileForOffcanvas.lastname}
                    </h2>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      #{selectedProfileForOffcanvas.id}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '0.15rem' }}>
                    {selectedProfileForOffcanvas.gmail || selectedProfileForOffcanvas.profile_email || 'Sin correo asociado'}
                  </div>
                </div>
              </div>

              {/* Botones de acción Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <Link
                  to={`/profiles/${selectedProfileForOffcanvas.id}/edit`}
                  className="btn-secondary"
                  style={{
                    width: 'auto',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.8rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                  title="Editar perfil completo"
                >
                  <Edit2 size={14} />
                  <span>Editar</span>
                </Link>

                <button
                  type="button"
                  onClick={handleCloseOffcanvas}
                  style={{
                    width: 'auto',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '0.4rem',
                    borderRadius: '0.375rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Cerrar panel"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Pestañas de Navegación del Offcanvas */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid var(--border-color)',
                background: 'rgba(0, 0, 0, 0.01)',
                padding: '0 1.25rem',
                gap: '0.5rem',
              }}
            >
              <button
                type="button"
                onClick={() => setOffcanvasTab('activities')}
                style={{
                  width: 'auto',
                  background: 'none',
                  border: 'none',
                  borderBottom: offcanvasTab === 'activities' ? '2px solid var(--primary)' : '2px solid transparent',
                  padding: '0.85rem 0.75rem',
                  color: offcanvasTab === 'activities' ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: offcanvasTab === 'activities' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <ListChecks size={16} />
                <span>Actividades</span>
                {offcanvasActivities && (
                  <span
                    style={{
                      background: offcanvasTab === 'activities' ? 'var(--primary)' : 'rgba(0,0,0,0.08)',
                      color: offcanvasTab === 'activities' ? '#fff' : 'var(--text-muted)',
                      fontSize: '0.7rem',
                      padding: '0.1rem 0.45rem',
                      borderRadius: '9999px',
                      fontWeight: 600,
                    }}
                  >
                    {(offcanvasActivities.youtube?.length || 0) +
                      (offcanvasActivities.google?.length || 0) +
                      (offcanvasActivities.gmaps?.length || 0) +
                      (offcanvasActivities.browser?.length || 0) +
                      (offcanvasActivities.quora?.length || 0) +
                      (offcanvasActivities.medium?.length || 0)}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setOffcanvasTab('logs')}
                style={{
                  width: 'auto',
                  background: 'none',
                  border: 'none',
                  borderBottom: offcanvasTab === 'logs' ? '2px solid var(--primary)' : '2px solid transparent',
                  padding: '0.85rem 0.75rem',
                  color: offcanvasTab === 'logs' ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: offcanvasTab === 'logs' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <FileText size={16} />
                <span>Logs</span>
                <span
                  style={{
                    background: offcanvasTab === 'logs' ? 'var(--primary)' : 'rgba(0,0,0,0.08)',
                    color: offcanvasTab === 'logs' ? '#fff' : 'var(--text-muted)',
                    fontSize: '0.7rem',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '9999px',
                    fontWeight: 600,
                  }}
                >
                  {offcanvasLogs.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setOffcanvasTab('tags')}
                style={{
                  width: 'auto',
                  background: 'none',
                  border: 'none',
                  borderBottom: offcanvasTab === 'tags' ? '2px solid var(--primary)' : '2px solid transparent',
                  padding: '0.85rem 0.75rem',
                  color: offcanvasTab === 'tags' ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: offcanvasTab === 'tags' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <History size={16} />
                <span>Historial Tags</span>
                <span
                  style={{
                    background: offcanvasTab === 'tags' ? 'var(--primary)' : 'rgba(0,0,0,0.08)',
                    color: offcanvasTab === 'tags' ? '#fff' : 'var(--text-muted)',
                    fontSize: '0.7rem',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '9999px',
                    fontWeight: 600,
                  }}
                >
                  {offcanvasTagHistory.length}
                </span>
              </button>
            </div>

            {/* Contenido scrolleable del Offcanvas */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
              {offcanvasLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Cargando datos del perfil...</div>
                  <small style={{ fontSize: '0.8rem' }}>Consultando actividades, bitácora y etiquetas</small>
                </div>
              ) : offcanvasTab === 'activities' ? (
                /* ================= PESTAÑA: ACTIVIDADES ================= */
                <div>
                  {(() => {
                    const acts = offcanvasActivities || { youtube: [], quora: [], medium: [], browser: [], google: [], gmaps: [] };
                    const allList = [
                      ...acts.youtube.map((a) => ({ ...a, platform: 'YouTube', icon: Video, color: '#ef4444' })),
                      ...acts.google.map((a) => ({ ...a, platform: 'Google', icon: Search, color: '#3b82f6' })),
                      ...acts.gmaps.map((a) => ({ ...a, platform: 'Google Maps', icon: MapPin, color: '#10b981' })),
                      ...acts.browser.map((a) => ({ ...a, platform: 'Navegador Web', icon: Globe, color: '#8b5cf6' })),
                      ...acts.quora.map((a) => ({ ...a, platform: 'Quora', icon: Activity, color: '#b91c1c' })),
                      ...acts.medium.map((a) => ({ ...a, platform: 'Medium', icon: Activity, color: '#000000' })),
                    ];

                    if (allList.length === 0) {
                      return (
                        <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                          <ListChecks size={40} style={{ opacity: 0.4, margin: '0 auto 0.75rem auto' }} />
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Sin actividades asignadas</div>
                          <p style={{ margin: 0, fontSize: '0.85rem' }}>Este perfil no tiene actividades de navegación o búsqueda pendientes.</p>
                        </div>
                      );
                    }

                    const completedCount = allList.filter((a) => Number(a.status) === 1).length;

                    return (
                      <div>
                        {/* Resumen */}
                        <div
                          style={{
                            display: 'flex',
                            gap: '0.75rem',
                            marginBottom: '1.25rem',
                            padding: '0.75rem 1rem',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--border-color)',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                            Total: {allList.length} actividades
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                            <span style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                              {completedCount} completadas
                            </span>
                            <span style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                              {allList.length - completedCount} pendientes
                            </span>
                          </div>
                        </div>

                        {/* Lista de actividades */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {allList.map((item, idx) => {
                            const isCompleted = Number(item.status) === 1;
                            const IconComp = item.icon || Activity;
                            return (
                              <div
                                key={idx}
                                style={{
                                  padding: '0.85rem 1rem',
                                  borderRadius: '0.5rem',
                                  background: 'var(--card-bg)',
                                  border: '1px solid var(--border-color)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.45rem',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                    <span
                                      style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '6px',
                                        background: `${item.color}22`,
                                        color: item.color,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                    >
                                      <IconComp size={14} />
                                    </span>
                                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                      {item.platform}
                                    </span>
                                    {item.kind !== undefined && (
                                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                        (Tipo {item.kind})
                                      </span>
                                    )}
                                  </div>

                                  <span
                                    style={{
                                      fontSize: '0.72rem',
                                      fontWeight: 600,
                                      padding: '0.15rem 0.5rem',
                                      borderRadius: '9999px',
                                      background: isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                      color: isCompleted ? '#10b981' : '#f59e0b',
                                      border: isCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                    }}
                                  >
                                    {isCompleted ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                                    {isCompleted ? 'Completada' : 'Pendiente'}
                                  </span>
                                </div>

                                {/* Detalle de la actividad */}
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', wordBreak: 'break-word', background: 'rgba(0,0,0,0.02)', padding: '0.45rem 0.6rem', borderRadius: '4px' }}>
                                  {item.search_query && <div><strong>Búsqueda:</strong> {item.search_query}</div>}
                                  {item.video_id && <div><strong>Video ID:</strong> {item.video_id}</div>}
                                  {item.comment_video_id && <div><strong>Comentar en:</strong> {item.comment_video_id}</div>}
                                  {item.likes_video_id && <div><strong>Like en:</strong> {item.likes_video_id}</div>}
                                  {item.target_url && <div><strong>URL:</strong> {item.target_url}</div>}
                                  {item.place_id && <div><strong>Place ID:</strong> {item.place_id}</div>}
                                  {item.review_text && <div><strong>Reseña:</strong> {item.review_text}</div>}
                                  {item.action_type && <div><strong>Acción:</strong> {item.action_type}</div>}
                                </div>

                                {/* Fechas programada y de finalización */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '0.35rem' }}>
                                  {(item.publish_date || item.publish_time) && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                      <Calendar size={12} />
                                      Programado: {item.publish_date} {item.publish_time}
                                    </div>
                                  )}
                                  {item.finished_at && (
                                    <div style={{ color: '#10b981' }}>
                                      Finalizado: {new Date(item.finished_at).toLocaleString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : offcanvasTab === 'logs' ? (
                /* ================= PESTAÑA: LOGS ================= */
                <div>
                  {offcanvasLogs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                      <FileText size={40} style={{ opacity: 0.4, margin: '0 auto 0.75rem auto' }} />
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Sin logs registrados</div>
                      <p style={{ margin: 0, fontSize: '0.85rem' }}>No se han generado eventos de ejecución para este perfil.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {offcanvasLogs.map((log) => {
                        const isSuccess = log.status?.toLowerCase().includes('correcto') || log.status?.toLowerCase().includes('success') || log.status?.toLowerCase().includes('ok');
                        return (
                          <div
                            key={log.id}
                            style={{
                              padding: '0.85rem 1rem',
                              borderRadius: '0.5rem',
                              background: 'var(--card-bg)',
                              border: '1px solid var(--border-color)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.35rem',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span
                                  style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    padding: '0.12rem 0.45rem',
                                    borderRadius: '4px',
                                    background: isSuccess ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                    color: isSuccess ? '#10b981' : '#ef4444',
                                  }}
                                >
                                  {log.status || 'Info'}
                                </span>
                                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                  {log.activity_name || log.platform || 'Actividad'}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {new Date(log.created_at).toLocaleString()}
                              </span>
                            </div>

                            {log.message && (
                              <div
                                style={{
                                  fontSize: '0.8rem',
                                  color: 'var(--text-main)',
                                  background: 'rgba(0, 0, 0, 0.03)',
                                  padding: '0.45rem 0.6rem',
                                  borderRadius: '4px',
                                  fontFamily: 'monospace',
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                }}
                              >
                                {log.message}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* ================= PESTAÑA: HISTORIAL DE TAGS ================= */
                <div>
                  {offcanvasTagHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                      <History size={40} style={{ opacity: 0.4, margin: '0 auto 0.75rem auto' }} />
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Sin historial de etiquetas</div>
                      <p style={{ margin: 0, fontSize: '0.85rem' }}>Aún no se han registrado eventos de adición o remoción de etiquetas para este perfil.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {offcanvasTagHistory.map((item) => {
                        const isAdded = item.action === 'added';
                        const isAuto = item.source === 'automatic';
                        const tagColor = item.tag?.color || '#3b82f6';

                        return (
                          <div
                            key={item.id}
                            style={{
                              padding: '0.85rem 1rem',
                              borderRadius: '0.5rem',
                              background: 'var(--card-bg)',
                              border: '1px solid var(--border-color)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '0.75rem',
                              flexWrap: 'wrap',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                              {/* Acción badge */}
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: '9999px',
                                  background: isAdded ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                  color: isAdded ? '#10b981' : '#ef4444',
                                  border: isAdded ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                }}
                              >
                                {isAdded ? <Plus size={12} /> : <X size={12} />}
                                {isAdded ? 'Agregada' : 'Quitada'}
                              </span>

                              {/* Tag pill */}
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  padding: '0.2rem 0.6rem',
                                  borderRadius: '9999px',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  background: `${tagColor}22`,
                                  color: tagColor,
                                  border: `1px solid ${tagColor}44`,
                                }}
                              >
                                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: tagColor }} />
                                {item.tag?.name || `Etiqueta #${item.tag_id}`}
                                {item.tag?.is_system && (
                                  <span style={{ fontSize: '0.65rem', opacity: 0.8, textTransform: 'uppercase' }}>
                                    (Sistema)
                                  </span>
                                )}
                              </span>

                              {/* Source badge: Manual vs Automática */}
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  padding: '0.15rem 0.45rem',
                                  borderRadius: '4px',
                                  background: isAuto ? 'rgba(139, 92, 246, 0.12)' : 'rgba(14, 165, 233, 0.12)',
                                  color: isAuto ? '#8b5cf6' : '#0284c7',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                }}
                              >
                                {isAuto ? <Bot size={11} /> : <User size={11} />}
                                {isAuto ? 'Automática' : 'Manual'}
                              </span>
                            </div>

                            {/* Timestamp */}
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                              {new Date(item.created_at).toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilesBoard;
