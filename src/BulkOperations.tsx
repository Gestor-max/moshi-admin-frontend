import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Layers, Upload, FileText, CheckCircle2, AlertCircle, ArrowRight, Globe, Search, PlaySquare, Video, Navigation, Map } from 'lucide-react';

interface LocationItem {
  id: number;
  state: string;
  location: string;
  _count?: {
    profiles: number;
  };
}

interface ProfileItem {
  id: number;
  name: string;
  lastname: string;
  profile_email?: string;
  gmail?: string;
  location_id?: number | null;
  is_archived?: boolean;
}

const ACTIVITY_OPTIONS = [
  {
    key: 'browser_link',
    label: 'Navegador: Visitar Sitio Web',
    desc: 'URLs completas de sitios web a visitar (ej. https://ejemplo.com)',
    icon: Globe,
    color: '#06b6d4',
  },
  {
    key: 'google_search',
    label: 'Google: Búsquedas de Google',
    desc: 'Palabras clave o términos de búsqueda para Google',
    icon: Search,
    color: '#3b82f6',
  },
  {
    key: 'youtube_search',
    label: 'Youtube: Búsquedas de youtube',
    desc: 'Términos de búsqueda a buscar en YouTube',
    icon: PlaySquare,
    color: '#ef4444',
  },
  {
    key: 'youtube_video',
    label: 'Youtube: Ver video',
    desc: 'IDs de video de YouTube (ej. dQw4w9WgXcQ) o enlaces',
    icon: Video,
    color: '#f43f5e',
  },
  {
    key: 'gmaps_search',
    label: 'Google Maps: Búsqueda en el mapa',
    desc: 'Términos de búsqueda para Google Maps (ej. restaurantes cerca de mí)',
    icon: Map,
    color: '#10b981',
  },
  {
    key: 'gmaps_place_id',
    label: 'Google Maps: Links de Google Maps (Visitar Link / Place ID)',
    desc: 'Place IDs de Google Maps o URLs directas del lugar',
    icon: Navigation,
    color: '#f59e0b',
  },
];

const BulkOperations: React.FC = () => {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [selectedActivityType, setSelectedActivityType] = useState<string>('google_search');
  const [inputMode, setInputMode] = useState<'textarea' | 'file'>('textarea');
  const [rawText, setRawText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  const [executing, setExecuting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locRes, profRes] = await Promise.all([
          api.get('/locations'),
          api.get('/profiles'),
        ]);
        setLocations(locRes.data);
        setProfiles(profRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Perfiles pertenecientes a la ubicación seleccionada
  const matchingProfiles = profiles.filter(
    (p) => !p.is_archived && p.location_id && String(p.location_id) === String(selectedLocationId)
  );

  // Entradas parseadas (una por línea, no vacías)
  const entriesList = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // Manejador de archivo local (FileReader en memoria, nunca se envía archivo al servidor)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Error al leer el archivo en el navegador.');
    };
    reader.readAsText(file);
  };

  const handleExecute = async () => {
    setSuccessMessage('');
    setErrorMessage('');

    if (!selectedLocationId) {
      setErrorMessage('Por favor selecciona una ubicación.');
      return;
    }

    if (matchingProfiles.length === 0) {
      setErrorMessage('No hay perfiles activos asignados a la ubicación seleccionada.');
      return;
    }

    if (entriesList.length === 0) {
      setErrorMessage('Por favor ingresa o importa al menos una línea válida de datos.');
      return;
    }

    setExecuting(true);

    try {
      const res = await api.post('/activities/bulk-location', {
        location_id: Number(selectedLocationId),
        activity_type: selectedActivityType,
        entries: entriesList,
      });

      if (res.data.success) {
        setSuccessMessage(
          `🎉 ${res.data.message || `Se crearon ${res.data.activities_created} actividades exitosamente para ${res.data.profiles_count} perfiles.`}`
        );
        setRawText('');
        setFileName('');
      } else {
        setErrorMessage(res.data.message || 'Error al ejecutar operación masiva.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'Error en el servidor al ejecutar la operación masiva.');
    } finally {
      setExecuting(false);
    }
  };

  const selectedLocObj = locations.find((l) => String(l.id) === String(selectedLocationId));

  if (loading) {
    return (
      <div className="dashboard" style={{ width: '100%', maxWidth: '100%', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Cargando ubicaciones y perfiles...
      </div>
    );
  }

  return (
    <div className="dashboard" style={{ width: '100%', maxWidth: '100%' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
          <Layers size={28} color="var(--primary)" /> Operaciones Masivas (Bulk Operations)
        </h1>
        <p className="subtitle" style={{ textAlign: 'left', margin: '0.35rem 0 0 0' }}>
          Importa y asigna búsquedas, enlaces o tareas a todos los perfiles de una ubicación en un solo paso.
        </p>
      </div>

      {successMessage && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#10b981',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={20} /> {successMessage}
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#ef4444',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontWeight: 600,
          }}
        >
          <AlertCircle size={20} /> {errorMessage}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(320px, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
        {/* COLUMNA IZQUIERDA: CONFIGURACIÓN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* PASO 1: SELECCIONAR UBICACIÓN */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>1</span>
              Seleccionar Ubicación Asociada
            </h3>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}>
                Ubicación / Ciudad (Location)
              </label>
              <select
                className="input-field"
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
              >
                <option value="">-- Selecciona una Ubicación --</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    📍 {loc.location} ({loc.state})
                  </option>
                ))}
              </select>
            </div>

            {selectedLocationId && (
              <div style={{ padding: '0.85rem', background: 'var(--surface-hover)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Perfiles en esta ubicación:</span>
                  <span
                    className="badge"
                    style={{
                      background: matchingProfiles.length > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: matchingProfiles.length > 0 ? '#10b981' : '#ef4444',
                      fontWeight: 'bold',
                    }}
                  >
                    {matchingProfiles.length} perfiles activos
                  </span>
                </div>
                {matchingProfiles.length > 0 ? (
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.5rem', maxHeight: '100px', overflowY: 'auto' }}>
                    {matchingProfiles.map((p) => (
                      <span
                        key={p.id}
                        style={{
                          fontSize: '0.75rem',
                          background: 'var(--bg-card)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '0.25rem',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                        }}
                      >
                        #{p.id} {p.name} {p.lastname}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem', color: '#ef4444' }}>
                    ⚠️ No hay perfiles asociados a esta ubicación. Asigna perfiles a esta ubicación primero.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* PASO 2: SELECCIONAR TIPO DE ACTIVIDAD */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>2</span>
              Seleccionar Actividad Destino
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {ACTIVITY_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = selectedActivityType === opt.key;
                return (
                  <label
                    key={opt.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      border: isSelected ? `2px solid ${opt.color}` : '1px solid var(--border)',
                      background: isSelected ? `${opt.color}15` : 'var(--bg-card)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="activity_type"
                      value={opt.key}
                      checked={isSelected}
                      onChange={() => setSelectedActivityType(opt.key)}
                      style={{ accentColor: opt.color }}
                    />
                    <div style={{ color: opt.color }}>
                      <IconComponent size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {opt.desc}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: ENTRADA DE DATOS & EJECUCIÓN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>3</span>
                Datos a Importar (Línea por Línea)
              </h3>

              {/* Toggle Textarea vs Archivo */}
              <div style={{ display: 'inline-flex', background: 'var(--surface-hover)', padding: '2px', borderRadius: '0.375rem' }}>
                <button
                  type="button"
                  onClick={() => setInputMode('textarea')}
                  style={{
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '0.25rem',
                    border: 'none',
                    cursor: 'pointer',
                    background: inputMode === 'textarea' ? 'var(--primary)' : 'transparent',
                    color: inputMode === 'textarea' ? 'white' : 'var(--text-muted)',
                  }}
                >
                  <FileText size={13} style={{ display: 'inline', marginRight: 4 }} /> Pegar Texto
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('file')}
                  style={{
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '0.25rem',
                    border: 'none',
                    cursor: 'pointer',
                    background: inputMode === 'file' ? 'var(--primary)' : 'transparent',
                    color: inputMode === 'file' ? 'white' : 'var(--text-muted)',
                  }}
                >
                  <Upload size={13} style={{ display: 'inline', marginRight: 4 }} /> Cargar Archivo (.txt/.csv)
                </button>
              </div>
            </div>

            {inputMode === 'file' && (
              <div style={{ marginBottom: '1rem' }}>
                <div
                  style={{
                    border: '2px dashed var(--border)',
                    padding: '1.5rem',
                    borderRadius: '0.5rem',
                    textAlign: 'center',
                    background: 'var(--surface-hover)',
                  }}
                >
                  <Upload size={32} style={{ margin: '0 auto 0.5rem', color: 'var(--primary)' }} />
                  <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, fontSize: '0.875rem' }}>
                    Selecciona un archivo .txt o .csv desde tu equipo
                  </p>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    🔒 El archivo se procesa únicamente en la memoria de tu navegador y no se almacena en el servidor.
                  </p>
                  <input
                    type="file"
                    accept=".txt,.csv"
                    onChange={handleFileUpload}
                    style={{ fontSize: '0.85rem' }}
                  />
                  {fileName && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
                      ✅ Archivo cargado: {fileName}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Contenido (un registro por línea):
                </label>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                  {entriesList.length} líneas detectadas
                </span>
              </div>
              <textarea
                className="input-field"
                rows={10}
                style={{ fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.4' }}
                placeholder={`Pega aquí tus datos línea por línea:\nLínea 1 o enlace\nLínea 2 o enlace\nLínea 3 o enlace...`}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
            </div>

            {/* TARJETA DE RESUMEN Y CÁLCULO */}
            <div
              style={{
                background: 'var(--surface-hover)',
                padding: '1.25rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border)',
                marginBottom: '1.5rem',
              }}
            >
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📊 Resumen de la Operación
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Ubicación:</span>
                  <strong>{selectedLocObj ? `${selectedLocObj.location} (${selectedLocObj.state})` : 'No seleccionada'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Perfiles alcanzados:</span>
                  <strong style={{ color: matchingProfiles.length > 0 ? '#10b981' : '#ef4444' }}>
                    {matchingProfiles.length} perfiles
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Líneas / Entradas:</span>
                  <strong>{entriesList.length} registros</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Total Actividades a Crear:</span>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>
                    {matchingProfiles.length * entriesList.length} actividades
                  </strong>
                </div>
              </div>
            </div>

            {/* BOTÓN EJECUTAR */}
            <button
              type="button"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
              disabled={executing || !selectedLocationId || matchingProfiles.length === 0 || entriesList.length === 0}
              onClick={handleExecute}
            >
              {executing ? (
                '⏳ Procesando e importando actividades...'
              ) : (
                <>
                  <ArrowRight size={18} /> Ejecutar Importación Masiva ({matchingProfiles.length * entriesList.length} registros)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOperations;
