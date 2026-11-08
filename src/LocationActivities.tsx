import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from './api';
import {
  ArrowLeft,
  Save,
  Trash2,
  Edit2,
  ListChecks,
  Search,
  Eye,
  ThumbsUp,
  MessageSquare,
  Globe,
  MapPin,
  Navigation,
  Info,
} from 'lucide-react';

interface LocationItem {
  id: number;
  state: string;
  location: string;
  user_id: number;
}

type PlatformType = 'youtube' | 'quora' | 'medium' | 'browser' | 'google' | 'gmaps';

const LocationActivities: React.FC = () => {
  const { locationId } = useParams<{ locationId: string }>();

  const [locationData, setLocationData] = useState<LocationItem | null>(null);
  const [platform, setPlatform] = useState<PlatformType>('google');
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
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formValues, setFormValues] = useState<any>({});
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const fetchLocationAndActivities = async () => {
    if (!locationId) return;
    setLoading(true);
    try {
      const [locRes, actRes] = await Promise.all([
        api.get(`/locations/${locationId}`),
        api.get(`/locations/${locationId}/activities`),
      ]);
      setLocationData(locRes.data);
      setActivities({
        youtube: actRes.data.youtube || [],
        quora: actRes.data.quora || [],
        medium: actRes.data.medium || [],
        browser: actRes.data.browser || [],
        google: actRes.data.google || [],
        gmaps: actRes.data.gmaps || [],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocationAndActivities();
  }, [locationId]);

  const handlePlatformChange = (p: PlatformType) => {
    setPlatform(p);
    setIsBulkMode(false);
    setBulkText('');
    if (p === 'browser') {
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
    let defaultValues: any = {};
    if (platform === 'gmaps') {
      if (act === 'gmaps_search') defaultValues = { kind: 1 };
      else if (act === 'gmaps_visit') defaultValues = { kind: 2 };
      else if (act === 'gmaps_navigate') defaultValues = { kind: 3 };
      else if (act === 'gmaps_review') defaultValues = { kind: 4, rating: 5 };
    } else if (platform === 'youtube') {
      if (act === 'view_video' || act === 'search') defaultValues = { kind: 1 };
      else if (act === 'likes_video') defaultValues = { kind: 2 };
      else if (act === 'comment_video') defaultValues = { kind: 3 };
    } else if (platform === 'quora') {
      if (act === 'view_question' || act === 'search') defaultValues = { kind: 1 };
      else if (act === 'view_answer') defaultValues = { kind: 2 };
      else if (act === 'upvote_question') defaultValues = { kind: 3 };
      else if (act === 'upvote_answer') defaultValues = { kind: 4 };
      else if (act === 'comment_question') defaultValues = { kind: 5 };
      else if (act === 'comment_answer') defaultValues = { kind: 6 };
    } else if (platform === 'medium') {
      if (act === 'view_post' || act === 'search') defaultValues = { kind: 1 };
      else if (act === 'claps_post') defaultValues = { kind: 2 };
      else if (act === 'comment_post') defaultValues = { kind: 3 };
    }
    setFormValues(defaultValues);
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationId) return;

    try {
      const payload = { ...formValues };
      if (platform === 'gmaps' && payload.kind === undefined) {
        if (actionType === 'gmaps_review') payload.kind = 4;
        else if (actionType === 'gmaps_navigate') payload.kind = 3;
        else if (actionType === 'gmaps_visit') payload.kind = 2;
        else payload.kind = 1;
      } else if (platform === 'youtube' && payload.kind === undefined) {
        if (actionType === 'likes_video') payload.kind = 2;
        else if (actionType === 'comment_video') payload.kind = 3;
        else payload.kind = 1;
      } else if (platform === 'quora' && payload.kind === undefined) {
        if (actionType === 'view_answer') payload.kind = 2;
        else if (actionType === 'upvote_question') payload.kind = 3;
        else if (actionType === 'upvote_answer') payload.kind = 4;
        else if (actionType === 'comment_question') payload.kind = 5;
        else if (actionType === 'comment_answer') payload.kind = 6;
        else payload.kind = 1;
      } else if (platform === 'medium' && payload.kind === undefined) {
        if (actionType === 'claps_post') payload.kind = 2;
        else if (actionType === 'comment_post') payload.kind = 3;
        else payload.kind = 1;
      }

      if (editingId) {
        await api.patch(`/locations/${locationId}/activities/${platform}/${editingId}`, payload);
      } else if (isBulkMode) {
        const queries = bulkText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
        if (queries.length === 0) {
          alert('Por favor ingresa al menos un elemento en el cuadro de texto.');
          return;
        }

        let bulkAction = 'search';
        if (platform === 'browser') bulkAction = 'link';
        else if (platform === 'youtube') {
          if (actionType === 'view_video') bulkAction = 'watch';
          else if (actionType === 'comment_video') bulkAction = 'comment';
          else if (actionType === 'likes_video') bulkAction = 'like';
        } else if (platform === 'gmaps') {
          if (actionType === 'gmaps_visit') bulkAction = 'place';
          else if (actionType === 'gmaps_navigate') bulkAction = 'navigate';
          else if (actionType === 'gmaps_review') bulkAction = 'review';
        } else if (platform === 'quora') {
          if (actionType === 'view_question') bulkAction = 'question';
          else if (actionType === 'view_answer') bulkAction = 'answer';
          else if (actionType === 'upvote_question') bulkAction = 'upvote_question';
          else if (actionType === 'upvote_answer') bulkAction = 'upvote_answer';
          else if (actionType === 'comment_question') bulkAction = 'comment_question';
          else if (actionType === 'comment_answer') bulkAction = 'comment_answer';
        } else if (platform === 'medium') {
          if (actionType === 'view_post') bulkAction = 'post';
          else if (actionType === 'claps_post') bulkAction = 'claps';
          else if (actionType === 'comment_post') bulkAction = 'comment';
        }

        await api.post(`/locations/${locationId}/activities/${platform}/bulk`, {
          queries,
          action_type: bulkAction,
        });
        setBulkText('');
        setIsBulkMode(false);
      } else {
        await api.post(`/locations/${locationId}/activities/${platform}`, payload);
      }

      setFormValues({});
      setEditingId(null);
      fetchLocationAndActivities();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error al guardar la actividad');
    }
  };

  const handleEdit = (act: any) => {
    setEditingId(act.id);
    setIsBulkMode(false);
    setFormValues({ ...act });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta actividad plantilla?')) return;
    try {
      await api.delete(`/locations/${locationId}/activities/${platform}/${id}`);
      fetchLocationAndActivities();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter activities for current platform and action type
  const currentList = ((activities as any)[platform] || []).filter((act: any) => {
    if (platform === 'browser') return true;
    if (platform === 'google') return true;
    if (platform === 'gmaps') {
      if (actionType === 'gmaps_visit') return act.kind === 2 || Boolean(act.place_id && !act.review_text);
      if (actionType === 'gmaps_search') return act.kind === 1 || Boolean(act.search_query);
      if (actionType === 'gmaps_navigate') return act.kind === 3 || Boolean(act.navigate_location);
      if (actionType === 'gmaps_review') return act.kind === 4 || Boolean(act.review_text);
      return true;
    }
    if (actionType === 'search') return Boolean(act.search_query);
    if (platform === 'youtube') {
      if (actionType === 'view_video') return act.kind === 1 || Boolean(act.video_id && !act.comment_video_id && !act.likes_video_id);
      if (actionType === 'likes_video') return act.kind === 2 || Boolean(act.likes_video_id);
      if (actionType === 'comment_video') return act.kind === 3 || Boolean(act.comment_video_id);
    } else if (platform === 'quora') {
      if (actionType === 'view_question') return act.kind === 1 || Boolean(act.question_id && !act.comment_question_id && !act.upvote_question_id);
      if (actionType === 'view_answer') return act.kind === 2 || Boolean(act.answer_id && !act.comment_answer_id && !act.upvote_answer_id);
      if (actionType === 'upvote_question') return act.kind === 3 || Boolean(act.upvote_question_id);
      if (actionType === 'upvote_answer') return act.kind === 4 || Boolean(act.upvote_answer_id);
      if (actionType === 'comment_question') return act.kind === 5 || Boolean(act.comment_question_id);
      if (actionType === 'comment_answer') return act.kind === 6 || Boolean(act.comment_answer_id);
    } else if (platform === 'medium') {
      if (actionType === 'view_post') return act.kind === 1 || Boolean(act.post_id && !act.comment_post_id && !act.claps_post_id);
      if (actionType === 'claps_post') return act.kind === 2 || Boolean(act.claps_post_id);
      if (actionType === 'comment_post') return act.kind === 3 || Boolean(act.comment_post_id);
    }
    return true;
  });

  return (
    <div className="dashboard">
      <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '2rem' }}>
        <Link
          to="/locations"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            marginBottom: '1.25rem',
          }}
        >
          <ArrowLeft size={18} /> Volver a Ubicaciones
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: '0.75rem', color: 'white' }}>
              <ListChecks size={26} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
                Actividades Plantilla: {locationData ? `${locationData.location} (${locationData.state})` : `Location #${locationId}`}
              </h1>
              <p className="subtitle" style={{ margin: 0, textAlign: 'left' }}>
                Configura las actividades predefinidas que se clonarán automáticamente a cada nuevo perfil asignado a esta ubicación.
              </p>
            </div>
          </div>
        </div>

        {/* Banner Informativo */}
        <div
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '0.5rem',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            color: 'var(--text-main)',
            fontSize: '0.9rem',
          }}
        >
          <Info size={20} color="#3b82f6" style={{ flexShrink: 0 }} />
          <span>
            <strong>Plantilla de Ubicación:</strong> Todas las actividades guardadas aquí se asignarán automáticamente como actividades pendientes a cualquier perfil nuevo creado con esta ubicación.
          </span>
        </div>

        {/* TABS DE PLATAFORMA */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--border)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
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
            className={`btn ${platform === 'browser' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '0.5rem 0.5rem 0 0', padding: '0.65rem 1.25rem' }}
            onClick={() => handlePlatformChange('browser')}
          >
            🌐 Navegador ({activities.browser?.length || 0})
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
        </div>

        {/* SUBTABS POR TIPO DE ACCIÓN */}
        {platform === 'gmaps' && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {[
              { id: 'gmaps_all', label: 'Todas las Acciones', icon: <MapPin size={15} /> },
              { id: 'gmaps_search', label: 'Búsqueda Maps', icon: <Search size={15} /> },
              { id: 'gmaps_visit', label: 'Visitar Place ID', icon: <Eye size={15} /> },
              { id: 'gmaps_navigate', label: 'Navegación / Rutas', icon: <Navigation size={15} /> },
              { id: 'gmaps_review', label: 'Reseñas & Rating', icon: <MessageSquare size={15} /> },
            ].map((sub) => (
              <button
                key={sub.id}
                type="button"
                className={`btn ${actionType === sub.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                onClick={() => handleActionTypeChange(sub.id)}
              >
                {sub.icon} {sub.label}
              </button>
            ))}
          </div>
        )}

        {platform === 'youtube' && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {[
              { id: 'search', label: 'Búsquedas', icon: <Search size={15} /> },
              { id: 'view_video', label: 'Ver Video (ID)', icon: <Eye size={15} /> },
              { id: 'comment_video', label: 'Comentarios', icon: <MessageSquare size={15} /> },
              { id: 'likes_video', label: 'Likes', icon: <ThumbsUp size={15} /> },
            ].map((sub) => (
              <button
                key={sub.id}
                type="button"
                className={`btn ${actionType === sub.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                onClick={() => handleActionTypeChange(sub.id)}
              >
                {sub.icon} {sub.label}
              </button>
            ))}
          </div>
        )}

        {platform === 'quora' && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {[
              { id: 'search', label: 'Búsquedas', icon: <Search size={15} /> },
              { id: 'view_question', label: 'Ver Pregunta', icon: <Eye size={15} /> },
              { id: 'view_answer', label: 'Ver Respuesta', icon: <Eye size={15} /> },
              { id: 'upvote_question', label: 'Upvote Pregunta', icon: <ThumbsUp size={15} /> },
              { id: 'upvote_answer', label: 'Upvote Respuesta', icon: <ThumbsUp size={15} /> },
              { id: 'comment_question', label: 'Comentar Pregunta', icon: <MessageSquare size={15} /> },
              { id: 'comment_answer', label: 'Comentar Respuesta', icon: <MessageSquare size={15} /> },
            ].map((sub) => (
              <button
                key={sub.id}
                type="button"
                className={`btn ${actionType === sub.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                onClick={() => handleActionTypeChange(sub.id)}
              >
                {sub.icon} {sub.label}
              </button>
            ))}
          </div>
        )}

        {platform === 'medium' && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {[
              { id: 'search', label: 'Búsquedas', icon: <Search size={15} /> },
              { id: 'view_post', label: 'Ver Post (ID)', icon: <Eye size={15} /> },
              { id: 'claps_post', label: 'Claps', icon: <ThumbsUp size={15} /> },
              { id: 'comment_post', label: 'Comentarios', icon: <MessageSquare size={15} /> },
            ].map((sub) => (
              <button
                key={sub.id}
                type="button"
                className={`btn ${actionType === sub.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                onClick={() => handleActionTypeChange(sub.id)}
              >
                {sub.icon} {sub.label}
              </button>
            ))}
          </div>
        )}

        {/* FORMULARIO DE AGREGAR / EDITAR */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
              {editingId ? 'Editar Actividad Plantilla' : 'Añadir Nueva Actividad Plantilla'}
            </h3>
            {!editingId && (
              <button
                type="button"
                className={`btn ${isBulkMode ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                onClick={() => setIsBulkMode(!isBulkMode)}
              >
                {isBulkMode ? 'Cambiar a Modo Individual' : '⚡ Modo Masivo (Bulk)'}
              </button>
            )}
          </div>

          <form onSubmit={handleSave}>
            {isBulkMode ? (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                  {platform === 'browser'
                    ? 'Ingresa una URL por línea (ej: https://wikipedia.org):'
                    : 'Ingresa un término/query o identificador por línea:'}
                </label>
                <textarea
                  className="input-field"
                  rows={6}
                  placeholder={`ejemplo 1\nejemplo 2\nejemplo 3`}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  style={{ width: '100%', fontFamily: 'monospace' }}
                  required
                />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                {platform === 'browser' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Enlace / URL *</label>
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

                {platform === 'google' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Término de Búsqueda Google *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="ej. mejores restaurantes en cdmx"
                      value={formValues.search_query || ''}
                      onChange={(e) => setFormValues({ ...formValues, search_query: e.target.value })}
                      required
                    />
                  </div>
                )}

                {platform === 'youtube' && (
                  <>
                    {(actionType === 'search' || !actionType) && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Búsqueda en YouTube *</label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="ej. tutorial python avanzado"
                          value={formValues.search_query || ''}
                          onChange={(e) => setFormValues({ ...formValues, search_query: e.target.value })}
                          required
                        />
                      </div>
                    )}
                    {actionType === 'view_video' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>ID del Video de YouTube *</label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="ej. dQw4w9WgXcQ"
                          value={formValues.video_id || ''}
                          onChange={(e) => setFormValues({ ...formValues, video_id: e.target.value })}
                          required
                        />
                      </div>
                    )}
                    {actionType === 'comment_video' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>ID del Video a Comentar *</label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="ej. dQw4w9WgXcQ"
                          value={formValues.comment_video_id || ''}
                          onChange={(e) => setFormValues({ ...formValues, comment_video_id: e.target.value })}
                          required
                        />
                      </div>
                    )}
                    {actionType === 'likes_video' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>ID del Video para Like *</label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="ej. dQw4w9WgXcQ"
                          value={formValues.likes_video_id || ''}
                          onChange={(e) => setFormValues({ ...formValues, likes_video_id: e.target.value })}
                          required
                        />
                      </div>
                    )}
                  </>
                )}

                {platform === 'gmaps' && (
                  <>
                    {(actionType === 'gmaps_all' || actionType === 'gmaps_search') && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Término de Búsqueda Maps</label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="ej. cafeterías cerca de mí"
                          value={formValues.search_query || ''}
                          onChange={(e) => setFormValues({ ...formValues, search_query: e.target.value })}
                        />
                      </div>
                    )}
                    {(actionType === 'gmaps_all' || actionType === 'gmaps_visit') && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Place ID de Google</label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="ej. ChIJN1t_tDeuEmsRUsoyG83frY4"
                          value={formValues.place_id || ''}
                          onChange={(e) => setFormValues({ ...formValues, place_id: e.target.value })}
                        />
                      </div>
                    )}
                    {(actionType === 'gmaps_all' || actionType === 'gmaps_navigate') && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Ubicación de Destino</label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="ej. Calle 5, Ciudad de México"
                          value={formValues.navigate_location || ''}
                          onChange={(e) => setFormValues({ ...formValues, navigate_location: e.target.value })}
                        />
                      </div>
                    )}
                    {(actionType === 'gmaps_all' || actionType === 'gmaps_review') && (
                      <>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Texto de Reseña</label>
                          <textarea
                            className="input-field"
                            rows={3}
                            placeholder="Excelente atención y servicio..."
                            value={formValues.review_text || ''}
                            onChange={(e) => setFormValues({ ...formValues, review_text: e.target.value })}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Calificación (1 a 5 estrellas)</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            className="input-field"
                            value={formValues.rating || 5}
                            onChange={(e) => setFormValues({ ...formValues, rating: Number(e.target.value) })}
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                {platform === 'quora' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      {actionType === 'search' ? 'Búsqueda en Quora *' : 'ID o URL de Quora *'}
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="ej. Cómo aprender programación"
                      value={formValues.search_query || formValues.question_id || ''}
                      onChange={(e) => setFormValues({ ...formValues, search_query: e.target.value, question_id: e.target.value })}
                      required
                    />
                  </div>
                )}

                {platform === 'medium' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      {actionType === 'search' ? 'Búsqueda en Medium *' : 'ID o Enlace de Post *'}
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="ej. Machine learning trends 2026"
                      value={formValues.search_query || formValues.post_id || ''}
                      onChange={(e) => setFormValues({ ...formValues, search_query: e.target.value, post_id: e.target.value })}
                      required
                    />
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
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
              <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Save size={16} /> {editingId ? 'Actualizar Plantilla' : 'Añadir Actividad'}
              </button>
            </div>
          </form>
        </div>

        {/* LISTADO DE ACTIVIDADES PLANTILLA */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
              Actividades Plantilla Registradas ({currentList.length})
            </h3>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando actividades...</div>
          ) : currentList.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No hay actividades configuradas para esta plataforma. Usa el formulario arriba para agregar la primera.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '0.75rem' }}>ID</th>
                    <th style={{ padding: '0.75rem' }}>Detalle / Parámetros</th>
                    <th style={{ padding: '0.75rem', width: '120px', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentList.map((item: any) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                      <td style={{ padding: '0.75rem', color: 'var(--text-muted)', width: '60px' }}>#{item.id}</td>
                      <td style={{ padding: '0.75rem' }}>
                        {platform === 'browser' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Globe size={16} color="var(--primary)" />
                            <a href={item.link} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                              {item.link}
                            </a>
                          </div>
                        )}
                        {platform === 'google' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Search size={16} /> <strong>{item.search_query}</strong>
                          </div>
                        )}
                        {platform === 'youtube' && (
                          <div>
                            {item.search_query && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Search size={16} /> <strong>{item.search_query}</strong>
                              </div>
                            )}
                            {item.video_id && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Eye size={16} /> Video ID: <code>{item.video_id}</code>
                              </div>
                            )}
                            {item.comment_video_id && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MessageSquare size={16} /> Comentar Video: <code>{item.comment_video_id}</code>
                              </div>
                            )}
                            {item.likes_video_id && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ThumbsUp size={16} /> Like Video: <code>{item.likes_video_id}</code>
                              </div>
                            )}
                          </div>
                        )}
                        {platform === 'gmaps' && (
                          <div>
                            {item.search_query && <div>🔍 Búsqueda: <strong>{item.search_query}</strong></div>}
                            {item.place_id && <div>📍 Place ID: <code>{item.place_id}</code></div>}
                            {item.navigate_location && <div>🧭 Navegar hacia: <strong>{item.navigate_location}</strong></div>}
                            {item.review_text && (
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                ⭐ {item.rating} estrellas: "{item.review_text}"
                              </div>
                            )}
                          </div>
                        )}
                        {platform === 'quora' && (
                          <div>
                            {item.search_query && <div>🔍 {item.search_query}</div>}
                            {item.question_id && <div>❓ Pregunta ID: <code>{item.question_id}</code></div>}
                          </div>
                        )}
                        {platform === 'medium' && (
                          <div>
                            {item.search_query && <div>🔍 {item.search_query}</div>}
                            {item.post_id && <div>📝 Post ID: <code>{item.post_id}</code></div>}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.5rem' }}
                            onClick={() => handleEdit(item)}
                            title="Editar"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.5rem', color: '#ef4444' }}
                            onClick={() => handleDelete(item.id)}
                            title="Eliminar"
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
      </div>
    </div>
  );
};

export default LocationActivities;
