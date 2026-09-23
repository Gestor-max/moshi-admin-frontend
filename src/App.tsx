import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { LanguageProvider } from './LanguageContext';
import LandingPage from './LandingPage';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Profiles from './Profiles';
import ArchivedProfiles from './ArchivedProfiles';
import Tags from './Tags';
import BulkOperations from './BulkOperations';
import NewProfile from './NewProfile';
import EditProfile from './EditProfile';
import ProfileActivities from './ProfileActivities';
import Proxies from './Proxies';
import NewProxy from './NewProxy';
import Locations from './Locations';
import Websites from './Websites';
import LinkedProfiles from './LinkedProfiles';
import Automations from './Automations';
import Profile from './Profile';
import Users from './Users';
import Layout from './Layout';
import './index.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-muted)' }}>Cargando...</div>;
  if (!token) return <Navigate to="/login" />;

  return <Layout>{children}</Layout>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading, isAdmin } = useAuth();

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-muted)' }}>Cargando...</div>;
  if (!token) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/dashboard" />;

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Ruta Pública Principal: Landing Page SaaS */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rutas Privadas del Panel */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profiles" element={<ProtectedRoute><Profiles /></ProtectedRoute>} />
            <Route path="/profiles/archived" element={<ProtectedRoute><ArchivedProfiles /></ProtectedRoute>} />
            <Route path="/tags" element={<ProtectedRoute><Tags /></ProtectedRoute>} />
            <Route path="/bulk-operations" element={<ProtectedRoute><BulkOperations /></ProtectedRoute>} />
            <Route path="/profiles/new" element={<ProtectedRoute><NewProfile /></ProtectedRoute>} />
            <Route path="/profiles/:profileId/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path="/profiles/:profileId/activities" element={<ProtectedRoute><ProfileActivities /></ProtectedRoute>} />
            <Route path="/proxies" element={<ProtectedRoute><Proxies /></ProtectedRoute>} />
            <Route path="/proxies/new" element={<ProtectedRoute><NewProxy /></ProtectedRoute>} />
            <Route path="/locations" element={<ProtectedRoute><Locations /></ProtectedRoute>} />
            <Route path="/linked-profiles" element={<ProtectedRoute><LinkedProfiles /></ProtectedRoute>} />
            <Route path="/automations" element={<ProtectedRoute><Automations /></ProtectedRoute>} />
            <Route path="/websites" element={<AdminRoute><Websites /></AdminRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
