import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Skull, Search, Trash2, RotateCcw, ListChecks, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProxyItem {
  id: number;
  ip: string;
  port: string;
  username: string;
}

interface LocationItem {
  id: number;
  state: string;
  location: string;
}

interface TagItem {
  id: number;
  name: string;
  color?: string;
}

interface ActivityCount {
  google_activities?: number;
  youtube_activities?: number;
  gmaps_activities?: number;
  browser_activities?: number;
  quora_activities?: number;
  medium_activities?: number;
}

interface ProfileItem {
  id: number;
  name: string;
  lastname: string;
  gmail?: string;
  profile_email?: string;
  pais_iso?: string;
  is_zombie?: number;
  proxy?: ProxyItem;
  location?: LocationItem;
  location_proxy?: LocationItem;
  location_proxy_alt?: LocationItem;
  tag?: TagItem;
  _count?: ActivityCount;
}

const ZombieProfiles: React.FC = () => {
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchZombieProfiles = async (searchQuery = '') => {
    try {
      const res = await api.get(`/profiles?zombie=1${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`);
      setProfiles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZombieProfiles();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchZombieProfiles(search);
  };

  const handleUnzombie = async (id: number) => {
    if (!window.confirm('¿Deseas restaurar este perfil zombie y devolverlo a la lista de perfiles activos?')) {
      return;
    }

    try {
      await api.patch(`/profiles/${id}/zombie`, { is_zombie: 0 });
      fetchZombieProfiles(search);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al restaurar perfil zombie');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar permanentemente este perfil zombie?')) {
      return;
    }

    try {
      await api.delete(`/profiles/${id}`);
      fetchZombieProfiles(search);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar perfil');
    }
  };

  return (
    <div className="dashboard" style={{ width: '100%', maxWidth: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link to="/profiles" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Volver a Perfiles Activos
          </Link>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
            <Skull size={26} color="#ec4899" /> Cuentas Zombie (Inactivas / Bloqueadas)
          </h1>
          <p className="subtitle" style={{ textAlign: 'left', margin: '0.3rem 0 0 0' }}>
            Perfiles que fallaron inicios de sesión en Google o fueron marcados como cuentas no operativas.
          </p>
        </div>
      </div>

      {/* Buscador */}
      <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '2.75rem' }}
            placeholder="Buscar por nombre, correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-secondary">
          Buscar
        </button>
      </form>

      {/* Tabla de perfiles zombie */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Cargando cuentas zombie...
        </div>
      ) : profiles.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Skull size={48} style={{ margin: '0 auto 1rem', opacity: 0.3, color: '#ec4899' }} />
          <h3>No hay cuentas marcadas como zombie</h3>
          <p style={{ margin: '0.5rem 0 1.5rem' }}>
            Los perfiles que fallen el login de Google en Moshi Client o que marques como zombie aparecerán aquí.
          </p>
          <Link to="/profiles" className="btn btn-primary">
            Ver Perfiles Activos
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto', width: '100%' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--surface-hover)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nombre Completo</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estado</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Gmail / Correo</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Proxy</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ubicación</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Actividades</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => {
                const totalActs = (p._count?.google_activities || 0) + (p._count?.youtube_activities || 0) + (p._count?.gmaps_activities || 0) + (p._count?.browser_activities || 0);
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', background: 'rgba(236, 72, 153, 0.03)' }}>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>#{p.id}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                        {p.name} {p.lastname}
                      </div>
                      {p.tag && (
                        <span
                          className="badge"
                          style={{
                            display: 'inline-block',
                            marginTop: '0.25rem',
                            fontSize: '0.72rem',
                            background: `${p.tag.color || '#3b82f6'}20`,
                            color: p.tag.color || '#3b82f6',
                            border: `1px solid ${p.tag.color || '#3b82f6'}40`,
                          }}
                        >
                          {p.tag.name}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', border: '1px solid rgba(236, 72, 153, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <AlertTriangle size={12} /> Zombie
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                      <div>{p.gmail || p.profile_email || '-'}</div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                      {p.proxy ? (
                        <span style={{ fontFamily: 'monospace' }}>
                          {p.proxy.ip}:{p.proxy.port}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Sin Proxy</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                      {p.location ? (
                        <span>
                          {p.location.location} ({p.location.state})
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        <span className="badge" style={{ background: '#3b82f620', color: '#3b82f6', fontSize: '0.75rem' }} title="Google">
                          🔍 {p._count?.google_activities || 0}
                        </span>
                        <span className="badge" style={{ background: '#ef444420', color: '#ef4444', fontSize: '0.75rem' }} title="YouTube">
                          🔴 {p._count?.youtube_activities || 0}
                        </span>
                        <span className="badge" style={{ background: '#10b98120', color: '#10b981', fontSize: '0.75rem' }} title="Maps">
                          🗺️ {p._count?.gmaps_activities || 0}
                        </span>
                        <span className="badge" style={{ background: '#8b5cf620', color: '#8b5cf6', fontSize: '0.75rem' }} title="Total">
                          ⚡ {totalActs}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <Link
                          to={`/profiles/${p.id}/activities`}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', background: '#2563eb', color: 'white', borderColor: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          title="Ver Actividades"
                        >
                          <ListChecks size={14} /> Actividades
                        </Link>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          title="Restaurar a Perfiles Activos"
                          onClick={() => handleUnzombie(p.id)}
                        >
                          <RotateCcw size={14} /> Restaurar
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                          title="Eliminar Perfil"
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 size={14} />
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
    </div>
  );
};

export default ZombieProfiles;
