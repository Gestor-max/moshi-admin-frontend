import React, { useState, useEffect } from 'react';
import { api } from './api';
import { useLanguage } from './LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserCheck, Save, ArrowLeft, Briefcase, GraduationCap, MapPin, Key, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';

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

type TabType = 'basica' | 'credenciales' | 'empleo' | 'educacion' | 'ubicacion';

const NewProfile: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [proxies, setProxies] = useState<ProxyItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('basica');
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Basic Profile fields
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    username: '',
    website: '',
    pronouns: "Don't specify",
    company_basic: '',
    location_basic: '',
    social_accounts: '{"x.com":"", "facebook.com":""}',
    topic_about_you: '',
    profile_credential: '',
    description_html: '',
    gmail: '',
    gmail_password: '',
    gmail_password_prev: '',
    email_recovery: '',
    email_recovery_prev: '',
    profile_email: '',
    profile_email_password: '',
    bio: '',
    img: '',
    pais_iso: 'MEX',
    mes_nac: 1,
    year_nac: 2000,
    day_nac: 1,
    gender: 'M',
    time_zone: 'America/Mexico_City',
    proxy_id: '',
    proxy2_id: '',
    location_id: '',
    location_proxy_id: '',
    location_proxy_alt_id: '',
    tag_id: '',
    two_fa: '',
    two_fa_prev: '',
    telefono: '',
    gmail_new_password: '',
    gmail_new_recovery_email: '',
    gmail_change_2fa: false,
  });

  // Empleo fields
  const [empleo, setEmpleo] = useState({
    position: '',
    company: '',
    start_year: '',
    end_year: '',
    currently_work_here: true,
  });

  // Educación fields
  const [educacion, setEducacion] = useState({
    school: '',
    primary_major: '',
    secondary_major: '',
    degree_type: '',
    graduation_year: '',
  });

  // Ubicación fields
  const [ubicacion, setUbicacion] = useState({
    location: '',
    start_year: '',
    end_year: '',
    currently_live_here: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProxies, resLocs, resTags] = await Promise.all([
          api.get('/proxies'),
          api.get('/locations'),
          api.get('/tags'),
        ]);
        setProxies(resProxies.data);
        setLocations(resLocs.data);
        setTags(resTags.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.lastname.trim()) {
      setError('Nombre y Apellido son campos obligatorios.');
      setActiveTab('basica');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post(
        '/profiles',
        {
          ...formData,
          mes_nac: Number(formData.mes_nac) || 1,
          year_nac: Number(formData.year_nac) || 2000,
          day_nac: Number(formData.day_nac) || 1,
          proxy_id: formData.proxy_id ? Number(formData.proxy_id) : null,
          proxy2_id: formData.proxy2_id ? Number(formData.proxy2_id) : null,
          gmail_change_2fa: Boolean(formData.gmail_change_2fa),
          location_id: formData.location_id ? Number(formData.location_id) : null,
          location_proxy_id: formData.location_proxy_id ? Number(formData.location_proxy_id) : null,
          location_proxy_alt_id: formData.location_proxy_alt_id ? Number(formData.location_proxy_alt_id) : null,
          tag_id: formData.tag_id ? Number(formData.tag_id) : null,
          empleo: JSON.stringify(empleo),
          educacion: JSON.stringify(educacion),
          ubicacion: JSON.stringify(ubicacion),
        }
      );
      navigate('/profiles');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al crear el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div style={{ maxWidth: '850px', margin: '0 auto', paddingBottom: '2rem' }}>
        <Link to="/profiles" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1.25rem' }}>
          <ArrowLeft size={18} /> Volver a Perfiles
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: '0.75rem', color: 'white' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Crear Nuevo Perfil</h1>
            <p className="subtitle" style={{ margin: 0, textAlign: 'left' }}>
              Los campos Nombre y Apellido son obligatorios. El resto de la información es opcional.
            </p>
          </div>
        </div>

        {error && <div className="error-message" style={{ marginBottom: '1.25rem' }}>{error}</div>}

        {/* NAVEGACIÓN POR TABS */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'basica' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            onClick={() => setActiveTab('basica')}
          >
            <User size={16} /> {t('tab_basic')}
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'credenciales' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            onClick={() => setActiveTab('credenciales')}
          >
            <Key size={16} /> {t('tab_credentials')}
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'empleo' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            onClick={() => setActiveTab('empleo')}
          >
            <Briefcase size={16} /> {t('tab_employment')}
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'educacion' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            onClick={() => setActiveTab('educacion')}
          >
            <GraduationCap size={16} /> {t('tab_education')}
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'ubicacion' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            onClick={() => setActiveTab('ubicacion')}
          >
            <MapPin size={16} /> {t('tab_location')}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* TAB 1: INFORMACIÓN BÁSICA */}
          {activeTab === 'basica' && (
            <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label>Nombre <span style={{ color: 'var(--error)' }}>*</span></label>
                <input type="text" className="input-field" name="name" value={formData.name} onChange={handleChange} placeholder="ej. Mario" required />
              </div>

              <div className="form-group">
                <label>Apellido <span style={{ color: 'var(--error)' }}>*</span></label>
                <input type="text" className="input-field" name="lastname" value={formData.lastname} onChange={handleChange} placeholder="ej. Mosca" required />
              </div>

              <div className="form-group">
                <label>Username</label>
                <input type="text" className="input-field" name="username" value={formData.username} onChange={handleChange} placeholder="ej. mariomosca" />
              </div>

              <div className="form-group">
                <label>Website</label>
                <input type="text" className="input-field" name="website" value={formData.website} onChange={handleChange} placeholder="https://mariomosca.com" />
              </div>

              <div className="form-group">
                <label>Pronouns (Pronombres)</label>
                <select name="pronouns" className="input-field" value={formData.pronouns} onChange={handleChange}>
                  <option value="Don't specify">Don't specify</option>
                  <option value="they/them">they/them</option>
                  <option value="she/her">she/her</option>
                  <option value="he/him">he/him</option>
                </select>
              </div>

              <div className="form-group">
                <label>Company (Empresa Básica)</label>
                <input type="text" className="input-field" name="company_basic" value={formData.company_basic} onChange={handleChange} placeholder="ej. Coca Cola" />
              </div>

              <div className="form-group">
                <label>Location (Ubicación Básica)</label>
                <input type="text" className="input-field" name="location_basic" value={formData.location_basic} onChange={handleChange} placeholder="ej. Austin, TX" />
              </div>

              <div className="form-group">
                <label>Profile Credential (Incluye Ubicación)</label>
                <input type="text" className="input-field" name="profile_credential" value={formData.profile_credential} onChange={handleChange} placeholder="ej. Full Stack Programmer at Coca Cola" />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Topic About You (Temas / Intereses)</label>
                <input type="text" className="input-field" name="topic_about_you" value={formData.topic_about_you} onChange={handleChange} placeholder="ej. Live Music, Street Tacos, Hiking, Paddleboarding" />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Social Accounts (JSON Format)</label>
                <textarea name="social_accounts" rows={2} className="input-field" value={formData.social_accounts} onChange={handleChange} placeholder='{"x.com":"", "facebook.com":""}' />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Description HTML (Biografía en HTML)</label>
                <textarea name="description_html" rows={3} className="input-field" value={formData.description_html} onChange={handleChange} placeholder='Mario Mosca is a young Latino professional...' />
              </div>

              <div className="form-group">
                <label>Género</label>
                <select name="gender" className="input-field" value={formData.gender} onChange={handleChange}>
                  <option value="M">Masculino (M)</option>
                  <option value="F">Femenino (F)</option>
                  <option value="O">Otro (O)</option>
                </select>
              </div>

              <div className="form-group">
                <label>País ISO (3 letras)</label>
                <input type="text" className="input-field" name="pais_iso" maxLength={3} value={formData.pais_iso} onChange={handleChange} placeholder="ARG, MEX, ESP..." />
              </div>

              <div className="form-group">
                <label>Día Nacimiento</label>
                <input type="number" className="input-field" name="day_nac" min={1} max={31} value={formData.day_nac} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Mes Nacimiento</label>
                <input type="number" className="input-field" name="mes_nac" min={1} max={12} value={formData.mes_nac} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Año Nacimiento</label>
                <input type="number" className="input-field" name="year_nac" min={1900} max={2030} value={formData.year_nac} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Zona Horaria</label>
                <input type="text" className="input-field" name="time_zone" value={formData.time_zone} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Proxy Asociado (Opcional)</label>
                <select name="proxy_id" className="input-field" value={formData.proxy_id} onChange={handleChange}>
                  <option value="">-- Sin Proxy --</option>
                  {proxies.map((p) => (
                    <option key={p.id} value={p.id}>
                      Proxy #{p.id} ({p.ip}:{p.port})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Proxy 2 Secundario (Opcional)</label>
                <select name="proxy2_id" className="input-field" value={formData.proxy2_id} onChange={handleChange}>
                  <option value="">-- Sin Proxy 2 --</option>
                  {proxies.map((p) => (
                    <option key={p.id} value={p.id}>
                      Proxy #{p.id} ({p.ip}:{p.port})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Ubicación Asociada (Opcional)</label>
                <select name="location_id" className="input-field" value={formData.location_id} onChange={handleChange}>
                  <option value="">-- Sin Ubicación --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.location} ({loc.state})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>🛰️ Location Proxy (Opcional)</label>
                <select name="location_proxy_id" className="input-field" value={formData.location_proxy_id} onChange={handleChange}>
                  <option value="">-- Sin Location Proxy --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.location} ({loc.state})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>🔄 Location Proxy Alternativa (Opcional)</label>
                <select name="location_proxy_alt_id" className="input-field" value={formData.location_proxy_alt_id} onChange={handleChange}>
                  <option value="">-- Sin Location Proxy Alternativa --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.location} ({loc.state})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>🏷️ Etiqueta / Tag (Opcional)</label>
                <select name="tag_id" className="input-field" value={formData.tag_id} onChange={handleChange}>
                  <option value="">-- Sin Etiqueta --</option>
                  {tags.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Biografía (Bio Simple)</label>
                <textarea name="bio" rows={2} className="input-field" value={formData.bio} onChange={handleChange} placeholder="Acerca de este perfil..." />
              </div>
            </div>
          )}

          {/* TAB 2: CREDENCIALES & CORREOS */}
          {activeTab === 'credenciales' && (
            <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label>Correo Gmail</label>
                <input type="email" className="input-field" name="gmail" value={formData.gmail} onChange={handleChange} placeholder="cuenta@gmail.com" />
              </div>

              <div className="form-group">
                <label>Teléfono (Opcional)</label>
                <input type="text" className="input-field" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Ej: +52 55 1234 5678" />
              </div>

              <div className="form-group">
                <label>Contraseña Gmail Actual</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showPasswords.gmail_password ? 'text' : 'password'}
                    className="input-field"
                    name="gmail_password"
                    value={formData.gmail_password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('gmail_password')}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0
                    }}
                    title={showPasswords.gmail_password ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPasswords.gmail_password ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Contraseña Google Anterior</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showPasswords.gmail_password_prev ? 'text' : 'password'}
                    className="input-field"
                    name="gmail_password_prev"
                    value={formData.gmail_password_prev}
                    onChange={handleChange}
                    placeholder="Contraseña anterior..."
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('gmail_password_prev')}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0
                    }}
                    title={showPasswords.gmail_password_prev ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPasswords.gmail_password_prev ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Correo de Recuperación (Gmail)</label>
                <input type="email" className="input-field" name="email_recovery" value={formData.email_recovery} onChange={handleChange} placeholder="recuperacion@gmail.com" />
              </div>

              <div className="form-group">
                <label>Correo de Recuperación Anterior</label>
                <input type="email" className="input-field" name="email_recovery_prev" value={formData.email_recovery_prev} onChange={handleChange} placeholder="recuperacion_anterior@gmail.com" />
              </div>

              <div className="form-group">
                <label>Código 2FA Actual (Opcional)</label>
                <input type="text" className="input-field" name="two_fa" value={formData.two_fa} onChange={handleChange} placeholder="Ej: JBSWY3DPEHPK3PXP" />
              </div>

              <div className="form-group">
                <label>Código 2FA Anterior (Opcional)</label>
                <input type="text" className="input-field" name="two_fa_prev" value={formData.two_fa_prev} onChange={handleChange} placeholder="Secreto OTP anterior..." />
              </div>

              <div className="form-group">
                <label>Correo de Perfil Secundario</label>
                <input type="email" className="input-field" name="profile_email" value={formData.profile_email} onChange={handleChange} placeholder="perfil@dominio.com" />
              </div>

              <div className="form-group">
                <label>Contraseña Correo Perfil</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showPasswords.profile_email_password ? 'text' : 'password'}
                    className="input-field"
                    name="profile_email_password"
                    value={formData.profile_email_password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('profile_email_password')}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0
                    }}
                    title={showPasswords.profile_email_password ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPasswords.profile_email_password ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Sección Cambio de Credenciales Google */}
              <div style={{ gridColumn: 'span 2', marginTop: '1rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--primary)' }}>
                  <ShieldCheck size={18} /> Actualización de Seguridad / Cambio de Datos en Google
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Datos para activar el cambio de contraseña, correo de recuperación y 2FA en Google.
                </p>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    name="gmail_change_2fa"
                    checked={Boolean(formData.gmail_change_2fa)}
                    onChange={handleChange}
                    style={{ width: '1.15rem', height: '1.15rem', accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <span>Activar cambio de 2FA en Google (gmail_change_2fa)</span>
                </label>
                <small style={{ display: 'block', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Habilita la orden para cambiar y actualizar el código de verificación en dos pasos (2FA) en la cuenta de Google.
                </small>
              </div>

              <div className="form-group">
                <label>Nueva Contraseña de Gmail</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showPasswords.gmail_new_password ? 'text' : 'password'}
                    className="input-field"
                    name="gmail_new_password"
                    value={formData.gmail_new_password}
                    onChange={handleChange}
                    placeholder="Nueva contraseña deseada..."
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('gmail_new_password')}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0
                    }}
                    title={showPasswords.gmail_new_password ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPasswords.gmail_new_password ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Nuevo Correo de Recuperación</label>
                <input
                  type="email"
                  className="input-field"
                  name="gmail_new_recovery_email"
                  value={formData.gmail_new_recovery_email}
                  onChange={handleChange}
                  placeholder="nuevo_recuperacion@gmail.com"
                />
              </div>
            </div>
          )}

          {/* TAB 3: EMPLEO */}
          {activeTab === 'empleo' && (
            <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label>Position (Puesto / Cargo)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="ej. Full Stack Programmer"
                  value={empleo.position}
                  onChange={(e) => setEmpleo({ ...empleo, position: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Company / Organization (Empresa / Organización)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="ej. Coca Cola"
                  value={empleo.company}
                  onChange={(e) => setEmpleo({ ...empleo, company: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Start Year (Año Inicio)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="ej. 2021"
                  value={empleo.start_year}
                  onChange={(e) => setEmpleo({ ...empleo, start_year: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>End Year (Año Fin)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="ej. Present"
                  value={empleo.currently_work_here ? 'Present' : empleo.end_year}
                  disabled={empleo.currently_work_here}
                  onChange={(e) => setEmpleo({ ...empleo, end_year: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="currently_work_here"
                  checked={empleo.currently_work_here}
                  onChange={(e) => setEmpleo({ ...empleo, currently_work_here: e.target.checked })}
                />
                <label htmlFor="currently_work_here" style={{ margin: 0, cursor: 'pointer' }}>I currently work here (Trabajo actualmente aquí)</label>
              </div>
            </div>
          )}

          {/* TAB 4: EDUCACIÓN */}
          {activeTab === 'educacion' && (
            <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>School / Universidad</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="ej. University of Texas at Austin"
                  value={educacion.school}
                  onChange={(e) => setEducacion({ ...educacion, school: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Primary Major (Carrera Principal)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="ej. Computer Science"
                  value={educacion.primary_major}
                  onChange={(e) => setEducacion({ ...educacion, primary_major: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Secondary Major (Carrera Secundaria)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="ej. Business"
                  value={educacion.secondary_major}
                  onChange={(e) => setEducacion({ ...educacion, secondary_major: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Degree Type (Tipo de Grado)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="ej. Bachelor of Science"
                  value={educacion.degree_type}
                  onChange={(e) => setEducacion({ ...educacion, degree_type: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Graduation Year (Año de Graduación)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="ej. 2020"
                  value={educacion.graduation_year}
                  onChange={(e) => setEducacion({ ...educacion, graduation_year: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* TAB 5: UBICACIÓN */}
          {activeTab === 'ubicacion' && (
            <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Location (Ubicación) <span style={{ color: 'var(--error)' }}>*</span></label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="ej. Austin, TX"
                  value={ubicacion.location}
                  onChange={(e) => setUbicacion({ ...ubicacion, location: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Start Year (Año Inicio)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="ej. 2015"
                  value={ubicacion.start_year}
                  onChange={(e) => setUbicacion({ ...ubicacion, start_year: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>End Year (Año Fin)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="ej. Present"
                  disabled={ubicacion.currently_live_here}
                  value={ubicacion.currently_live_here ? 'Present' : ubicacion.end_year}
                  onChange={(e) => setUbicacion({ ...ubicacion, end_year: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="currently_live_here"
                  checked={ubicacion.currently_live_here}
                  onChange={(e) => setUbicacion({ ...ubicacion, currently_live_here: e.target.checked })}
                />
                <label htmlFor="currently_live_here" style={{ margin: 0, cursor: 'pointer' }}>I currently live here (Resido actualmente aquí)</label>
              </div>
            </div>
          )}

          {/* BOTONES FIJOS Y RENDEREADOS SIEMPRE */}
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/profiles')}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ minWidth: '160px' }}
            >
              <Save size={18} /> {loading ? 'Guardando...' : 'Guardar Perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProfile;
