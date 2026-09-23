import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from './api';
import { ArrowLeft, Download, Plus, Save, Trash2, Edit2, ListChecks, Search, Eye, ThumbsUp, MessageSquare, Globe, MapPin, Star, Navigation, RefreshCw } from 'lucide-react';

interface ProfileItem {
  id: number;
  name: string;
  lastname: string;
  gmail?: string;
  profile_email?: string;
}

export interface ActivityLogItem {
  id: number;
  profile_id: number;
  activity_name: string;
  platform?: string;
  status: string;
  message?: string;
  created_at: string;
}

type PlatformType = 'youtube' | 'quora' | 'medium' | 'browser' | 'google' | 'gmaps' | 'logs';

const ProfileActivities: React.FC = () => {
  const { profileId } = useParams<{ profileId: string }>();

  const [profile, setProfile] = useState<ProfileItem | null>(null);
  const [platform, setPlatform] = useState<PlatformType>('youtube');
  const [actionType, setActionType] = useState<string>('search');
  const [activities, setActivities] = useState<{
    youtube: any[];
    quora: any[];
    medium: any[];
    browser: any[];
    google: any[];
    gmaps: any[];
  }>({
    youtube: [],
    quora: [],
    medium: [],
    browser: [],
    google: [],
    gmaps: [],
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formValues, setFormValues] = useState<any>({});
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const fetchActivityLogs = async () => {
    if (!profileId) return;
    setLogsLoading(true);
    try {
      const res = await api.get(`/activities/log/profile/${profileId}`);
      setActivityLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchProfileAndActivities = async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      const [profRes, actRes] = await Promise.all([
        api.get(`/profiles/${profileId}`),
        api.get(`/activities/profile/${profileId}`),
      ]);
      setProfile(profRes.data);
      setActivities({
        youtube: actRes.data.youtube || [],
        quora: actRes.data.quora || [],
        medium: actRes.data.medium || [],
        browser: actRes.data.browser || [],
        google: actRes.data.google || [],
        gmaps: actRes.data.gmaps || [],
      });
      fetchActivityLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndActivities();
  }, [profileId]);

  // Adjust default action type when platform changes
  const handlePlatformChange = (p: PlatformType) => {
    setPlatform(p);
    setIsBulkMode(false);
    setBulkText('');
    if (p === 'logs') {
      fetchActivityLogs();
    } else if (p === 'browser') {
      setActionType('visit_link');
    } else if (p === 'gmaps') {
      setActionType('gmaps_all');
    } else {
      setActionType('search');
    }
    setFormValues({});
    setEditingId(null);
  };

  const handleActionTypeChange = (act: string) => {
    setActionType(act);
    setIsBulkMode(false);
    setBulkText('');
    setFormValues({});
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) return;

    try {
      if (editingId) {
        await api.patch(`/activities/${platform}/${editingId}`, formValues);
      } else if (isBulkMode) {
        const queries = bulkText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
        if (queries.length === 0) {
          alert('Por favor ingresa al menos una búsqueda en el cuadro de texto.');
          return;
        }
        await api.post(`/activities/${platform}/bulk`, {
          profile_id: Number(profileId),
          queries,
        });
        setBulkText('');
        setIsBulkMode(false);
      } else {
        await api.post(`/activities/${platform}`, {
          profile_id: Number(profileId),
          ...formValues,
        });
      }
      setFormValues({});
      setEditingId(null);
      fetchProfileAndActivities();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar actividad');
    }
  };

  const handleStatusChange = async (actId: number, newStatus: number) => {
    try {
      await api.patch(`/activities/${platform}/${actId}/status`, { status: newStatus });
      fetchProfileAndActivities();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al actualizar estado');
    }
  };

  const handleDelete = async (actId: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta actividad?')) return;
    try {
      await api.delete(`/activities/${platform}/${actId}`);
      fetchProfileAndActivities();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar actividad');
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activities, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `profile_${profileId}_activities.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filter activities for current platform and action type
  const currentList = platform === 'logs' ? [] : ((activities as any)[platform] || []).filter((act: any) => {
    if (platform === 'browser') {
      return true; // visit_link
    }
    if (platform === 'google') {
      return true; // google_search
    }
    if (platform === 'gmaps') {
      if (actionType === 'gmaps_visit') return Boolean(act.place_id && !act.review_text);
      if (actionType === 'gmaps_search') return Boolean(act.search_query);
      if (actionType === 'gmaps_navigate') return Boolean(act.navigate_location);
      if (actionType === 'gmaps_review') return Boolean(act.review_text);
      return true; // gmaps_all
    }

    if (actionType === 'search') return Boolean(act.search_query);
    if (platform === 'youtube') {
      if (actionType === 'view_video') return Boolean(act.video_id && !act.comment_video_id && !act.likes_video_id);
      if (actionType === 'likes_video') return Boolean(act.likes_video_id);
      if (actionType === 'comment_video') return Boolean(act.comment_video_id);
    } else if (platform === 'quora') {
      if (actionType === 'view_question') return Boolean(act.question_id && !act.comment_question_id && !act.upvote_question_id);
      if (actionType === 'view_answer') return Boolean(act.answer_id && !act.comment_answer_id && !act.upvote_answer_id);
      if (actionType === 'upvote_question') return Boolean(act.upvote_question_id);
      if (actionType === 'upvote_answer') return Boolean(act.upvote_answer_id);
      if (actionType === 'comment_question') return Boolean(act.comment_question_id);
      if (actionType === 'comment_answer') return Boolean(act.comment_answer_id);
    } else if (platform === 'medium') {
      if (actionType === 'view_post') return Boolean(act.post_id && !act.comment_post_id && !act.claps_post_id);
      if (actionType === 'claps_post') return Boolean(act.claps_post_id);
      if (actionType === 'comment_post') return Boolean(act.comment_post_id);
    }
    return true;
  });

  return (
    <div className="dashboard">
      <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '2rem' }}>
        <Link to="/profiles" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1.25rem' }}>
          <ArrowLeft size={18} /> Volver a Perfiles
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#2563eb', padding: '0.75rem', borderRadius: '0.75rem', color: 'white' }}>
              <ListChecks size={26} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
                Actividades de {profile ? `${profile.name} ${profile.lastname}` : `Perfil #${profileId}`}
              </h1>
              <p className="subtitle" style={{ margin: 0, textAlign: 'left' }}>
                Administra, agrega y exporta las actividades automatizadas por módulo y tipo de acción.
              </p>
            </div>
          </div>
          <button className="btn btn-secondary" onClick={handleExportJson}>
            <Download size={18} /> Exportar JSON
          </button>
        </div>

        {/* TABS DE PLATAFORMA PRINCIPAL */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--border)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn ${platform === 'browser' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '0.5rem 0.5rem 0 0', padding: '0.65rem 1.25rem' }}
            onClick={() => handlePlatformChange('browser')}
          >
            🌐 Navegador ({activities.browser?.length || 0})
          </button>
          <button
            type="button"
            className={`btn ${platform === 'google' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '0.5rem 0.5rem 0 0', padding: '0.65rem 1.25rem' }}
            onClick={() => handlePlatformChange('google')}
          >
            🔍 Google ({activities.google?.length || 0})
          </button>
          <button
            type="button"
            className={`btn ${platform === 'gmaps' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '0.5rem 0.5rem 0 0', padding: '0.65rem 1.25rem' }}
            onClick={() => handlePlatformChange('gmaps')}
          >
            📍 Google Maps ({activities.gmaps?.length || 0})
          </button>
          <button
            type="button"
            className={`btn ${platform === 'youtube' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '0.5rem 0.5rem 0 0', padding: '0.65rem 1.25rem' }}
            onClick={() => handlePlatformChange('youtube')}
          >
            ▶️ YouTube ({activities.youtube?.length || 0})
          </button>
          <button
            type="button"
            className={`btn ${platform === 'quora' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '0.5rem 0.5rem 0 0', padding: '0.65rem 1.25rem' }}
            onClick={() => handlePlatformChange('quora')}
          >
            🔴 Quora ({activities.quora?.length || 0})
          </button>
          <button
            type="button"
            className={`btn ${platform === 'medium' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '0.5rem 0.5rem 0 0', padding: '0.65rem 1.25rem' }}
            onClick={() => handlePlatformChange('medium')}
          >
            ✍️ Medium ({activities.medium?.length || 0})
          </button>
          <button
            type="button"
            className={`btn ${platform === 'logs' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              borderRadius: '0.5rem 0.5rem 0 0',
              padding: '0.65rem 1.25rem',
              background: platform === 'logs' ? '#059669' : undefined,
              borderColor: platform === 'logs' ? '#059669' : undefined,
              color: platform === 'logs' ? '#fff' : undefined,
            }}
            onClick={() => handlePlatformChange('logs')}
          >
            📜 Activity Log ({activityLogs.length})
          </button>
        </div>

        {platform === 'logs' ? (
          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📜 Registro de Actividades Ejecutadas (Activity Log)
                </h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Historial de ejecuciones reportadas por el cliente Moshi con status Correcto o Error.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                onClick={fetchActivityLogs}
                disabled={logsLoading}
              >
                <RefreshCw size={14} className={logsLoading ? 'animate-spin' : ''} />
                {logsLoading ? 'Actualizando...' : 'Recargar Logs'}
              </button>
            </div>

            {logsLoading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando registros...</div>
            ) : activityLogs.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No hay actividades registradas en el log para este perfil aún.
              </div>
            ) : (
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-hover)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fecha / Hora</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Actividad</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Plataforma</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estado</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mensaje / Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', fontWeight: 600 }}>#{log.id}</td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                        {log.activity_name}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>
                        <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' }}>
                          {log.platform || 'General'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>
                        {log.status === 'Correcto' ? (
                          <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#16a34a', fontWeight: 'bold' }}>
                            ✅ Correcto
                          </span>
                        ) : log.status === 'Error' ? (
                          <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#dc2626', fontWeight: 'bold' }}>
                            ❌ Error
                          </span>
                        ) : (
                          <span className="badge" style={{ background: 'rgba(156, 163, 175, 0.2)', color: '#4b5563' }}>
                            {log.status}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text)' }}>
                        {log.message || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <>
            {/* SUB-TABS POR TIPO DE ACCIÓN ESPECÍFICA */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
          {platform === 'browser' && (
            <button
              type="button"
              className={`btn ${actionType === 'visit_link' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem' }}
              onClick={() => handleActionTypeChange('visit_link')}
            >
              <Globe size={14} /> Visitar Sitio Web (Link)
            </button>
          )}

          {platform === 'google' && (
            <button
              type="button"
              className={`btn ${actionType === 'google_search' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem' }}
              onClick={() => handleActionTypeChange('google_search')}
            >
              <Search size={14} /> Búsqueda en Google
            </button>
          )}

          {platform === 'gmaps' && (
            <>
              <button
                type="button"
                className={`btn ${actionType === 'gmaps_all' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
                onClick={() => handleActionTypeChange('gmaps_all')}
              >
                <MapPin size={14} /> Todas las Acciones G-Maps
              </button>
              <button
                type="button"
                className={`btn ${actionType === 'gmaps_search' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
                onClick={() => handleActionTypeChange('gmaps_search')}
              >
                <Search size={14} /> Búsqueda en Mapa
              </button>
              <button
                type="button"
                className={`btn ${actionType === 'gmaps_visit' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
                onClick={() => handleActionTypeChange('gmaps_visit')}
              >
                <Eye size={14} /> Visitar Link / Place ID
              </button>
              <button
                type="button"
                className={`btn ${actionType === 'gmaps_navigate' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
                onClick={() => handleActionTypeChange('gmaps_navigate')}
              >
                <Navigation size={14} /> Navegar Ubicación
              </button>
              <button
                type="button"
                className={`btn ${actionType === 'gmaps_review' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
                onClick={() => handleActionTypeChange('gmaps_review')}
              >
                <Star size={14} /> Dejar Reseña / Rating
              </button>
            </>
          )}

          {platform === 'youtube' && (
            <>
              <button
                type="button"
                className={`btn ${actionType === 'search' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
                onClick={() => handleActionTypeChange('search')}
              >
                <Search size={14} /> Búsqueda de YouTube
              </button>
              <button
                type="button"
                className={`btn ${actionType === 'view_video' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
                onClick={() => handleActionTypeChange('view_video')}
              >
                <Eye size={14} /> Ver Video
              </button>
              <button
                type="button"
                className={`btn ${actionType === 'likes_video' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
                onClick={() => handleActionTypeChange('likes_video')}
              >
                <ThumbsUp size={14} /> Me Gusta Video
              </button>
              <button
                type="button"
                className={`btn ${actionType === 'comment_video' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
                onClick={() => handleActionTypeChange('comment_video')}
              >
                <MessageSquare size={14} /> Comentar en Video
              </button>
            </>
          )}

          {platform === 'quora' && (
            <>
              <button
                type="button"
                className={`btn ${actionType === 'search' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
                onClick={() => handleActionTypeChange('search')}
              >
                <Search size={14} /> Búsqueda de Quora
              </button>
              <button
                type="button"
                className={`btn ${actionType === 'view_question' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
                onClick={() => handleActionTypeChange('view_question')}
              >
                <Eye size={14} /> Ver Pregunta
              </button>
              <button
                type="button"
                className={`btn ${actionType === 'view_answer' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
                onClick={() => handleActionTypeChange('view_answer')}
              >
                <Eye size={14} /> Ver Respuesta
              </button>
              <button
                type="button"
                className={`btn ${actionType === 'upvote_question' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
                onClick={() => handleActionTypeChange('upvote_question')}
              >
                <ThumbsUp size={14} /> Me Gusta Pregunta
              </button>
              <button
                type="button"
                className={`btn ${actionType === 'upvote_answer' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
                onClick={() => handleActionTypeChange('upvote_answer')}
              >
                <ThumbsUp size={14} /> Me Gusta Respuesta
              </button>
              <button
                type="button"
                className={`btn ${actionType === 'comment_question' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
                onClick={() => handleActionTypeChange('comment_question')}
              >
                <MessageSquare size={14} /> Comentar Pregunta
              </button>
              <button
                type="button"
                className={`btn ${actionType === 'comment_answer' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
                onClick={() => handleActionTypeChange('comment_answer')}
              >
                <MessageSquare size={14} /> Comentar Respuesta
              </button>
            </>
          )}

          {platform === 'medium' && (
            <>
              <button
                type="button"
                className={`btn ${actionType === 'search' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
                onClick={() => handleActionTypeChange('search')}
              >
                <Search size={14} /> Búsqueda de Medium
              </button>
              <button
                type="button"
                className={`btn ${actionType === 'view_post' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
                onClick={() => handleActionTypeChange('view_post')}
              >
                <Eye size={14} /> Ver Post
              </button>
              <button
                type="button"
                className={`btn ${actionType === 'claps_post' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
                onClick={() => handleActionTypeChange('claps_post')}
              >
                <ThumbsUp size={14} /> Me Gusta Post (Claps)
              </button>
              <button
                type="button"
                className={`btn ${actionType === 'comment_post' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
                onClick={() => handleActionTypeChange('comment_post')}
              >
                <MessageSquare size={14} /> Comentar Post
              </button>
            </>
          )}
        </div>

        {/* FORMULARIO AGREGAR / EDITAR EN ESTE TAB ESPECÍFICO */}
        <form onSubmit={handleSave} className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} color="var(--primary)" />
              {editingId ? 'Editar Actividad' : isBulkMode ? 'Agregar Búsquedas en Bulk' : 'Agregar Nueva Actividad'}
            </h3>
            {!editingId && (platform === 'google' || (platform === 'youtube' && actionType === 'search')) && (
              <div style={{ display: 'inline-flex', background: 'var(--surface-hover)', padding: '2px', borderRadius: '0.375rem' }}>
                <button
                  type="button"
                  onClick={() => setIsBulkMode(false)}
                  style={{
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '0.25rem',
                    border: 'none',
                    cursor: 'pointer',
                    background: !isBulkMode ? 'var(--primary)' : 'transparent',
                    color: !isBulkMode ? 'white' : 'var(--text-muted)',
                  }}
                >
                  Individual
                </button>
                <button
                  type="button"
                  onClick={() => setIsBulkMode(true)}
                  style={{
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '0.25rem',
                    border: 'none',
                    cursor: 'pointer',
                    background: isBulkMode ? 'var(--primary)' : 'transparent',
                    color: isBulkMode ? 'white' : 'var(--text-muted)',
                  }}
                >
                  Masivo (Bulk Textarea)
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* BROWSER INPUTS */}
            {platform === 'browser' && (
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Link / URL del sitio web</label>
                <input
                  type="url"
                  className="input-field"
                  placeholder="https://ejemplo.com"
                  value={formValues.link || ''}
                  onChange={(e) => setFormValues({ ...formValues, link: e.target.value })}
                  required
                />
              </div>
            )}

            {/* GOOGLE INPUTS */}
            {platform === 'google' && (
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                {isBulkMode ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <label style={{ fontWeight: 600 }}>Búsquedas Masivas en Google (una por línea)</label>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                        {bulkText.split('\n').filter((l) => l.trim()).length} búsquedas
                      </span>
                    </div>
                    <textarea
                      className="input-field"
                      rows={6}
                      placeholder={`Pega aquí tus búsquedas separadas por Enter:\nmejores servicios de mudanza en Miami\nmudanzas economicas en Austin\nempresas de fletes y transporte`}
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      required
                    />
                  </>
                ) : (
                  <>
                    <label>Search Query (Búsqueda en Google)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Ej. mejores servicios de mudanza en Miami"
                      value={formValues.search_query || ''}
                      onChange={(e) => setFormValues({ ...formValues, search_query: e.target.value })}
                      required
                    />
                  </>
                )}
              </div>
            )}

            {/* GMAPS INPUTS */}
            {platform === 'gmaps' && (
              <>
                <div className="form-group">
                  <label>Place ID / Link Google Maps (Opcional)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ej. ChIJN1t_tDeuEmsRUsoyG83frY4 o URL de Maps"
                    value={formValues.place_id || ''}
                    onChange={(e) => setFormValues({ ...formValues, place_id: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Search Query (Búsqueda en el mapa)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ej. restaurantes cerca de mí"
                    value={formValues.search_query || ''}
                    onChange={(e) => setFormValues({ ...formValues, search_query: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Navigate Location (Navegar a ubicación)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ej. 25.7617, -80.1918 o Dirección"
                    value={formValues.navigate_location || ''}
                    onChange={(e) => setFormValues({ ...formValues, navigate_location: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Rating / Calificación (1 a 5 estrellas)</label>
                  <select
                    className="input-field"
                    value={formValues.rating !== undefined ? formValues.rating : 5}
                    onChange={(e) => setFormValues({ ...formValues, rating: Number(e.target.value) })}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Estrellas</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Estrellas</option>
                    <option value={3}>⭐⭐⭐ 3 Estrellas</option>
                    <option value={2}>⭐⭐ 2 Estrellas</option>
                    <option value={1}>⭐ 1 Estrella</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Review Text (Texto de Reseña)</label>
                  <textarea
                    className="input-field"
                    rows={3}
                    placeholder="Ej. Excelente servicio y atención, muy recomendado!"
                    value={formValues.review_text || ''}
                    onChange={(e) => setFormValues({ ...formValues, review_text: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* YOUTUBE / QUORA / MEDIUM COMMON SEARCH */}
            {(platform === 'youtube' || platform === 'quora' || platform === 'medium') && actionType === 'search' && (
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                {platform === 'youtube' && isBulkMode ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <label style={{ fontWeight: 600 }}>Búsquedas Masivas en YouTube (una por línea)</label>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                        {bulkText.split('\n').filter((l) => l.trim()).length} búsquedas
                      </span>
                    </div>
                    <textarea
                      className="input-field"
                      rows={6}
                      placeholder={`Pega aquí tus búsquedas de YouTube separadas por Enter:\ntutorial react vite\ncomo crear un bot en python\nmusica relajante para trabajar`}
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      required
                    />
                  </>
                ) : (
                  <>
                    <label>Search Query (Término de búsqueda)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Ej. tutorial python nestjs"
                      value={formValues.search_query || ''}
                      onChange={(e) => setFormValues({ ...formValues, search_query: e.target.value })}
                      required
                    />
                  </>
                )}
              </div>
            )}

            {/* YOUTUBE INPUTS */}
            {platform === 'youtube' && actionType === 'view_video' && (
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Video ID</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej. dQw4w9WgXcQ"
                  value={formValues.video_id || ''}
                  onChange={(e) => setFormValues({ ...formValues, video_id: e.target.value })}
                  required
                />
              </div>
            )}

            {platform === 'youtube' && actionType === 'likes_video' && (
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Video ID (Me Gusta)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej. dQw4w9WgXcQ"
                  value={formValues.likes_video_id || formValues.video_id || ''}
                  onChange={(e) => setFormValues({ ...formValues, likes_video_id: e.target.value, video_id: e.target.value })}
                  required
                />
              </div>
            )}

            {platform === 'youtube' && actionType === 'comment_video' && (
              <>
                <div className="form-group">
                  <label>Video ID</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ej. dQw4w9WgXcQ"
                    value={formValues.video_id || ''}
                    onChange={(e) => setFormValues({ ...formValues, video_id: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Comment / Texto Comentario (Comment Video ID)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ej. Excelente video explicativo"
                    value={formValues.comment_video_id || ''}
                    onChange={(e) => setFormValues({ ...formValues, comment_video_id: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            {/* QUORA INPUTS */}
            {platform === 'quora' && actionType === 'view_question' && (
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Question ID</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej. ID o slug de pregunta"
                  value={formValues.question_id || ''}
                  onChange={(e) => setFormValues({ ...formValues, question_id: e.target.value })}
                  required
                />
              </div>
            )}

            {platform === 'quora' && actionType === 'view_answer' && (
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Answer ID</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej. ID de respuesta"
                  value={formValues.answer_id || ''}
                  onChange={(e) => setFormValues({ ...formValues, answer_id: e.target.value })}
                  required
                />
              </div>
            )}

            {platform === 'quora' && actionType === 'upvote_question' && (
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Upvote Question ID</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej. ID de pregunta"
                  value={formValues.upvote_question_id || ''}
                  onChange={(e) => setFormValues({ ...formValues, upvote_question_id: e.target.value })}
                  required
                />
              </div>
            )}

            {platform === 'quora' && actionType === 'upvote_answer' && (
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Upvote Answer ID</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej. ID de respuesta"
                  value={formValues.upvote_answer_id || ''}
                  onChange={(e) => setFormValues({ ...formValues, upvote_answer_id: e.target.value })}
                  required
                />
              </div>
            )}

            {platform === 'quora' && actionType === 'comment_question' && (
              <>
                <div className="form-group">
                  <label>Question ID</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formValues.question_id || ''}
                    onChange={(e) => setFormValues({ ...formValues, question_id: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Comment Question ID / Texto Comentario</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formValues.comment_question_id || ''}
                    onChange={(e) => setFormValues({ ...formValues, comment_question_id: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            {platform === 'quora' && actionType === 'comment_answer' && (
              <>
                <div className="form-group">
                  <label>Answer ID</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formValues.answer_id || ''}
                    onChange={(e) => setFormValues({ ...formValues, answer_id: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Comment Answer ID / Texto Comentario</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formValues.comment_answer_id || ''}
                    onChange={(e) => setFormValues({ ...formValues, comment_answer_id: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            {/* MEDIUM INPUTS */}
            {platform === 'medium' && actionType === 'view_post' && (
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Post ID</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej. ID o slug de post"
                  value={formValues.post_id || ''}
                  onChange={(e) => setFormValues({ ...formValues, post_id: e.target.value })}
                  required
                />
              </div>
            )}

            {platform === 'medium' && actionType === 'claps_post' && (
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Claps Post ID</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej. ID de post para dar Claps"
                  value={formValues.claps_post_id || ''}
                  onChange={(e) => setFormValues({ ...formValues, claps_post_id: e.target.value })}
                  required
                />
              </div>
            )}

            {platform === 'medium' && actionType === 'comment_post' && (
              <>
                <div className="form-group">
                  <label>Post ID</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formValues.post_id || ''}
                    onChange={(e) => setFormValues({ ...formValues, post_id: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Comment Post ID / Texto Comentario</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formValues.comment_post_id || ''}
                    onChange={(e) => setFormValues({ ...formValues, comment_post_id: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            {/* CAMPOS OPCIONALES DE PROGRAMACIÓN */}
            <div className="form-group">
              <label>Fecha Programada (Opcional)</label>
              <input
                type="date"
                className="input-field"
                value={formValues.publish_date || ''}
                onChange={(e) => setFormValues({ ...formValues, publish_date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Hora Programada (Opcional)</label>
              <input
                type="time"
                className="input-field"
                value={formValues.publish_time || ''}
                onChange={(e) => setFormValues({ ...formValues, publish_time: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            {editingId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditingId(null);
                  setFormValues({});
                }}
              >
                Cancelar Edición
              </button>
            )}
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> {editingId ? 'Guardar Cambios' : 'Agregar a esta pestaña'}
            </button>
          </div>
        </form>

        {/* LISTA DE ACTIVIDADES EN ESTA PESTAÑA */}
        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>
            Listado de Actividades ({currentList.length})
          </h3>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando actividades...</div>
          ) : currentList.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No hay actividades registradas en esta pestaña.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem' }}>ID</th>
                    <th style={{ padding: '0.75rem' }}>Detalle de la Acción</th>
                    <th style={{ padding: '0.75rem' }}>Programación (Fecha / Hora)</th>
                    <th style={{ padding: '0.75rem' }}>Estado / Finalizado</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentList.map((act: any) => (
                    <tr key={act.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>#{act.id}</td>
                      <td style={{ padding: '0.75rem' }}>
                        {act.link && <div><strong>Link:</strong> <a href={act.link} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>{act.link}</a></div>}
                        {act.search_query && <div><strong>Búsqueda:</strong> {act.search_query}</div>}
                        {act.place_id && <div><strong>Place ID / Link:</strong> {act.place_id}</div>}
                        {act.navigate_location && <div><strong>Navegar Ubicación:</strong> {act.navigate_location}</div>}
                        {act.review_text && <div><strong>Reseña:</strong> {act.review_text}</div>}
                        {act.rating !== undefined && act.rating !== null && platform === 'gmaps' && <div><strong>Rating:</strong> {'⭐'.repeat(act.rating)} ({act.rating}/5)</div>}

                        {act.video_id && <div><strong>Video ID:</strong> {act.video_id}</div>}
                        {act.comment_video_id && <div><strong>Comment Video ID:</strong> {act.comment_video_id}</div>}
                        {act.likes_video_id && <div><strong>Likes Video ID:</strong> {act.likes_video_id}</div>}
                        {act.question_id && <div><strong>Question ID:</strong> {act.question_id}</div>}
                        {act.answer_id && <div><strong>Answer ID:</strong> {act.answer_id}</div>}
                        {act.upvote_question_id && <div><strong>Upvote Question:</strong> {act.upvote_question_id}</div>}
                        {act.upvote_answer_id && <div><strong>Upvote Answer:</strong> {act.upvote_answer_id}</div>}
                        {act.comment_question_id && <div><strong>Comment Question:</strong> {act.comment_question_id}</div>}
                        {act.comment_answer_id && <div><strong>Comment Answer:</strong> {act.comment_answer_id}</div>}
                        {act.post_id && <div><strong>Post ID:</strong> {act.post_id}</div>}
                        {act.claps_post_id && <div><strong>Claps Post:</strong> {act.claps_post_id}</div>}
                        {act.comment_post_id && <div><strong>Comment Post:</strong> {act.comment_post_id}</div>}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                        {act.publish_date || act.publish_time ? (
                          <div>
                            <div>📅 {act.publish_date || 'Sin fecha'}</div>
                            <div>⏰ {act.publish_time || 'Sin hora'}</div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Sin programar</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <select
                          className="input-field"
                          style={{
                            padding: '0.3rem 0.6rem',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            background: act.status === 1 ? 'rgba(34,197,94,0.15)' : act.status === 2 ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.15)',
                            color: act.status === 1 ? '#22c55e' : act.status === 2 ? '#ef4444' : '#eab308',
                          }}
                          value={act.status}
                          onChange={(e) => handleStatusChange(act.id, Number(e.target.value))}
                        >
                          <option value={0}>⏳ 0: Pendiente</option>
                          <option value={1}>✅ 1: Completado</option>
                          <option value={2}>❌ 2: Error</option>
                        </select>
                        {act.finished_at && (
                          <div style={{ fontSize: '0.75rem', color: '#22c55e', marginTop: '0.25rem' }}>
                            Finalizado: {new Date(act.finished_at).toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          {act.status !== 1 && (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', background: '#22c55e', color: 'white', borderColor: '#22c55e' }}
                              title="Marcar como Finalizado"
                              onClick={() => handleStatusChange(act.id, 1)}
                            >
                              Finalizar
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                            onClick={() => {
                              setEditingId(act.id);
                              setFormValues({ ...act });
                            }}
                          >
                            <Edit2 size={14} /> Editar
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                            onClick={() => handleDelete(act.id)}
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
        </div>
        </>
      )}
      </div>
    </div>
  );
};


export default ProfileActivities;



