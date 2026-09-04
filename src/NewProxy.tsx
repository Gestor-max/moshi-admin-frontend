import React, { useState } from 'react';
import { api } from './api';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { Server, Save, ArrowLeft, FileText, Settings } from 'lucide-react';

const NewProxy: React.FC = () => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'manual' | 'string'>('string');
  const [proxyString, setProxyString] = useState('');
  
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleProxyStringChange = (val: string) => {
    setProxyString(val);
    const parts = val.trim().split(':');
    if (parts.length === 4) {
      setIp(parts[0]);
      setPort(parts[1]);
      setUsername(parts[2]);
      setPassword(parts[3]);
    } else if (parts.length === 2) {
      setIp(parts[0]);
      setPort(parts[1]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let finalIp = ip;
    let finalPort = port;
    let finalUsername = username;
    let finalPassword = password;

    if (mode === 'string') {
      const parts = proxyString.trim().split(':');
      if (parts.length >= 2) {
        finalIp = parts[0];
        finalPort = parts[1];
        finalUsername = parts[2] || '';
        finalPassword = parts[3] || '';
      } else {
        setError('El formato del string de proxy no es válido. Debe ser: ip:puerto:usuario:contraseña o ip:puerto');
        setLoading(false);
        return;
      }
    }

    if (!finalIp || !finalPort) {
      setError('La IP y el puerto son obligatorios');
      setLoading(false);
      return;
    }

    try {
      await api.post('/proxies', { ip: finalIp, port: finalPort, username: finalUsername, password: finalPassword });
      navigate('/proxies');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al guardar el proxy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Link to="/proxies" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1.5rem' }}>
          <ArrowLeft size={18} /> {t('back')}
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: '0.75rem', color: 'white' }}>
            <Server size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{t('new_proxy')}</h1>
            <p className="subtitle" style={{ margin: 0, textAlign: 'left' }}>{t('proxies_subtitle')}</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={() => setMode('string')}
            style={{
              flex: 1,
              padding: '0.6rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-color, #333)',
              background: mode === 'string' ? 'var(--primary, #6366f1)' : 'transparent',
              color: mode === 'string' ? 'white' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: 500,
            }}
          >
            <FileText size={18} /> {t('import_string')}
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            style={{
              flex: 1,
              padding: '0.6rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-color, #333)',
              background: mode === 'manual' ? 'var(--primary, #6366f1)' : 'transparent',
              color: mode === 'manual' ? 'white' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: 500,
            }}
          >
            <Settings size={18} /> {t('manual_form')}
          </button>
        </div>

        {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="container" style={{ margin: 0, maxWidth: 'none', padding: '2rem' }}>
          {mode === 'string' ? (
            <div className="form-group">
              <label>{t('proxy_string_label')}</label>
              <input
                type="text"
                placeholder="isp.oxylabs.io:8002:mover_4xh1b:Penchair50+="
                value={proxyString}
                onChange={(e) => handleProxyStringChange(e.target.value)}
                required
              />
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>IP / Host</label>
                <input
                  type="text"
                  placeholder="192.168.1.1"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Port</label>
                <input
                  type="text"
                  placeholder="8080"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="proxy_user"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </>
          )}

          <button type="submit" disabled={loading} style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1 }}>
            <Save size={18} /> {loading ? t('loading') : t('save')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewProxy;
