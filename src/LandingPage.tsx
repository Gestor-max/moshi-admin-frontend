import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { 
  Bot, Download, Zap, Server, Globe, UserCheck, 
  ArrowRight, CheckCircle2, Monitor, ChevronRight, Lock
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    // Simular inicio de descarga
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = '#';
      link.setAttribute('download', 'MoshiApp-Setup-v1.0.exe');
      document.body.appendChild(link);
      alert('¡Gracias por descargar Moshi App! La descarga comenzará en breve.');
      setDownloading(false);
    }, 1000);
  };

  return (
    <div className="saas-landing">
      {/* Navbar Pública */}
      <header className="saas-nav">
        <div className="saas-nav-container">
          <div className="saas-logo" onClick={() => navigate('/')}>
            <div className="saas-logo-icon">
              <Bot size={26} />
            </div>
            <span>Moshi<span className="text-orange">Admin</span></span>
          </div>

          <nav className="saas-nav-links">
            <a href="#features">Características</a>
            <a href="#app-download">Moshi App</a>
            <a href="#security">Seguridad</a>
          </nav>

          <div className="saas-nav-actions">
            {token ? (
              <button onClick={() => navigate('/dashboard')} className="btn-saas-primary">
                Ir al Dashboard <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <Link to="/login" className="btn-saas-ghost">Iniciar Sesión</Link>
                <Link to="/register" className="btn-saas-outline">Registrarse</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="saas-hero">
        <div className="saas-hero-bg-glow"></div>
        <div className="saas-container">
          <div className="saas-badge">
            <Zap size={14} /> Nueva Versión 2.0 Disponible
          </div>
          
          <h1 className="saas-hero-title">
            Gestión Inteligente de <br />
            <span className="gradient-text">Perfiles, Proxies y Cuentas</span>
          </h1>

          <p className="saas-hero-subtitle">
            La plataforma SaaS definitiva para administrar la infraestructura de automatización de tus perfiles digitales, redes y proxies con total control y seguridad.
          </p>

          <div className="saas-hero-cta">
            <button className="btn-download-hero" onClick={handleDownload} disabled={downloading}>
              <Download size={22} className="pulse-icon" />
              <div className="btn-download-text">
                <span className="btn-main-label">{downloading ? 'Iniciando Descarga...' : 'Descargar Moshi App'}</span>
                <span className="btn-sub-label">Versión Oficial para Windows (.exe)</span>
              </div>
            </button>

            {token ? (
              <button onClick={() => navigate('/dashboard')} className="btn-hero-secondary">
                Abrir Panel Web <ChevronRight size={18} />
              </button>
            ) : (
              <Link to="/login" className="btn-hero-secondary">
                Acceder a la Plataforma Web <ChevronRight size={18} />
              </Link>
            )}
          </div>

          <div className="saas-hero-stats">
            <div className="hero-stat-item">
              <h4>99.9%</h4>
              <p>Uptime Garantizado</p>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat-item">
              <h4>Multi-Proxy</h4>
              <p>Soporte HTTP / SOCKS5</p>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat-item">
              <h4>Encriptado</h4>
              <p>Protección AES-256</p>
            </div>
          </div>
        </div>
      </section>

      {/* App Download Highlight Section */}
      <section id="app-download" className="saas-section app-highlight-section">
        <div className="saas-container">
          <div className="app-card-grid">
            <div className="app-card-info">
              <div className="tag-orange"><Monitor size={14} /> Aplicación de Escritorio</div>
              <h2>Potencia tu flujo de trabajo con <span>Moshi App</span></h2>
              <p>
                Sincroniza tus perfiles de forma transparente y ejecuta tareas automatizadas directamente desde tu escritorio con la máxima velocidad y menor consumo de recursos.
              </p>
              <ul className="app-features-list">
                <li><CheckCircle2 size={18} color="var(--primary)" /> Sincronización en tiempo real con el panel web</li>
                <li><CheckCircle2 size={18} color="var(--primary)" /> Gestión integrada de proxies de alta velocidad</li>
                <li><CheckCircle2 size={18} color="var(--primary)" /> Interfaz optimizada en modo oscuro</li>
                <li><CheckCircle2 size={18} color="var(--primary)" /> Configuración rápida e instalador liviano</li>
              </ul>
              <div style={{ marginTop: '2rem' }}>
                <button className="btn-download-hero" onClick={handleDownload}>
                  <Download size={20} />
                  <span>Obtener Moshi App Gratis</span>
                </button>
              </div>
            </div>

            <div className="app-card-preview">
              <div className="preview-window">
                <div className="preview-header">
                  <div className="dots">
                    <span className="dot red"></span>
                    <span className="dot yellow"></span>
                    <span className="dot green"></span>
                  </div>
                  <span className="window-title">Moshi App Desktop v1.0</span>
                </div>
                <div className="preview-body">
                  <div className="preview-sidebar">
                    <div className="preview-item active"></div>
                    <div className="preview-item"></div>
                    <div className="preview-item"></div>
                  </div>
                  <div className="preview-content">
                    <div className="preview-row"></div>
                    <div className="preview-cards">
                      <div className="p-card"></div>
                      <div className="p-card"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="saas-section">
        <div className="saas-container">
          <div className="section-title-wrapper">
            <h2 className="section-title">Todo lo que necesitas en una sola plataforma</h2>
            <p className="section-subtitle">Diseñado para simplificar la gestión y supervisión masiva de cuentas y proxies.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><UserCheck size={26} /></div>
              <h3>Gestión de Perfiles</h3>
              <p>Organiza la identidad digital de cada perfil con metadatos completos, información geográfica y zonas horarias.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><Server size={26} /></div>
              <h3>Control de Proxies</h3>
              <p>Asignación dinámica de proxies a perfiles para garantizar conexiones aisladas y seguras sin filtraciones.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><Globe size={26} /></div>
              <h3>Integración Web</h3>
              <p>Vincula cuentas a sitios web específicos y gestiona credenciales y cookies de forma centralizada.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><Globe size={26} /></div>
              <h3>Cuentas / Perfiles Multi Website</h3>
              <p>Administración especializada y vinculación de perfiles en múltiples plataformas web con almacenamiento seguro de cookies de sesión.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><Zap size={26} /></div>
              <h3>Gestión de Scripts RPA</h3>
              <p>Automatización de procesos robóticos y ejecución eficiente de scripts para maximizar la productividad de tus perfiles.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><Lock size={26} /></div>
              <h3>Seguridad Avanzada</h3>
              <p>Cifrado de contraseñas mediante Bcrypt y autenticación de sesiones respaldada por JSON Web Tokens (JWT).</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="saas-footer">
        <div className="saas-container footer-content">
          <div className="footer-brand">
            <div className="saas-logo">
              <Bot size={22} className="text-orange" />
              <span>Moshi<span className="text-orange">Admin</span></span>
            </div>
            <p>© 2026 MoshiAdmin. Todos los derechos reservados.</p>
          </div>
          <div className="footer-links">
            <Link to="/login">Iniciar Sesión</Link>
            <Link to="/register">Crear Cuenta</Link>
            <a href="#app-download">Descargar App</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
