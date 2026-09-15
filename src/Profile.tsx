import React, { useState } from 'react';
import { api } from './api';
import { useAuth } from './AuthContext';
import { User, Mail, Lock, ShieldCheck, Save } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, token, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password && password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    setLoading(true);
    try {
      const payload: any = { name, email };
      if (password) payload.password = password;

      const res = await api.patch('/auth/profile', payload);

      login(token!, { ...user!, ...res.data });
      setMessage({ type: 'success', text: '¡Perfil actualizado con éxito!' });
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error al actualizar el perfil.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: '0.375rem', color: 'var(--primary)' }}>
            <User size={28} />
          </div>
          <div>
            <h1 style={{ margin: 0 }}>Mi Perfil</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Administra tu información personal y seguridad</p>
          </div>
        </div>

        {message && (
          <div className="error-message" style={{
            color: message.type === 'success' ? 'var(--success)' : 'var(--error)',
            background: message.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            borderColor: message.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center',
            border: '1px solid'
          }}>
            {message.type === 'success' ? <ShieldCheck size={18} /> : <XIcon size={18} />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div className="container" style={{ margin: 0, maxWidth: 'none', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
              <User size={18} color="var(--primary)" /> Datos Personales
            </h3>
            <div className="form-group">
              <label>Nombre Completo</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="Tu nombre"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Correo Electrónico</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
            </div>
          </div>

          <div className="container" style={{ margin: 0, maxWidth: 'none', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
              <Lock size={18} color="var(--primary)" /> Seguridad
            </h3>
            <div className="form-group">
              <label>Nueva Contraseña (Opcional)</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Confirmar Contraseña</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deja estos campos vacíos si no deseas cambiar tu contraseña.</p>
          </div>

          <div className="span-2" style={{ gridColumn: 'span 2' }}>
            <button type="submit" disabled={loading} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: loading ? 0.7 : 1
            }}>
              <Save size={18} /> {loading ? 'Actualizando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const XIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default Profile;
