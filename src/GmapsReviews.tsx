import React, { useState, useEffect } from 'react';
import { api } from './api';
import {
  Star,
  Plus,
  Upload,
  RefreshCw,
  Search,
  Trash2,
  Edit2,
  ExternalLink,
  MapPin,
  CheckCircle,
  Clock,
  Layers,
  X,
  Save,
  FileText
} from 'lucide-react';

interface GmapsReviewItem {
  id: number;
  place_id: string;
  name_place?: string;
  rating: number;
  review: string;
  status: number; // 0: Nueva/Disponible, 1: Aplicada
  link_review?: string;
  profile_id?: number | null;
  created_at: string;
  updated_at: string;
  profile?: {
    id: number;
    name: string;
    lastname: string;
    gmail?: string;
    profile_email?: string;
  } | null;
}

export const GmapsReviews: React.FC = () => {
  const [reviews, setReviews] = useState<GmapsReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // 'all' | '0' | '1'

  // Modal Crear / Editar
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState<GmapsReviewItem | null>(null);
  const [formData, setFormData] = useState({
    place_id: '',
    name_place: '',
    rating: 5,
    review: '',
    status: 0,
    link_review: '',
  });

  // Modal Importar CSV
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvPreview, setCsvPreview] = useState<Array<{ place_id: string; rating: number; review: string }>>([]);
  const [importing, setImporting] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/gmaps-reviews?${params.toString()}`);
      setReviews(res.data);
    } catch (err) {
      console.error('Error al cargar reseñas globales:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReviews();
  };

  // Métricas
  const totalCount = reviews.length;
  const availableCount = reviews.filter((r) => r.status === 0).length;
  const appliedCount = reviews.filter((r) => r.status === 1).length;

  // Abrir Modal Crear
  const handleOpenCreate = () => {
    setEditingReview(null);
    setFormData({
      place_id: '',
      name_place: '',
      rating: 5,
      review: '',
      status: 0,
      link_review: '',
    });
    setShowModal(true);
  };

  // Abrir Modal Editar
  const handleOpenEdit = (item: GmapsReviewItem) => {
    setEditingReview(item);
    setFormData({
      place_id: item.place_id || '',
      name_place: item.name_place || '',
      rating: item.rating || 5,
      review: item.review || '',
      status: item.status || 0,
      link_review: item.link_review || '',
    });
    setShowModal(true);
  };

  // Guardar (Crear o Actualizar)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.place_id.trim()) {
      alert('El campo Place ID es obligatorio.');
      return;
    }

    try {
      if (editingReview) {
        await api.patch(`/gmaps-reviews/${editingReview.id}`, formData);
      } else {
        await api.post('/gmaps-reviews', formData);
      }
      setShowModal(false);
      fetchReviews();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error al guardar la reseña.');
    }
  };

  // Eliminar
  const handleDelete = async (id: number) => {
    if (!window.confirm(`¿Estás seguro de eliminar la reseña #${id}?`)) return;
    try {
      await api.delete(`/gmaps-reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
      alert('Error al eliminar la reseña.');
    }
  };

  // Parser de CSV
  const parseCSV = (text: string) => {
    const lines: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        inQuotes = !inQuotes;
        current += char;
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && text[i + 1] === '\n') {
          i++;
        }
        if (current.trim().length > 0) {
          lines.push(current);
        }
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim().length > 0) {
      lines.push(current);
    }

    const results: Array<{ place_id: string; rating: number; review: string }> = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const delimiter = line.includes(';') && !line.includes(',') ? ';' : ',';
      const cells: string[] = [];
      let cell = '';
      let cellInQuotes = false;

      for (let c = 0; c < line.length; c++) {
        const ch = line[c];
        if (ch === '"') {
          cellInQuotes = !cellInQuotes;
        } else if (ch === delimiter && !cellInQuotes) {
          cells.push(cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
          cell = '';
        } else {
          cell += ch;
        }
      }
      cells.push(cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

      if (cells.length < 1) continue;

      const col0 = cells[0] || '';
      const col1 = cells[1] || '';
      const col2 = cells[2] || '';

      // Omitir cabecera si incluye palabras clave
      if (
        i === 0 &&
        (col0.toLowerCase().includes('place') || col0.toLowerCase().includes('id') || col1.toLowerCase().includes('rating'))
      ) {
        continue;
      }

      if (!col0) continue;

      let parsedRating = 5;
      let reviewText = col2;

      const num = parseInt(col1, 10);
      if (!isNaN(num) && num >= 1 && num <= 5) {
        parsedRating = num;
      } else if (col1 && !col2) {
        reviewText = col1;
        parsedRating = 5;
      }

      results.push({
        place_id: col0.trim(),
        rating: parsedRating,
        review: reviewText ? reviewText.trim() : '',
      });
    }

    return results;
  };

  const handleCsvTextChange = (text: string) => {
    setCsvText(text);
    const parsed = parseCSV(text);
    setCsvPreview(parsed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleCsvTextChange(content || '');
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (csvPreview.length === 0) {
      alert('No hay reseñas válidas para importar. Revisa el texto o archivo.');
      return;
    }

    setImporting(true);
    try {
      const res = await api.post('/gmaps-reviews/bulk', { reviews: csvPreview });
      alert(`✅ ${res.data.message || 'Reseñas importadas correctamente.'}`);
      setShowCsvModal(false);
      setCsvText('');
      setCsvPreview([]);
      fetchReviews();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error al importar reseñas.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      {/* HEADER PRINCIPAL */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Star color="#f59e0b" fill="#f59e0b" size={26} /> Reseñas Globales (Pool de Reviews)
          </h1>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Bolsa centralizada de reseñas para Google Maps. Cualquier perfil que ejecute "GMaps Dejar Reseña" tomará una reseña disponible de este pool.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setCsvText('');
              setCsvPreview([]);
              setShowCsvModal(true);
            }}
          >
            <Upload size={16} /> Importar CSV
          </button>
          <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} /> Nueva Reseña
          </button>
          <button type="button" className="btn btn-secondary" onClick={fetchReviews} disabled={loading} title="Recargar">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* TARJETAS DE MÉTRICAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '0.75rem', borderRadius: '0.5rem', color: '#3b8df6' }}>
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>TOTAL RESEÑAS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text)' }}>{totalCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(234, 179, 8, 0.15)', padding: '0.75rem', borderRadius: '0.5rem', color: '#eab308' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>DISPONIBLES (NUEVAS)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#eab308' }}>{availableCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(34, 197, 94, 0.15)', padding: '0.75rem', borderRadius: '0.5rem', color: '#22c55e' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>APLICADAS (PUBLICADAS)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22c55e' }}>{appliedCount}</div>
          </div>
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* TABS DE ESTADO */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className={`btn ${statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
              onClick={() => setStatusFilter('all')}
            >
              Todas ({totalCount})
            </button>
            <button
              type="button"
              className={`btn ${statusFilter === '0' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
              onClick={() => setStatusFilter('0')}
            >
              ⏳ Disponibles ({availableCount})
            </button>
            <button
              type="button"
              className={`btn ${statusFilter === '1' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
              onClick={() => setStatusFilter('1')}
            >
              ✅ Aplicadas ({appliedCount})
            </button>
          </div>

          {/* BUSCADOR */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', minWidth: '300px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Buscar por Place ID, negocio o texto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ margin: 0, padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
            />
            <button type="submit" className="btn btn-secondary" style={{ padding: '0.45rem 0.85rem' }}>
              <Search size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando reseñas globales...</div>
        ) : reviews.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No se encontraron reseñas en el pool global con los filtros aplicados.
          </div>
        ) : (
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--surface-hover)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Place ID / Negocio</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Calificación</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Texto de la Reseña</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Perfil Asignado</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estado</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Link de Reseña</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fecha</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((rev) => (
                <tr key={rev.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', fontWeight: 'bold' }}>#{rev.id}</td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', maxWidth: '220px', wordBreak: 'break-all' }}>
                    {rev.name_place && (
                      <div style={{ fontWeight: 'bold', color: 'var(--text)', marginBottom: '2px' }}>{rev.name_place}</div>
                    )}
                    {rev.place_id ? (
                      <a
                        href={rev.place_id.startsWith('http') ? rev.place_id : `https://www.google.com/maps/place/?q=place_id:${rev.place_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#38bdf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <MapPin size={13} /> {rev.place_id}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '1rem' }}>
                      {'★'.repeat(rev.rating || 5)}{'☆'.repeat(5 - (rev.rating || 5))}
                    </span>
                    <span style={{ marginLeft: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      ({rev.rating || 5}/5)
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text)', maxWidth: '320px' }}>
                    <div style={{ maxHeight: '80px', overflowY: 'auto', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                      {rev.review || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin texto</span>}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    {rev.profile ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b8df6', fontWeight: 'bold' }}>
                          Perfil #{rev.profile.id}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {rev.profile.gmail || rev.profile.name}
                        </span>
                      </div>
                    ) : (
                      <span className="badge" style={{ background: 'rgba(156, 163, 175, 0.2)', color: '#9ca3af' }}>
                        Sin asignar
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    {rev.status === 1 ? (
                      <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', fontWeight: 'bold' }}>
                        ✅ Aplicada
                      </span>
                    ) : (
                      <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', fontWeight: 'bold' }}>
                        ⏳ Nueva / Pool
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>
                    {rev.link_review && rev.link_review.trim() !== '' ? (
                      <a
                        href={rev.link_review}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '0.3rem 0.65rem',
                          fontSize: '0.8rem',
                          color: '#38bdf8',
                          borderColor: 'rgba(56, 189, 248, 0.3)',
                          textDecoration: 'none',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <ExternalLink size={13} /> Ver Reseña
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>Pendiente</span>
                    )}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.6rem', marginRight: '0.4rem' }}
                      onClick={() => handleOpenEdit(rev)}
                      title="Editar"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.6rem', color: 'var(--error)' }}
                      onClick={() => handleDelete(rev.id)}
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL CREAR / EDITAR */}
      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="modal-content card" style={{ maxWidth: '550px', width: '100%', padding: '1.75rem', position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ marginTop: 0, marginBottom: '1.25rem', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star color="#f59e0b" fill="#f59e0b" size={20} />
              {editingReview ? `Editar Reseña #${editingReview.id}` : 'Nueva Reseña Global'}
            </h2>

            <form onSubmit={handleSave}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', fontWeight: 'bold' }}>
                  Place ID o Link de Google Maps *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej. ChIJN1t_tDeuEmsRUsoyG83frY4 o URL maps.google.com"
                  value={formData.place_id}
                  onChange={(e) => setFormData({ ...formData, place_id: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', fontWeight: 'bold' }}>
                    Calificación (Estrellas)
                  </label>
                  <select
                    className="input-field"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Estrellas)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Estrellas)</option>
                    <option value={3}>⭐⭐⭐ (3 Estrellas)</option>
                    <option value={2}>⭐⭐ (2 Estrellas)</option>
                    <option value={1}>⭐ (1 Estrella)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', fontWeight: 'bold' }}>
                    Estado
                  </label>
                  <select
                    className="input-field"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                  >
                    <option value={0}>⏳ 0: Nueva / Disponible en Pool</option>
                    <option value={1}>✅ 1: Aplicada / Publicada</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', fontWeight: 'bold' }}>
                  Nombre del Lugar / Negocio (Opcional)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej. Dental Care Center"
                  value={formData.name_place}
                  onChange={(e) => setFormData({ ...formData, name_place: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', fontWeight: 'bold' }}>
                  Texto de la Reseña
                </label>
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder="Redacta la reseña que el perfil escribirá en Google Maps..."
                  value={formData.review}
                  onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                />
              </div>

              {editingReview && (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', fontWeight: 'bold' }}>
                    Link de Reseña Publicada (Opcional)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="https://maps.app.goo.gl/..."
                    value={formData.link_review}
                    onChange={(e) => setFormData({ ...formData, link_review: e.target.value })}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> {editingReview ? 'Guardar Cambios' : 'Crear Reseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL IMPORTAR CSV */}
      {showCsvModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="modal-content card" style={{ maxWidth: '650px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowCsvModal(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Upload size={22} color="#38bdf8" /> Importar Reseñas desde CSV
            </h2>
            <p style={{ margin: '0 0 1rem', color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.4' }}>
              Formato esperado por fila: <strong>Place ID, Rating, Review Text</strong>. Si omites el rating se asignará 5 por defecto.
            </p>

            {/* SELECCIÓN DE ARCHIVO */}
            <div style={{ marginBottom: '1rem', border: '2px dashed var(--border)', padding: '1.25rem', borderRadius: '0.5rem', textAlign: 'center' }}>
              <input
                type="file"
                accept=".csv, .txt"
                id="csvFileInput"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="csvFileInput" className="btn btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={16} /> Seleccionar archivo CSV / TXT
              </label>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                O pega el contenido directamente abajo:
              </div>
            </div>

            {/* TEXTAREA PEGAR CONTENIDO */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <textarea
                className="input-field"
                rows={5}
                placeholder={`ChIJN1t_tDeuEmsRUsoyG83frY4, 5, "Excelente servicio y atención profesional"\nhttps://maps.app.goo.gl/example, 5, "Muy recomendado volveré sin duda"`}
                value={csvText}
                onChange={(e) => handleCsvTextChange(e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
              />
            </div>

            {/* VISTA PREVIA DETECTADA */}
            {csvPreview.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#22c55e' }}>
                    ✅ {csvPreview.length} reseñas válidas detectadas para importar:
                  </span>
                </div>

                <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '0.375rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-hover)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '0.4rem 0.6rem' }}>#</th>
                        <th style={{ padding: '0.4rem 0.6rem' }}>Place ID</th>
                        <th style={{ padding: '0.4rem 0.6rem' }}>Rating</th>
                        <th style={{ padding: '0.4rem 0.6rem' }}>Review Text</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.slice(0, 10).map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.4rem 0.6rem' }}>{idx + 1}</td>
                          <td style={{ padding: '0.4rem 0.6rem', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {row.place_id}
                          </td>
                          <td style={{ padding: '0.4rem 0.6rem', color: '#f59e0b', whiteSpace: 'nowrap' }}>
                            {'★'.repeat(row.rating)}
                          </td>
                          <td style={{ padding: '0.4rem 0.6rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {row.review || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {csvPreview.length > 10 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', textAlign: 'right' }}>
                    ...y {csvPreview.length - 10} filas más.
                  </div>
                )}
              </div>
            )}

            {/* BOTONES ACCIÓN */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowCsvModal(false)} disabled={importing}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmImport}
                disabled={importing || csvPreview.length === 0}
              >
                {importing ? 'Importando...' : `Importar ${csvPreview.length} Reseñas`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GmapsReviews;
