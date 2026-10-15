import React, { useState, useEffect } from 'react';
import { api } from './api';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import {
  UserCheck,
  Skull,
  Archive,
  Users,
  MapPin,
  CalendarDays,
  Server,
  Shield,
  Activity,
  CheckCircle2,
  Search,
  Globe,
  Video,
  MessageSquare,
  FileText,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PLATFORM_NAMES: Record<string, { label: string; icon: any; color: string }> = {
  gmaps: { label: 'Google Maps', icon: MapPin, color: '#10b981' },
  google: { label: 'Google Search', icon: Search, color: '#3b82f6' },
  youtube: { label: 'YouTube', icon: Video, color: '#ef4444' },
  browser: { label: 'Browser', icon: Globe, color: '#06b6d4' },
  quora: { label: 'Quora', icon: MessageSquare, color: '#b91c1c' },
  medium: { label: 'Medium', icon: FileText, color: '#4b5563' },
};

const Dashboard: React.FC = () => {
  const { user, token, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTabPlatform, setActiveTabPlatform] = useState<string>('gmaps');
  const [hoveredDay, setHoveredDay] = useState<any>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/stats');
      setStats(res.data);
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError(err?.response?.data?.message || err?.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', fontSize: '1rem' }}>
          <RefreshCw size={20} className="spinning" />
          {t('dashboard_loading_stats')}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '3rem', maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '2rem', border: '1px solid var(--border-color)' }}>
          <AlertCircle size={40} color="#ef4444" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No se pudieron cargar las estadísticas</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{error}</p>
          <button className="btn btn-primary" onClick={fetchStats} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={16} /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  const chartDays = stats?.chartDays || [];
  const maxDayTotal = Math.max(1, ...chartDays.map((d: any) => d.total || 0));
  const totalCompleted15Days = chartDays.reduce((acc: number, d: any) => acc + (d.total || 0), 0);

  const latestList = stats?.latestFinished?.[activeTabPlatform] || [];

  return (
    <div className="dashboard" style={{ width: '100%', maxWidth: '100%' }}>
      {/* HEADER */}
      <div className="page-header" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem' }}>{t('dashboard_title')}</h1>
          <p className="subtitle" style={{ textAlign: 'left', margin: '0.25rem 0 0' }}>
            {t('dashboard_welcome')}, <strong>{user?.name || user?.email}</strong>
          </p>
        </div>
      </div>

      {/* =========================================================================
          FILA 1: MÉTRICAS DE PERFILES (4 CONTADORES)
          1. Activos | 2. Zombies | 3. Archivados | 4. Totales
      ========================================================================= */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          Estado de Perfiles
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* 1. Activos */}
          <Link to="/profiles" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="stat-card" style={{ transition: 'transform 0.15s ease, box-shadow 0.15s ease', cursor: 'pointer' }}>
              <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#16a34a' }}>
                <UserCheck size={24} />
              </div>
              <div className="stat-info">
                <h3 style={{ fontSize: '1.75rem', margin: 0, color: '#16a34a' }}>{stats?.activeProfiles ?? 0}</h3>
                <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>Perfiles Activos</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Operativos en Moshi</span>
              </div>
            </div>
          </Link>

          {/* 2. Zombies */}
          <Link to="/zombie-profiles" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="stat-card" style={{ transition: 'transform 0.15s ease, box-shadow 0.15s ease', cursor: 'pointer', borderColor: stats?.zombieProfiles > 0 ? 'rgba(236, 72, 153, 0.4)' : undefined }}>
              <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
                <Skull size={24} />
              </div>
              <div className="stat-info">
                <h3 style={{ fontSize: '1.75rem', margin: 0, color: '#ec4899' }}>{stats?.zombieProfiles ?? 0}</h3>
                <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>Perfiles Zombies</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Requieren verificación</span>
              </div>
            </div>
          </Link>

          {/* 3. Archivados */}
          <Link to="/archived-profiles" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="stat-card" style={{ transition: 'transform 0.15s ease, box-shadow 0.15s ease', cursor: 'pointer' }}>
              <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#d97706' }}>
                <Archive size={24} />
              </div>
              <div className="stat-info">
                <h3 style={{ fontSize: '1.75rem', margin: 0, color: '#d97706' }}>{stats?.archivedProfiles ?? 0}</h3>
                <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>Perfiles Archivados</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fuera de rotación</span>
              </div>
            </div>
          </Link>

          {/* 4. Totales */}
          <Link to="/profiles" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="stat-card" style={{ transition: 'transform 0.15s ease, box-shadow 0.15s ease', cursor: 'pointer' }}>
              <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#2563eb' }}>
                <Users size={24} />
              </div>
              <div className="stat-info">
                <h3 style={{ fontSize: '1.75rem', margin: 0, color: '#2563eb' }}>{stats?.totalProfiles ?? 0}</h3>
                <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>Perfiles Totales</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Base de datos total</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          FILA 2: RECURSOS Y AGENDA (4 CONTADORES)
          1. Locations | 2. Agenda | 3. Proxies Totales | 4. Usuarios
      ========================================================================= */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          Recursos y Agenda
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* 1. Locations */}
          <Link to="/locations" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="stat-card" style={{ transition: 'transform 0.15s ease', cursor: 'pointer' }}>
              <div className="stat-icon" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#0284c7' }}>
                <MapPin size={24} />
              </div>
              <div className="stat-info">
                <h3 style={{ fontSize: '1.75rem', margin: 0, color: '#0284c7' }}>{stats?.locations ?? 0}</h3>
                <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>Locations</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ubicaciones configuradas</span>
              </div>
            </div>
          </Link>

          {/* 2. Agenda */}
          <Link to="/schedules" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="stat-card" style={{ transition: 'transform 0.15s ease', cursor: 'pointer' }}>
              <div className="stat-icon" style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#ea580c' }}>
                <CalendarDays size={24} />
              </div>
              <div className="stat-info">
                <h3 style={{ fontSize: '1.75rem', margin: 0, color: '#ea580c' }}>{stats?.scheduledActivities ?? 0}</h3>
                <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>Agenda (Actividades)</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tareas agendadas pendientes</span>
              </div>
            </div>
          </Link>

          {/* 3. Proxies Totales */}
          <Link to="/proxies" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="stat-card" style={{ transition: 'transform 0.15s ease', cursor: 'pointer' }}>
              <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#9333ea' }}>
                <Server size={24} />
              </div>
              <div className="stat-info">
                <h3 style={{ fontSize: '1.75rem', margin: 0, color: '#9333ea' }}>{stats?.proxies ?? 0}</h3>
                <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>Proxies Totales</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Servidores de conexión</span>
              </div>
            </div>
          </Link>

          {/* 4. Usuarios */}
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#4f46e5' }}>
              <Shield size={24} />
            </div>
            <div className="stat-info">
              <h3 style={{ fontSize: '1.75rem', margin: 0, color: '#4f46e5' }}>{stats?.users ?? (isAdmin ? 1 : 1)}</h3>
              <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>Usuarios del Sistema</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isAdmin ? 'Acceso Administrador' : 'Tu cuenta activa'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          FILA 3: GRÁFICA DE ACTIVIDADES REALIZADAS (ÚLTIMOS 15 DÍAS)
      ========================================================================= */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="#2563eb" />
              Actividades Realizadas (Últimos 15 días)
            </h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Contabilización diaria de actividades completadas con fecha de finalización (finished_at).
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb' }}>
              {totalCompleted15Days}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Actividades completadas</div>
          </div>
        </div>

        {/* Leyenda interactiva de plataformas */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem', fontSize: '0.8rem' }}>
          {Object.entries(PLATFORM_NAMES).map(([key, info]) => (
            <div key={key} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: 10, height: 10, borderRadius: '2px', background: info.color }} />
              <span style={{ color: 'var(--text)' }}>{info.label}</span>
            </div>
          ))}
        </div>

        {/* Gráfico de barras apiladas SVG */}
        <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <div style={{ minWidth: '680px', height: '220px', display: 'flex', alignItems: 'flex-end', gap: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            {chartDays.map((day: any, idx: number) => {
              const heightPercent = maxDayTotal > 0 ? (day.total / maxDayTotal) * 100 : 0;
              const isHovered = hoveredDay?.date === day.date;

              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {/* Tooltip flotante */}
                  {isHovered && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '105%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'var(--surface, #1e293b)',
                        color: 'var(--text, #fff)',
                        border: '1px solid var(--border)',
                        borderRadius: '0.5rem',
                        padding: '0.65rem 0.85rem',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                        zIndex: 20,
                        whiteSpace: 'nowrap',
                        fontSize: '0.75rem',
                        minWidth: '150px',
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: '0.35rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.25rem' }}>
                        📅 {day.label} ({day.date})
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <span>Total:</span>
                        <strong style={{ color: '#2563eb' }}>{day.total}</strong>
                      </div>
                      {day.gmaps > 0 && <div style={{ color: '#10b981' }}>🗺️ Maps: {day.gmaps}</div>}
                      {day.google > 0 && <div style={{ color: '#3b82f6' }}>🔍 Google: {day.google}</div>}
                      {day.youtube > 0 && <div style={{ color: '#ef4444' }}>🔴 YouTube: {day.youtube}</div>}
                      {day.browser > 0 && <div style={{ color: '#06b6d4' }}>🌐 Browser: {day.browser}</div>}
                      {day.quora > 0 && <div style={{ color: '#b91c1c' }}>💬 Quora: {day.quora}</div>}
                      {day.medium > 0 && <div style={{ color: '#94a3b8' }}>✍️ Medium: {day.medium}</div>}
                    </div>
                  )}

                  {/* Número arriba de la barra */}
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: day.total > 0 ? 'var(--text)' : 'var(--text-muted)', marginBottom: '4px' }}>
                    {day.total > 0 ? day.total : ''}
                  </span>

                  {/* Barra apilada */}
                  <div
                    style={{
                      width: '100%',
                      height: `${Math.max(4, heightPercent)}%`,
                      borderRadius: '4px 4px 0 0',
                      background: day.total > 0 ? 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)' : 'var(--surface-hover)',
                      opacity: isHovered ? 1 : 0.85,
                      transition: 'height 0.3s ease, opacity 0.15s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column-reverse',
                    }}
                  >
                    {/* Segmentos de color proporcional por plataforma */}
                    {day.total > 0 && (
                      <>
                        <div style={{ height: `${(day.gmaps / day.total) * 100}%`, background: '#10b981' }} />
                        <div style={{ height: `${(day.google / day.total) * 100}%`, background: '#3b82f6' }} />
                        <div style={{ height: `${(day.youtube / day.total) * 100}%`, background: '#ef4444' }} />
                        <div style={{ height: `${(day.browser / day.total) * 100}%`, background: '#06b6d4' }} />
                        <div style={{ height: `${(day.quora / day.total) * 100}%`, background: '#b91c1c' }} />
                        <div style={{ height: `${(day.medium / day.total) * 100}%`, background: '#4b5563' }} />
                      </>
                    )}
                  </div>

                  {/* Etiqueta del día abajo */}
                  <span style={{ fontSize: '0.7rem', color: isHovered ? 'var(--primary)' : 'var(--text-muted)', marginTop: '8px', whiteSpace: 'nowrap' }}>
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================
          FILA 4: ÚLTIMAS 5 ACTIVIDADES FINALIZADAS POR TIPO
      ========================================================================= */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={20} color="#10b981" />
              Últimas 5 Actividades Finalizadas
            </h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Detalle y auditoría de las ejecuciones más recientes ordenadas por finished_at.
            </p>
          </div>
        </div>

        {/* Sub-tabs por tipo de plataforma */}
        <div style={{ display: 'flex', gap: '0.35rem', padding: '0.75rem 1.5rem', background: 'var(--surface-hover)', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          {Object.entries(PLATFORM_NAMES).map(([key, info]) => {
            const Icon = info.icon;
            const isSelected = activeTabPlatform === key;
            return (
              <button
                key={key}
                type="button"
                className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  fontSize: '0.825rem',
                  padding: '0.45rem 0.9rem',
                  background: isSelected ? info.color : undefined,
                  borderColor: isSelected ? info.color : undefined,
                  color: isSelected ? '#fff' : undefined,
                }}
                onClick={() => setActiveTabPlatform(key)}
              >
                <Icon size={14} /> {info.label}
              </button>
            );
          })}
        </div>

        {/* Lista / Tabla de las últimas 5 */}
        <div style={{ overflowX: 'auto' }}>
          {latestList.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No hay actividades finalizadas registradas recientemente para {PLATFORM_NAMES[activeTabPlatform]?.label}.
            </div>
          ) : (
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Perfil</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tipo / Kind</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Detalle de Acción</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fecha Finalización (finished_at)</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {latestList.map((item: any) => {
                  const prof = item.profile || {};
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.85rem', fontWeight: 600 }}>#{item.id}</td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <Link to={`/profiles/${prof.id}/activities`} style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                          {prof.name ? `${prof.name} ${prof.lastname || ''}` : `Perfil #${item.profile_id}`}
                        </Link>
                        {prof.gmail && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prof.gmail}</div>}
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        {activeTabPlatform === 'gmaps' && (
                          <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669', fontWeight: 600, fontSize: '0.75rem' }}>
                            {item.kind === 5 ? '📸 Kind 5: Subir Foto' : item.kind === 4 ? '⭐ Kind 4: Reseña' : item.kind === 3 ? '🧭 Kind 3: Navegar' : item.kind === 2 ? '🌐 Kind 2: Visitar' : '🔍 Kind 1: Buscar'}
                          </span>
                        )}
                        {activeTabPlatform === 'youtube' && (
                          <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#dc2626', fontWeight: 600, fontSize: '0.75rem' }}>
                            {item.kind === 3 ? '💬 Kind 3: Comentar' : item.kind === 2 ? '👍 Kind 2: Like' : '▶️ Kind 1: Ver Video'}
                          </span>
                        )}
                        {activeTabPlatform === 'quora' && (
                          <span className="badge" style={{ background: 'rgba(185, 28, 28, 0.15)', color: '#b91c1c', fontWeight: 600, fontSize: '0.75rem' }}>
                            Kind {item.kind || 1}
                          </span>
                        )}
                        {activeTabPlatform === 'medium' && (
                          <span className="badge" style={{ background: 'rgba(75, 85, 99, 0.15)', color: '#4b5563', fontWeight: 600, fontSize: '0.75rem' }}>
                            {item.kind === 3 ? '💬 Comentar' : item.kind === 2 ? '👏 Claps' : '📖 Ver Post'}
                          </span>
                        )}
                        {activeTabPlatform === 'google' && (
                          <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#2563eb', fontWeight: 600, fontSize: '0.75rem' }}>
                            🔍 Búsqueda
                          </span>
                        )}
                        {activeTabPlatform === 'browser' && (
                          <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#0891b2', fontWeight: 600, fontSize: '0.75rem' }}>
                            🌐 Visitar Link
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.85rem', maxWidth: '320px', wordBreak: 'break-word' }}>
                        {item.search_query && <div><strong>Búsqueda:</strong> {item.search_query}</div>}
                        {item.place_id && (
                          <div>
                            <strong>Ficha/Link:</strong>{' '}
                            {item.place_id.startsWith('http') ? (
                              <a href={item.place_id} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>
                                {item.place_id.slice(0, 45)}...
                              </a>
                            ) : (
                              <span>{item.place_id}</span>
                            )}
                          </div>
                        )}
                        {item.navigate_location && <div><strong>Ruta Origen:</strong> {item.navigate_location}</div>}
                        {item.video_id && <div><strong>Video ID:</strong> {item.video_id}</div>}
                        {item.link && (
                          <a href={item.link} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>
                            {item.link.slice(0, 45)}...
                          </a>
                        )}
                        {item.post_id && <div><strong>Post ID:</strong> {item.post_id}</div>}
                        {item.question_id && <div><strong>Question ID:</strong> {item.question_id}</div>}
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.825rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {item.finished_at ? (
                          <div>
                            <div style={{ color: '#16a34a', fontWeight: 600 }}>
                              ✅ {new Date(item.finished_at).toLocaleDateString()}
                            </div>
                            <div style={{ fontSize: '0.75rem' }}>
                              {new Date(item.finished_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                          </div>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                        <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#16a34a', fontWeight: 'bold' }}>
                          Completado
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
