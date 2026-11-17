import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';

import ReceptionistPortal from './pages/ReceptionistPortal';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 text-xs">Authenticating...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-6 rounded-2xl border border-red-200 text-center space-y-3">
        <h3 className="text-base font-bold text-red-700">Access Restricted</h3>
        <p className="text-xs text-slate-600">
          Your active role (<strong>{user.role}</strong>) does not have authorization to view this clinical portal.
        </p>
        <p className="text-[11px] text-slate-500">
          Use the <strong>"⚡ Switch Role Demo"</strong> dropdown in the top navbar to instantly preview other role workspaces.
        </p>
      </div>
    );
  }

  return children;
};

function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-emerald-950 text-emerald-200 text-xs py-8 border-t border-emerald-800 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative flex items-center justify-center">
              <div className="absolute -inset-1 rounded-full bg-emerald-500 opacity-40 blur-xs logo-glow-aura group-hover:opacity-90 transition-all duration-300"></div>
              <img 
                src="/amu_logo.png" 
                alt="AMU Logo" 
                className="relative w-11 h-11 bg-white rounded-full p-0.5 shadow-md ring-1 ring-emerald-400/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 object-contain" 
              />
            </div>
            <div>
              <div className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">Aligarh Muslim University (AMU)</div>
              <div className="text-[11px] text-emerald-400">Jawaharlal Nehru Medical College & Hospital — OPD System</div>
            </div>
          </div>
          <div className="text-[11px] text-emerald-300">
            Compliant with AMU Academic & Hospital By-Laws • Anti-Starvation Token Dispatch Engine
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Standard Portal Pages wrapped in MainLayout */}
          <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
          <Route path="/login" element={<MainLayout><LoginPage /></MainLayout>} />
          <Route path="/register" element={<MainLayout><RegisterPage /></MainLayout>} />

          {/* Protected Role Routes */}
          <Route 
            path="/patient" 
            element={
              <MainLayout>
                <ProtectedRoute allowedRoles={['PATIENT']}>
                  <PatientDashboard />
                </ProtectedRoute>
              </MainLayout>
            } 
          />

          <Route 
            path="/doctor" 
            element={
              <MainLayout>
                <ProtectedRoute allowedRoles={['DOCTOR']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              </MainLayout>
            } 
          />

          



          <Route 
            path="/receptionist" 
            element={
              <MainLayout>
                <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
                  <ReceptionistPortal />
                </ProtectedRoute>
              </MainLayout>
            } 
          />

          <Route 
            path="/admin" 
            element={
              <MainLayout>
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              </MainLayout>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
