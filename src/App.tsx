import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PublicForm from './pages/PublicForm';
import LeadsList from './pages/LeadsList';
import CadastroLideranca from './pages/CadastroLideranca';
import MapPage from './pages/MapPage';
import { useEffect, useState, ReactNode } from 'react';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      <Routes>
        {/* Public Form Route */}
        <Route path="/cadastro" element={<CadastroLideranca />} />
        <Route path="/form/:leaderId" element={<PublicForm />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="mapa" element={<MapPage />} />
              <Route path="leads" element={<LeadsList />} />
              <Route path="leads/:leaderId" element={<LeadsList />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </div>
  );
}
