import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Bot, Mail, Lock, ArrowRight, ShieldCheck, User, CheckCircle2, Zap } from 'lucide-react';
import { useAuth } from './AuthContext';
import API_BASE_URL from './api';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, token } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, { email, password, name });
      if (res.data?.access_token) {
        login(res.data.access_token, res.data.user);
        navigate('/dashboard');
      } else {
        navigate('/login', { state: { message: 'Cuenta creada con éxito. Por favor inicia sesión.' } });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo completar el registro. Contacta al administrador.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout-page">
      {/* Navbar Pública */}
      <header className="saas-nav">
        <div className="saas-nav-container">
          <div className="saas-logo" onClick={() => navigate('/')}>
            <div className="saas-logo-icon">
              <Bot size={24} />
            </div>
            <span>Moshi<span className="text-orange">Admin</span></span>
          </div>

          <nav className="saas-nav-links">
            <Link to="/">Inicio</Link>
            <a href="/#features">Características</a>
            <a href="/#app-download">Moshi App</a>
          </nav>

          <div className="saas-nav-actions">
            {token ? (
              <button onClick={() => navigate('/dashboard')} className="btn-saas-primary">
                Ir al Dashboard <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <Link to="/login" className="btn-saas-ghost">Iniciar Sesión</Link>
                <Link to="/register" className="btn-saas-outline font-semibold">Registrarse</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="auth-split-container">
        {/* Lado Izquierdo: Información del Sistema */}
        <div className="auth-info-side">
          <div className="auth-info-content">
            <div className="saas-badge">
              <Zap size={14} /> Empieza Hoy Mismo
            </div>

            <h2>
              Únete a la plataforma de <br />
              <span className="gradient-text">Gestión Avanzada de Cuentas</span>
            </h2>

            <p className="auth-info-description">
              Crea tu cuenta de MoshiAdmin en segundos y comienza a estructurar tus perfiles, automatización RPA y proxies sin complicaciones.
            </p>

            <div className="auth-features-list">
              <div className="auth-feature-item">
                <CheckCircle2 size={20} className="text-orange" />
                <div>
                  <h4>Acceso Inmediato al Panel SaaS</h4>
                  <p>Monitorea y administra tus recursos en tiempo real desde cualquier lugar.</p>
                </div>
              </div>

              <div className="auth-feature-item">
                <ShieldCheck size={20} className="text-orange" />
                <div>
                  <h4>Integración Directa con Moshi App</h4>
                  <p>Conecta la app de escritorio para la gestión automatizada local.</p>
                </div>
              </div>

              <div className="auth-feature-item">
                <Zap size={20} className="text-orange" />
                <div>
                  <h4>Soporte Multi-Website</h4>
                  <p>Administra credenciales y sesiones de múltiples sitios web.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Formulario de Registro */}
        <div className="auth-form-side">
          <div className="auth-card-container">
            <div className="auth-header">
              <div className="auth-logo-badge">
                <Bot size={30} />
              </div>
              <h2>Crear cuenta</h2>
              <p className="subtitle">Únete a MoshiAdmin y gestiona tus perfiles</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>Nombre Completo</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Juan Pérez"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Correo Electrónico</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Contraseña</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Confirmar Contraseña</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-auth-submit">
                {loading ? 'Creando cuenta...' : (
                  <>
                    Registrarse <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer-text">
              ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
