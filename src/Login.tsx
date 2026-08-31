import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Bot, Mail, Lock, ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import API_BASE_URL from './api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, token } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      login(response.data.access_token, response.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciales inválidas. Verifica tu correo y contraseña.');
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
                <Link to="/login" className="btn-saas-ghost text-orange font-semibold">Iniciar Sesión</Link>
                <Link to="/register" className="btn-saas-outline">Registrarse</Link>
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
              <ShieldCheck size={14} /> Plataforma Segura SaaS
            </div>

            <h2>
              Administración Centralizada de <br />
              <span className="gradient-text">Perfiles & Automation</span>
            </h2>

            <p className="auth-info-description">
              MoshiAdmin te brinda control total sobre tus perfiles digitales, asignación dinámica de proxies, integración multi-website y ejecución de scripts RPA.
            </p>

            <div className="auth-features-list">
              <div className="auth-feature-item">
                <CheckCircle2 size={20} className="text-orange" />
                <div>
                  <h4>Aislamiento de Perfiles & Proxies</h4>
                  <p>Asigna proxies HTTP/SOCKS5 a cada perfil para conexiones seguras.</p>
                </div>
              </div>

              <div className="auth-feature-item">
                <Zap size={20} className="text-orange" />
                <div>
                  <h4>Automatización y Scripts RPA</h4>
                  <p>Optimiza tus tareas masivas con integración nativa a Moshi App.</p>
                </div>
              </div>

              <div className="auth-feature-item">
                <ShieldCheck size={20} className="text-orange" />
                <div>
                  <h4>Seguridad de Grado Empresarial</h4>
                  <p>Cifrado Bcrypt para credenciales y tokens JWT para cada sesión.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Formulario de Login */}
        <div className="auth-form-side">
          <div className="auth-card-container">
            <div className="auth-header">
              <div className="auth-logo-badge">
                <Bot size={30} />
              </div>
              <h2>Iniciar Sesión</h2>
              <p className="subtitle">Bienvenido de nuevo. Accede a tu panel.</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
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

              <button type="submit" disabled={loading} className="btn-auth-submit">
                {loading ? 'Ingresando...' : (
                  <>
                    Ingresar al Dashboard <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer-text">
              ¿No tienes una cuenta aún? <Link to="/register">Crea una cuenta</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
