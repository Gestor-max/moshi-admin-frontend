import React, { useState, useEffect } from 'react';
import { api } from './api';
import { useAuth } from './AuthContext';
import { Users as UsersIcon, Plus, Shield, UserX, UserCheck, Key, Trash2, X } from 'lucide-react';

interface UserItem {
  id: number;
  email: string;
  name: string | null;
  status: number;
  rol: number;
}

const Users: React.FC = () => {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create user form
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRol, setNewRol] = useState(2);

  // Password change
  const [changePassword, setChangePassword] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    try {
      await api.post('/auth/users', {
        email: newEmail,
        password: newPassword,
        name: newName,
        rol: newRol,
      });
      setSuccess('Usuario creado exitosamente');
      setShowCreateModal(false);
      setNewEmail('');
      setNewPassword('');
      setNewName('');
      setNewRol(2);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear usuario');
    }
  };

  const handleToggleStatus = async (u: UserItem) => {
    clearMessages();
    try {
      const newStatus = u.status === 1 ? 0 : 1;
      await api.patch(`/auth/users/${u.id}/status`, { status: newStatus });
      setSuccess(`Usuario ${newStatus === 1 ? 'activado' : 'desactivado'}`);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar status');
    }
  };

  const handleChangeRole = async (u: UserItem) => {
    clearMessages();
    try {
      const newRol = u.rol === 1 ? 2 : 1;
      await api.patch(`/auth/users/${u.id}/rol`, { rol: newRol });
      setSuccess(`Rol actualizado a ${newRol === 1 ? 'Administrador' : 'Usuario'}`);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar rol');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!selectedUser) return;
    try {
      await api.patch(`/auth/users/${selectedUser.id}/password`, { password: changePassword });
      setSuccess('Contraseña actualizada');
      setShowPasswordModal(false);
      setChangePassword('');
      setSelectedUser(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar contraseña');
    }
  };

  const handleDeleteUser = async () => {
    clearMessages();
    if (!selectedUser) return;
    try {
      await api.delete(`/auth/users/${selectedUser.id}`);
      setSuccess('Usuario eliminado');
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Cargando usuarios...</div>;

  return (
    <div className="dashboard">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: '0.375rem', color: 'var(--primary)' }}>
            <UsersIcon size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0 }}>Gestión de Usuarios</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>{users.length} usuarios registrados</p>
          </div>
        </div>
        <button
          className="btn-primary btn-sm"
          onClick={() => setShowCreateModal(true)}
          style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto' }}
        >
          <Plus size={16} /> Nuevo Usuario
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="error-message" style={{
          color: 'var(--success)',
          background: 'rgba(34, 197, 94, 0.1)',
          borderColor: 'rgba(34, 197, 94, 0.2)',
          border: '1px solid'
        }}>
          {success}
        </div>
      )}

      {/* Users Table */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Status</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name || '—'}</td>
                <td>{u.email}</td>
                <td>
                  <span className={u.rol === 1 ? 'badge badge-admin' : 'badge badge-user'}>
                    {u.rol === 1 ? 'Admin' : 'Usuario'}
                  </span>
                </td>
                <td>
                  <span className={u.status === 1 ? 'badge badge-active' : 'badge badge-inactive'}>
                    {u.status === 1 ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                    {u.id !== currentUser?.id && (
                      <>
                        <button
                          className="btn-sm btn-outline"
                          onClick={() => handleToggleStatus(u)}
                          title={u.status === 1 ? 'Desactivar' : 'Activar'}
                        >
                          {u.status === 1 ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                        <button
                          className="btn-sm btn-outline"
                          onClick={() => handleChangeRole(u)}
                          title={u.rol === 1 ? 'Cambiar a Usuario' : 'Cambiar a Admin'}
                        >
                          <Shield size={14} />
                        </button>
                        <button
                          className="btn-sm btn-outline"
                          onClick={() => {
                            setSelectedUser(u);
                            setShowPasswordModal(true);
                            clearMessages();
                          }}
                          title="Cambiar contraseña"
                        >
                          <Key size={14} />
                        </button>
                        <button
                          className="btn-sm btn-danger"
                          onClick={() => {
                            setSelectedUser(u);
                            setShowDeleteModal(true);
                            clearMessages();
                          }}
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--primary)' }}>Crear Usuario</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', width: 'auto', margin: 0, padding: '0.25rem', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Nombre</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre completo" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="correo@ejemplo.com" required />
              </div>
              <div className="form-group">
                <label>Contraseña</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <div className="form-group">
                <label>Rol</label>
                <select value={newRol} onChange={(e) => setNewRol(Number(e.target.value))}>
                  <option value={2}>Usuario</option>
                  <option value={1}>Administrador</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowCreateModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Crear Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--primary)' }}>Cambiar Contraseña</h2>
              <button onClick={() => setShowPasswordModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', width: 'auto', margin: 0, padding: '0.25rem', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Cambiar contraseña de: <strong style={{ color: 'var(--text)' }}>{selectedUser.email}</strong>
            </p>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Nueva Contraseña</label>
                <input type="password" value={changePassword} onChange={(e) => setChangePassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowPasswordModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--error)' }}>Confirmar Eliminación</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              ¿Estás seguro de eliminar al usuario <strong style={{ color: 'var(--text)' }}>{selectedUser.email}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
              <button className="btn-sm btn-danger" onClick={handleDeleteUser} style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
