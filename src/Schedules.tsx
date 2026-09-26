import React, { useState, useEffect } from 'react';
import { api } from './api';
import { useLanguage } from './LanguageContext';
import { Calendar, Clock, Plus, Trash2, Edit2, X, Save, MapPin, CheckCircle2, XCircle, RotateCw } from 'lucide-react';

interface LocationItem {
  id: number;
  state: string;
  location: string;
}

interface ScheduleItem {
  id: number;
  user_id: number;
  location_id: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  rotate_proxy: boolean;
  created_at: string;
  location?: LocationItem;
  activities?: string[];
}

export const AVAILABLE_ACTIVITIES = [
  { id: 'youtube_activity_single', label: 'YouTube Activity (Single)', color: '#ef4444', icon: '🔴' },
  { id: 'google_activity_single', label: 'Google Activity (Single)', color: '#3b82f6', icon: '🔍' },
  { id: 'gmaps_activity_single', label: 'GMaps Activity (Single)', color: '#10b981', icon: '🗺️' },
  { id: 'cm_youtube', label: 'YouTube Ops', color: '#f97316', icon: '🎬' },
  { id: 'cm_google_maps', label: 'Google Maps', color: '#06b6d4', icon: '📍' },
  { id: 'cm_gmb_reviews', label: 'GMB Reviews', color: '#eab308', icon: '⭐' },
  { id: 'cm_gmail_ops', label: 'Gmail Ops', color: '#8b5cf6', icon: '📧' },
  { id: 'cm_cnn_newsletters', label: 'CNN Newsletters', color: '#ec4899', icon: '📰' },
  { id: 'cm_wsj_newsletters', label: 'WSJ Newsletters', color: '#64748b', icon: '📰' },
  { id: 'browser_visit', label: 'Visitar Sitio Web', color: '#14b8a6', icon: '🌐' },
];

const Schedules: React.FC = () => {
  const { t } = useLanguage();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | ''>('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('12:00');
  const [isActive, setIsActive] = useState(true);
  const [rotateProxy, setRotateProxy] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchSchedules = async () => {
    try {
      const res = await api.get('/schedules');
      setSchedules(res.data);
    } catch (err) {
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await api.get('/locations');
      setLocations(res.data);
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchLocations();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setSelectedLocationId(locations.length > 0 ? locations[0].id : '');
    setStartTime('08:00');
    setEndTime('12:00');
    setIsActive(true);
    setRotateProxy(false);
    setSelectedActivities(['youtube_activity_single', 'gmaps_activity_single']);
    setShowModal(true);
  };

  const openEditModal = (sch: ScheduleItem) => {
    setEditingId(sch.id);
    setSelectedLocationId(sch.location_id);
    setStartTime(sch.start_time);
    setEndTime(sch.end_time);
    setIsActive(sch.is_active);
    setRotateProxy(sch.rotate_proxy);
    setSelectedActivities(sch.activities || []);
    setShowModal(true);
  };

  const toggleActivitySelection = (actId: string) => {
    if (selectedActivities.includes(actId)) {
      setSelectedActivities(selectedActivities.filter((id) => id !== actId));
    } else {
      setSelectedActivities([...selectedActivities, actId]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocationId) {
      alert('Por favor selecciona una ubicación.');
      return;
    }
    if (selectedActivities.length === 0) {
      alert('Debes seleccionar al menos una actividad.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        location_id: Number(selectedLocationId),
        start_time: startTime,
        end_time: endTime,
        is_active: isActive,
        rotate_proxy: rotateProxy,
        activities: selectedActivities,
      };

      if (editingId) {
        await api.patch(`/schedules/${editingId}`, payload);
      } else {
        await api.post('/schedules', payload);
      }

      setShowModal(false);
      fetchSchedules();
    } catch (err: any) {
      console.error('Error saving schedule:', err);
      alert(err.response?.data?.message || 'Error al guardar horario de agenda.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const res = await api.patch(`/schedules/${id}/toggle`);
      setSchedules(schedules.map((s) => (s.id === id ? { ...s, is_active: res.data.is_active } : s)));
    } catch (err) {
      console.error('Error toggling schedule:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta programación de la agenda?')) return;
    try {
      await api.delete(`/schedules/${id}`);
      setSchedules(schedules.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Error deleting schedule:', err);
    }
  };

  const getActivityMeta = (id: string) => {
    return AVAILABLE_ACTIVITIES.find((a) => a.id === id) || {
      id,
      label: id.replace('_', ' '),
      color: '#64748b',
      icon: '⚙️',
    };
  };

  return (
    <div className="dashboard" style={{ width: '100%', maxWidth: '100%' }}>
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.75rem', fontWeight: 700 }}>
            <Calendar size={28} color="#38bdf8" />
            Agenda de Automatizaciones
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Programa horarios de ejecución por ubicación y actividades automatizadas.
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={openCreateModal}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', fontWeight: 600 }}
        >
          <Plus size={18} /> Nueva Programación
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          {t('loading')}
        </div>
      ) : schedules.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--card-bg)', borderRadius: '12px', border: '1px dashed var(--border-color)', marginTop: '1.5rem' }}>
          <Clock size={48} color="#64748b" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>No hay horarios programados en la agenda</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Crea una nueva regla horaria para ejecutar automatizaciones por ubicación.
          </p>
          <button className="btn-primary" onClick={openCreateModal}>
            <Plus size={16} /> Crear Primera Programación
          </button>
        </div>
      ) : (
        <div className="table-container" style={{ marginTop: '1.5rem', width: '100%', overflowX: 'auto', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.1)' }}>
                <th style={{ padding: '0.9rem 1rem' }}>ID</th>
                <th style={{ padding: '0.9rem 1rem' }}>Ubicación</th>
                <th style={{ padding: '0.9rem 1rem' }}>Horario</th>
                <th style={{ padding: '0.9rem 1rem' }}>Rotador Proxy</th>
                <th style={{ padding: '0.9rem 1rem' }}>Actividades Asignadas (Tags)</th>
                <th style={{ padding: '0.9rem 1rem' }}>Estado</th>
                <th style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((sch) => {
                const locStr = sch.location ? `${sch.location.location} (${sch.location.state})` : `Location #${sch.location_id}`;
                return (
                  <tr key={sch.id} style={{ borderBottom: '1px solid var(--border-color)', opacity: sch.is_active ? 1 : 0.6 }}>
                    <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      #{sch.id}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8' }}>
                        <MapPin size={16} />
                        {locStr}
                      </div>
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.3rem 0.6rem',
                          borderRadius: '6px',
                          background: 'rgba(56, 189, 248, 0.12)',
                          color: '#38bdf8',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                        }}
                      >
                        <Clock size={14} />
                        {sch.start_time} - {sch.end_time}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      {sch.rotate_proxy ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '9999px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#10b981',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                          }}
                        >
                          <RotateCw size={13} /> Activa Rotador
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '9999px',
                            background: 'rgba(148, 163, 184, 0.12)',
                            color: '#94a3b8',
                            fontSize: '0.8rem',
                          }}
                        >
                          Sin Rotador
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', maxWidth: '360px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {(sch.activities || []).length > 0 ? (
                          sch.activities!.map((actId) => {
                            const meta = getActivityMeta(actId);
                            return (
                              <span
                                key={actId}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  padding: '0.25rem 0.55rem',
                                  borderRadius: '6px',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  background: `${meta.color}20`,
                                  color: meta.color,
                                  border: `1px solid ${meta.color}50`,
                                }}
                              >
                                <span>{meta.icon}</span>
                                {meta.label}
                              </span>
                            );
                          })
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                            Sin actividades
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <button
                        onClick={() => handleToggle(sch.id)}
                        style={{
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.3rem 0.7rem',
                          borderRadius: '9999px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          background: sch.is_active ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: sch.is_active ? '#22c55e' : '#ef4444',
                        }}
                      >
                        {sch.is_active ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {sch.is_active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => openEditModal(sch)}
                          className="btn-icon"
                          title="Editar"
                          style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: '4px' }}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(sch.id)}
                          className="btn-icon"
                          title="Eliminar"
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL CREAR / EDITAR */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--card-bg, #1e293b)',
              borderRadius: '16px',
              padding: '2rem',
              width: '100%',
              maxWidth: '620px',
              border: '1px solid var(--border-color, #334155)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={22} color="#38bdf8" />
                {editingId ? 'Editar Programación de Agenda' : 'Nueva Programación de Agenda'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              {/* Selector de Location */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  Ubicación Asociada (Location) *
                </label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg, #0f172a)',
                    color: 'var(--text-main, #f8fafc)',
                    fontSize: '0.95rem',
                  }}
                  required
                >
                  <option value="" disabled>Selecciona una ubicación...</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.location} ({loc.state})
                    </option>
                  ))}
                </select>
              </div>

              {/* Horarios: Inicio y Fin */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
                    Hora Inicio *
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--input-bg, #0f172a)',
                      color: 'var(--text-main, #f8fafc)',
                      fontSize: '0.95rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
                    Hora Fin *
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--input-bg, #0f172a)',
                      color: 'var(--text-main, #f8fafc)',
                      fontSize: '0.95rem',
                    }}
                  />
                </div>
              </div>

              {/* Switches: Activo y Activa Rotador */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.15)', padding: '0.9rem', borderRadius: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#22c55e', cursor: 'pointer' }}
                  />
                  <span>🟢 Está Activo</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={rotateProxy}
                    onChange={(e) => setRotateProxy(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#38bdf8', cursor: 'pointer' }}
                  />
                  <span>🔄 Activar Rotador</span>
                </label>
              </div>

              {/* Selección de Actividades con Checkbox y Tags */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                    Actividades a Ejecutar en este Horario *
                  </label>
                  <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>
                    {selectedActivities.length} seleccionadas
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.6rem',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg, #0f172a)',
                  }}
                >
                  {AVAILABLE_ACTIVITIES.map((act) => {
                    const isChecked = selectedActivities.includes(act.id);
                    return (
                      <label
                        key={act.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.45rem 0.6rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          background: isChecked ? `${act.color}15` : 'transparent',
                          border: isChecked ? `1px solid ${act.color}60` : '1px solid transparent',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleActivitySelection(act.id)}
                          style={{ width: '16px', height: '16px', accentColor: act.color, cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.85rem', fontWeight: isChecked ? 600 : 400, color: isChecked ? act.color : 'inherit' }}>
                          {act.icon} {act.label}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* Previsualización en Formato de Etiquetas (Tags) */}
                <div style={{ marginTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Vista previa de etiquetas (Tags):
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {selectedActivities.length > 0 ? (
                      selectedActivities.map((actId) => {
                        const meta = getActivityMeta(actId);
                        return (
                          <span
                            key={actId}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: `${meta.color}25`,
                              color: meta.color,
                              border: `1px solid ${meta.color}60`,
                            }}
                          >
                            <span>{meta.icon}</span>
                            {meta.label}
                          </span>
                        );
                      })
                    ) : (
                      <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>
                        ⚠️ No has seleccionado ninguna actividad todavía.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'transparent',
                    color: 'var(--text-main)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Save size={16} />
                  {saving ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Programación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedules;
