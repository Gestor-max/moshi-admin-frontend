import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Archive, Search, Trash2, RotateCcw, ListChecks, ArrowLeft } from 'lucide-react';
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

interface ProfileItem {
  id: number;
  name: string;
  lastname: string;
  gmail?: string;
  profile_email?: string;
  pais_iso?: string;
  proxy?: ProxyItem;
  location?: LocationItem;
  location_proxy?: LocationItem;
  location_proxy_alt?: LocationItem;
  tag?: TagItem;
}

const ArchivedProfiles: React.FC = () => {
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchArchivedProfiles = async (searchQuery = '') => {
    try {
      const res = await api.get(`/profiles?archived=true${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`);
      setProfiles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedProfiles();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArchivedProfiles(search);
  };

  const handleUnarchive = async (id: number) => {
    if (!window.confirm('¿Deseas desarchivar y restaurar este perfil a la lista principal?')) {
      return;
    }

    try {
      await api.patch(`/profiles/${id}/archive`, { is_archived: false });
      fetchArchivedProfiles(search);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al restaurar perfil');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar permanentemente este perfil archivado?')) {
      return;
    }

    try {
      await api.delete(`/profiles/${id}`);
      fetchArchivedProfiles(search);
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
            <Archive size={26} color="#f59e0b" /> Perfiles Archivados
          </h1>
          <p className="subtitle" style={{ textAlign: 'left', margin: '0.3rem 0 0 0' }}>
            Perfiles que han sido retirados de la vista principal. Puedes restaurarlos o eliminarlos.
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

      {/* TABLA DE PERFILES ARCHIVADOS */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Cargando perfiles archivados...
        </div>
      ) : profiles.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Archive size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3>No hay perfiles archivados</h3>
          <p style={{ margin: '0.5rem 0 1.5rem' }}>Los perfiles que archives desde la lista principal aparecerán aquí.</p>
          <Link to="/profiles" className="btn btn-secondary">
            <ArrowLeft size={16} /> Ir a Perfiles Activos
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto', width: '100%' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--surface-hover)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nombre Completo</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Etiqueta</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Gmail</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Proxy</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ubicación</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>🛰️ Loc. Proxy</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>País</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => {
                const tagColor = p.tag?.color || '#3b82f6';
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', opacity: 0.9 }}>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>#{p.id}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                        {p.name} {p.lastname}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Archivado</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {p.tag ? (
                        <span
                          className="badge"
                          style={{
                            background: `${tagColor}22`,
                            color: tagColor,
                            border: `1px solid ${tagColor}66`,
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                            padding: '0.25rem 0.55rem',
                            borderRadius: '9999px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: tagColor }} />
                          {p.tag.name}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {p.gmail || '-'}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                      {p.proxy ? (
                        <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
                          {p.proxy.ip}:{p.proxy.port}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Sin Proxy</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                      {p.location ? (
                        <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                          {p.location.location} ({p.location.state})
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Sin Ubicación</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                      {p.location_proxy ? (
                        <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                          {p.location_proxy.location} ({p.location_proxy.state})
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {p.pais_iso || '-'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', background: '#10b981', borderColor: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          title="Restaurar / Desarchivar Perfil"
                          onClick={() => handleUnarchive(p.id)}
                        >
                          <RotateCcw size={14} /> Restaurar
                        </button>
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
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', color: '#ef4444' }}
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

export default ArchivedProfiles;
